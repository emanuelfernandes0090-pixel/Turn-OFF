import React from "react";
import {
  ArrowLeft,
  Calendar,
  Zap,
  Users,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Share2,
  Sliders,
  DollarSign,
  TrendingDown,
  CheckCircle2,
  Tv,
  Thermometer,
  Lightbulb,
  Droplets,
  HardDrive,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";
import { SavedDiagnosis, AccessibilitySettings } from "../types";
import { formatBRL, formatNumber } from "../lib/energy";

interface SavedDiagnosisDetailProps {
  diagnosis: SavedDiagnosis;
  onBack: () => void;
  onOpenSimulator: (diagnosis: SavedDiagnosis) => void;
  onShare: (diagnosis: SavedDiagnosis) => void;
  settings: AccessibilitySettings;
}

export const SavedDiagnosisDetail: React.FC<SavedDiagnosisDetailProps> = ({
  diagnosis,
  onBack,
  onOpenSimulator,
  onShare,
  settings,
}) => {
  const { input, result, createdAt, kind } = diagnosis;

  // Prepare horizontal ranked chart data
  const totalEstimated = result.totalEstimated || 1;
  const chartData = [...(result.estimates || [])]
    .sort((a, b) => b.monthlyKwh - a.monthlyKwh)
    .slice(0, 8)
    .map((item) => {
      const pct = ((item.monthlyKwh / totalEstimated) * 100).toFixed(1);
      return {
        name: item.label.length > 20 ? item.label.slice(0, 18) + "..." : item.label,
        kwh: Math.round(item.monthlyKwh),
        percentage: pct,
        label: `${Math.round(item.monthlyKwh)} kWh (${pct}%)`,
      };
    });

  const formattedDate = new Date(createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div id="saved-diagnosis-detail-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <button
            type="button"
            id="btn-detail-back-history"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Histórico
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
              Detalhes do Diagnóstico
            </h1>
            <span
              className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full ${
                kind === "teste"
                  ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              }`}
            >
              {kind === "teste" ? "Simulação de Teste" : "Diagnóstico Principal"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Salvo em {formattedDate}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-detail-share"
            onClick={() => onShare(diagnosis)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            Compartilhar
          </button>
          <button
            type="button"
            id="btn-detail-open-simulator"
            onClick={() => onOpenSimulator(diagnosis)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            Abrir no Simulador "E se?"
          </button>
        </div>
      </div>

      {/* Critical Safety Notice if any safety risks were identified */}
      {result.safetyAlert && (
        <div
          id="saved-detail-safety-alert"
          className="p-5 rounded-3xl bg-red-50 dark:bg-red-950/40 border-2 border-red-500 text-red-950 dark:text-red-200 shadow-sm space-y-2"
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />
            <h3 className="font-bold text-sm sm:text-base">
              Atenção: Alerta de Segurança Elétrica Registrado
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-red-900/90 dark:text-red-300 leading-relaxed">
            Durante este diagnóstico foram apontadas condições elétricas de risco (ex: aquecimento em tomadas, cheiro de fiação queimada, ausência de aterramento ou disjuntor incompatível). A integridade e segurança da sua família são prioritárias: consulte um profissional eletricista qualificado.
          </p>
        </div>
      )}

      {/* Main Metrics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            Total Estimado
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
            {formatNumber(result.totalEstimated)} <span className="text-xs font-normal text-slate-500">kWh/mês</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Fatura real informada: {input.monthlyKwh} kWh
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Custo Estimado
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-['Space_Grotesk']">
            {formatBRL(result.totalEstimated * result.effectiveCostPerKwh)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Tarifa base: {formatBRL(result.effectiveCostPerKwh)}/kWh
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            Por Morador
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
            {formatNumber(result.kwhPerPerson)} <span className="text-xs font-normal text-slate-500">kWh</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {formatBRL(result.costPerPerson)}/pessoa ({input.occupants} pessoas)
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
            Confiabilidade
          </span>
          <p className="text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-400 font-['Space_Grotesk']">
            {result.confidenceScore}%
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
            Nível: {result.confidence} ({result.coherence})
          </p>
        </div>
      </div>

      {/* Distribution Chart */}
      {chartData.length > 0 && (
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              Ranking de Consumo por Aparelho
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribuição estimada das maiores parcelas de energia da residência
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 90, left: 10, bottom: 5 }}
              >
                <XAxis type="number" hide domain={[0, "dataMax + 10"]} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  stroke="#94a3b8"
                />
                <Tooltip
                  formatter={(val: any) => [`${val} kWh/mês`, "Consumo Mensal"]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="kwh"
                  fill="#10b981"
                  radius={[0, 8, 8, 0]}
                  barSize={18}
                >
                  <LabelList
                    dataKey="label"
                    position="right"
                    style={{ fontSize: "11px", fontWeight: "bold", fill: "#10b981" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Appliances List */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Aparelhos Inventariados ({result.estimates?.length || 0})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detalhamento de potência, regime de uso e impacto na conta
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Aparelho</th>
                <th className="py-2.5 px-3 font-semibold text-center">Qtd</th>
                <th className="py-2.5 px-3 font-semibold text-right">Potência</th>
                <th className="py-2.5 px-3 font-semibold text-right">Uso Diário</th>
                <th className="py-2.5 px-3 font-semibold text-right">Consumo (kWh)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Custo Estimado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {result.estimates?.map((item) => {
                const itemCost = item.monthlyKwh * result.effectiveCostPerKwh;
                const pct = ((item.monthlyKwh / totalEstimated) * 100).toFixed(1);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {pct}% do consumo estimado
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300 font-medium">
                      {item.quantity || 1}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">
                      {item.powerWatts} W
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">
                      {item.hoursPerDay}h/dia ({item.frequency || 30}d/mês)
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatNumber(item.monthlyKwh)} kWh
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatBRL(itemCost)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations & Potential Savings */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            Recomendações Geradas neste Diagnóstico
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {result.recommendations.map((rec) => {
              const maxSavings = rec.potentialKwh?.[1] || 0;
              return (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {rec.title}
                    </h4>
                    {maxSavings > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                        Economia ~{formatNumber(maxSavings)} kWh
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {settings.simpleLanguage && rec.actionSimple ? rec.actionSimple : rec.action}
                  </p>
                  {(rec.why || rec.whySimple) && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
                      {settings.simpleLanguage && rec.whySimple ? rec.whySimple : rec.why}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
