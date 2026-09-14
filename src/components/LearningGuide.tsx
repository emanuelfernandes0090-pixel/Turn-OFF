import React, { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Zap,
  Gauge,
  CheckCircle2,
  AlertCircle,
  Clock,
  Home,
  ShieldCheck,
  Award,
  Flame,
  Tv,
  ArrowRight,
  Calculator,
  FileText,
  HeartHandshake,
  Users,
  Scale,
} from "lucide-react";
import { AccessibilitySettings } from "../types";
import { AdSlot } from "./AdSlot";
import { formatBRL, formatNumber } from "../lib/energy";

interface LearningGuideProps {
  settings: AccessibilitySettings;
}

export const LearningGuide: React.FC<LearningGuideProps> = ({ settings }) => {
  // Pocket calculator state
  const [calcWatts, setCalcWatts] = useState<number>(1000);
  const [calcHours, setCalcHours] = useState<number>(2);
  const [calcDays, setCalcDays] = useState<number>(30);
  const [calcTariff, setCalcTariff] = useState<number>(0.88);

  const pocketMonthlyKwh = (calcWatts / 1000) * calcHours * calcDays;
  const pocketMonthlyCost = pocketMonthlyKwh * calcTariff;

  // Active accordion section
  const [activeAccordion, setActiveAccordion] = useState<string>("bill-parts");

  return (
    <div id="learning-guide-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
          <GraduationCap className="w-3.5 h-3.5" />
          Aprender & Compreender
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
          Guia de Aprendizado & Eficiência Energética
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          {settings.simpleLanguage
            ? "Aprenda como funciona a sua conta de luz, como calcular o consumo de qualquer aparelho e como ler o relógio da sua casa sem complicação."
            : "Fundamentos técnicos e didáticos sobre o sistema elétrico residencial brasileiro, desvendando tarifas, bandeiras, medição e rotinas eficientes."}
        </p>
      </div>

      {/* Interactive Pocket Calculator */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-50/80 to-indigo-50/60 dark:from-slate-900 dark:to-slate-800 border border-blue-200 dark:border-slate-700 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Calculadora de Bolso: Como Calcular Qualquer Aparelho
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fórmula oficial: <code className="font-mono font-bold text-blue-700 dark:text-blue-300">(Potência em Watts × Horas/dia × Dias) ÷ 1000 = kWh</code>
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
            Física Aplicada
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Potência do Aparelho (Watts)
            </label>
            <input
              id="input-pocket-watts"
              type="number"
              min="0"
              max="15000"
              value={calcWatts || ""}
              onChange={(e) => setCalcWatts(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
              placeholder="0"
              className="w-full text-sm font-bold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-blue-500"
            />
            <span className="text-[10px] text-slate-400">Olhe a etiqueta atrás do produto</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Horas Ligado por Dia
            </label>
            <input
              id="input-pocket-hours"
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={calcHours || ""}
              onChange={(e) => setCalcHours(e.target.value === "" ? 0 : Math.min(24, Math.max(0, Number(e.target.value))))}
              placeholder="0"
              className="w-full text-sm font-bold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-blue-500"
            />
            <span className="text-[10px] text-slate-400">Ex: 2 horas</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Dias no Mês
            </label>
            <input
              id="input-pocket-days"
              type="number"
              min="0"
              max="30"
              value={calcDays || ""}
              onChange={(e) => setCalcDays(e.target.value === "" ? 0 : Math.min(30, Math.max(0, Number(e.target.value))))}
              placeholder="0"
              className="w-full text-sm font-bold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-blue-500"
            />
            <span className="text-[10px] text-slate-400">Ex: 30 dias</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Tarifa com Impostos (R$/kWh)
            </label>
            <input
              id="input-pocket-tariff"
              type="number"
              step="0.01"
              min="0"
              value={calcTariff || ""}
              onChange={(e) => setCalcTariff(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
              placeholder="0.94"
              className="w-full text-sm font-bold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-blue-500"
            />
            <span className="text-[10px] text-slate-400">Média Ceará ~R$ 0,94</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
              Consumo Mensal Deste Aparelho:
            </span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-['Space_Grotesk']">
              {formatNumber(pocketMonthlyKwh)} kWh/mês
            </div>
          </div>
          <div className="sm:text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
              Custo Estimado na Fatura:
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
              {formatBRL(pocketMonthlyCost)}/mês
            </div>
            <span className="text-[11px] text-slate-400">ou {formatBRL(pocketMonthlyCost * 12)} por ano</span>
          </div>
        </div>
      </div>

      {/* Module 1: Desvendando a Conta de Luz */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          1. O que Significam os Termos da Sua Conta de Luz?
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Tarifa de Energia (TE)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Geração
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              É o valor que você paga pela eletricidade gerada nas usinas (hidrelétricas, solares, eólicas e termelétricas). Remunera quem produz os elétrons.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Tarifa de Uso da Distribuição (TUSD)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Postes e Fios
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Paga a infraestrutura física da distribuidora (ex: Enel, Cemig, Light): postes, cabos de alta e baixa tensão, transformadores, subestações e equipes técnicas de manutenção 24h.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Bandeiras Tarifárias (ANEEL)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                Condição Climática
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Sinalizam se a geração do país está barata (água abundante nas hidrelétricas = Bandeira Verde, sem acréscimo) ou cara (seca exigindo acionamento de termelétricas a combustível fóssil = Bandeira Amarela ou Vermelha Patamar 1 e 2).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Tributos (ICMS, PIS/COFINS) e COSIP</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                Governo e Prefeitura
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O ICMS vai para o Governo do seu Estado. O PIS e a COFINS vão para a União Federal. A COSIP/CIP vai diretamente para a Prefeitura Municipal manter os postes das ruas iluminados.
            </p>
          </div>
        </div>
      </div>

      {/* Module 2: Como Ler o Relógio Medidor */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
          <Gauge className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          2. Como Ler o Medidor de Luz (Relógio Medidor) na Prática
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Digital */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                Medidor Eletrônico Digital (Display LCD)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                Mais Comum
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O display mostra os números diretamente em formato digital.
            </p>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-700 font-mono text-center text-lg font-black tracking-widest text-emerald-800 dark:text-emerald-300">
              014827 kWh
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
              <li>Anote o número inteiro (desconsidere casas decimais se houver).</li>
              <li>Para saber o consumo do mês: pegue o valor de hoje e subtraia a leitura da fatura anterior.</li>
            </ul>
          </div>

          {/* Ponteiros (Ciclométrico) */}
          <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                Medidor Eletromecânico de Ponteiros (4 ou 5 Reloginhos)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                Modelos Antigos
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Cada reloginho gira no sentido inverso do vizinho (horário e anti-horário).
            </p>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-700 text-xs font-semibold text-amber-900 dark:text-amber-200 space-y-1">
              <p>• Leia sempre da esquerda para a direita (milhar, centena, dezena, unidade).</p>
              <p>• Se o ponteiro estiver entre dois números, <strong>anote sempre o menor</strong> (ex: entre 3 e 4, anote 3).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Module 3: Selo Procel e Etiqueta INMETRO */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
          <Award className="w-5 h-5 text-amber-500" />
          3. O que é o Selo Procel e a Etiqueta Nacional de Conservação de Energia (ENCE)?
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          O <strong>Selo Procel</strong> é concedido anualmente pelo Governo Federal aos equipamentos mais eficientes de cada categoria testados pelo INMETRO.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-1.5">
            <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
              Classe A+++ / A++ / A
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              Consomem até 40% a 60% menos energia elétrica que a média de mercado. Possuem compressores Inverter e isolamento térmico premium.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-1.5">
            <span className="font-bold text-xs text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
              Classe B e C
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              Eficiência intermediária. O produto pode ser mais barato na prateleira da loja, mas cobra o dobro ao longo de 5 anos na conta de luz.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 space-y-1.5">
            <span className="font-bold text-xs text-rose-800 dark:text-rose-300 uppercase tracking-wider block">
              Classe D e E (ou Aparelhos com mais de 10 Anos)
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              Altíssimo desperdício de energia. Motores e resistências antigas que geram calor excessivo e encarecem a fatura familiar.
            </p>
          </div>
        </div>
      </div>

      {/* Module 4: Consumo Oculto e Standby */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
          <Tv className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          4. O "Consumo Fantasma" do Standby: Quem Está Gastando Energia Desligado?
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Mesmo com o aparelho desligado no controle remoto, circuitos de recepção de sinal, mostradores de relógio e sensores internos continuam puxando eletricidade 24 horas por dia.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { name: "Decodificador de TV a Cabo", watts: "12 a 22 W", cost: "R$ 8 a 15/mês", tip: "Consome quase o mesmo ligado ou em espera." },
            { name: "Console de Videogame", watts: "8 a 15 W", cost: "R$ 6 a 10/mês", tip: 'Desative a opção "Inicialização Rápida".' },
            { name: "Micro-ondas com Relógio", watts: "3 a 5 W", cost: "R$ 2 a 4/mês", tip: "O relógio digital gasta mais energia no ano que esquentar pratos." },
            { name: "Carregador Plugado Vazio", watts: "0,5 a 2 W", cost: "R$ 0,50 a 1/mês", tip: "Desconecte da tomada ao retirar o celular." },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-1.5"
            >
              <h5 className="font-bold text-xs text-purple-950 dark:text-purple-200">{item.name}</h5>
              <div className="flex items-center justify-between text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                <span>{item.watts}</span>
                <span>{item.cost}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.tip}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Dica de Ouro:</strong> Conecte a TV, o receptor e o videogame a uma régua / filtro de linha com interruptor liga/desliga. Ao ir dormir ou sair de casa, basta apertar um único botão.
          </span>
        </div>
      </div>

      {/* Module 5: Como Ler Sua Fatura Passo a Passo (Exemplo Real Enel Ceará) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            5. Como "Ler" Sua Fatura de Energia Passo a Passo (Exemplo Enel)
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
            Guia Prático
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          A conta de luz brasileira possui um layout padronizado pelas normas da ANEEL. Veja onde encontrar cada informação essencial para auditar sua cobrança:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
                Nº de Cliente / Código da Instalação (UC)
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Topo da Fatura</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Identifica seu imóvel perante a distribuidora. É o número que você informa ao ligar para o 0800, solicitar reparos na rede ou pedir inclusão na Tarifa Social.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                Mês de Referência e Vencimento
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Destaque Superior</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O mês de referência (ex: 04/2026) refere-se ao período de leitura entre os dias 15 do mês anterior e 15 do mês atual. O vencimento deve ter pelo menos 5 dias úteis de antecedência do recebimento.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                Consumo Faturado em kWh
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Quadro Central de Medição</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Calculado pela fórmula: <code>(Leitura Atual - Leitura Anterior) × Constante do Medidor</code>. É sobre esse valor que toda a conta é calculada. Compare com seu relógio para verificar se houve erro de digitação pelo leiturista.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">4</span>
                O que são TE e TUSD?
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Demonstrativo de Valores</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              A <strong>TE (Tarifa de Energia)</strong> remunera a geração da usina elétrica (hidrelétrica, eólica, solar). A <strong>TUSD (Tarifa de Distribuição)</strong> remunera a manutenção dos postes, cabos e transformadores da concessionária.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">5</span>
                Impostos (ICMS, PIS, COFINS) e CIP
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Tributos Discriminados</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Podem representar até 30% a 40% do total da fatura. Famílias cadastradas na Tarifa Social com consumo até certo teto têm alíquota reduzida de ICMS conforme a legislação de cada estado.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">6</span>
                Histórico de Consumo (Últimos 12 Meses)
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Gráfico na Fatura</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Permite acompanhar a sazonalidade (ex: meses mais quentes no Nordeste com maior uso de ventiladores e geladeira) e identificar saltos anormais que apontem fuga de corrente elétrica.
            </p>
          </div>
        </div>
      </div>

      {/* Module 6: Temas de Interesse Social e Direitos do Consumidor */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
            <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            6. Temas de Interesse Social e Direitos do Consumidor (ANEEL)
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
            Cidadania Energética
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          A energia elétrica é um serviço público essencial. Conheça as principais proteções legais garantidas pela Resolução Normativa ANEEL nº 1.000/2021:
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/80 flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200">
                Tarifa Social de Energia Elétrica (TSEE) — Gratuidade até 80 kWh/mês
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Famílias inscritas no Cadastro Único (CadÚnico) com renda per capita de até meio salário mínimo, beneficiários do BPC (Benefício de Prestação Continuada) ou famílias com pessoa com deficiência dependente de aparelhos de sobrevida têm direito à gratuidade de 100% na parcela de consumo até 80 kWh/mês conforme a Lei Federal nº 15.235/2025. Acima dessa faixa, paga-se apenas a tarifa regular sobre os kWh excedentes.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/80 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-200">
                Proibição de Corte em Sextas-Feiras e Vésperas de Feriado
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Pela Lei nº 14.015/2020 e normas da ANEEL, a distribuidora <strong>não pode suspender o fornecimento</strong> na sexta-feira, sábado, domingo, feriado ou no dia anterior a feriados. A suspensão só pode ocorrer após notificação formal com antecedência mínima de 15 dias corridos.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
                Ressarcimento por Aparelhos Queimados por Queda ou Picos de Tensão
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Se uma tempestade, pico de luz ou oscilação na rede queimar sua geladeira, TV ou motor, a distribuidora é obrigada por lei a indenizar ou consertar o aparelho. Registre a ocorrência pelo canal de atendimento em até 90 dias com a data e horário aproximado do ocorrido.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-3">
            <Users className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
                Cadastro de Usuários com Aparelhos de Sobrevida Médica
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Residências com pessoas que utilizam concentradores de oxigênio, respiradores mecânicos ou equipamentos vitais contínuos podem cadastrar a unidade consumidora como prioritária. Em caso de corte acidental ou desligamento programado na rede, a concessionária deve avisar antecipadamente e fornecer gerador emergencial se necessário.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Discrete ad banner placeholder if enabled */}
      <AdSlot placement="learning-footer" />
    </div>
  );
};
