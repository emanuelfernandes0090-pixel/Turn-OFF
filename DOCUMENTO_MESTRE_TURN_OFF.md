# DOCUMENTO MESTRE DE CONTEXTO E ESPECIFICAÇÃO TÉCNICA
## PROJETO: Turn OFF — Eficiência Energética Residencial & Segurança Elétrica
**Criadores Originais**: GT-02 do 3º Técnico em Sistemas de Energia Renovável da EEEP Dom Walfrido Teixeira Vieira  
**Versão Atual**: 2.5 (Edição Master Web + APK Ready)  
**ID do Applet no Google AI Studio**: `3cdf2ab5-6d1b-4264-9250-925861e46e22`

---

## 1. QUAL O MELHOR MODELO NO GOOGLE AI STUDIO (ASSINATURA)?
Para contas com assinatura do Google AI Studio / Gemini Advanced / Pay-As-You-Go:

1. **Modelo Recomendado para Produção (Turn OFF)**: **`gemini-3.8-flash`** com fallback automático para **`gemini-3.6-flash`**.
   - **Por que é o melhor?**: O Gemini 3 Flash possui velocidade instantânea de inferência (menos de 1 a 2 segundos), altíssima fidelidade na leitura de imagens com texto denso (tabelas de faturas de luz de concessionárias brasileiras, com ICMS, PIS/COFINS, TUSD, TE e histórico de consumo) e suporte a raciocínio rápido para responder dúvidas no chat.
   - **Custo e Cota**: Na cota gratuita (Free Tier) do Google AI Studio, o modelo Flash oferece até **15 RPM (requisições por minuto)** e **1.500 RPD (requisições por dia)** sem custo algum. Em contas com assinatura/faturamento ativo (Pay-As-You-Go), ele custa centavos de dólar por milhão de tokens (cerca de R$ 0,001 por análise de fatura), permitindo milhares de análises sem gerar custos significativos.
2. **Modelo Recomendado para Tarefas Pesadas / Raciocínio Profundo**: **`gemini-3.1-pro`** ou **`gemini-2.5-pro`**
   - Ideal para análises técnicas complexas de engenharia ou geração de relatórios longos de auditoria, mas desnecessário para o dia a dia do app pois o Flash já entrega precisão total.

---

## 2. ARQUITETURA DO APK E PROCESSAMENTO DA IA (SCANNER E CHAT)
### Como o APK vai funcionar?
O projeto foi construído sobre React + Vite + TypeScript e está 100% preparado para ser empacotado como aplicativo nativo Android (**APK / AAB**) utilizando o ecossistema **Capacitor** (`@capacitor/core`, `@capacitor/android`, `@capacitor/camera`).

### O APK vai mandar para um servidor ou terá uma IA integrada no app?
Existem duas abordagens no mercado e a resposta técnica objetiva é:

1. **Abordagem Adotada (Mais consistente e profissional): Servidor Seguro com API Gemini**
   - **Como funciona**: O APK do celular captura a foto da conta de luz ou envia a mensagem de dúvida para uma rota backend segura (`/api/ocr-bill` e `/api/assistant`). O servidor processa no Google Gemini e devolve os dados estruturados em JSON para o app.
   - **Por que não colocar uma IA pesada direto dentro do APK?**: Modelos de visão capazes de ler faturas em português (como tabelas fiscais de concessionárias brasileiras) pesam entre **2 GB a 4 GB** e exigem chips gráficos topo de linha. Colocar uma IA desse tamanho dentro do APK faria o aplicativo pesar gigabytes, travaria celulares comuns das famílias e esgotaria a bateria em minutos.
   - **E se a internet cair?**: O Turn OFF conta com uma **dupla camada de contingência (Extrator Determinístico Offline)**:
     - Mesmo sem internet ou sem créditos na IA, o leitor de PDF e os cálculos matemáticos continuam funcionando 100% no aparelho de forma determinística e gratuita.

2. **É algo consistente e gratuito para sempre?**
   - **Consistência**: Sim, 100% estável. O backend utiliza chamadas com validação de esquema JSON e fallbacks defensivos.
   - **Gratuidade**: O Google AI Studio oferece o **Free Tier** (nível gratuito de chaves de API) com limites generosos (até 1.500 análises diárias gratuitas). Além disso, todas as 9 ferramentas essenciais do app (Diagnóstico, Simulador, Payback, Segurança, Guia, Tarifa Social, Histórico e Tutorial) **são 100% locais e gratuitas para sempre**, não dependendo de servidor nem de pagamentos para funcionar.

---

## 3. LOGO OFICIAL
A nova logo criada (`TurnOffLogo.tsx`) incorpora:
- **Formato de ícone arredondado** com gradiente verde floresta profundo (`#064e3b` a `#042f2e`).
- **Símbolo clássico Power (Liga/Desliga)** em branco espesso e nítido.
- **Raio de energia elétrica** dourado/verde saindo do topo direito.
- **Folha de sustentabilidade e eficiência** integrada ao contorno circular.
- **Ponto ativo de conexão**.

