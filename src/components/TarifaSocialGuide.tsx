import React, { useState } from "react";
import {
  HeartHandshake,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  FileCheck,
  Building,
  ArrowRight,
  TrendingDown,
  Info,
  DollarSign,
  Zap,
} from "lucide-react";
import { calculateTseeDiscount, formatBRL, formatNumber } from "../lib/energy";
import { AccessibilitySettings } from "../types";

interface TarifaSocialGuideProps {
  settings: AccessibilitySettings;
}

export const TarifaSocialGuide: React.FC<TarifaSocialGuideProps> = ({ settings }) => {
  const [testKwh, setTestKwh] = useState<number>(140);
  const [baseTariff, setBaseTariff] = useState<number>(0.85);

  const tseeCalc = calculateTseeDiscount(testKwh, baseTariff);
  const annualSavings = tseeCalc.totalDiscountValue * 12;

  return (
    <div id="tarifa-social-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
          <HeartHandshake className="w-3.5 h-3.5" />
          Direito Social & Cidadania
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
          Tarifa Social de Energia Elétrica (TSEE)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          {settings.simpleLanguage
            ? "A Tarifa Social é um benefício do governo que dá desconto na conta de luz para famílias que precisam. Veja aqui se você tem direito e como pedir na sua distribuidora."
            : "Desconto tarifário regulamentado pela ANEEL e Governo Federal. Concede até 100% de gratuidade na parcela de consumo para a primeira faixa de consumo residencial."}
        </p>
      </div>

      {/* Interactive TSEE Calculator */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Simulador de Desconto da Tarifa Social
            </h3>
            <p className="text-xs text-slate-500">
              Veja quanto sua família economiza por mês caso cadastrada no CadÚnico
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            Regras Federais Vigentes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Consumo Mensal na Fatura (kWh)
            </label>
            <input
              id="input-tsee-kwh"
              type="number"
              min="0"
              max="1500"
              value={testKwh || ""}
              onChange={(e) => setTestKwh(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
              placeholder="0"
              className="w-full text-lg font-bold p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
            />
            <span className="text-[11px] text-slate-400 block">
              Até 80 kWh/mês o consumo é 100% gratuito pela nova regra.
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Tarifa Base da Concessionária (R$/kWh)
              </label>
              <div className="flex gap-1">
                {[0.75, 0.85, 0.95, 1.10].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBaseTariff(t)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                      baseTariff === t
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {t.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
            <input
              id="input-tsee-tariff"
              type="number"
              step="0.01"
              min="0"
              value={baseTariff || ""}
              onChange={(e) => setBaseTariff(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
              placeholder="0.85"
              className="w-full text-lg font-bold p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
            />
            <span className="text-[11px] text-slate-400 block">
              Você pode digitar o valor exato da sua conta (TE + TUSD + Tributos) ou clicar nos atalhos acima.
            </span>
          </div>
        </div>

        {/* Calculation Result Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-xs text-slate-500">Sem Tarifa Social</span>
            <div className="text-xl font-bold text-slate-700 dark:text-slate-300">
              {formatBRL(tseeCalc.standardCost)}/mês
            </div>
            <p className="text-[11px] text-slate-400">Cobrança integral</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-1">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Com Tarifa Social Aplicada
            </span>
            <div className="text-2xl font-black text-emerald-800 dark:text-emerald-200 font-['Space_Grotesk']">
              {formatBRL(tseeCalc.tseeCost)}/mês
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Desconto de {formatBRL(tseeCalc.totalDiscountValue)}/mês
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-600 text-white space-y-1 shadow-md">
            <span className="text-xs text-emerald-100 font-semibold">Economia em 1 Ano</span>
            <div className="text-2xl font-black font-['Space_Grotesk']">
              {formatBRL(annualSavings)}
            </div>
            <p className="text-[11px] text-emerald-100">
              Valor poupado que permanece na renda da família
            </p>
          </div>
        </div>

        {/* Tier Breakdown Table */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
              Regra Vigente por Faixa de Consumo (Lei 15.235/2025)
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Faixa Única Nacional
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-emerald-500/50 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Até 80 kWh/mês</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">100% Gratuito</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Gratuidade total na parcela de consumo de energia para famílias beneficiárias.
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Acima de 80 kWh/mês</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">Tarifa Integral</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Incide a tarifa normal da distribuidora exclusivamente sobre os quilowatts-hora que ultrapassarem os 80 kWh.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Who is Eligible & How to Apply */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Quem tem direito */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
            <CheckCircle2 className="w-5 h-5" />
            Quem Tem Direito à Tarifa Social?
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <span>
                <strong>Famílias inscritas no CadÚnico</strong> com renda familiar mensal por pessoa menor ou igual a meio salário mínimo nacional.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <span>
                <strong>Idosos com 65 anos ou mais</strong> ou pessoas com deficiência que recebam o Benefício de Prestação Continuada da Assistência Social (<strong>BPC / LOAS</strong>).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <span>
                <strong>Famílias no CadÚnico com renda de até 3 salários mínimos</strong> que possuam membro com doença ou deficiência cujo tratamento exija o uso continuado de aparelhos elétricos (aparelhos de suporte vital).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <span>
                <strong>Famílias indígenas e quilombolas</strong> inscritas no CadÚnico têm gratuidade de 100% até 50 kWh/mês.
              </span>
            </li>
          </ul>
        </div>

        {/* Card: Passo a passo para solicitar */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-base">
            <Building className="w-5 h-5" />
            Como Solicitar e Garantir Seu Desconto
          </div>
          <ol className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 list-decimal list-inside">
            <li className="leading-relaxed">
              <strong>Atualize o CadÚnico no CRAS:</strong> Seus dados devem ter sido atualizados nos últimos 2 anos no Centro de Referência de Assistência Social da sua cidade.
            </li>
            <li className="leading-relaxed">
              <strong>Cruze o CPF com a Conta de Luz:</strong> A lei federal prevê cadastramento automático quando o CPF do titular da conta de luz é o mesmo do responsável pelo CadÚnico.
            </li>
            <li className="leading-relaxed">
              <strong>Solicite na Distribuidora:</strong> Se não recebeu automaticamente, ligue para a distribuidora de energia (Enel, Cemig, CPFL, Equatorial, Neoenergia, Celesc, etc.) e informe seu NIS (Número de Identificação Social) ou número do benefício BPC e o código do cliente da conta.
            </li>
            <li className="leading-relaxed">
              <strong>Importante:</strong> Cada família tem direito ao benefício em apenas uma unidade consumidora residencial.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
