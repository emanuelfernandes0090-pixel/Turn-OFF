import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Gemini OCR / Bill Scan endpoint
app.post("/api/scan-bill", async (req, res) => {
  console.log("[server] Received /api/scan-bill request:", {
    hasBase64: !!req.body?.base64,
    hasRawText: !!req.body?.rawText,
    mimeType: req.body?.mimeType
  });
  try {
    const { base64, mimeType, rawText } = req.body;

    // If client supplied raw text or no image base64, respond with text analysis or error
    if (!base64 && !rawText) {
      res.status(400).json({ error: "Nenhum arquivo ou texto foi fornecido para análise." });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && (base64 || rawText)) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        const prompt = `Você é um perito em análise e conferência de contas de energia elétrica do Brasil (Enel, Neoenergia, CPFL, Cemig, Copel, Equatorial, Celesc, Energisa, Light, etc.).
Analise a fatura de energia fornecida e extraia com RIGOR ABSOLUTO os dados.

REGRAS DE CONFIABILIDADE (ERRAR PARA VAZIO É MELHOR QUE ERRAR PARA NÚMERO INCORRETO):
1. 'consumo_kwh': Apenas o consumo FATURADO em kWh do ciclo atual. NUNCA confunda com histórico de 12 meses, média, leitura anterior, leitura atual do medidor ou consumo injetado. Se não tiver certeza, retorne null.
2. 'valor_total': O valor final a pagar em reais (R$). NUNCA confunda com tensão nominal (ex: 127V ou 220V), código de barras, código do cliente ou valor de impostos isolados.
3. 'mes_referencia': Mês de referência (ex: "08/2026", "Agosto/2026", "11/2017").
4. 'vencimento': Data de vencimento no formato DD/MM/AAAA.
5. 'distribuidora': Nome da concessionária (ex: Celesc, Cemig, Enel, Neoenergia, Equatorial, etc.).
6. 'unidade_consumidora': Código do cliente ou UC.
7. 'tarifa_te': Tarifa de Energia (R$/kWh), se identificada.
8. 'tarifa_tusd': Tarifa de Uso do Sistema de Distribuição (R$/kWh), se identificada.
9. 'bandeira': Cor da bandeira tarifária: "verde", "amarela", "vermelha_1", "vermelha_2", ou null.
10. 'valor_bandeira': Adicional em R$ cobrado pela bandeira tarifária, se houver.
11. 'impostos': { icms: R$ ou null, pis_cofins: R$ ou null }.
12. 'cosip': Valor da taxa de iluminação pública (COSIP/CIP) em R$ ou null.
13. 'tarifa_social_identificada': true somente se a fatura explicitamente contiver "Tarifa Social", "Baixa Renda", "TSEE" ou desconto social. Caso contrário false.
14. 'geracao_distribuida': { energia_injetada_kwh: número ou null, creditos_acumulados_kwh: número ou null } ou null.
15. 'alertas': lista de strings com avisos relevantes (ex: "Consumo alto", "Bandeira vermelha", "Tarifa Social identificada").
16. 'campos_baixa_confianca': lista de nomes de campos onde houve dúvida ou baixa nitidez.

Responda EXCLUSIVAMENTE em formato JSON com esta estrutura exata, sem blocos markdown ou texto adicional:
{
  "distribuidora": string | null,
  "unidade_consumidora": string | null,
  "mes_referencia": string | null,
  "vencimento": string | null,
  "consumo_kwh": number | null,
  "consumo_medio_12m_kwh": number | null,
  "valor_total": number | null,
  "bandeira": "verde" | "amarela" | "vermelha_1" | "vermelha_2" | null,
  "valor_bandeira": number | null,
  "tarifa_te": number | null,
  "tarifa_tusd": number | null,
  "impostos": { "icms": number | null, "pis_cofins": number | null },
  "cosip": number | null,
  "tarifa_social_identificada": boolean,
  "geracao_distribuida": { "energia_injetada_kwh": number | null, "creditos_acumulados_kwh": number | null } | null,
  "alertas": string[],
  "campos_baixa_confianca": string[]
}`;

        // Build parts for multimodal or text input
        const parts: any[] = [];
        if (base64) {
          const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, "");
          parts.push({
            inlineData: {
              mimeType: mimeType || "image/jpeg",
              data: cleanBase64,
            },
          });
        }
        if (rawText) {
          parts.push({
            text: `Texto da fatura:\n${rawText}`,
          });
        }
        parts.push({ text: prompt });

        // Try primary model gemini-3.8-flash, with fallback to gemini-3.6-flash
        const modelsToTry = ["gemini-3.8-flash", "gemini-3.6-flash"];
        let parsedData: any = null;
        let lastError: any = null;

        for (const model of modelsToTry) {
          try {
            console.log(`[server] Tentando extração OCR com modelo: ${model}`);
            const response = await ai.models.generateContent({
              model,
              contents: { parts },
              config: {
                thinkingConfig: { thinkingBudget: 0 },
                maxOutputTokens: 4096,
              },
            });

            const candidate = response.candidates?.[0];
            const finishReason = candidate?.finishReason;
            const contentText = response.text || "";

            if (finishReason === "MAX_TOKENS" || !contentText.trim()) {
              console.warn(
                `[server] Modelo ${model} retornou resposta incompleta ou vazia (finishReason: ${finishReason}). Tentando próximo modelo.`
              );
              continue;
            }

            // Clean JSON from code blocks if any
            const jsonMatch = contentText.match(/\{[\s\S]*\}/);
            const cleanedJson = jsonMatch
              ? jsonMatch[0]
              : contentText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

            try {
              parsedData = JSON.parse(cleanedJson);
              if (parsedData && typeof parsedData === "object") {
                console.log(`[server] Sucesso ao parsear JSON com modelo ${model}`);
                break;
              }
            } catch (jsonErr) {
              console.warn(`[server] Modelo ${model} gerou JSON inválido, tentando próximo modelo:`, jsonErr);
              lastError = jsonErr;
              continue;
            }
          } catch (modelErr) {
            lastError = modelErr;
            console.warn(`[server] Erro na chamada do modelo ${model}, tentando próximo:`, modelErr);
          }
        }

        if (parsedData) {
          res.json({
            source: "gemini_vision",
            bill: parsedData,
            success: true,
          });
          return;
        }

        if (lastError) {
          throw lastError;
        }
      } catch (geminiError) {
        console.warn("[server] Gemini OCR fallback triggered:", geminiError);
        // Fall through to fallback
      }
    }

    // Fallback response for offline or when Gemini key is not provided
    res.json({
      source: "client_fallback",
      message: "Análise por IA indisponível ou em modo offline. Use o extrator determinístico local ou preenchimento manual.",
      success: false,
    });
  } catch (error) {
    console.error("[server] Erro no processamento de fatura:", error);
    res.status(500).json({ error: "Falha ao processar arquivo da conta de energia." });
  }
});

