import React, { useState, useRef } from "react";
import {
  Upload,
  Camera,
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Save,
  Zap,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  ArrowLeft,
  Share2,
  Edit3,
} from "lucide-react";
import { ExtractedBill, AccessibilitySettings } from "../types";
import {
  parseBillText,
  calculateBillCoherence,
  SAMPLE_BILLS,
  parseNumberBR,
} from "../lib/bill-parser";
import { formatBRL, formatNumber } from "../lib/energy";

interface BillScannerProps {
  onSaveBill: (bill: ExtractedBill) => void;
  onUseInDiagnosis: (bill: ExtractedBill) => void;
  onShareBill?: (bill: ExtractedBill) => void;
  settings: AccessibilitySettings;
}

export const BillScanner: React.FC<BillScannerProps> = ({
  onSaveBill,
  onUseInDiagnosis,
  onShareBill,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "text" | "samples">("upload");
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanFailed, setScanFailed] = useState<boolean>(false);
  const [isManualInput, setIsManualInput] = useState<boolean>(false);
  const [extractedBill, setExtractedBill] = useState<ExtractedBill | null>(null);
  const [rawTextInput, setRawTextInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [explanatoryTopic, setExplanatoryTopic] = useState<{
    title: string;
    description: string;
    example?: string;
    tip?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const TARIFF_EXPLANATIONS: Record<string, { title: string; description: string; example?: string; tip?: string }> = {
    consumo: {
      title: "Consumo Faturado (kWh)",
      description: "É a quantidade real de energia elétrica que a sua residência utilizou durante o ciclo de faturamento (geralmente entre 28 e 32 dias). O valor é obtido subtraindo a leitura atual do medidor pela leitura do mês anterior.",
      example: "Exemplo: Se o medidor marcava 14.500 no mês passado e agora marca 14.700, seu consumo faturado foi de 200 kWh.",
      tip: 'Confira se o número no seu relógio medidor hoje é maior ou igual ao registrado como "Leitura Atual" na conta.',
    },
    valor_total: {
      title: "Valor Total a Pagar (R$)",
      description: "É a soma de todos os custos: consumo de energia (TE + TUSD), adicionais de bandeiras tarifárias, impostos estaduais (ICMS) e federais (PIS/COFINS), além da taxa municipal de iluminação pública (COSIP).",
      tip: "Compare sempre o valor total com o consumo em kWh para saber se o aumento da conta foi por consumo de aparelhos ou por mudança de bandeira tarifária.",
    },
    te: {
      title: "TE - Tarifa de Energia",
      description: "Remunera a geração de eletricidade nas usinas hidrelétricas, solares, eólicas e termelétricas. É o preço da energia puramente dita, sem considerar os postes e fios que a transportam.",
      example: "Em média no Brasil, varia entre R$ 0,30 e R$ 0,55 por kWh.",
      tip: "Economizar no tempo do chuveiro ou na temperatura do ar-condicionado reduz diretamente o valor cobrado na TE.",
    },
    tusd: {
      title: "TUSD - Tarifa de Uso do Sistema de Distribuição",
      description: "Paga a infraestrutura das distribuidoras de energia (ex: Enel, Equatorial, Cemig). Cobre os postes, fiação nas ruas, transformadores, subestações e as equipes de emergência 24h.",
      example: "Em média, varia entre R$ 0,35 e R$ 0,60 por kWh.",
      tip: "A TUSD é cobrada proporcionalmente à energia que você consome. Quanto menos kWh sua casa puxa da rede, menor o valor de TUSD.",
    },
    bandeira: {
      title: "Bandeiras Tarifárias (ANEEL)",
      description: "Sistema criado pela ANEEL para repassar aos consumidores o custo extra de gerar energia nos meses de seca, quando é necessário ligar usinas termelétricas a óleo e gás.",
      example: "• Verde: Sem custo extra.\n• Amarela: Pequeno acréscimo.\n• Vermelha Patamar 1 e 2: Custos mais altos a cada 100 kWh consumidos.",
      tip: "Em meses de Bandeira Vermelha, reduza o tempo de banho e o uso de ferro elétrico para evitar surpresas no fim do mês.",
    },
    icms: {
      title: "ICMS (Imposto Estadual)",
      description: "Imposto sobre Circulação de Mercadorias e Serviços, arrecadado pelo Governo do seu Estado. Incide sobre a energia, o transporte e as bandeiras tarifárias.",
      tip: "Cada estado possui sua própria alíquota residencial (geralmente entre 17% e 20%).",
    },
    piscofins: {
      title: "PIS e COFINS (Tributos Federais)",
      description: "Contribuições sociais arrecadadas pela União Federal (Governo Federal) destinadas ao financiamento da seguridade social, saúde pública e previdência.",
      tip: "Suas alíquotas variam todo mês na conta de acordo com os créditos das distribuidoras.",
    },
    cosip: {
      title: "COSIP / CIP (Iluminação Pública)",
      description: "Contribuição para Custeio do Serviço de Iluminação Pública. É repassada integralmente para a Prefeitura Municipal da sua cidade para trocar lâmpadas de postes e iluminar praças e vias públicas.",
      tip: "O valor é fixado por lei municipal da sua cidade, e não pela distribuidora de energia.",
    },
    uc: {
      title: "Unidade Consumidora (UC / Instalação)",
      description: 'É o número de identificação exclusivo da sua casa ou apartamento perante a concessionária de energia. É como se fosse o "CPF" do seu relógio medidor.',
      tip: "Tenha esse número em mãos sempre que for ligar para a distribuidora para pedir atendimento, solicitar religação ou cadastrar a Tarifa Social.",
    },
    tsee: {
      title: "Tarifa Social de Energia Elétrica (TSEE)",
      description: "Programa do Governo Federal que concede descontos expressivos na conta de luz para famílias de baixa renda inscritas no Cadastro Único (CadÚnico) com renda por pessoa de até meio salário mínimo.",
      example: "Garante gratuidade ou descontos de até 100% da parcela de consumo nos primeiros 80 kWh/mês.",
      tip: 'Consulte a aba "Tarifa Social" no aplicativo para simular exatamente quanto você pode economizar e ver como solicitar.',
    },
  };

  const hasEssentialBillData = (b: Partial<ExtractedBill> | null | undefined): boolean => {
    if (!b) return false;
    const hasKwh = typeof b.consumo_kwh === "number" && !isNaN(b.consumo_kwh) && b.consumo_kwh > 0;
    const hasValor = typeof b.valor_total === "number" && !isNaN(b.valor_total) && b.valor_total > 0;
    const hasMes = typeof b.mes_referencia === "string" && b.mes_referencia.trim().length > 0;
    return hasKwh || hasValor || hasMes;
  };

  const handleStartManualInput = () => {
    setScanFailed(false);
    setScanError(null);
    setIsManualInput(true);
    setExtractedBill({
      distribuidora: "",
      unidade_consumidora: "",
      mes_referencia: "",
      vencimento: "",
      consumo_kwh: null,
      consumo_medio_12m_kwh: null,
      variacao_consumo_percentual: null,
      bandeira: "verde",
      valor_bandeira: null,
      tarifa_te: null,
      tarifa_tusd: null,
      cosip: null,
      valor_total: null,
      geracao_distribuida: null,
      tarifa_social_identificada: false,
      impostos: {
        icms: null,
        pis_cofins: null,
      },
      alertas: [],
      campos_baixa_confianca: [],
      quality: "revisar",
      qualityMessage: "Preenchimento manual dos dados da fatura. Digite as informações da sua conta de luz para análise.",
    });
  };

  // Process selected file
  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      setScanError("O arquivo é maior que 12 MB. Por favor selecione uma imagem ou PDF de menor tamanho.");
      setScanFailed(false);
      return;
    }

    setIsScanning(true);
    setScanError(null);
    setScanFailed(false);
    setIsManualInput(false);

    try {
      // Read file to Base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        // Try AI scanning via /api/scan-bill
        try {
          const response = await fetch("/api/scan-bill", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              base64: base64Data,
              mimeType: file.type || "image/jpeg",
              fileName: file.name,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.bill && hasEssentialBillData(data.bill)) {
              const bill: ExtractedBill = {
                ...data.bill,
                sourceUrl: URL.createObjectURL(file),
                quality: data.bill.campos_baixa_confianca?.length === 0 ? "boa" : "revisar",
                qualityMessage:
                  data.bill.campos_baixa_confianca?.length === 0
                    ? "Leitura realizada com sucesso via IA. Revise os valores antes de salvar."
                    : `Alguns campos foram sinalizados para conferência: ${data.bill.campos_baixa_confianca?.join(", ")}.`,
              };
              setExtractedBill(bill);
              setIsScanning(false);
              setScanFailed(false);
              return;
            }
          }
        } catch (apiErr) {
          console.warn("[BillScanner] Backend AI scanner falhou ou indisponível:", apiErr);
        }

        // If AI or OCR could not extract essential data, DO NOT show empty review screen
        // Keep the user on the upload screen with friendly error and direct actions
        setExtractedBill(null);
        setScanFailed(true);
        setIsScanning(false);
      };

      reader.onerror = () => {
        setScanError("Falha ao ler o arquivo selecionado no navegador. Tente novamente.");
        setScanFailed(false);
        setIsScanning(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setScanError("Erro inesperado ao processar o arquivo.");
      setScanFailed(true);
      setIsScanning(false);
    }
  };

  const handleTextScan = () => {
    if (!rawTextInput.trim()) {
      setScanError("Cole o texto da sua conta de energia antes de analisar.");
      return;
    }

    setScanError(null);
    setScanFailed(false);
    setIsScanning(true);

    try {
      const bill = parseBillText(rawTextInput, "local://texto-colado");
      if (hasEssentialBillData(bill)) {
        setExtractedBill(bill);
        setScanFailed(false);
        setIsManualInput(false);
      } else {
        setExtractedBill(null);
        setScanFailed(true);
      }
    } catch (err) {
      setScanFailed(true);
      setExtractedBill(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleLoadSample = (sampleText: string) => {
    setScanError(null);
    setIsScanning(true);
    setTimeout(() => {
      const bill = parseBillText(sampleText, "sample://fatura-padrao");
      setExtractedBill(bill);
      setIsScanning(false);
    }, 250);
  };

  const handleFieldChange = (
    field: keyof ExtractedBill,
    value: unknown
  ) => {
    if (!extractedBill) return;
    setExtractedBill({
      ...extractedBill,
      [field]: value,
    });
  };

  const handleImpostosChange = (field: "icms" | "pis_cofins", val: number | null) => {
    if (!extractedBill) return;
    setExtractedBill({
      ...extractedBill,
      impostos: {
        ...extractedBill.impostos,
        [field]: val,
      },
    });
  };

  const coherence = extractedBill ? calculateBillCoherence(extractedBill) : null;

  return (
    <div id="bill-scanner-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-200 dark:border-teal-800">
          <FileText className="w-3.5 h-3.5" />
          Leitor Inteligente de Faturas
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
          Leitura & Conferência Consciente da Conta
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          {settings.simpleLanguage
            ? "Envie uma foto ou PDF da sua conta de energia. O aplicativo confere os números e você pode corrigir qualquer valor antes de salvar."
            : "Auditoria completa: extrai consumo faturado (kWh), valor total (R$), tarifas TE/TUSD, encargos, bandeira e identifica se há Tarifa Social ou Geração Solar. Errar para o vazio é preferível a inventar valores."}
        </p>
      </div>

      {/* Input Mode Selector */}
      {!extractedBill && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
            {[
              { id: "upload" as const, label: "Foto ou PDF", icon: Upload },
              { id: "text" as const, label: "Colar Texto OCR", icon: FileText },
              { id: "samples" as const, label: "Exemplos de Contas", icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`tab-scanner-${tab.id}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setScanError(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-emerald-600 text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Upload (File / Drag & Drop / Camera) */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              <div
                id="dropzone-bill"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files?.[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition flex flex-col items-center justify-center gap-4 ${
                  dragOver
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/30"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base sm:text-lg">
                    Clique para escolher a conta ou arraste o arquivo aqui
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Formatos suportados: Imagens (JPG, PNG, WebP) ou PDF digital (até 12 MB)
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    Foto nítida
                  </span>
                  <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    PDF da distribuidora
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Text Paste */}
          {activeTab === "text" && (
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Cole o texto bruto extraído da sua conta (ou de um leitor OCR):
              </label>
              <textarea
                id="textarea-bill-ocr"
                rows={8}
                value={rawTextInput}
                onChange={(e) => setRawTextInput(e.target.value)}
                placeholder="Exemplo: ENEL DISTRIBUIÇÃO SP&#10;Consumo faturado: 195 kWh&#10;Total a pagar: R$ 180,45&#10;Vencimento: 20/08/2026&#10;TE: 0,42 TUSD: 0,38"
                className="w-full p-4 text-xs font-mono rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <div className="flex justify-end">
                <button
                  id="btn-analyze-text"
                  onClick={handleTextScan}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Analisar Texto da Fatura
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Sample Bills for Test & Demonstration */}
          {activeTab === "samples" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecione uma conta brasileira pré-configurada para testar a auditoria, detecção de tensão 220V em colunas, Tarifa Social e Geração Solar:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SAMPLE_BILLS.map((sample, idx) => (
                  <button
                    key={idx}
                    id={`btn-sample-bill-${idx}`}
                    onClick={() => handleLoadSample(sample.raw)}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-left transition hover:shadow-xs group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {sample.label}
                      </h4>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {sample.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Friendly Scan Failure Notice */}
          {scanFailed && (
            <div
              id="bill-scan-failure-card"
              className="p-5 sm:p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 shadow-sm space-y-3 animate-in fade-in duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    Não conseguimos ler as informações desta imagem
                  </h4>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                    A imagem pode estar com baixa resolução, cortada, com reflexos ou pouca iluminação. Para uma leitura automática nítida, fotografe a conta aberta, de cima para baixo e com boa luz. Ou se preferir, digite os dados diretamente.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-amber-200 dark:border-amber-900/60">
                <button
                  type="button"
                  id="btn-retry-scan-file"
                  onClick={() => {
                    setScanFailed(false);
                    setScanError(null);
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Tentar outra foto/arquivo
                </button>
                <button
                  type="button"
                  id="btn-manual-input-fallback"
                  onClick={handleStartManualInput}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Preencher manualmente
                </button>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {scanError && !scanFailed && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {/* Scanning Progress */}
          {isScanning && (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin" />
              <span className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-200">
                Analisando e conferindo dados da fatura...
              </span>
            </div>
          )}
        </div>
      )}

      {/* Extracted Bill Results & Validation Editor */}
      {extractedBill && (
        <div className="space-y-6">
          {/* Quality & Audit Status Banner */}
          <div
            className={`p-5 sm:p-6 rounded-3xl border shadow-sm space-y-3 ${
              isManualInput
                ? "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800"
                : extractedBill.quality === "boa"
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                : "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {isManualInput ? (
                  <Edit3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : extractedBill.quality === "boa" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                )}
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {isManualInput
                    ? "Preenchimento Manual da Fatura de Energia"
                    : extractedBill.quality === "boa"
                    ? "Leitura Concluída com Alta Confiança"
                    : "Revisão e Conferência Recomendada"}
                </h3>
              </div>
              <button
                id="btn-scan-another"
                onClick={() => {
                  setExtractedBill(null);
                  setIsManualInput(false);
                }}
                className="self-start sm:self-auto text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 underline flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {isManualInput ? "Voltar ao envio de arquivo" : "Tentar outra foto/arquivo"}
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isManualInput
                ? "Digite abaixo os dados da sua conta de luz (consumo kWh, valor total, distribuidora, etc.) para que o Turn OFF calcule suas métricas e audite as tarifas."
                : extractedBill.qualityMessage}
            </p>

            {/* Coherence Feedback */}
            {coherence?.comparable && (
              <div
                className={`p-3 rounded-2xl text-xs flex items-start gap-2 ${
                  coherence.incoherent
                    ? "bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700"
                    : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200"
                }`}
              >
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Validação de Coerência: </span>
                  {coherence.explanation}
                </div>
              </div>
            )}
          </div>

          {/* Editable Fields Grid */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Campos Reconhecidos da Fatura
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Você pode editar qualquer campo diretamente antes de salvar
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {extractedBill.distribuidora || "Concessionária"}
              </span>
            </div>

            {/* Main Fields: Consumption and Total Value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Consumo Faturado (kWh)*
                  </label>
                  <button
                    type="button"
                    onClick={() => setExplanatoryTopic(TARIFF_EXPLANATIONS.consumo)}
                    className="p-1 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/50 rounded-full transition"
                    title="O que é Consumo Faturado?"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  id="input-bill-kwh"
                  type="number"
                  value={extractedBill.consumo_kwh ?? ""}
                  onChange={(e) =>
                    handleFieldChange("consumo_kwh", e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="Ex: 180"
                  className="w-full text-xl font-bold bg-white dark:bg-slate-800 rounded-xl px-3 py-1.5 border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white focus:outline-emerald-500"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  Apenas consumo faturado no mês (não confundir com medidor).
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Valor Total a Pagar (R$)*
                  </label>
                  <button
                    type="button"
                    onClick={() => setExplanatoryTopic(TARIFF_EXPLANATIONS.valor_total)}
                    className="p-1 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/50 rounded-full transition"
                    title="O que compõe o Valor Total?"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  id="input-bill-total"
                  type="number"
                  step="0.01"
                  value={extractedBill.valor_total ?? ""}
                  onChange={(e) =>
                    handleFieldChange("valor_total", e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="Ex: 214.50"
                  className="w-full text-xl font-bold bg-white dark:bg-slate-800 rounded-xl px-3 py-1.5 border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white focus:outline-emerald-500"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  Valor final em dinheiro (nunca tensão 220V).
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Data de Vencimento
                </label>
                <input
                  id="input-bill-vencimento"
                  type="text"
                  value={extractedBill.vencimento ?? ""}
                  onChange={(e) => handleFieldChange("vencimento", e.target.value || null)}
                  placeholder="DD/MM/AAAA"
                  className="w-full text-sm font-semibold bg-white dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mês de Referência
                </label>
                <input
                  id="input-bill-referencia"
                  type="text"
                  value={extractedBill.mes_referencia ?? ""}
                  onChange={(e) => handleFieldChange("mes_referencia", e.target.value || null)}
                  placeholder="MM/AAAA"
                  className="w-full text-sm font-semibold bg-white dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>
            </div>

            {/* Additional Metadata: Distributor, UC, Flag */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Distribuidora
                </label>
                <input
                  id="input-bill-distribuidora"
                  type="text"
                  value={extractedBill.distribuidora ?? ""}
                  onChange={(e) => handleFieldChange("distribuidora", e.target.value || null)}
                  placeholder="Ex: Enel, Cemig, Celesc..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Unidade Consumidora (UC)
                  </label>
                  <button
                    type="button"
                    onClick={() => setExplanatoryTopic(TARIFF_EXPLANATIONS.uc)}
                    className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="O que é Unidade Consumidora?"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  id="input-bill-uc"
                  type="text"
                  value={extractedBill.unidade_consumidora ?? ""}
                  onChange={(e) => handleFieldChange("unidade_consumidora", e.target.value || null)}
                  placeholder="Código do cliente"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Bandeira Tarifária
                  </label>
                  <button
                    type="button"
                    onClick={() => setExplanatoryTopic(TARIFF_EXPLANATIONS.bandeira)}
                    className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="O que são Bandeiras Tarifárias?"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
                <select
                  id="select-bill-bandeira"
                  value={extractedBill.bandeira ?? ""}
                  onChange={(e) =>
                    handleFieldChange(
                      "bandeira",
                      e.target.value ? (e.target.value as ExtractedBill["bandeira"]) : null
                    )
                  }
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Não identificada</option>
                  <option value="verde">Verde (Sem custo adicional)</option>
                  <option value="amarela">Amarela (Custo moderado)</option>
                  <option value="vermelha_1">Vermelha Patamar 1 (Alto custo)</option>
                  <option value="vermelha_2">Vermelha Patamar 2 (Custo crítico)</option>
                </select>
              </div>
            </div>

            {/* Tariff Breakdown: TE, TUSD, ICMS, PIS/COFINS, COSIP */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                  Composição Tarifária & Tributos (R$)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Clique no <HelpCircle className="w-3 h-3 inline text-emerald-600" /> para ver a explicação de cada item
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                      TE (Energia)
                    </span>
                    <button
                      type="button"
                      onClick={() => setExplanatoryTopic(TARIFF_EXPLANATIONS.te)}
                      className="text-slate-400 hover:text-emerald-600"
                    >
                      <HelpCircle className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.0001"
                    value={extractedBill.tarifa_te ?? ""}
                    onChange={(e) =>
                      handleFieldChange("tarifa_te", e.target.value ? Number(e.target.value) : null)
                    }
                    placeholder="R$/kWh"
                    className="w-full text-xs font-semibold bg-white dark:bg-slate-800 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                      TUSD (Distrib.)
                    </span>
                    <button
                      type="button"
                      onClick={() => setExplanatoryTopic(TARIFF_EXPLANATIONS.tusd)}
                      className="text-slate-400 hover:text-emerald-600"
                    >
                      <HelpCircle className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.0001"
                    value={extractedBill.tarifa_tusd ?? ""}
                    onChange={(e) =>
                      handleFieldChange("tarifa_tusd", e.target.value ? Number(e.target.value) : null)
                    }
                    placeholder="R$/kWh"
                    className="w-full text-xs font-semibold bg-white dark:bg-slate-800 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                      ICMS
                    </span>
                    <button
                      type="button"
                      onClick={() => setExplanatoryTopic(TARIFF_EXPLANATIONS.icms)}
                      className="text-slate-400 hover:text-emerald-600"
                    >
                      <HelpCircle className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={extractedBill.impostos.icms ?? ""}
                    onChange={(e) =>
                      handleImpostosChange("icms", e.target.value ? Number(e.target.value) : null)
                    }
                    placeholder="R$"
                    className="w-full text-xs font-semibold bg-white dark:bg-slate-800 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                      PIS / COFINS
                    </span>
                    <button
                      type="button"
                      onClick={() => setExplanatoryTopic(TARIFF_EXPLANATIONS.piscofins)}
                      className="text-slate-400 hover:text-emerald-600"
                    >
                      <HelpCircle className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={extractedBill.impostos.pis_cofins ?? ""}
                    onChange={(e) =>
                      handleImpostosChange("pis_cofins", e.target.value ? Number(e.target.value) : null)
                    }
                    placeholder="R$"
                    className="w-full text-xs font-semibold bg-white dark:bg-slate-800 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                      COSIP (Ilum.)
                    </span>
                    <button
                      type="button"
                      onClick={() => setExplanatoryTopic(TARIFF_EXPLANATIONS.cosip)}
                      className="text-slate-400 hover:text-emerald-600"
                    >
                      <HelpCircle className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={extractedBill.cosip ?? ""}
                    onChange={(e) =>
                      handleFieldChange("cosip", e.target.value ? Number(e.target.value) : null)
                    }
                    placeholder="R$"
                    className="w-full text-xs font-semibold bg-white dark:bg-slate-800 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Tarifa Social Toggle & GD */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    Tarifa Social / Baixa Renda (TSEE)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Benefício federal que concede gratuidade de 100% da parcela de consumo até 80 kWh/mês.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setExplanatoryTopic(TARIFF_EXPLANATIONS.tsee)}
                  className="p-1 text-slate-400 hover:text-emerald-600"
                  title="O que é Tarifa Social?"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  id="checkbox-tarifa-social"
                  type="checkbox"
                  checked={extractedBill.tarifa_social_identificada}
                  onChange={(e) => handleFieldChange("tarifa_social_identificada", e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tarifa Social Aplicada
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap gap-3 justify-end">
              {onShareBill && (
                <button
                  id="btn-share-bill"
                  onClick={() => onShareBill(extractedBill)}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Compartilhar / PDF
                </button>
              )}

              <button
                id="btn-save-bill-history"
                onClick={() => onSaveBill(extractedBill)}
                className="px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-4 h-4 text-emerald-600" />
                Salvar no Histórico
              </button>

              <button
                id="btn-use-in-diagnosis"
                onClick={() => onUseInDiagnosis(extractedBill)}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md hover:shadow-lg"
              >
                <Zap className="w-4 h-4 fill-current" />
                Iniciar Novo Diagnóstico com Esta Conta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explanatory Info Modal */}
      {explanatoryTopic && (
        <div
          id="tariff-explanation-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Info className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {explanatoryTopic.title}
                </h4>
              </div>
              <button
                onClick={() => setExplanatoryTopic(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {explanatoryTopic.description}
            </p>

            {explanatoryTopic.example && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line font-medium">
                {explanatoryTopic.example}
              </div>
            )}

            {explanatoryTopic.tip && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>
                  <strong>Dica Prática:</strong> {explanatoryTopic.tip}
                </span>
              </div>
            )}

            <button
              onClick={() => setExplanatoryTopic(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
