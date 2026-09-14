import React, { useState, useMemo } from "react";
import {
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Zap,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Scale,
  RefreshCw,
  Share2,
  Info,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { applianceCatalog as APPLIANCE_DEFINITIONS, calculateEquipmentPayback, formatBRL, formatNumber } from "../lib/energy";
import { AccessibilitySettings } from "../types";

interface EquipmentPaybackSimulatorProps {
  settings: AccessibilitySettings;
  defaultTariff?: number;
  onSharePayback?: (payload: {
    equipmentName: string;
    investmentBrl: number;
    monthlySavingsBrl: number;
    annualSavingsBrl: number;
    paybackMonths: number;
    viable: boolean;
  }) => void;
}

interface PresetUpgrade {
  label: string;
  applianceKey: string;
  currentName: string;
  currentWatts: number;
  currentHours: number;
  currentDays: number;
  newName: string;
  newPrice: number;
  newWatts: number;
  newHours: number;
  newDays: number;
}

const PRESET_UPGRADES: PresetUpgrade[] = [
  {
    label: "Ar-Condicionado Convencional 12.000 BTU ➔ Inverter Selo Procel A+++",
    applianceKey: "ar-condicionado",
    currentName: "Ar-Condicionado Tradicional (On/Off 12.000 BTU)",
    currentWatts: 1400,
    currentHours: 8,
    currentDays: 30,
    newName: "Split Inverter 12.000 BTU Procel A+++",
    newPrice: 2499,
    newWatts: 650,
    newHours: 8,
    newDays: 30,
  },
  {
    label: "Geladeira Antiga 10 Anos ➔ Refrigerador Inverter Frost Free A+++",
    applianceKey: "geladeira",
    currentName: "Geladeira Duplex Antiga (com borracha ressecada)",
    currentWatts: 250,
    currentHours: 24,
    currentDays: 30,
    newName: "Geladeira Frost Free Inverter Procel A+++ (38 kWh/mês)",
    newPrice: 3199,
    newWatts: 110,
    newHours: 24,
    newDays: 30,
  },
  {
    label: "Chuveiro Elétrico 4 Estações ➔ Chuveiro com Controle Eletrônico Progressivo",
    applianceKey: "chuveiro",
    currentName: "Chuveiro Tradicional (Inverno constante 5500W)",
    currentWatts: 5500,
    currentHours: 1.5,
    currentDays: 30,
    newName: "Chuveiro Eletrônico Digital Ajustável (Média 3200W)",
    newPrice: 240,
    newWatts: 3200,
    newHours: 1.5,
    newDays: 30,
  },
  {
    label: "Troca de 15 Lâmpadas Fluorescentes / Halógenas ➔ Kit LED 9W",
    applianceKey: "iluminacao",
    currentName: "15 Lâmpadas Fluorescentes Compactas (23W cada = 345W)",
    currentWatts: 345,
    currentHours: 5,
    currentDays: 30,
    newName: "15 Lâmpadas LED 9W Certificadas Procel (135W total)",
    newPrice: 150,
    newWatts: 135,
    newHours: 5,
    newDays: 30,
  },
  {
    label: "Bomba D'Água Antiga Rebobinada ➔ Bomba Autoaspirante Moderna 1/2 CV",
    applianceKey: "bomba",
    currentName: "Bomba d'água antiga com atrito mecânico (750W)",
    currentWatts: 750,
    currentHours: 3,
    currentDays: 30,
    newName: "Bomba Centrífuga Alta Eficiência 1/2 CV (370W)",
    newPrice: 420,
    newWatts: 370,
    newHours: 3,
    newDays: 30,
  },
  {
    label: "Freezer Horizontal Antigo ➔ Freezer Vertical Inverter Procel A",
    applianceKey: "freezer",
    currentName: "Freezer Horizontal antigo (350W uso contínuo)",
    currentWatts: 350,
    currentHours: 24,
    currentDays: 30,
    newName: "Freezer Vertical Inverter Frost Free A (160W)",
    newPrice: 2899,
    newWatts: 160,
    newHours: 24,
    newDays: 30,
  },
  {
    label: "Lavadora Antiga com Agitador ➔ Lavadora Front Load Inverter Eco",
    applianceKey: "lavadora",
    currentName: "Lavadora Convencional Superior (1500W)",
    currentWatts: 1500,
    currentHours: 1.5,
    currentDays: 12,
    newName: "Lavadora Frontal Inverter Inteligente (450W)",
    newPrice: 2699,
    newWatts: 450,
    newHours: 1.5,
    newDays: 12,
  },
];

const PAYBACK_EXPLANATIONS = {
  payback: {
    title: "O que é Tempo de Payback?",
    description: "Payback Simples é o tempo (em meses ou anos) necessário para que a economia gerada na sua conta de luz pague integralmente o preço investido no produto novo.",
    example: "Exemplo: Se você paga R$ 2.400 em um equipamento Inverter que reduz sua fatura em R$ 100 todo mês, o payback é: R$ 2.400 ÷ R$ 100 = 24 meses (2 anos). A partir do 25º mês, todo o dinheiro economizado vira alívio financeiro limpo no bolso!",
    tip: "Aparelhos duram em média de 8 a 12 anos. Um payback de até 3 ou 4 anos representa excelente viabilidade financeira.",
  },
  procel: {
    title: "Diferença entre Selo Procel A e Modelos Convencionais",
    description: "O Selo Procel identifica os modelos que passam nos testes mais rigorosos do Inmetro. Modelos Inverter contam com compressores inteligentes que modulam a rotação do motor em vez de ligar e desligar continuamente, reduzindo até 40% a 60% da energia gasta.",
    example: "Enquanto um modelo antigo ou de categoria D consome muita energia em cada partida de motor, um modelo Selo Procel A+++ opera de forma linear, estável e silenciosa.",
    tip: "Sempre compare o consumo informado na etiqueta do Inmetro (kWh/mês ou kWh/ano) antes de comprar.",
  },
};

export const EquipmentPaybackSimulator: React.FC<EquipmentPaybackSimulatorProps> = ({
  settings,
  defaultTariff = 0.88,
  onSharePayback,
}) => {
  const [explanatoryTopic, setExplanatoryTopic] = useState<{
    title: string;
    description: string;
    example?: string;
    tip?: string;
  } | null>(null);

  // Selected preset label tracking
  const [activePresetLabel, setActivePresetLabel] = useState<string | null>(
    PRESET_UPGRADES[0].label
  );

  // Current equipment form state
  const [selectedApplianceKey, setSelectedApplianceKey] = useState<string>("ar-condicionado");
  const [currentEquipmentName, setCurrentEquipmentName] = useState<string>(
    "Ar-Condicionado Tradicional (12.000 BTU)"
  );
  const [currentPowerWatts, setCurrentPowerWatts] = useState<number>(1400);
  const [currentHoursPerDay, setCurrentHoursPerDay] = useState<number>(8);
  const [currentDaysPerMonth, setCurrentDaysPerMonth] = useState<number>(30);

  // New equipment form state
  const [newEquipmentName, setNewEquipmentName] = useState<string>(
    "Split Inverter 12.000 BTU Selo Procel A+++"
  );
  const [newPriceBrl, setNewPriceBrl] = useState<number>(2499);
  const [newPowerWatts, setNewPowerWatts] = useState<number>(650);
  const [newHoursPerDay, setNewHoursPerDay] = useState<number>(8);
  const [newDaysPerMonth, setNewDaysPerMonth] = useState<number>(30);

  // Energy tariff (R$/kWh)
  const [tariffKwhBrl, setTariffKwhBrl] = useState<number>(defaultTariff || 0.88);

  // When appliance type changes, auto-populate reference power from definitions
  const handleApplianceChange = (key: string) => {
    setSelectedApplianceKey(key);
    const def = APPLIANCE_DEFINITIONS.find((a) => a.key === key);
    if (def) {
      setCurrentEquipmentName(`Meu(Minha) ${def.label}`);
      setCurrentPowerWatts(def.defaultPower);
      setNewPowerWatts(Math.round(def.defaultPower * 0.55)); // Typical 45% reduction for modern class A
    }
  };

  // Preset loader
  const handleApplyPreset = (preset: PresetUpgrade) => {
    setActivePresetLabel(preset.label);
    setSelectedApplianceKey(preset.applianceKey);
    setCurrentEquipmentName(preset.currentName);
    setCurrentPowerWatts(preset.currentWatts);
    setCurrentHoursPerDay(preset.currentHours);
    setCurrentDaysPerMonth(preset.currentDays);

    setNewEquipmentName(preset.newName);
    setNewPriceBrl(preset.newPrice);
    setNewPowerWatts(preset.newWatts);
    setNewHoursPerDay(preset.newHours);
    setNewDaysPerMonth(preset.newDays);
  };

  // Perform calculation
  const result = useMemo(() => {
    return calculateEquipmentPayback({
      applianceKey: selectedApplianceKey,
      currentPowerWatts,
      currentHoursPerDay,
      currentDaysPerMonth,
      newPriceBrl,
      newPowerWatts,
      newHoursPerDay,
      newDaysPerMonth,
      tariffKwhBrl,
    });
  }, [
    selectedApplianceKey,
    currentPowerWatts,
    currentHoursPerDay,
    currentDaysPerMonth,
    newPriceBrl,
    newPowerWatts,
    newHoursPerDay,
    newDaysPerMonth,
    tariffKwhBrl,
  ]);

  // Determine viability assessment
  const paybackStatus = useMemo(() => {
    if (!result.viable || result.monthlyBrlSaved <= 0) {
      return {
        label: "Investimento Sem Economia Elétrica",
        desc: "O novo equipamento consome igual ou mais que o anterior nas horas informadas.",
        color: "red",
      };
    }
    if (result.paybackMonths <= 12) {
      return {
        label: "Excelente Retorno (Menos de 1 Ano)",
        desc: "O aparelho se paga muito rapidamente apenas com a economia na conta de luz.",
        color: "emerald",
      };
    }
    if (result.paybackMonths <= 24) {
      return {
        label: "Ótimo Investimento (1 a 2 Anos)",
        desc: "Retorno consistente dentro da vida útil do equipamento com ganho financeiro contínuo.",
        color: "emerald",
      };
    }
    if (result.paybackMonths <= 48) {
      return {
        label: "Retorno Médio a Longo Prazo (2 a 4 Anos)",
        desc: "Viável se o equipamento for durável e mantido em uso contínuo por vários anos.",
        color: "amber",
      };
    }
    return {
      label: "Retorno Acima de 4 Anos",
      desc: "O valor da aquisição é alto em relação à economia mensal obtida. Avalie se outros benefícios (conforto, garantia) justificam a compra.",
      color: "slate",
    };
  }, [result]);

  return (
    <div id="payback-simulator-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Introduction */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
            <ShoppingBag className="w-3.5 h-3.5" />
            Decisão Inteligente de Compra
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
            Simulador de Compra & Tempo de Payback
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            {settings.simpleLanguage
              ? "Quer trocar um aparelho antigo por um novo mais moderno? Coloque o preço e o consumo para descobrir em quantos meses a economia na conta de luz paga o produto novo."
              : "Calcule o tempo de retorno do investimento (Payback Simples) e o ponto de equilíbrio financeiro ao substituir eletrodomésticos antigos por modelos de alta eficiência energética (Selo Procel A / Inverter)."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              id="btn-help-payback-concept"
              onClick={() => setExplanatoryTopic(PAYBACK_EXPLANATIONS.payback)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              Como funciona o Payback?
            </button>
            <button
              type="button"
              id="btn-help-procel-concept"
              onClick={() => setExplanatoryTopic(PAYBACK_EXPLANATIONS.procel)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              Por que Selo Procel A / Inverter?
            </button>
          </div>
        </div>

        {onSharePayback && (
          <button
            id="btn-share-payback"
            onClick={() => {
              onSharePayback({
                equipmentName: newEquipmentName || "Novo Equipamento Eficiente",
                investmentBrl: newPriceBrl,
                monthlySavingsBrl: result.monthlyBrlSaved,
                annualSavingsBrl: result.annualBrlSaved,
                paybackMonths: result.paybackMonths,
                viable: result.viable,
              });
            }}
            className="self-start px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar Análise
          </button>
        )}
      </div>

      {/* Preset Upgrades Shortcuts */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Cenários de Troca Frequentes (Clique para Carregar):
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_UPGRADES.map((preset, idx) => {
            const isSelected = activePresetLabel === preset.label;
            return (
              <button
                key={idx}
                id={`btn-payback-preset-${idx}`}
                onClick={() => handleApplyPreset(preset)}
                className={`p-3 text-left rounded-2xl border transition text-xs space-y-1.5 group ${
                  isSelected
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-400 shadow-sm"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={`font-bold text-xs ${isSelected ? "text-indigo-950 dark:text-indigo-200" : "text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400"} transition-colors`}>
                    {preset.label}
                  </div>
                  {isSelected && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-black text-[9px] uppercase tracking-wider shrink-0">
                      Ativo
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Novo por {formatBRL(preset.newPrice)}</span>
                  <span className={`${isSelected ? "text-indigo-700 dark:text-indigo-300 font-bold" : "text-indigo-600 dark:text-indigo-400 font-semibold"} flex items-center gap-0.5`}>
                    {isSelected ? "Carregado" : "Testar"} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Input Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Equipamento Atual (Antigo) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Aparelho Atual (Em Uso)
                </h3>
                <p className="text-xs text-slate-500">O que você já possui em casa hoje</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Linha de Base
            </span>
          </div>

          <div className="space-y-4">
            {/* Appliance Selector from Catalog */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Tipo de Aparelho (Catálogo Oficial)
              </label>
              <select
                id="select-payback-appliance"
                value={selectedApplianceKey}
                onChange={(e) => handleApplianceChange(e.target.value)}
                className="w-full text-xs font-semibold p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500"
              >
                {APPLIANCE_DEFINITIONS.map((app) => (
                  <option key={app.key} value={app.key}>
                    {app.label} (~{app.defaultPower} W)
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Nome ou Descrição do Aparelho Atual
              </label>
              <input
                id="input-current-name"
                type="text"
                value={currentEquipmentName}
                onChange={(e) => setCurrentEquipmentName(e.target.value)}
                className="w-full text-xs font-semibold p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500"
              />
            </div>

            {/* Power Watts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Potência (Watts)</span>
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                </label>
                <input
                  id="input-current-watts"
                  type="number"
                  min="0"
                  max="15000"
                  value={currentPowerWatts || ""}
                  onChange={(e) => setCurrentPowerWatts(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-full text-sm font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Horas / Dia</span>
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                </label>
                <input
                  id="input-current-hours"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={currentHoursPerDay || ""}
                  onChange={(e) => setCurrentHoursPerDay(e.target.value === "" ? 0 : Math.min(24, Math.max(0, Number(e.target.value))))}
                  placeholder="0"
                  className="w-full text-sm font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Dias / Mês</span>
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                </label>
                <input
                  id="input-current-days"
                  type="number"
                  min="0"
                  max="30"
                  value={currentDaysPerMonth || ""}
                  onChange={(e) => setCurrentDaysPerMonth(e.target.value === "" ? 0 : Math.min(30, Math.max(0, Number(e.target.value))))}
                  placeholder="0"
                  className="w-full text-sm font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500"
                />
              </div>
            </div>

            {/* Current Consumption Subtotal Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Consumo Atual Estimado</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {formatNumber(result.currentMonthlyKwh)} kWh/mês
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Custo Mensal</span>
                <span className="text-lg font-black text-slate-700 dark:text-slate-300">
                  {formatBRL(result.currentMonthlyCost)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Novo Equipamento Pretendido */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Novo Equipamento a Comprar
                </h3>
                <p className="text-xs text-slate-500">Modelo novo com Selo Procel A / Inverter</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
              Alta Eficiência
            </span>
          </div>

          <div className="space-y-4">
            {/* New Name & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Modelo ou Marca do Novo Produto
                </label>
                <input
                  id="input-new-name"
                  type="text"
                  value={newEquipmentName}
                  onChange={(e) => setNewEquipmentName(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                  <span>Preço (R$)*</span>
                  <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                </label>
                <input
                  id="input-new-price"
                  type="number"
                  min="0"
                  step="10"
                  value={newPriceBrl || ""}
                  onChange={(e) => setNewPriceBrl(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-full text-sm font-black p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 focus:outline-indigo-500"
                />
              </div>
            </div>

            {/* Power Watts, Hours, Days for New Appliance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Potência Nova (W)</span>
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                </label>
                <input
                  id="input-new-watts"
                  type="number"
                  min="0"
                  max="15000"
                  value={newPowerWatts || ""}
                  onChange={(e) => setNewPowerWatts(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-full text-sm font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Novo Uso (h/dia)</span>
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                </label>
                <input
                  id="input-new-hours"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={newHoursPerDay || ""}
                  onChange={(e) => setNewHoursPerDay(e.target.value === "" ? 0 : Math.min(24, Math.max(0, Number(e.target.value))))}
                  placeholder="0"
                  className="w-full text-sm font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Dias / Mês</span>
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                </label>
                <input
                  id="input-new-days"
                  type="number"
                  min="0"
                  max="30"
                  value={newDaysPerMonth || ""}
                  onChange={(e) => setNewDaysPerMonth(e.target.value === "" ? 0 : Math.min(30, Math.max(0, Number(e.target.value))))}
                  placeholder="0"
                  className="w-full text-sm font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-indigo-500"
                />
              </div>
            </div>

            {/* New Consumption Subtotal Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-indigo-700 dark:text-indigo-300 block">Novo Consumo Previsto</span>
                <span className="text-lg font-black text-indigo-950 dark:text-indigo-100">
                  {formatNumber(result.newMonthlyKwh)} kWh/mês
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-indigo-700 dark:text-indigo-300 block">Novo Custo Mensal</span>
                <span className="text-lg font-black text-indigo-950 dark:text-indigo-100">
                  {formatBRL(result.newMonthlyCost)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tariff rate config strip */}
      <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Tarifa de Energia Considerada:
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            (R$ por kWh com impostos)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="input-payback-tariff"
            type="number"
            step="0.01"
            min="0"
            value={tariffKwhBrl || ""}
            onChange={(e) => setTariffKwhBrl(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
            placeholder="0.94"
            className="w-24 text-center font-bold py-1 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-indigo-500"
          />
          <span className="text-slate-500">R$/kWh</span>
          <button
            onClick={() => setTariffKwhBrl(0.94)}
            className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-[11px] font-semibold"
            title="Definir tarifa Enel Ceará"
          >
            Enel CE (~R$ 0,94)
          </button>
        </div>
      </div>

      {/* Primary Payback Results Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Economia Mensal em R$ */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-semibold block">Economia Mensal na Conta</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-['Space_Grotesk']">
            {formatBRL(result.monthlyBrlSaved)}/mês
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Redução de {formatNumber(result.monthlyKwhSaved)} kWh todos os meses
          </p>
        </div>

        {/* Economia Anual Acumulada */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-semibold block">Economia Acumulada em 1 Ano</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
            {formatBRL(result.annualBrlSaved)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {formatBRL(result.annualBrlSaved * 3)} poupados em 3 anos
          </p>
        </div>

        {/* Tempo de Payback */}
        <div className="p-5 rounded-3xl bg-indigo-600 text-white shadow-md space-y-1 sm:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-100 font-semibold">
              Tempo Estimado de Payback (Retorno do Investimento)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
              {paybackStatus.label}
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black font-['Space_Grotesk']">
              {result.viable ? `${result.paybackMonths} Meses` : "Sem retorno"}
            </span>
            {result.viable && result.paybackYears > 0.9 && (
              <span className="text-sm text-indigo-200 font-medium">
                (~{result.paybackYears} anos)
              </span>
            )}
          </div>
          <p className="text-xs text-indigo-100 leading-relaxed pt-1">
            {paybackStatus.desc}
          </p>
        </div>
      </div>

      {/* Break-Even Timeline Chart */}
      {result.viable && result.timeline.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Gráfico do Ponto de Equilíbrio (Quando a Economia "Paga" o Aparelho)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A linha verde (Economia Acumulada) cruza a linha tracejada (Preço de Compra) no mês de Payback. A partir dali, é lucro puro para o seu bolso.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
              Ponto de corte: Mês {result.paybackMonths}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.timeline} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="month"
                  unit="º mês"
                  stroke="#94a3b8"
                  fontSize={11}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v) => `R$ ${v}`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    formatBRL(Number(value)),
                    name === "cumulativeSavings"
                      ? "Economia Acumulada"
                      : name === "investmentCost"
                      ? "Preço de Compra do Aparelho"
                      : "Saldo Líquido",
                  ]}
                  labelFormatter={(label) => `Mês ${label}`}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  formatter={(value) =>
                    value === "cumulativeSavings"
                      ? "Economia Acumulada na Conta (R$)"
                      : value === "investmentCost"
                      ? "Custo de Compra (R$)"
                      : "Saldo Líquido (R$)"
                  }
                />
                <ReferenceLine
                  x={Math.round(result.paybackMonths)}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{
                    value: `Payback: ${result.paybackMonths}m`,
                    position: "top",
                    fill: "#10b981",
                    fontSize: 11,
                    fontWeight: "bold",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeSavings"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="investmentCost"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Conclusão Financeira: </span>
              Ao investir {formatBRL(newPriceBrl)} no modelo {newEquipmentName}, sua conta terá alívio de {formatBRL(result.monthlyBrlSaved)} mensais. No mês {result.paybackMonths}, o produto terá se pagado integralmente, acumulando nos meses subsequentes uma economia líquida positiva.
            </div>
          </div>
        </div>
      )}

      {/* Explanatory Topic Modal */}
      {explanatoryTopic && (
        <div
          id="payback-help-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 no-print"
          onClick={(e) => {
            if (e.target === e.currentTarget) setExplanatoryTopic(null);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-slate-300 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Info className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {explanatoryTopic.title}
                </h4>
              </div>
              <button
                onClick={() => setExplanatoryTopic(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {explanatoryTopic.description}
            </p>

            {explanatoryTopic.example && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line font-medium leading-relaxed">
                {explanatoryTopic.example}
              </div>
            )}

            {explanatoryTopic.tip && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>
                  <strong>Dica Prática:</strong> {explanatoryTopic.tip}
                </span>
              </div>
            )}

            <button
              onClick={() => setExplanatoryTopic(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
