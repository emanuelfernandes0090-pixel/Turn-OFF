import React, { useState, useMemo, useEffect } from "react";
import {
  Zap,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Info,
  TrendingDown,
  Printer,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Clock,
  Home,
  Users,
  Search,
  Lightbulb,
  Share2,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import {
  ApplianceInput,
  ApplianceKey,
  BillScanRecord,
  DiagnosisInput,
  DiagnosisResult,
  LightingRoom,
  SafetyAnswers,
  UsageUnit,
  AccessibilitySettings,
  SavedDiagnosis,
} from "../types";
import {
  applianceCatalog,
  calculateDiagnosis,
  createLightingRoom,
  describeConsumptionDifference,
  estimateAppliance,
  formatBRL,
  formatNumber,
  lightingTechnologyOptions,
} from "../lib/energy";

const DIAGNOSIS_EXPLANATIONS: Record<
  string,
  { title: string; description: string; example?: string; tip?: string }
> = {
  duty_cycle: {
    title: "Fator de Utilização & Duty Cycle",
    description:
      "Aparelhos com termostato ou ciclos térmicos (como geladeira, freezer e ar-condicionado) não consomem a potência máxima o tempo todo. O motor liga para resfriar e desliga quando atinge a temperatura.",
    example:
      "Exemplo: Uma geladeira de 150 W ligada 24 horas por dia opera seu motor em torno de 45% a 65% do tempo. O Turn OFF calcula esse ciclo físico real.",
    tip: "Manter as borrachas de vedação limpas e não colocar alimentos quentes reduz diretamente o tempo de compressor acionado.",
  },
  btus: {
    title: "Capacidade Térmica de Ar-Condicionado (BTUs)",
    description:
      "BTU mede a capacidade de resfriamento. Um quarto pequeno (até 12m²) usa 9.000 BTUs; salas maiores exigem 12.000 a 18.000 BTUs ou mais.",
    example:
      "Aparelho subdimensionado (ex: 7.000 BTUs numa sala de 25m²) não atinge a temperatura, fazendo o compressor trabalhar 100% do tempo no limite máximo, gastando muito mais.",
    tip: "Aparelhos com tecnologia Inverter e Selo Procel A+++ economizam até 60% de energia em relação aos convencionais.",
  },
  confiabilidade: {
    title: "Índice de Confiabilidade dos Dados",
    description:
      "Mede a coerência matemática entre o consumo medido pela distribuidora na sua conta e a soma do consumo de todos os aparelhos cadastrados no assistente.",
    example:
      "• 85% a 100%: Cadastro fiel à realidade da residência.\n• Abaixo de 50%: Divergência alta — pode haver equipamentos não listados, horas superestimadas ou fuga de corrente.",
    tip: "Se a confiabilidade estiver baixa, revise as horas de uso de aparelhos de alto impacto ou confira se não esqueceu de marcar itens como freezer ou bomba d'água.",
  },
  eficiencia: {
    title: "Índice de Eficiência Energética",
    description:
      "Nota calculada a partir da consistência do consumo por habitante, ausência de riscos elétricos graves e aproveitamento consciente dos equipamentos.",
    example:
      "Pontuações altas mostram que a casa está protegida contra riscos elétricos e não desperdiça energia com hábitos de alto custo.",
    tip: "Resolva primeiro os pontos de perigo elétrico e adote as 2 ações prioritárias para aumentar seu índice.",
  },
  faixas_economia: {
    title: "Economia: Conservadora, Provável e Otimista",
    description:
      "Projeções fundamentadas em modelos físicos reais de uso residencial, sem promessas irreais:",
    example:
      "• Conservadora: Pequenas reduções garantidas (standby desligado e lâmpadas apagadas ao sair).\n• Provável: Ajuste disciplinado de rotina (banho 5 min mais curto e ar em 23°C/24°C).\n• Otimista: Soma de novos hábitos à substituição de lâmpadas antigas e aparelhos por Selo Procel A.",
    tip: "Mesmo a meta conservadora já gera alívio perceptível no bolso todos os meses.",
  },
};

const RISK_SIGNS = [
  "Tomadas ou plugues aquecendo com o uso",
  "Cheiro de queimado ou marcas escuras nas tomadas",
  "Faíscas ao ligar equipamentos ou plugar",
  "Fios descascados, danificados ou emendas expostas",
  "Disjuntor desarma com frequência no quadro",
  'Uso excessivo de adaptadores "benjamim" ou extensões em cadeia',
] as const;

const RISK_SIGN_RECOMMENDATIONS: Record<string, { title: string; recommendation: string }> = {
  "Tomadas ou plugues aquecendo com o uso": {
    title: "Tomadas ou Plugues Aquecendo",
    recommendation:
      "Desligue imediatamente os aparelhos conectados a este ponto. O aquecimento revela mau contato nos bornes internos ou corrente acima da capacidade da tomada (ex.: plugue de 20A forçado em tomada de 10A). Chame um eletricista habilitado para reapertar os contatos ou substituir o módulo.",
  },
  "Cheiro de queimado ou marcas escuras nas tomadas": {
    title: "Cheiro de Queimado ou Marcas Escuras",
    recommendation:
      "Desarme imediatamente o disjuntor desse circuito no quadro e não volte a usar essa tomada. O escurecimento indica arco elétrico contínuo e carbonização do plástico, constituindo risco severo e imediato de princípio de incêndio.",
  },
  "Faíscas ao ligar equipamentos ou plugar": {
    title: "Faíscas ao Conectar Equipamentos",
    recommendation:
      "Faíscas frequentes ao plugar indicam folga mecânica ou desgaste severo das lâminas de contato internas da tomada. Substitua o conjunto da tomada por modelos certificados pelo Inmetro e evite conectar aparelhos de alta potência já ligados no botão.",
  },
  "Fios descascados, danificados ou emendas expostas": {
    title: "Fios Descascados ou Emendas Expostas",
    recommendation:
      "Risco gravíssimo de choque letal por contato direto, especialmente com crianças e animais domésticos. Não improvise com fita adesiva comum: acione um profissional para substituir o trecho danificado e refazer as emendas dentro de caixas de passagem usando conectores normatizados.",
  },
  "Disjuntor desarma com frequência no quadro": {
    title: "Disjuntor Desarmando com Frequência",
    recommendation:
      'Nunca aumente a amperagem do disjuntor sem antes redimensionar a bitola dos fios (isso pode causar incêndio oculto na parede). O desarme frequente aponta que o circuito está operando acima do limite seguro. Peça a um eletricista para redistribuir as cargas em circuitos independentes.',
  },
  'Uso excessivo de adaptadores "benjamim" ou extensões em cadeia': {
    title: 'Uso Excessivo de Adaptadores "Benjamim" / Extensões',
    recommendation:
      "Remova adaptadores em cascata. A soma das potências dos aparelhos conectados sobrecarrega a tomada individual e derrete o plástico interno. Ligue apenas um aparelho de potência média/alta por tomada e providencie novos pontos fixos com um profissional.",
  },
  // Fallback for previous single-quote data in local storage
  "Uso excessivo de adaptadores 'benjamim' ou extensões em cadeia": {
    title: 'Uso Excessivo de Adaptadores "Benjamim" / Extensões',
    recommendation:
      "Remova adaptadores em cascata. A soma das potências dos aparelhos conectados sobrecarrega a tomada individual e derrete o plástico interno. Ligue apenas um aparelho de potência média/alta por tomada e providencie novos pontos fixos com um profissional.",
  },
};

interface DiagnosisWizardProps {
  onSaveDiagnosis: (diagnosis: SavedDiagnosis) => void;
  onOpenSimulator: (diagnosis: SavedDiagnosis) => void;
  onExit?: () => void;
  billScans: BillScanRecord[];
  initialBillScan?: BillScanRecord | null;
  initialSavedDiagnosis?: SavedDiagnosis | null;
  settings: AccessibilitySettings;
  onFocusModeChange?: (active: boolean) => void;
  onShareDiagnosis?: (diagnosis: SavedDiagnosis) => void;
}

export const DiagnosisWizard: React.FC<DiagnosisWizardProps> = ({
  onSaveDiagnosis,
  onOpenSimulator,
  onExit,
  billScans,
  initialBillScan,
  initialSavedDiagnosis,
  settings,
  onFocusModeChange,
  onShareDiagnosis,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [currentDiagId, setCurrentDiagId] = useState<string | null>(initialSavedDiagnosis?.id || null);
  const [isSaved, setIsSaved] = useState<boolean>(Boolean(initialSavedDiagnosis));
  const [explanatoryTopic, setExplanatoryTopic] = useState<{
    title: string;
    description: string;
    example?: string;
    tip?: string;
  } | null>(null);

  // Notify focus mode during questionnaire (steps 1-3)
  useEffect(() => {
    if (onFocusModeChange) {
      onFocusModeChange(step >= 1 && step <= 3);
    }
    return () => {
      if (onFocusModeChange) {
        onFocusModeChange(false);
      }
    };
  }, [step, onFocusModeChange]);

  // Step 1: Bill & Household
  const [billValue, setBillValue] = useState<number>(
    initialSavedDiagnosis?.input.billValue ?? (initialBillScan?.bill.valor_total || 220)
  );
  const [monthlyKwh, setMonthlyKwh] = useState<number>(
    initialSavedDiagnosis?.input.monthlyKwh ?? (initialBillScan?.bill.consumo_kwh || 180)
  );
  const [occupants, setOccupants] = useState<number>(
    initialSavedDiagnosis?.input.occupants ?? 3
  );
  const [selectedBillId, setSelectedBillId] = useState<string | null>(
    initialBillScan?.id || null
  );

  // Step 2: Appliances Inventory
  const initialAppliances: ApplianceInput[] = useMemo(() => {
    return applianceCatalog.map((item) => ({
      id: item.key,
      key: item.key,
      label: item.label,
      present: item.key === "geladeira" || item.key === "chuveiro" || item.key === "iluminacao",
      quantity: 1,
      quantityUsed: 1,
      frequency: item.mode === "ciclica" ? 30 : item.key === "chuveiro" ? 30 : 20,
      hoursPerDay: item.key === "geladeira" ? 24 : item.key === "chuveiro" ? 0.6 : 3,
      usageUnit: "horas",
      powerWatts: item.defaultPower,
      source: "estimativa",
      utilizationFactor: item.defaultUtilizationFactor,
      mode: item.mode,
      inverterTechnology: false,
      lightingType: "led",
      lightingRooms:
        item.key === "iluminacao"
          ? [
              { ...createLightingRoom("room-1"), name: "Sala", lamps: { led: 2, fluorescente: 0, incandescente: 0 } },
              { ...createLightingRoom("room-2"), name: "Cozinha", lamps: { led: 2, fluorescente: 0, incandescente: 0 } },
              { ...createLightingRoom("room-3"), name: "Quartos", lamps: { led: 2, fluorescente: 0, incandescente: 0 } },
            ]
          : undefined,
    }));
  }, []);

  const [appliances, setAppliances] = useState<ApplianceInput[]>(() => {
    if (initialSavedDiagnosis?.input.appliances && initialSavedDiagnosis.input.appliances.length > 0) {
      return initialSavedDiagnosis.input.appliances;
    }
    return initialAppliances;
  });
  const [categoryFilter, setCategoryFilter] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [lightingMode, setLightingMode] = useState<"general" | "rooms">("general");

  // Step 3: Safety Checks
  const [safety, setSafety] = useState<SafetyAnswers>(
    initialSavedDiagnosis?.input.safety ?? {
      grounding: "nao-sei",
      breakerCount: null,
      dr: "nao-sei",
      riskSigns: [],
    }
  );
  const [hasSafetyRisk, setHasSafetyRisk] = useState<boolean>(
    initialSavedDiagnosis?.input.hasSafetyRisk ?? false
  );

  // Step 4: Result state
  const [result, setResult] = useState<DiagnosisResult | null>(
    initialSavedDiagnosis?.result ?? null
  );

  // Validations for Step 1 and Step 2
  const isStep1Valid =
    !isNaN(monthlyKwh) &&
    monthlyKwh >= 10 &&
    monthlyKwh <= 5000 &&
    !isNaN(billValue) &&
    billValue >= 10 &&
    !isNaN(occupants) &&
    occupants >= 1 &&
    occupants <= 30;

  const hasValidAppliance = useMemo(() => {
    return appliances.some(
      (a) =>
        a.present &&
        (a.hoursPerDay > 0 || (a.lightingRooms && a.lightingRooms.length > 0))
    );
  }, [appliances]);

  // Categories list
  const categories = [
    { id: "todos", label: "Todos" },
    { id: "climatizacao", label: "Climatização & Luz" },
    { id: "cozinha", label: "Cozinha" },
    { id: "aquecimento", label: "Banho & Térmicos" },
    { id: "limpeza", label: "Limpeza" },
    { id: "eletronicos", label: "Eletrônicos" },
    { id: "motores_outros", label: "Motores & Outros" },
  ];

  const filteredAppliances = useMemo(() => {
    return appliances.filter((a) => {
      const def = applianceCatalog.find((c) => c.key === a.key);
      const matchesCategory = categoryFilter === "todos" || def?.category === categoryFilter;
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term === "" ||
        a.label.toLowerCase().includes(term) ||
        (def?.description && def.description.toLowerCase().includes(term)) ||
        (def?.category && def.category.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [appliances, categoryFilter, searchTerm]);

  // Import from saved bill
  const handleImportBill = (scan: BillScanRecord) => {
    setSelectedBillId(scan.id);
    if (scan.bill.consumo_kwh) setMonthlyKwh(scan.bill.consumo_kwh);
    if (scan.bill.valor_total) setBillValue(scan.bill.valor_total);
  };

  const updateAppliance = (key: ApplianceKey, patch: Partial<ApplianceInput>) => {
    setIsSaved(false);
    setAppliances((prev) =>
      prev.map((app) => (app.key === key ? { ...app, ...patch } : app))
    );
  };

  // Run calculation and advance to Step 4
  const handleCalculate = () => {
    const activeBill = selectedBillId
      ? billScans.find((s) => s.id === selectedBillId)?.bill
      : undefined;

    const inputData: DiagnosisInput = {
      billValue: Math.max(10, billValue),
      monthlyKwh: Math.max(10, monthlyKwh),
      occupants: Math.max(1, occupants),
      appliances,
      detailed: true,
      hasSafetyRisk: hasSafetyRisk || safety.riskSigns.length > 0,
      safety,
    };

    const calculated = calculateDiagnosis(inputData, activeBill);
    setResult(calculated);
    setStep(4);

    const diagId = currentDiagId || `diag-${Date.now()}`;
    setCurrentDiagId(diagId);
    setIsSaved(true);

    // Auto-save immediately to history (preventing duplicates by reusing same ID)
    const autoSavedDiag: SavedDiagnosis = {
      id: diagId,
      createdAt: new Date().toISOString(),
      input: inputData,
      result: calculated,
      sourceBillScanId: selectedBillId || undefined,
      kind: "principal",
    };
    onSaveDiagnosis(autoSavedDiag);
  };

  const handleSave = () => {
    if (!result) return;
    const diagId = currentDiagId || `diag-${Date.now()}`;
    setCurrentDiagId(diagId);
    const diagnosisToSave: SavedDiagnosis = {
      id: diagId,
      createdAt: new Date().toISOString(),
      input: {
        billValue: Math.max(10, billValue),
        monthlyKwh: Math.max(10, monthlyKwh),
        occupants: Math.max(1, occupants),
        appliances,
        detailed: true,
        hasSafetyRisk: hasSafetyRisk || safety.riskSigns.length > 0,
        safety,
      },
      result,
      sourceBillScanId: selectedBillId || undefined,
      kind: "principal",
    };
    onSaveDiagnosis(diagnosisToSave);
    setIsSaved(true);
  };

  const handleSaveAndExit = () => {
    handleSave();
    if (onFocusModeChange) onFocusModeChange(false);
    if (onExit) {
      onExit();
    }
  };

  // Chart colors for Recharts
  const COLORS = ["#087F5B", "#0D9488", "#0284C7", "#6366F1", "#8B5CF6", "#D97706", "#DC2626", "#64748B"];

  return (
    <div id="diagnosis-wizard-view" className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation Bar: Back to Previous Step or Return to Home */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {step === 1 ? (
          <button
            id="btn-exit-diagnosis-top"
            type="button"
            onClick={() => {
              if (onFocusModeChange) onFocusModeChange(false);
              if (onExit) {
                onExit();
              }
            }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold transition cursor-pointer"
            title="Voltar à tela Início"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Voltar ao Início</span>
          </button>
        ) : step === 4 ? (
          <button
            id="btn-exit-diagnosis-top"
            type="button"
            onClick={() => setStep(3)}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold transition cursor-pointer"
            title="Voltar à Verificação de Segurança (Etapa 3)"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Voltar à Etapa 3 (Segurança)</span>
          </button>
        ) : (
          <button
            id="btn-exit-diagnosis-top"
            type="button"
            onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : 1))}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold transition cursor-pointer"
            title="Voltar à etapa anterior preservando os dados preenchidos"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Voltar à Etapa {step - 1}</span>
          </button>
        )}

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="hidden sm:inline">Assistente de Eficiência</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
            Etapa {step} de 4
          </span>
        </div>
      </div>

      {/* Wizard Progress Stepper */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[
            { num: 1, label: "Fatura & Lar" },
            { num: 2, label: "Equipamentos" },
            { num: 3, label: "Segurança" },
            { num: 4, label: "Relatório" },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                    step === s.num
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105"
                      : step > s.num
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-semibold ${
                    step === s.num
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full transition-colors ${
                    step > idx + 1
                      ? "bg-emerald-500"
                      : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* STEP 1: BILL & HOUSEHOLD CONTEXT */}
      {step === 1 && (
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
              Etapa 1: Informações da Conta & Moradores
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Estes valores servem de linha de base para comparar com os aparelhos cadastrados.
            </p>
          </div>

          {/* Import from past scanned bills button if available */}
          {billScans.length > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Home className="w-4 h-4 text-emerald-600" />
                Puxar dados de uma conta já escaneada:
              </span>
              <div className="flex flex-wrap gap-2">
                {billScans.slice(0, 4).map((scan) => (
                  <button
                    key={scan.id}
                    id={`btn-import-bill-${scan.id}`}
                    onClick={() => handleImportBill(scan)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      selectedBillId === scan.id
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {scan.bill.mes_referencia || "Fatura"} · {scan.bill.consumo_kwh ?? "—"} kWh (
                    {formatBRL(scan.bill.valor_total || 0)})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                Valor Médio da Fatura (R$)
              </label>
              <input
                id="input-wizard-bill-value"
                type="number"
                step="0.01"
                value={billValue === 0 ? "" : billValue}
                onChange={(e) => setBillValue(e.target.value === "" ? 0 : Number(e.target.value))}
                placeholder="Ex: 240.00"
                className="w-full text-lg font-bold p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Total a pagar da fatura de energia mais recente.
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                Consumo Mensal (kWh)
              </label>
              <input
                id="input-wizard-monthly-kwh"
                type="number"
                value={monthlyKwh === 0 ? "" : monthlyKwh}
                onChange={(e) => setMonthlyKwh(e.target.value === "" ? 0 : Number(e.target.value))}
                placeholder="Ex: 180"
                className="w-full text-lg font-bold p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Quantidade de quilowatts-hora faturados no mês.
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                Moradores na Residência
              </label>
              <input
                id="input-wizard-occupants"
                type="number"
                min="1"
                max="25"
                value={occupants === 0 ? "" : occupants}
                onChange={(e) => setOccupants(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
                onBlur={() => {
                  if (!occupants || occupants < 1) setOccupants(1);
                }}
                placeholder="Ex: 3"
                className="w-full text-lg font-bold p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Para calcular consumo e custo per capita.
              </span>
            </div>
          </div>

          {!isStep1Valid && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Para continuar com segurança, informe um valor de conta a partir de R$ 10,00, consumo mensal entre 10 e 5.000 kWh e entre 1 e 30 moradores.
              </span>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between">
            {onExit ? (
              <button
                type="button"
                id="btn-wizard-step1-exit"
                onClick={() => {
                  if (onFocusModeChange) onFocusModeChange(false);
                  onExit();
                }}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Início
              </button>
            ) : <div />}
            <button
              id="btn-wizard-step1-next"
              disabled={!isStep1Valid}
              onClick={() => {
                if (isStep1Valid) setStep(2);
              }}
              className={`px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 ${
                isStep1Valid
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
              }`}
            >
              Avançar para Mapeamento de Aparelhos
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: APPLIANCES INVENTORY & LIGHTING ROOM BUILDER */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
                Etapa 2: Mapeamento Físico de Equipamentos
              </h2>
              <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                <span>
                  Marque os aparelhos presentes e informe as horas ou minutos de uso diário. O aplicativo aplica o duty cycle físico real (ciclos térmicos do compressor).
                </span>
                <button
                  type="button"
                  id="btn-help-duty-cycle"
                  onClick={() => setExplanatoryTopic(DIAGNOSIS_EXPLANATIONS.duty_cycle)}
                  className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer ml-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  O que é Duty Cycle?
                </button>
              </div>
            </div>

            {/* Search Input & Category Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-search-appliance"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar aparelho (ex: chuveiro, geladeira, ar, tv, lâmpada)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-emerald-500 font-medium"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    id={`btn-cat-${cat.id}`}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      categoryFilter === cat.id
                        ? "bg-emerald-600 text-white shadow-xs font-bold"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty state for search */}
            {filteredAppliances.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Nenhum aparelho encontrado para "{searchTerm}".
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("todos");
                  }}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Limpar filtros de busca
                </button>
              </div>
            )}

            {/* Appliances List */}
            <div className="space-y-4">
              {filteredAppliances.map((app) => {
                const def = applianceCatalog.find((c) => c.key === app.key);
                const isLighting = app.key === "iluminacao";
                const isCyclic = app.mode === "ciclica";
                const estimate = estimateAppliance(app);

                return (
                  <div
                    key={app.key}
                    id={`appliance-card-${app.key}`}
                    className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                      app.present
                        ? "bg-slate-50 dark:bg-slate-800/40 border-emerald-500/50 shadow-xs"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80"
                    }`}
                  >
                    {/* Header: Checkbox & Name */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          id={`check-app-${app.key}`}
                          type="checkbox"
                          checked={app.present}
                          onChange={(e) => updateAppliance(app.key, { present: e.target.checked })}
                          className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                            {app.label}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {def?.description}
                          </span>
                        </div>
                      </label>

                      {app.present && (
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            ~{formatNumber(estimate.monthlyKwh)} kWh/mês
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Controls if Present */}
                    {app.present && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 space-y-4">
                        {/* Lighting: Mode Switcher (General vs Room-by-room) */}
                        {isLighting ? (
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                              <div className="flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                  Como prefere cadastrar as lâmpadas?
                                </span>
                              </div>
                              <div className="flex rounded-xl bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLightingMode("general");
                                    // If not configured, set default general room
                                    if (!app.lightingRooms || app.lightingRooms.length === 0 || app.lightingRooms[0].id !== "geral") {
                                      updateAppliance("iluminacao", {
                                        lightingRooms: [
                                          {
                                            id: "geral",
                                            name: "Toda a Casa (Iluminação Geral)",
                                            frequency: 30,
                                            hoursPerDay: 5,
                                            lamps: { led: 8, fluorescente: 1, incandescente: 0 },
                                          },
                                        ],
                                      });
                                    }
                                  }}
                                  className={`px-3 py-1 font-bold rounded-lg transition ${
                                    lightingMode === "general"
                                      ? "bg-emerald-600 text-white shadow-xs"
                                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                                  }`}
                                >
                                  Geral da Casa (Rápido)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLightingMode("rooms");
                                    if (app.lightingRooms && app.lightingRooms[0]?.id === "geral") {
                                      updateAppliance("iluminacao", {
                                        lightingRooms: [
                                          { ...createLightingRoom("room-1"), name: "Sala", hoursPerDay: 5, lamps: { led: 3, fluorescente: 0, incandescente: 0 } },
                                          { ...createLightingRoom("room-2"), name: "Cozinha", hoursPerDay: 4, lamps: { led: 2, fluorescente: 0, incandescente: 0 } },
                                          { ...createLightingRoom("room-3"), name: "Quartos", hoursPerDay: 3, lamps: { led: 3, fluorescente: 0, incandescente: 0 } },
                                        ],
                                      });
                                    }
                                  }}
                                  className={`px-3 py-1 font-bold rounded-lg transition ${
                                    lightingMode === "rooms"
                                      ? "bg-emerald-600 text-white shadow-xs"
                                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                                  }`}
                                >
                                  Por Cômodo (Detalhado)
                                </button>
                              </div>
                            </div>

                            {/* Lighting Mode: General */}
                            {lightingMode === "general" ? (
                              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                  Informe a média de lâmpadas de cada tecnologia instaladas em toda a residência e a média de horas de uso:
                                </div>
                                {(() => {
                                  const generalRoom = app.lightingRooms?.[0] || {
                                    id: "geral",
                                    name: "Toda a Casa",
                                    hoursPerDay: 5,
                                    frequency: 30,
                                    lamps: { led: 8, fluorescente: 1, incandescente: 0 },
                                  };
                                  return (
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                                      <div>
                                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Média Horas/dia</span>
                                        <input
                                          type="number"
                                          min="0"
                                          max="24"
                                          value={generalRoom.hoursPerDay === 0 ? "" : generalRoom.hoursPerDay}
                                          onChange={(e) => {
                                            const updated = [{ ...generalRoom, hoursPerDay: e.target.value === "" ? 0 : Number(e.target.value) }];
                                            updateAppliance("iluminacao", { lightingRooms: updated });
                                          }}
                                          className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"
                                        />
                                      </div>
                                      <div>
                                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Dias/mês</span>
                                        <input
                                          type="number"
                                          min="0"
                                          max="30"
                                          value={generalRoom.frequency === 0 ? "" : generalRoom.frequency}
                                          onChange={(e) => {
                                            const updated = [{ ...generalRoom, frequency: e.target.value === "" ? 0 : Number(e.target.value) }];
                                            updateAppliance("iluminacao", { lightingRooms: updated });
                                          }}
                                          className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"
                                        />
                                      </div>
                                      <div>
                                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block mb-1">
                                          Total LED (9W)
                                        </span>
                                        <input
                                          type="number"
                                          min="0"
                                          value={generalRoom.lamps.led === 0 ? "" : generalRoom.lamps.led}
                                          onChange={(e) => {
                                            const updated = [{
                                              ...generalRoom,
                                              lamps: { ...generalRoom.lamps, led: e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)) },
                                            }];
                                            updateAppliance("iluminacao", { lightingRooms: updated });
                                          }}
                                          className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-emerald-600"
                                        />
                                      </div>
                                      <div>
                                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold block mb-1">
                                          Fluor. (15W)
                                        </span>
                                        <input
                                          type="number"
                                          min="0"
                                          value={generalRoom.lamps.fluorescente === 0 ? "" : generalRoom.lamps.fluorescente}
                                          onChange={(e) => {
                                            const updated = [{
                                              ...generalRoom,
                                              lamps: { ...generalRoom.lamps, fluorescente: e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)) },
                                            }];
                                            updateAppliance("iluminacao", { lightingRooms: updated });
                                          }}
                                          className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-amber-600"
                                        />
                                      </div>
                                      <div>
                                        <span className="text-[11px] text-red-600 dark:text-red-400 font-bold block mb-1">
                                          Incand. (60W)
                                        </span>
                                        <input
                                          type="number"
                                          min="0"
                                          value={generalRoom.lamps.incandescente === 0 ? "" : generalRoom.lamps.incandescente}
                                          onChange={(e) => {
                                            const updated = [{
                                              ...generalRoom,
                                              lamps: { ...generalRoom.lamps, incandescente: e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)) },
                                            }];
                                            updateAppliance("iluminacao", { lightingRooms: updated });
                                          }}
                                          className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-red-600"
                                        />
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : (
                              /* Lighting Mode: Room by room */
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                    Cômodos Cadastrados
                                  </span>
                                  <button
                                    id="btn-add-lighting-room"
                                    onClick={() => {
                                      const rooms = app.lightingRooms || [];
                                      updateAppliance("iluminacao", {
                                        lightingRooms: [
                                          ...rooms,
                                          createLightingRoom(`room-${Date.now()}`),
                                        ],
                                      });
                                    }}
                                    className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-lg hover:bg-emerald-200 transition flex items-center gap-1"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    Adicionar Cômodo
                                  </button>
                                </div>

                                {(app.lightingRooms || []).map((room, rIdx) => (
                                  <div
                                    key={room.id}
                                    className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
                                  >
                                    <div className="flex items-center justify-between">
                                      <input
                                        type="text"
                                        value={room.name}
                                        onChange={(e) => {
                                          const nextRooms = [...(app.lightingRooms || [])];
                                          nextRooms[rIdx].name = e.target.value;
                                          updateAppliance("iluminacao", { lightingRooms: nextRooms });
                                        }}
                                        className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:outline-hidden"
                                      />
                                      {(app.lightingRooms || []).length > 1 && (
                                        <button
                                          onClick={() => {
                                            const nextRooms = (app.lightingRooms || []).filter(
                                              (_, i) => i !== rIdx
                                            );
                                            updateAppliance("iluminacao", { lightingRooms: nextRooms });
                                          }}
                                          className="text-red-500 hover:text-red-700 p-1"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                                      <div>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Horas/dia</span>
                                        <input
                                          type="number"
                                          min="0"
                                          max="24"
                                          value={room.hoursPerDay === 0 ? "" : room.hoursPerDay}
                                          onChange={(e) => {
                                            const nextRooms = [...(app.lightingRooms || [])];
                                            nextRooms[rIdx].hoursPerDay = e.target.value === "" ? 0 : Number(e.target.value);
                                            updateAppliance("iluminacao", { lightingRooms: nextRooms });
                                          }}
                                          className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"
                                        />
                                      </div>
                                      <div>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Dias/mês</span>
                                        <input
                                          type="number"
                                          min="0"
                                          max="30"
                                          value={room.frequency === 0 ? "" : room.frequency}
                                          onChange={(e) => {
                                            const nextRooms = [...(app.lightingRooms || [])];
                                            nextRooms[rIdx].frequency = e.target.value === "" ? 0 : Number(e.target.value);
                                            updateAppliance("iluminacao", { lightingRooms: nextRooms });
                                          }}
                                          className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"
                                        />
                                      </div>
                                      <div>
                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                                          LED (9W)
                                        </span>
                                        <input
                                          type="number"
                                          min="0"
                                          value={room.lamps.led === 0 ? "" : room.lamps.led}
                                          onChange={(e) => {
                                            const nextRooms = [...(app.lightingRooms || [])];
                                            nextRooms[rIdx].lamps.led = e.target.value === "" ? 0 : Math.max(0, Number(e.target.value));
                                            updateAppliance("iluminacao", { lightingRooms: nextRooms });
                                          }}
                                          className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-emerald-600"
                                        />
                                      </div>
                                      <div>
                                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                                          Fluor. (15W)
                                        </span>
                                        <input
                                          type="number"
                                          min="0"
                                          value={room.lamps.fluorescente === 0 ? "" : room.lamps.fluorescente}
                                          onChange={(e) => {
                                            const nextRooms = [...(app.lightingRooms || [])];
                                            nextRooms[rIdx].lamps.fluorescente = e.target.value === "" ? 0 : Math.max(0, Number(e.target.value));
                                            updateAppliance("iluminacao", { lightingRooms: nextRooms });
                                          }}
                                          className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-amber-600"
                                        />
                                      </div>
                                      <div>
                                        <span className="text-[10px] text-red-600 dark:text-red-400 font-bold block">
                                          Incand. (60W)
                                        </span>
                                        <input
                                          type="number"
                                          min="0"
                                          value={room.lamps.incandescente === 0 ? "" : room.lamps.incandescente}
                                          onChange={(e) => {
                                            const nextRooms = [...(app.lightingRooms || [])];
                                            nextRooms[rIdx].lamps.incandescente = e.target.value === "" ? 0 : Math.max(0, Number(e.target.value));
                                            updateAppliance("iluminacao", { lightingRooms: nextRooms });
                                          }}
                                          className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-red-600"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Standard Appliance Inputs */
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                            {/* Quantity */}
                            <div>
                              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                                Quantidade
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="99"
                                value={app.quantity === 0 ? "" : app.quantity}
                                onChange={(e) => {
                                  const q = e.target.value === "" ? 0 : Number(e.target.value);
                                  updateAppliance(app.key, {
                                    quantity: q,
                                    quantityUsed: Math.min(app.quantityUsed, q || 1),
                                  });
                                }}
                                onBlur={() => {
                                  if (!app.quantity || app.quantity < 1) {
                                    updateAppliance(app.key, {
                                      quantity: 1,
                                      quantityUsed: Math.min(app.quantityUsed, 1),
                                    });
                                  }
                                }}
                                className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                              />
                            </div>

                            {/* Simultaneous Use */}
                            <div>
                              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                                Em uso simultâneo
                              </label>
                              <input
                                type="number"
                                min="1"
                                max={app.quantity || 1}
                                value={app.quantityUsed === 0 ? "" : app.quantityUsed}
                                onChange={(e) => {
                                  const qUsed = e.target.value === "" ? 0 : Number(e.target.value);
                                  updateAppliance(app.key, {
                                    quantityUsed: qUsed,
                                  });
                                }}
                                onBlur={() => {
                                  if (!app.quantityUsed || app.quantityUsed < 1) {
                                    updateAppliance(app.key, { quantityUsed: 1 });
                                  } else if (app.quantityUsed > (app.quantity || 1)) {
                                    updateAppliance(app.key, { quantityUsed: app.quantity || 1 });
                                  }
                                }}
                                className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                              />
                            </div>

                            {/* Duration per day (Hours or Minutes Switcher) */}
                            <div className="col-span-2">
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                  {isCyclic ? "Horas/dia disponível" : "Tempo de uso/dia"}
                                </label>
                                <div className="flex text-[10px] rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden">
                                  <button
                                    onClick={() => {
                                      if (app.usageUnit === "minutos") {
                                        updateAppliance(app.key, {
                                          usageUnit: "horas",
                                          hoursPerDay: Math.round((app.hoursPerDay / 60) * 10) / 10,
                                        });
                                      }
                                    }}
                                    className={`px-1.5 py-0.5 font-bold ${
                                      app.usageUnit !== "minutos"
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                                    }`}
                                  >
                                    Horas
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (app.usageUnit !== "minutos") {
                                        updateAppliance(app.key, {
                                          usageUnit: "minutos",
                                          hoursPerDay: Math.round(app.hoursPerDay * 60),
                                        });
                                      }
                                    }}
                                    className={`px-1.5 py-0.5 font-bold ${
                                      app.usageUnit === "minutos"
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                                    }`}
                                  >
                                    Minutos
                                  </button>
                                </div>
                              </div>
                              <input
                                type="number"
                                step={app.usageUnit === "minutos" ? "1" : "0.1"}
                                min="0"
                                max={app.usageUnit === "minutos" ? 1440 : 24}
                                value={app.hoursPerDay === 0 ? "" : app.hoursPerDay}
                                onChange={(e) =>
                                  updateAppliance(app.key, {
                                    hoursPerDay: e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)),
                                  })
                                }
                                className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                              />
                            </div>

                            {/* Days / Month */}
                            <div>
                              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                                Dias no mês (0-30)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="30"
                                value={app.frequency === 0 ? "" : app.frequency}
                                onChange={(e) =>
                                  updateAppliance(app.key, {
                                    frequency: e.target.value === "" ? 0 : Math.min(30, Math.max(0, Number(e.target.value))),
                                  })
                                }
                                className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                              />
                            </div>

                            {/* Power (Watts) */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                  Potência (W)
                                </label>
                                <button
                                  onClick={() =>
                                    updateAppliance(app.key, {
                                      source: app.source === "placa" ? "estimativa" : "placa",
                                    })
                                  }
                                  className="text-[10px] text-emerald-600 dark:text-emerald-400 underline"
                                >
                                  {app.source === "placa" ? "Sei da placa" : "Usar padrão"}
                                </button>
                              </div>
                              <input
                                type="number"
                                value={app.powerWatts === 0 ? "" : app.powerWatts}
                                onChange={(e) =>
                                  updateAppliance(app.key, {
                                    powerWatts: e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)),
                                    source: "placa",
                                  })
                                }
                                onBlur={() => {
                                  if (!app.powerWatts || app.powerWatts < 1) {
                                    updateAppliance(app.key, { powerWatts: 1 });
                                  }
                                }}
                                className={`w-full p-2 rounded-xl bg-white dark:bg-slate-800 border font-bold text-slate-900 dark:text-white ${
                                  app.source === "placa"
                                    ? "border-emerald-500 text-emerald-700 dark:text-emerald-300"
                                    : "border-slate-300 dark:border-slate-700"
                                }`}
                              />
                            </div>
                          </div>
                        )}

                        {/* Special Features: Inverter for AC */}
                        {app.key === "ar-condicionado" && (
                          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">
                                Tecnologia Inverter
                              </span>
                              <p className="text-[11px] text-slate-500">
                                Modelos Inverter ajustam a rotação do compressor em vez de ligar/desligar bruscamente, economizando até 30% em regime estável.
                              </p>
                            </div>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(app.inverterTechnology)}
                                onChange={(e) =>
                                  updateAppliance(app.key, { inverterTechnology: e.target.checked })
                                }
                                className="w-4 h-4 text-emerald-600 rounded-md"
                              />
                              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                                É Inverter
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!hasValidAppliance && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Selecione ao menos um aparelho presente com tempo de uso para calcular o consumo da casa.
                </span>
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <button
                id="btn-wizard-step2-back"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para Fatura & Lar
              </button>
              <button
                id="btn-wizard-step2-next"
                disabled={!hasValidAppliance}
                onClick={() => {
                  if (hasValidAppliance) setStep(3);
                }}
                className={`px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 ${
                  hasValidAppliance
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
                }`}
              >
                Avançar para Verificação de Segurança
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: ELECTRICAL SAFETY AUDIT */}
      {step === 3 && (
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200 flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="font-bold text-base sm:text-lg">
                Segurança Elétrica: Economizar Nunca Deve Arriscar Sua Vida
              </h2>
              <p className="text-xs sm:text-sm text-red-800 dark:text-red-300 leading-relaxed">
                Observe sem tocar em fios e sem abrir o quadro de distribuição. Se houver qualquer sinal de perigo, a prioridade máxima é proteger sua família antes de pensar em economia.
              </p>
            </div>
          </div>

          {/* Risk Checklist */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Sinais Visíveis de Risco na Instalação (Marque se perceber algum):
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RISK_SIGNS.map((sign, idx) => {
                const isSelected = safety.riskSigns.includes(sign);
                return (
                  <button
                    key={idx}
                    id={`btn-risk-sign-${idx}`}
                    type="button"
                    onClick={() => {
                      const next = isSelected
                        ? safety.riskSigns.filter((s) => s !== sign)
                        : [...safety.riskSigns, sign];
                      setSafety({ ...safety, riskSigns: next });
                      setHasSafetyRisk(next.length > 0);
                    }}
                    className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                      isSelected
                        ? "bg-red-50 dark:bg-red-950/50 border-red-500 text-red-900 dark:text-red-200 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? "bg-red-600 border-red-600 text-white"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold leading-relaxed">
                      {sign}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grounding & DR Presence Question */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Sua casa possui Aterramento Elétrico (Fio Terra no pino do meio)?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "sim" as const, label: "Sim" },
                  { id: "nao" as const, label: "Não" },
                  { id: "nao-sei" as const, label: "Não sei" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    id={`btn-safety-grounding-${opt.id}`}
                    onClick={() => setSafety({ ...safety, grounding: opt.id })}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      safety.grounding === opt.id
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Existe Dispositivo DR (com botão "TESTE" no quadro)?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "sim" as const, label: "Sim" },
                  { id: "nao" as const, label: "Não" },
                  { id: "nao-sei" as const, label: "Não sei" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    id={`btn-safety-dr-${opt.id}`}
                    onClick={() => setSafety({ ...safety, dr: opt.id })}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      safety.dr === opt.id
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              id="btn-wizard-step3-back"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm hover:bg-slate-200 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar aos Aparelhos
            </button>
            <button
              id="btn-wizard-calculate"
              onClick={handleCalculate}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              Gerar Relatório de Diagnóstico Completo
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DIAGNOSIS REPORT CONSOLIDATED */}
      {step === 4 && result && (
        <div id="diagnosis-report-printable" className="space-y-8 animate-in fade-in duration-300">
          {/* Header Summary Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Relatório Técnico de Eficiência Energética
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Space_Grotesk'] mt-1">
                  Resultado do Diagnóstico
                </h2>
                <p className="text-xs text-slate-500">
                  Realizado em {new Date().toLocaleDateString("pt-BR")} · Residência de {occupants} pessoas
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-share-diagnosis-main"
                  onClick={() => {
                    if (onShareDiagnosis && result) {
                      const diagToShare: SavedDiagnosis = {
                        id: currentDiagId || `diag-${Date.now()}`,
                        createdAt: new Date().toISOString(),
                        input: {
                          billValue: Math.max(10, billValue),
                          monthlyKwh: Math.max(10, monthlyKwh),
                          occupants: Math.max(1, occupants),
                          appliances,
                          detailed: true,
                          hasSafetyRisk: hasSafetyRisk || safety.riskSigns.length > 0,
                          safety,
                        },
                        result,
                        sourceBillScanId: selectedBillId || undefined,
                        kind: "principal",
                      };
                      onShareDiagnosis(diagToShare);
                    }
                  }}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar / PDF
                </button>
                <button
                  id="btn-print-diagnosis"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>
                <button
                  id="btn-save-diagnosis-main"
                  onClick={handleSave}
                  className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                    isSaved ? "bg-emerald-700 opacity-95" : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSaved ? "Diagnóstico Salvo no Histórico" : "Salvar no Histórico"}
                </button>
              </div>
            </div>

            {/* Critical Safety Notice if triggered */}
            {result.safetyAlert && (
              <div className="p-5 sm:p-6 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-500 text-red-900 dark:text-red-200 space-y-4">
                <div className="flex items-center gap-2.5 text-red-700 dark:text-red-400 font-bold text-base">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>Alerta de Segurança Elétrica: Riscos e Anomalias Identificadas</span>
                </div>
                <p className="text-xs sm:text-sm text-red-950 dark:text-red-200/90 leading-relaxed">
                  Foram identificados pontos de risco na instalação elétrica que exigem atenção imediata para prevenir acidentes, choques e princípios de incêndio. Confira as orientações específicas para cada item detectado:
                </p>

                {/* Specific Recommendations for Each Marked Risk */}
                <div className="space-y-3 pt-2">
                  {safety.riskSigns &&
                    safety.riskSigns.map((sign, idx) => {
                      const item = RISK_SIGN_RECOMMENDATIONS[sign];
                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-red-200 dark:border-red-900/60 shadow-xs space-y-1.5"
                        >
                          <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold text-xs sm:text-sm">
                            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                            <span>{item?.title || sign}</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                            {item?.recommendation ||
                              "Solicite a inspeção imediata de um eletricista habilitado para este ponto."}
                          </p>
                        </div>
                      );
                    })}

                  {/* Grounding specific alert */}
                  {(safety.grounding === "nao" || safety.grounding === "nao-sei") && (
                    <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-300 dark:border-amber-900/60 shadow-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs sm:text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Ausência ou Incerteza de Aterramento (Fio Terra)</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                        Chuveiros elétricos, máquinas de lavar e aparelhos com partes metálicas exigem aterramento efetivo. Sem o fio terra ligado à haste de aterramento, qualquer fuga de corrente no aparelho pode passar pelo corpo do morador em vez de ser descarregada com segurança no solo.
                      </p>
                    </div>
                  )}

                  {/* DR specific alert */}
                  {(safety.dr === "nao" || safety.dr === "nao-sei") && (
                    <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-300 dark:border-amber-900/60 shadow-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs sm:text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Quadro sem Dispositivo DR (Diferencial Residual)</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                        O Dispositivo DR (obrigatório pela norma NBR 5410 em áreas úmidas) desliga o circuito em milissegundos ao detectar corrente escapando para a terra ou para o corpo de alguém. Sua instalação no quadro é a proteção mais eficaz contra choques elétricos graves.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-red-200 dark:border-red-800/80 text-[11px] text-red-800 dark:text-red-300 font-medium">
                  Orientação geral: Nunca tente resolver desarmes aumentando o disjuntor sem antes trocar os fios para uma bitola compatível. Contrate sempre um eletricista habilitado.
                </div>
              </div>
            )}

            {/* Confidence & Coherence Evaluation */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-600" />
                    Confiabilidade da Estimativa:{" "}
                    <span
                      className={`uppercase font-black ${
                        result.confidence === "alta"
                          ? "text-emerald-600"
                          : result.confidence === "média"
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {result.confidence} ({result.confidenceScore}%)
                    </span>
                  </span>
                  <button
                    type="button"
                    id="btn-help-confiabilidade"
                    onClick={() => setExplanatoryTopic(DIAGNOSIS_EXPLANATIONS.confiabilidade)}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer ml-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Como é calculada?
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {describeConsumptionDifference(result.totalEstimated, monthlyKwh, settings.simpleLanguage)}
                </p>
              </div>
              <button
                id="btn-re-edit-diagnosis"
                onClick={() => setStep(2)}
                className="self-start sm:self-auto text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Revisar Aparelhos
              </button>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs text-slate-500">Consumo Faturado</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
                  {formatNumber(monthlyKwh)} <span className="text-xs font-semibold text-slate-400">kWh</span>
                </div>
                <p className="text-[11px] text-slate-400">{formatBRL(billValue)}/mês</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs text-slate-500">Estimativa Aparelhos</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-['Space_Grotesk']">
                  {formatNumber(result.totalEstimated)} <span className="text-xs font-semibold text-slate-400">kWh</span>
                </div>
                <p className="text-[11px] text-slate-400">{result.estimates.length} itens ativos</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs text-slate-500">Tarifa Efetiva</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
                  {formatBRL(result.effectiveCostPerKwh)} <span className="text-xs font-semibold text-slate-400">/kWh</span>
                </div>
                <p className="text-[11px] text-slate-400">Custo marginal médio</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs text-slate-500">Por Morador ({occupants} pess.)</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
                  {formatNumber(result.kwhPerPerson)} <span className="text-xs font-semibold text-slate-400">kWh</span>
                </div>
                <p className="text-[11px] text-slate-400">{formatBRL(result.costPerPerson)}/morador</p>
              </div>
            </div>

            {/* Visual Chart: Ranked Horizontal Bar Chart with full names, % and kWh */}
            {(() => {
              const totalKwh = Math.max(1, result.totalEstimated);
              const rankedData = result.topContributors.map((c) => {
                const pct = Math.round((c.monthlyKwh / totalKwh) * 100);
                const cost = c.monthlyKwh * result.effectiveCostPerKwh;
                return {
                  name: c.label,
                  kwh: c.monthlyKwh,
                  pct,
                  cost,
                  displayLabel: `${formatNumber(c.monthlyKwh)} kWh (${pct}%)`,
                };
              });

              return (
                <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 dark:border-slate-700/80 pb-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Ranking dos Aparelhos que Mais Consomem (kWh/mês e % do Total)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Proporção exata de cada carga sobre os {formatNumber(result.totalEstimated)} kWh estimados da residência
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-1 rounded-full shrink-0">
                      {rankedData.length} aparelhos ranqueados
                    </span>
                  </div>

                  <div className="w-full" style={{ height: Math.max(280, rankedData.length * 48) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={rankedData}
                        margin={{ top: 10, right: 120, left: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          unit=" kWh"
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={150}
                          tick={{ fontSize: 12, fill: "#334155", fontWeight: 600 }}
                          interval={0}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl text-xs space-y-1">
                                  <p className="font-black text-slate-900 dark:text-white text-sm">
                                    {data.name}
                                  </p>
                                  <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                    Consumo: {formatNumber(data.kwh)} kWh/mês ({data.pct}% do total)
                                  </p>
                                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                                    Impacto na fatura: {formatBRL(data.cost)}/mês
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          dataKey="kwh"
                          fill="#087F5B"
                          radius={[0, 6, 6, 0]}
                        >
                          <LabelList
                            dataKey="displayLabel"
                            position="right"
                            className="fill-emerald-800 dark:fill-emerald-300 font-bold text-xs"
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })()}

            {/* Savings Potential Box (No double counting) */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <TrendingDown className="w-5 h-5" />
                  Potencial de Economia Mensal Calibrado (Sem Dupla Contagem)
                </div>
                <button
                  type="button"
                  id="btn-help-faixas-economia"
                  onClick={() => setExplanatoryTopic(DIAGNOSIS_EXPLANATIONS.faixas_economia)}
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 font-bold hover:underline cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Entenda as Faixas
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                As faixas abaixo representam a economia que sua residência pode atingir ajustando os hábitos nos maiores consumidores, respeitando o limite físico conservador de até 35% da fatura:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 block">Conservador</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {result.savings.conservative[0]}–{result.savings.conservative[1]} kWh
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold">
                    {formatBRL(result.savings.conservative[0] * result.effectiveCostPerKwh)}–
                    {formatBRL(result.savings.conservative[1] * result.effectiveCostPerKwh)}/mês
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-400 dark:border-emerald-700">
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold block">
                    Provável (Recomendado)
                  </span>
                  <div className="text-lg font-black text-emerald-800 dark:text-emerald-200">
                    {result.savings.probable[0]}–{result.savings.probable[1]} kWh
                  </div>
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                    {formatBRL(result.savings.probable[0] * result.effectiveCostPerKwh)}–
                    {formatBRL(result.savings.probable[1] * result.effectiveCostPerKwh)}/mês
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 block">Otimista (Com Trocas)</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {result.savings.optimistic[0]}–{result.savings.optimistic[1]} kWh
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold">
                    {formatBRL(result.savings.optimistic[0] * result.effectiveCostPerKwh)}–
                    {formatBRL(result.savings.optimistic[1] * result.effectiveCostPerKwh)}/mês
                  </span>
                </div>
              </div>
            </div>

            {/* Prioritized Recommendations List */}
            <div className="space-y-4 pt-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Ações Prioritárias Recomendadas para Seu Lar
              </h3>
              <div className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {rec.title}
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 self-start sm:self-auto">
                        Economia: ~{rec.potentialKwh[0]} a {rec.potentialKwh[1]} kWh/mês
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
                      {settings.simpleLanguage ? rec.actionSimple : rec.action}
                    </p>

                    <div className="flex flex-wrap gap-3 pl-8 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>
                        <strong>Por que importa:</strong>{" "}
                        {settings.simpleLanguage ? rec.whySimple : rec.why}
                      </span>
                      <span>·</span>
                      <span>
                        <strong>Investimento:</strong> {rec.cost}
                      </span>
                      <span>·</span>
                      <span>
                        <strong>Esforço:</strong> {rec.effort}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Navigation / Next Steps */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  id="btn-wizard-back-from-report"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar e Ajustar Aparelhos
                </button>
                <button
                  id="btn-wizard-restart"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Reiniciar Diagnóstico
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  id="btn-wizard-finish-exit"
                  onClick={() => {
                    if (onFocusModeChange) onFocusModeChange(false);
                    if (onExit) {
                      onExit();
                    }
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  title="Concluir diagnóstico e voltar ao Início"
                >
                  <Check className="w-4 h-4" />
                  Concluir e Voltar ao Início
                </button>
                <button
                  id="btn-wizard-open-simulator"
                  onClick={() => {
                    const diag: SavedDiagnosis = {
                      id: `diag-${Date.now()}`,
                      createdAt: new Date().toISOString(),
                      input: { billValue, monthlyKwh, occupants, appliances, detailed: true, hasSafetyRisk, safety },
                      result,
                      kind: "principal",
                    };
                    onOpenSimulator(diag);
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center gap-1.5"
                >
                  <Sliders className="w-4 h-4" />
                  Abrir no Simulador "E se..."
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contextual Educational Modal */}
      {explanatoryTopic && (
        <div
          id="diagnosis-help-modal-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-start justify-center pt-12 pb-16 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 no-print"
          onClick={(e) => {
            if (e.target === e.currentTarget) setExplanatoryTopic(null);
          }}
        >
          <div
            id="diagnosis-help-modal"
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-slate-300 dark:border-slate-800 p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                <Lightbulb className="w-5 h-5" />
                <h3>{explanatoryTopic.title}</h3>
              </div>
              <button
                id="btn-close-diagnosis-help"
                onClick={() => setExplanatoryTopic(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {explanatoryTopic.description}
            </p>

            {explanatoryTopic.example && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {explanatoryTopic.example}
              </div>
            )}

            {explanatoryTopic.tip && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{explanatoryTopic.tip}</span>
              </div>
            )}

            <button
              id="btn-understand-diagnosis-help"
              onClick={() => setExplanatoryTopic(null)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