// Interactive Educational AI Assistant Endpoint
app.post("/api/assistant", async (req, res) => {
  try {
    const { messages, userContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Nenhuma mensagem fornecida." });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.json({
        reply:
          "Olá! Sou o Assistente Turn OFF. No momento estou operando no modo local padrão. Você pode tirar dúvidas sobre como calcular kWh, ler relógios medidores ou consultar regras de segurança da NBR 5410 pelo nosso Guia Educativo.",
        model: "offline_fallback",
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemInstruction = `Você é o "Assistente Turn OFF", uma inteligência artificial especialista, didática e amigável em Eficiência Energética Residencial, Tarifas de Energia no Brasil (Aneel/TSEE) e Segurança Elétrica Doméstica (NBR 5410).
O aplicativo "Turn OFF" foi criado pelos estudantes do GT-02 de Sistemas de Energia Renovável da EEEP Dom Walfrido Teixeira Vieira.

SUAS DIRETRIZES FUNDAMENTAIS DE RESPOSTA:
1. Responda em Português do Brasil com linguagem simples, acolhedora, clara e objetiva para qualquer pergunta livre enviada pelo usuário.
2. FORMATAÇÃO E TEXTO LIMPO (REGRA CRÍTICA):
   - NUNCA use sintaxe LaTeX como "$$", "\\frac", "\\times" ou "\\text".
   - NUNCA use asteriscos repetidos ou caracteres colados como "**".
   - Evite travessões soltos e espaçamentos desnecessários em branco.
   - Sempre escreva fórmulas matemáticas de forma limpa, direta e visualmente agradável usando texto comum legível:
     Consumo Mensal (kWh) = (Potência em Watts × Horas/dia × Dias/mês) ÷ 1000
   - Ao fazer cálculos de exemplo, mostre passo a passo simples com números claros e resultados objetivos.
3. ADAPTAÇÃO A PERGUNTAS LIVRES:
   - Responda qualquer dúvida sobre consumo elétrico residencial, aparelhos (geladeira, chuveiro, ar-condicionado, lâmpadas, TV, lavadora, ferro), bandeiras tarifárias, faturas e economia de energia.
   - Sempre conecte a explicação à funcionalidade correspondente do aplicativo Turn OFF, indicando onde encontrar (Início, Diagnóstico, Leitor de Conta, Simulador "E se...", Payback, Segurança NBR 5410, Guia Educativo, Tarifa Social TSEE ou Histórico).
4. SEGURANÇA ELÉTRICA EM PRIMEIRO LUGAR:
   - Economizar energia NUNCA deve colocar a vida em risco. Condene terminantemente gambiarras, emendas soltas, desarmes forçados de disjuntores ou troca por disjuntor de maior corrente sem redimensionar a fiação.
5. FÍSICA CORRETA:
   - Aparelhos com compressor ou termostato (geladeiras, ar-condicionado, ferro de passar) operam em ciclos (fator de uso de ~40% a 60%), não ficando no pico 100% do tempo.
6. TARIFA SOCIAL (TSEE):
   - Esclareça os critérios do CadÚnico e BPC, e a gratuidade até 80 kWh segundo as diretrizes governamentais.
7. Mantenha parágrafos bem estruturados e tópicos diretos e objetivos.`;

    // Convert messages to Gemini contents format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Try models: gemini-2.5-flash as primary fast model, with fallbacks
    const modelsToTry = ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-3.6-flash"];
    let reply: string | null = null;
    let usedModel: string = "gemini-2.5-flash";

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        });
        if (response.text && response.text.trim()) {
          reply = response.text.trim();
          usedModel = model;
          break;
        }
      } catch (err) {
        console.warn(`[server] Modelo ${model} falhou no assistente:`, err);
      }
    }

    if (reply) {
      res.json({ reply, model: usedModel });
      return;
    }

    throw new Error("Nenhum modelo Gemini retornou resposta.");
  } catch (error) {
    console.error("[server] Erro no assistente de IA:", error);

    // Smart domestic energy knowledge fallback based on query keywords
    const lastUserMsg = (req.body?.messages || [])
      .filter((m: any) => m.role === "user")
      .slice(-1)[0]?.content?.toLowerCase() || "";

    let fallbackReply = "O Turn OFF foi desenvolvido para ajudar você a entender sua conta de luz, calcular o consumo exato dos aparelhos e economizar com segurança.";

    if (lastUserMsg.includes("kwh") || lastUserMsg.includes("calcul") || lastUserMsg.includes("consumo")) {
      fallbackReply = "O consumo em kWh é calculado pela fórmula física oficial: (Potência em Watts × Horas de uso por dia × Dias no mês) ÷ 1000. Lembre-se que aparelhos com compressor (como geladeiras e ar-condicionado) operam em ciclos (fator de ~40% a 60%), não ficando ligados no máximo o tempo todo.";
    } else if (lastUserMsg.includes("tarifa social") || lastUserMsg.includes("desconto") || lastUserMsg.includes("tsee") || lastUserMsg.includes("baixa renda")) {
      fallbackReply = "A Tarifa Social (TSEE) oferece gratuidade nos primeiros 80 kWh para famílias inscritas no CadÚnico (com renda per capita até meio salário mínimo) ou beneficiárias do BPC. Você pode simular seu direito e economia na aba 'Tarifa Social' do menu!";
    } else if (lastUserMsg.includes("chuveiro") || lastUserMsg.includes("ar") || lastUserMsg.includes("geladeira")) {
      fallbackReply = "Os maiores vilões da conta são aparelhos de transformação térmica de alta potência: o chuveiro elétrico (5.500W a 7.500W) e o ar-condicionado (1.000W a 2.000W). Banhos de 8 minutos em vez de 15 minutos e manter o ar em 23°C ou 24°C com portas fechadas geram reduções imediatas de até 30% na conta.";
    } else if (lastUserMsg.includes("segurança") || lastUserMsg.includes("choque") || lastUserMsg.includes("disjuntor") || lastUserMsg.includes("nbr")) {
      fallbackReply = "Conforme a norma NBR 5410 da ABNT: nunca troque um disjuntor por um de amperagem maior sem trocar a fiação correspondente (risco grave de incêndio). Use sempre conectores cerâmicos ou automáticos no chuveiro (nunca fita isolante comum que derrete) e garanta aterramento com dispositivo DR.";
    } else if (lastUserMsg.includes("simulador") || lastUserMsg.includes("e se")) {
      fallbackReply = "No simulador 'E se...', você pode testar reduções de hábitos (ex: diminuir 5 minutos de banho ou desligar o ar 1 hora antes) e ver instantaneamente a economia prevista em Reais (R$) e kWh por mês!";
    }

    res.json({
      reply: fallbackReply,
      model: "knowledge_engine",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
