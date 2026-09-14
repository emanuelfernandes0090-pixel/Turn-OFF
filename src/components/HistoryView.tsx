import React, { useState } from "react";
import {
  History,
  Trash2,
  Download,
  Upload,
  Calendar,
  Zap,
  TrendingUp,
  TrendingDown,
  FileText,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Share2,
  DollarSign,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  SavedDiagnosis,
  BillScanRecord,
  AccessibilitySettings,
} from "../types";
import { formatBRL, formatNumber } from "../lib/energy";
import { exportAppData, importAppData } from "../lib/storage";
import { SavedDiagnosisDetail } from "./SavedDiagnosisDetail";
import { AdSlot } from "./AdSlot";

interface HistoryViewProps {
  diagnoses: SavedDiagnosis[];
  billScans: BillScanRecord[];
  onSelectDiagnosis: (diagnosis: SavedDiagnosis) => void;
  onSelectBill: (billScan: BillScanRecord) => void;
  onDeleteDiagnosis: (id: string) => void;
  onDeleteBill: (id: string) => void;
  onClearAll: () => void;
  onDataImported: () => void;
  onOpenShare?: (diagnosis?: SavedDiagnosis) => void;
  onOpenSimulator?: (diagnosis: SavedDiagnosis) => void;
  settings: AccessibilitySettings;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  diagnoses,
  billScans,
  onSelectDiagnosis,
  onSelectBill,
  onDeleteDiagnosis,
  onDeleteBill,
  onClearAll,
  onDataImported,
  onOpenShare,
  onOpenSimulator,
  settings,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"diagnoses" | "bills">("diagnoses");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedDiagnosisDetail, setSelectedDiagnosisDetail] = useState<SavedDiagnosis | null>(null);
  const [billMetric, setBillMetric] = useState<"kwh" | "brl">("kwh");

  // If a diagnosis is selected for detailed inspection, render the SavedDiagnosisDetail view
  if (selectedDiagnosisDetail) {
    return (
      <SavedDiagnosisDetail
        diagnosis={selectedDiagnosisDetail}
        onBack={() => setSelectedDiagnosisDetail(null)}
        onOpenSimulator={(diag) => {
          if (onOpenSimulator) {
            onOpenSimulator(diag);
          } else {
            onSelectDiagnosis(diag);
          }
        }}
        onShare={(diag) => {
          if (onOpenShare) {
            onOpenShare(diag);
          }
        }}
        settings={settings}
      />
    );
  }

  // Group diagnoses: Principal vs Teste
  const principalDiagnoses = diagnoses.filter((d) => d.kind !== "teste");
  const testDiagnoses = diagnoses.filter((d) => d.kind === "teste");

  // Chart data from saved bills (sorted chronologically)
  const billChartData = (billScans || [])
    .filter((scan) => scan && scan.bill)
    .map((scan) => {
      const dateStr = scan.scannedAt || scan.createdAt || new Date().toISOString();
      const validDate = new Date(dateStr);
      const isDateValid = !isNaN(validDate.getTime());
      const formattedDate = isDateValid
        ? validDate.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
        : "Recente";

      return {
        mes: scan.bill.mes_referencia || formattedDate,
        kWh: scan.bill.consumo_kwh || 0,
        valor: scan.bill.valor_total || 0,
        rawDate: isDateValid ? validDate.getTime() : 0,
      };
    })
    .sort((a, b) => a.rawDate - b.rawDate);

  // Chart data from saved diagnoses (evolution of estimated consumption across analyses)
  const diagnosisChartData = (diagnoses || [])
    .map((diag) => {
      const validDate = new Date(diag.createdAt);
      const isDateValid = !isNaN(validDate.getTime());
      const formattedDate = isDateValid
        ? validDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
        : "Recente";

      return {
        data: formattedDate,
        estimadoKwh: Math.round(diag.result.totalEstimated),
        faturadoKwh: diag.input.monthlyKwh ? Math.round(diag.input.monthlyKwh) : 0,
        custoEstimadoBrl: Math.round(diag.result.totalEstimated * diag.result.effectiveCostPerKwh),
        rawDate: isDateValid ? validDate.getTime() : 0,
        kind: diag.kind === "teste" ? "Simulação" : "Diagnóstico",
      };
    })
    .sort((a, b) => a.rawDate - b.rawDate);

  const handleExportJson = () => {
    const jsonStr = exportAppData();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `turn-off-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const success = importAppData(content);
      if (success) {
        onDataImported();
      } else {
        alert("Arquivo de backup inválido.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="history-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
            <History className="w-3.5 h-3.5" />
            Memória & Evolução
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
            Histórico de Diagnósticos & Faturas
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Acompanhe o histórico de faturas registradas, compare diagnósticos com hipóteses de economia e visualize a evolução do seu consumo ao longo do tempo.
          </p>
        </div>

        {/* Export / Import actions */}
        <div className="flex items-center gap-2">
          <button
            id="btn-export-backup"
            onClick={handleExportJson}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar Backup
          </button>
          <label className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Importar
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
        </div>
      </div>

      {/* Historical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bill Evolution Chart */}
        {billChartData.length > 0 && (
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Evolução das Faturas de Energia
                </h3>
                <span className="text-xs text-slate-400">
                  {billChartData.length} faturas salvas no histórico
                </span>
              </div>

              {/* Metric Toggle: kWh vs R$ */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  id="btn-chart-metric-kwh"
                  onClick={() => setBillMetric("kwh")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    billMetric === "kwh"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Consumo (kWh)
                </button>
                <button
                  type="button"
                  id="btn-chart-metric-brl"
                  onClick={() => setBillMetric("brl")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    billMetric === "brl"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Custo (R$)
                </button>
              </div>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={billChartData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: number) => [
                      billMetric === "kwh" ? `${formatNumber(val)} kWh` : formatBRL(val),
                      billMetric === "kwh" ? "Consumo Faturado" : "Valor Total",
                    ]}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey={billMetric === "kwh" ? "kWh" : "valor"}
                    fill={billMetric === "kwh" ? "#10b981" : "#3b82f6"}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Diagnoses Comparison Chart */}
        {diagnosisChartData.length > 0 && (
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  Evolução dos Diagnósticos (kWh/mês)
                </h3>
                <span className="text-xs text-slate-400">
                  {diagnosisChartData.length} análises realizadas
                </span>
              </div>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diagnosisChartData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: number, name: string) => [
                      `${formatNumber(val)} kWh/mês`,
                      name === "estimadoKwh" ? "Estimado Aparelhos" : "Faturado Conta",
                    ]}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    formatter={(name) => (
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">
                        {name === "estimadoKwh" ? "Estimado pelos Aparelhos" : "Faturado na Conta"}
                      </span>
                    )}
                  />
                  <Bar dataKey="estimadoKwh" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="faturadoKwh" fill="#64748b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Tabs: Diagnoses vs Faturas */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
          <button
            id="tab-history-diagnoses"
            onClick={() => setActiveSubTab("diagnoses")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeSubTab === "diagnoses"
                ? "bg-emerald-600 text-white font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Zap className="w-4 h-4" />
            Diagnósticos Salvos ({diagnoses.length})
          </button>
          <button
            id="tab-history-bills"
            onClick={() => setActiveSubTab("bills")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeSubTab === "bills"
                ? "bg-emerald-600 text-white font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            Faturas Escaneadas ({billScans.length})
          </button>
        </div>

        {/* Diagnoses List */}
        {activeSubTab === "diagnoses" && (
          <div className="space-y-6">
            {/* Real Principal Diagnoses */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                Diagnósticos Principais (Mapeamentos do Lar)
              </span>

              {principalDiagnoses.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">Nenhum diagnóstico principal salvo ainda.</p>
              ) : (
                <div className="space-y-3">
                  {principalDiagnoses.map((diag) => (
                    <div
                      key={diag.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Diagnóstico de {new Date(diag.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                            {diag.result.confidence} confiança
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Consumo faturado: {diag.input.monthlyKwh} kWh · Estimado:{" "}
                          {formatNumber(diag.result.totalEstimated)} kWh · {diag.input.occupants} moradores
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {onOpenShare && (
                          <button
                            type="button"
                            onClick={() => onOpenShare(diag)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                            title="Compartilhar / PDF"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          id={`btn-view-detail-${diag.id}`}
                          onClick={() => setSelectedDiagnosisDetail(diag)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                        >
                          Ver Detalhes
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteDiagnosis(diag.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
                          title="Excluir diagnóstico"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Test Simulations ("E se...") */}
            {testDiagnoses.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                  Simulações de Teste Salvas ("E se...")
                </span>
                <div className="space-y-3">
                  {testDiagnoses.map((diag) => (
                    <div
                      key={diag.id}
                      className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-500 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Hipótese: {new Date(diag.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold">
                            Simulação
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          {diag.simulation?.description || `Novo consumo: ${formatNumber(diag.result.totalEstimated)} kWh/mês`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          id={`btn-view-test-detail-${diag.id}`}
                          onClick={() => setSelectedDiagnosisDetail(diag)}
                          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                        >
                          Ver Detalhes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenSimulator) {
                              onOpenSimulator(diag);
                            } else {
                              onSelectDiagnosis(diag);
                            }
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                        >
                          Abrir no Simulador
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteDiagnosis(diag.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
                          title="Excluir simulação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bills List */}
        {activeSubTab === "bills" && (
          <div className="space-y-3">
            {billScans.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">Nenhuma fatura escaneada salva ainda.</p>
            ) : (
              <div className="space-y-3">
                {billScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {scan.bill.distribuidora || "Conta de Energia"} · {scan.bill.mes_referencia || "Mês vigente"}
                        </span>
                        {scan.bill.tarifa_social_identificada && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                            Tarifa Social
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Consumo: {scan.bill.consumo_kwh ?? "—"} kWh · Total: {formatBRL(scan.bill.valor_total || 0)} · Vencimento: {scan.bill.vencimento || "—"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => onSelectBill(scan)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        Abrir Conta
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteBill(scan.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
                        title="Excluir fatura"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Clear All Safety Action */}
        {(diagnoses.length > 0 || billScans.length > 0) && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            {!showClearConfirm ? (
              <button
                type="button"
                id="btn-clear-all-data"
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
              >
                Limpar todos os dados salvos
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-red-600 font-bold">
                  Tem certeza? Todos os diagnósticos e contas serão apagados.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setShowClearConfirm(false);
                  }}
                  className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Sim, apagar tudo
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Discrete ad banner placeholder if enabled */}
        <AdSlot placement="history-footer" />
      </div>
    </div>
  );
};