---

## 4. BASE DE DADOS E CÁLCULOS 100% CONDIZENTES COM A REALIDADE
O aplicativo baseia-se rigorosamente nas normas da ANEEL, PROCEL, Inmetro e NBR 5410 da ABNT:

### A. Fórmula Física Real:
$$\text{Consumo Mensal (kWh)} = \frac{\text{Potência (W)}}{1000} \times \text{Horas/dia} \times \text{Dias/mês} \times \text{Fator de Utilização (Duty Cycle)}$$
- **Equipamentos Contínuos** (lâmpadas, TVs, ventiladores): Fator = `1.0`.
- **Equipamentos Cíclicos com Termostato/Compressor**:
  - **Geladeira Frost Free Duplex**: Fator de `0.40` (o compressor opera em ciclos liga/desliga de ~40% do tempo).
  - **Freezer**: Fator de `0.45`.
  - **Ar-condicionado Convencional**: Fator de `0.60`.
  - **Ar-condicionado Inverter**: Fator reduzido para `0.50` graças à modulação eletrônica de rotação.
  - **Ferro de Passar**: Fator de `0.70` (chaveamento bimetálico).
- **Equipamentos Pontuais**: Minutos de uso convertidos matematicamente para frações de hora.

### B. Base de Tarifas das Concessionárias Brasileiras:
O app inclui dados homologados pela ANEEL para as principais concessionárias do país:
- **Enel Ceará (CE)**: R$ 0,772 homologado (R$ 0,941 com tributos médios).
- **Enel São Paulo (SP)**: R$ 0,715 homologado (R$ 0,852 com tributos).
- **CPFL Paulista (SP)**: R$ 0,728 homologado (R$ 0,865 com tributos).
- **Light (RJ)**: R$ 0,798 homologado (R$ 1,025 com tributos).
- **Enel Rio (RJ)**: R$ 0,835 homologado (R$ 1,072 com tributos).
- **Cemig (MG)**: R$ 0,732 homologado (R$ 0,884 com tributos).
- **Coelba (BA)**: R$ 0,758 homologado (R$ 0,923 com tributos).
- **Neoenergia PE (PE)**: R$ 0,742 homologado (R$ 0,895 com tributos).
- **Copel (PR)**: R$ 0,695 homologado (R$ 0,832 com tributos).
- **RGE (RS)**: R$ 0,739 homologado (R$ 0,891 com tributos).
- **Celesc (SC)**: R$ 0,648 homologado (R$ 0,775 com tributos).
- **Equatorial Goiás (GO)**: R$ 0,712 homologado (R$ 0,863 com tributos).
- **Equatorial Pará (PA)**: R$ 0,845 homologado (R$ 1,042 com tributos).
- **Equatorial Maranhão (MA)**: R$ 0,768 homologado (R$ 0,935 com tributos).
- **Neoenergia Brasília (DF)**: R$ 0,675 homologado (R$ 0,812 com tributos).
- **Amazonas Energia (AM)**: R$ 0,812 homologado (R$ 0,998 com tributos).

### C. Tarifa Social de Energia Elétrica (TSEE):
- Considera as diretrizes atualizadas da ANEEL e Governo Federal: gratuidade de 100% da parcela de consumo de energia nos primeiros **80 kWh** para famílias elegíveis (CadÚnico e BPC), aplicando a tarifa proporcional apenas sobre o excedente.

---

## 5. IA EXPLICATIVA INTERATIVA
- Implementado componente `AIAssistantChat.tsx` acionado via configurações de acessibilidade.
- Rota backend dedicada `/api/assistant` com integração ao Google GenAI.
- Fornece respostas didáticas para todas as dúvidas de uso, cálculos, dicas de segurança NBR 5410 e passo a passo das telas.

---

## 6. COMO GERAR O ARQUIVO .ZIP E MIGRAR DE CONTA
Para mover o projeto para outra conta do Google AI Studio por assinatura:
1. No canto superior direito da tela do AI Studio Build, clique no menu de opções (`...` ou Configurações) e selecione **"Export to ZIP"** ou **"Export to GitHub"**.
2. Na sua nova conta com assinatura, abra o Google AI Studio Build e escolha **"Import Project"** selecionando o arquivo `.zip` exportado.
3. Todas as alterações, componentes, estilos e documentações estarão intactos e prontos para compilar.

---

## 7. COMO GERAR O APK ANDROID
Caso deseje gerar o `.apk` localmente com o Android Studio:
```bash
# 1. Instalar o Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Inicializar o Capacitor
npx cap init "Turn OFF" "com.turnoff.app" --web-dir dist

# 3. Gerar a build estática do Vite
npm run build

# 4. Adicionar a plataforma Android
npx cap add android

# 5. Sincronizar e abrir no Android Studio
npx cap sync
npx cap open android
```
No Android Studio, clique em **Build > Build Bundle(s) / APK(s) > Build APK(s)** para gerar o arquivo `.apk` de instalação.
