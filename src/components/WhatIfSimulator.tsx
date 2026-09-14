import React, { useState, useMemo } from "react";
import {
  Sliders,
  Sparkles,
  Zap,
  TrendingDown,
  Save,
  RotateCcw,
  Check,
  ArrowRight,
  Info,
  DollarSign,
  HelpCircle,
  Share2,
  X,
  Lightbulb,
} from "lucide-react";
import {
  ApplianceInput,
  ApplianceKey,
  SavedDiagnosis,
  AccessibilitySettings,
} from "../types";
import {
  calculateDiagnosis,
  estimateAppliance,
  formatBRL,
  formatNumber,
} from "../lib/energy";

const SIMULATOR_EXPLANATIONS: Record<
  string,
  { title: string; description: string; example?: string; tip?: string }
> = {
  teto_economia: {
    title: "Teto Físico de Economia Realista",
    description:
      "Nenhum ajuste razoável de hábitos reduz 100% ou 80% do consumo sem desligar os aparelhos essenciais da residência. O simulador adota um limite físico conservador calibrado em até 35% de economia comportamental.",
    example:
      "A geladeira, lâmpadas essenciais e roteador continuam demandando energia mínima contínua para preservar alimentos e a segurança.",
    tip: "Economias acima de 35% normalmente exigem geração própria (como energia solar fotovoltaica) ou substituição de aparelhos antigos por modelos com Selo Procel A+++.",
  },
  dupla_contagem: {
    title: "Prevenção de Dupla Contagem",
    description:
      "Se você simula diminuir a potência do chuveiro (chave Verão) e também reduzir o tempo de banho, a economia de tempo incide sobre a nova potência menor, e não sobre a original.",
    example:
      "Somar as duas economias isoladas geraria um resultado artificialmente inflado. O motor físico do Turn OFF recalcula o cenário de forma integrada.",
    tip: "Isso garante que o valor em reais projetado no simulador seja exatamente o que você conseguirá economizar na sua fatura real.",
  },
  custo_marginal: {
    title: "Tarifa Marginal Efetiva",
    description:
      "Cada quilowatt-hora economizado na ponta evita o pagamento da tarifa cheia somada à TUSD, impostos (ICMS, PIS, COFINS) e bandeiras tarifárias ativas.",
    example:
      "Economizar 10 kWh não poupa apenas a tarifa pura de geração, mas também o imposto correspondente proporcional.",
    tip: "Pequenas reduções nos aparelhos de alta potência (chuveiro, ar, ferro) trazem um alívio desproporcionalmente alto no bolso.",
  },
};

interface WhatIfSimulatorProps {
  baselineDiagnosis: SavedDiagnosis | null;
  onSaveTestSimulation: (simulation: SavedDiagnosis) => void;
  onShareSimulation?: (payload: {
    label: string;
    monthlyKwh: number;
    savingsKwh: number;
    monthlyCost: number;
    savingsBrl: number;
    changesSummary?: string[];
  }) => void;
  settings: AccessibilitySettings;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  baselineDiagnosis,
  onSaveTestSimulation,
  onShareSimulation,
  settings,
}) => {
  const [explanatoryTopic, setExplanatoryTopic] = useState<{
    title: string;
    description: string;
    example?: string;
    tip?: string;
  } | null>(null);

  // Baseline appliances
  const baseAppliances = useMemo(() => {
    return baselineDiagnosis?.input.appliances || [];
  }, [baselineDiagnosis]);

  // Simulation state: modified appliances
  const [simAppliances, setSimAppliances] = useState<ApplianceInput[]>(() => {
    return JSON.parse(JSON.stringify(baseAppliances));
  });

  // Track active presets applied (2 options per major equipment)
  const [activePresets, setActivePresets] = useState<Record<string, boolean>>({
    shower_duration: false,
    shower_summer: false,
    ac_temp: false,
    ac_timer: false,
    fridge_gasket: false,
    fridge_habits: false,
    light_led: false,
    light_hours: false,
    tv_standby: false,
    tv_eco_mode: false,
    laundry_full_load: false,
    iron_batch: false,
  });

  // Re-sync if baseline changes
  React.useEffect(() => {
    if (baseAppliances.length > 0) {
      setSimAppliances(JSON.parse(JSON.stringify(baseAppliances)));
      setActivePresets({
        shower_duration: false,
        shower_summer: false,
        ac_temp: false,
        ac_timer: false,
        fridge_gasket: false,
        fridge_habits: false,
        light_led: false,
        light_hours: false,
        tv_standby: false,
        tv_eco_mode: false,
        laundry_full_load: false,
        iron_batch: false,
      });
    }
  }, [baseAppliances]);

  // If no baseline diagnosis is available yet, provide a helper prompt
  if (!baselineDiagnosis || baseAppliances.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Sliders className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Crie um Diagnóstico Primeiro
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          O Simulador "E se..." precisa do mapeamento dos equipamentos da sua residência para calcular as hipóteses de economia com precisão física.
        </p>
      </div>
    );
  }

  // Calculate baseline diagnosis results
  const baselineResult = baselineDiagnosis.result;
  const costPerKwh = baselineResult.effectiveCostPerKwh || 0.85;

  // Calculate simulated diagnosis results
  const simulatedInput = {
    ...baselineDiagnosis.input,
    appliances: simAppliances,
  };
  const simulatedResult = calculateDiagnosis(simulatedInput);

  // Physical and financial delta
  const deltaKwh = Math.max(0, baselineResult.totalEstimated - simulatedResult.totalEstimated);
  const deltaBrl = deltaKwh * costPerKwh;
  const annualKwh = deltaKwh * 12;
  const annualBrl = deltaBrl * 12;

  // Handler for presets
  const togglePreset = (presetId: string) => {
    const isCurrentlyActive = activePresets[presetId];
    const nextActive = !isCurrentlyActive;
    setActivePresets((prev) => ({ ...prev, [presetId]: nextActive }));

    setSimAppliances((prev) => {
      const cloned: ApplianceInput[] = JSON.parse(JSON.stringify(prev));

      // 1. CHUVEIRO: Opção 1 (Duração)
      if (presetId === "shower_duration") {
        const shower = cloned.find((a) => a.key === "chuveiro");
        if (shower) {
          if (nextActive) {
            shower.hoursPerDay = Math.max(0.1, Math.round(shower.hoursPerDay * 0.7 * 10) / 10);
          } else {
            const baseShower = baseAppliances.find((a) => a.key === "chuveiro");
            if (baseShower) shower.hoursPerDay = baseShower.hoursPerDay;
          }
        }
      }

      // 1. CHUVEIRO: Opção 2 (Modo Verão / Potência)
      if (presetId === "shower_summer") {
        const shower = cloned.find((a) => a.key === "chuveiro");
        if (shower) {
          if (nextActive) {
            shower.powerWatts = Math.round((shower.powerWatts || 5500) * 0.65);
          } else {
            const baseShower = baseAppliances.find((a) => a.key === "chuveiro");
            if (baseShower) shower.powerWatts = baseShower.powerWatts;
          }
        }
      }

      // 2. AR-CONDICIONADO: Opção 1 (Temperatura 23°C-24°C)
      if (presetId === "ac_temp") {
        const ac = cloned.find((a) => a.key === "ar-condicionado");
        if (ac) {
          if (nextActive) {
            ac.utilizationFactor = 0.48;
          } else {
            const baseAc = baseAppliances.find((a) => a.key === "ar-condicionado");
            if (baseAc) ac.utilizationFactor = baseAc.utilizationFactor;
          }
        }
      }

      // 2. AR-CONDICIONADO: Opção 2 (Timer noturno / -1 hora)
      if (presetId === "ac_timer") {
        const ac = cloned.find((a) => a.key === "ar-condicionado");
        if (ac) {
          if (nextActive) {
            ac.hoursPerDay = Math.max(1, ac.hoursPerDay - 1);
          } else {
            const baseAc = baseAppliances.find((a) => a.key === "ar-condicionado");
            if (baseAc) ac.hoursPerDay = baseAc.hoursPerDay;
          }
        }
      }

      // 3. GELADEIRA: Opção 1 (Borracha e ventilação)
      if (presetId === "fridge_gasket") {
        const fridge = cloned.find((a) => a.key === "geladeira");
        if (fridge) {
          if (nextActive) {
            fridge.utilizationFactor = 0.32;
          } else {
            const baseFridge = baseAppliances.find((a) => a.key === "geladeira");
            if (baseFridge) fridge.utilizationFactor = baseFridge.utilizationFactor;
          }
        }
      }

      // 3. GELADEIRA: Opção 2 (Regular termostato / sem alimentos quentes)
      if (presetId === "fridge_habits") {
        const fridge = cloned.find((a) => a.key === "geladeira");
        if (fridge) {
          if (nextActive) {
            fridge.powerWatts = Math.round((fridge.powerWatts || 150) * 0.85);
          } else {
            const baseFridge = baseAppliances.find((a) => a.key === "geladeira");
            if (baseFridge) fridge.powerWatts = baseFridge.powerWatts;
          }
        }
      }

      // 4. ILUMINAÇÃO: Opção 1 (Lâmpadas LED 9W)
      if (presetId === "light_led") {
        const light = cloned.find((a) => a.key === "iluminacao");
        if (light) {
          if (nextActive && light.lightingRooms) {
            light.lightingRooms.forEach((r) => {
              const oldLamps = r.lamps.incandescente + r.lamps.fluorescente;
              r.lamps.led += oldLamps;
              r.lamps.incandescente = 0;
              r.lamps.fluorescente = 0;
            });
          } else {
            const baseLight = baseAppliances.find((a) => a.key === "iluminacao");
            if (baseLight && baseLight.lightingRooms) {
              light.lightingRooms = JSON.parse(JSON.stringify(baseLight.lightingRooms));
            }
          }
        }
      }

      // 4. ILUMINAÇÃO: Opção 2 (Apagar luzes ociosas / -1 hora)
      if (presetId === "light_hours") {
        const light = cloned.find((a) => a.key === "iluminacao");
        if (light && light.lightingRooms) {
          if (nextActive) {
            light.lightingRooms.forEach((r) => {
              r.hoursPerDay = Math.max(1, r.hoursPerDay - 1);
            });
          } else {
            const baseLight = baseAppliances.find((a) => a.key === "iluminacao");
            if (baseLight && baseLight.lightingRooms) {
              light.lightingRooms = JSON.parse(JSON.stringify(baseLight.lightingRooms));
            }
          }
        }
      }

      // 5. TV & ELETRÔNICOS: Opção 1 (Eliminar Standby Vampiro)
      if (presetId === "tv_standby") {
        const targets: ApplianceKey[] = ["televisao", "receptor-tv", "videogame", "computador"];
        cloned.forEach((a) => {
          if (targets.includes(a.key)) {
            if (nextActive) {
              a.hoursPerDay = Math.max(0.5, Math.round(a.hoursPerDay * 0.75 * 10) / 10);
            } else {
              const original = baseAppliances.find((o) => o.key === a.key);
              if (original) a.hoursPerDay = original.hoursPerDay;
            }
          }
        });
      }

      // 5. TV & ELETRÔNICOS: Opção 2 (Modo Eco na Tela)
      if (presetId === "tv_eco_mode") {
        const tv = cloned.find((a) => a.key === "televisao");
        if (tv) {
          if (nextActive) {
            tv.powerWatts = Math.round((tv.powerWatts || 120) * 0.8);
          } else {
            const baseTv = baseAppliances.find((a) => a.key === "televisao");
            if (baseTv) tv.powerWatts = baseTv.powerWatts;
          }
        }
      }

      // 6. LAVANDERIA & FERRO: Opção 1 (Máquina de lavar carga cheia)
      if (presetId === "laundry_full_load") {
        const washer = cloned.find((a) => a.key === "lavadora");
        if (washer) {
          if (nextActive) {
            washer.frequency = Math.max(4, Math.round(washer.frequency * 0.6));
          } else {
            const baseWasher = baseAppliances.find((a) => a.key === "lavadora");
            if (baseWasher) washer.frequency = baseWasher.frequency;
          }
        }
      }

      // 6. LAVANDERIA & FERRO: Opção 2 (Passar roupas em lote com calor residual)
      if (presetId === "iron_batch") {
        const iron = cloned.find((a) => a.key === "ferro");
        if (iron) {
          if (nextActive) {
            iron.hoursPerDay = Math.max(0.2, Math.round(iron.hoursPerDay * 0.7 * 10) / 10);
          } else {
            const baseIron = baseAppliances.find((a) => a.key === "ferro");
            if (baseIron) iron.hoursPerDay = baseIron.hoursPerDay;
          }
        }
      }

      return cloned;
    });
  };

  const resetSimulation = () => {
    setSimAppliances(JSON.parse(JSON.stringify(baseAppliances)));
    setActivePresets({
      shower_duration: false,
      shower_summer: false,
      ac_temp: false,
      ac_timer: false,
      fridge_gasket: false,
      fridge_habits: false,
      light_led: false,
      light_hours: false,
      tv_standby: false,
      tv_eco_mode: false,
      laundry_full_load: false,
      iron_batch: false,
    });
  };

  const saveSimulationAsTest = () => {
    const changesCount = Object.values(activePresets).filter(Boolean).length;
    const testDiag: SavedDiagnosis = {
      id: `sim-${Date.now()}`,
      createdAt: new Date().toISOString(),
      kind: "teste",
      originalDiagnosisId: baselineDiagnosis.id,
      input: simulatedInput,
      result: simulatedResult,
      simulation: {
        originalDiagnosisCreatedAt: baselineDiagnosis.createdAt,
        description: `Simulação de economia com ${changesCount} medidas hipotéticas aplicadas. Economia projetada de ${formatNumber(deltaKwh)} kWh/mês.`,
      },
    };
    onSaveTestSimulation(testDiag);
  };

  return (
    <div id="what-if-simulator-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
          <Sliders className="w-3.5 h-3.5" />
          Simulador Interativo
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
          Simulador "E se..."
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          {settings.simpleLanguage
            ? "Teste o que acontece se você mudar os hábitos ou trocar aparelhos. O cálculo mostra a economia na hora sem alterar seu diagnóstico original."
            : "Modelo físico sem sobreposição ou dupla contagem: compare diretamente consumo atual vs novo cenário com cálculo de kWh e custo evitado."}
        </p>
      </div>

      {/* Live Comparison Gauge */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-900 via-slate-900 to-emerald-950 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold">
              Resultado Instantâneo da Simulação
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-['Space_Grotesk']">
              Comparativo: Atual vs Cenário Simulado
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {onShareSimulation && deltaKwh > 0 && (
              <button
                id="btn-share-simulation"
                onClick={() => {
                  const appliedLabels: string[] = [];
                  if (activePresets.shower_duration) appliedLabels.push("Banhos rápidos de 8 min no chuveiro");
                  if (activePresets.shower_summer) appliedLabels.push("Chuveiro na posição Verão");
                  if (activePresets.ac_temp) appliedLabels.push("Ar-condicionado calibrado a 23°C");
                  if (activePresets.ac_timer) appliedLabels.push("Timer de 6h no ar-condicionado");
                  if (activePresets.fridge_gasket) appliedLabels.push("Borracha da geladeira vedada");
                  if (activePresets.fridge_habits) appliedLabels.push("Aberturas rápidas na geladeira");
                  if (activePresets.light_led) appliedLabels.push("Troca total para lâmpadas LED");
                  if (activePresets.light_hours) appliedLabels.push("Redução de 1h nas lâmpadas acesas");
                  if (activePresets.tv_standby) appliedLabels.push("Fim do consumo fantasma/standby");
                  if (activePresets.tv_eco_mode) appliedLabels.push("Modo econômico na TV");
                  if (activePresets.laundry_full_load) appliedLabels.push("Máquina de lavar sempre cheia");
                  if (activePresets.laundry_cold) appliedLabels.push("Lavagem com água fria");
                  if (activePresets.fan_speed) appliedLabels.push("Ventilador na velocidade moderada");
                  if (activePresets.fan_off_empty) appliedLabels.push("Ventilador desligado em cômodos vazios");
                  if (activePresets.iron_batch) appliedLabels.push("Ferro de passar em lote semanal");

                  onShareSimulation({
                    label: "Cenário de Eficiência Turn OFF",
                    monthlyKwh: simulatedResult.totalEstimated,
                    savingsKwh: deltaKwh,
                    monthlyCost: simulatedResult.totalEstimated * costPerKwh,
                    savingsBrl: deltaBrl,
                    changesSummary: appliedLabels,
                  });
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                Compartilhar Cenário
              </button>
            )}
            <button
              id="btn-reset-simulation"
              onClick={resetSimulation}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Valores
            </button>
          </div>
        </div>

        {/* 4 Cards: Current vs Simulated vs Delta kWh vs Delta R$ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-1">
            <span className="text-[11px] text-slate-300 block">Consumo Atual Estimado</span>
            <div className="text-xl sm:text-2xl font-black font-['Space_Grotesk'] text-white">
              {formatNumber(baselineResult.totalEstimated)} <span className="text-xs text-slate-300">kWh</span>
            </div>
            <p className="text-[10px] text-slate-400">
              {formatBRL(baselineResult.totalEstimated * costPerKwh)}/mês
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-1">
            <span className="text-[11px] text-blue-300 block font-semibold">Novo Consumo Simulado</span>
            <div className="text-xl sm:text-2xl font-black font-['Space_Grotesk'] text-blue-200">
              {formatNumber(simulatedResult.totalEstimated)} <span className="text-xs text-slate-300">kWh</span>
            </div>
            <p className="text-[10px] text-blue-300">
              {formatBRL(simulatedResult.totalEstimated * costPerKwh)}/mês
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/20 backdrop-blur-xs border border-emerald-400/30 space-y-1">
            <span className="text-[11px] text-emerald-300 block font-bold">Economia Mensal</span>
            <div className="text-xl sm:text-2xl font-black font-['Space_Grotesk'] text-emerald-300">
              {deltaKwh > 0 ? `-${formatNumber(deltaKwh)}` : "0.0"} <span className="text-xs text-emerald-200">kWh</span>
            </div>
            <p className="text-xs text-emerald-200 font-bold">
              {deltaKwh > 0 ? `${formatBRL(deltaBrl)}/mês` : "R$ 0,00"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/20 backdrop-blur-xs border border-emerald-400/30 space-y-1">
            <span className="text-[11px] text-emerald-300 block font-bold">Projeção Anual (12 Meses)</span>
            <div className="text-xl sm:text-2xl font-black font-['Space_Grotesk'] text-emerald-300">
              {annualKwh > 0 ? `-${formatNumber(annualKwh, 0)}` : "0"} <span className="text-xs text-emerald-200">kWh</span>
            </div>
            <p className="text-xs text-emerald-200 font-bold">
              {annualBrl > 0 ? `${formatBRL(annualBrl)}/ano` : "R$ 0,00"}
            </p>
          </div>
        </div>

        {/* Technical Explanations bar */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-blue-200">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
            Critérios Físicos:
          </span>
          <button
            type="button"
            id="btn-help-teto"
            onClick={() => setExplanatoryTopic(SIMULATOR_EXPLANATIONS.teto_economia)}
            className="inline-flex items-center gap-1 hover:text-white underline cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-300" />
            Por que até 35%? (Teto Físico)
          </button>
          <button
            type="button"
            id="btn-help-dupla-contagem"
            onClick={() => setExplanatoryTopic(SIMULATOR_EXPLANATIONS.dupla_contagem)}
            className="inline-flex items-center gap-1 hover:text-white underline cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-300" />
            Como evitamos dupla contagem?
          </button>
          <button
            type="button"
            id="btn-help-custo-marginal"
            onClick={() => setExplanatoryTopic(SIMULATOR_EXPLANATIONS.custo_marginal)}
            className="inline-flex items-center gap-1 hover:text-white underline cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-300" />
            Tarifa Efetiva / Custo Marginal
          </button>
        </div>
      </div>

      {/* Quick Scenario Toggles: 2 Options Per Equipment */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Cenários de Mudança Prática (2 Opções por Equipamento)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ative ou desative as hipóteses para cada equipamento e veja a economia recalibrada sem dupla contagem:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grupo 1: Chuveiro Elétrico */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
              1. Chuveiro Elétrico (~5.500W)
            </span>
            <div className="space-y-2">
              <button
                id="preset-shower-duration"
                onClick={() => togglePreset("shower_duration")}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-3 ${
                  activePresets.shower_duration
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm">Opção A: Banho 5 min mais curto</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Reduz 30% do tempo de uso diário.</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${activePresets.shower_duration ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-600"}`}>
                  {activePresets.shower_duration && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                id="preset-shower-summer"
                onClick={() => togglePreset("shower_summer")}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-3 ${
                  activePresets.shower_summer
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm">Opção B: Chave na posição Verão / Morna</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Reduz a potência elétrica em ~35% nos dias amenos.</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${activePresets.shower_summer ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-600"}`}>
                  {activePresets.shower_summer && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            </div>
          </div>

          {/* Grupo 2: Ar-Condicionado */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block">
              2. Ar-Condicionado
            </span>
            <div className="space-y-2">
              <button
                id="preset-ac-temp"
                onClick={() => togglePreset("ac_temp")}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-3 ${
                  activePresets.ac_temp
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm">Opção A: Regular para 23°C–24°C</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Cicla o compressor e evita trabalho contínuo forçado.</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${activePresets.ac_temp ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-600"}`}>
                  {activePresets.ac_temp && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                id="preset-ac-timer"
                onClick={() => togglePreset("ac_timer")}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-3 ${
                  activePresets.ac_timer
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm">Opção B: Programar Timer noturno (-1h)</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Desliga automaticamente antes do amanhecer.</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${activePresets.ac_timer ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-600"}`}>
                  {activePresets.ac_timer && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            </div>
          </div>

          {/* Grupo 3: Geladeira */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 block">
              3. Geladeira & Freezer
            </span>
            <div className="space-y-2">
              <button
                id="preset-fridge-gasket"
                onClick={() => togglePreset("fridge_gasket")}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-3 ${
                  activePresets.fridge_gasket
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm">Opção A: Trocar borracha e afastar da parede</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Diminui a perda de frio e resfria a serpentina.</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${activePresets.fridge_gasket ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-600"}`}>
                  {activePresets.fridge_gasket && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                id="preset-fridge-habits"
                onClick={() => togglePreset("fridge_habits")}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-3 ${
                  activePresets.fridge_habits
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm">Opção B: Regular termostato e sem prato quente</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Nunca coloque panelas quentes e ajuste nível médio.</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${activePresets.fridge_habits ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-600"}`}>
                  {activePresets.fridge_habits && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            </div>
          </div>

          {/* Grupo 4: Iluminação */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
              4. Iluminação Residencial
            </span>
            <div className="space-y-2">
              <button
                id="preset-light-led"
                onClick={() => togglePreset("light_led")}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-3 ${
                  activePresets.light_led
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm">Opção A: Trocar todas as lâmpadas por LED 9W</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Substitui lâmpadas antigas de 60W e 15W por LED.</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${activePresets.light_led ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-600"}`}>
                  {activePresets.light_led && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                id="preset-light-hours"
                onClick={() => togglePreset("light_hours")}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-3 ${
                  activePresets.light_hours
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm">Opção B: Apagar luzes em cômodos vazios (-1h)</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Corta 1 hora média de iluminação desnecessária.</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${activePresets.light_hours ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-600"}`}>
                  {activePresets.light_hours && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            </div>
          </div>

          {/* Grupo 5: Televisão & Eletrônicos */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 block">
              5. Televisão & Eletrônicos
            </span>
            <div className="space-y-2">
              <button
                id="preset-tv-standby"
                onClick={() => togglePreset("tv_standby")}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-3 ${
                  activePresets.tv_standby
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm">Opção A: Cortar Standby na Tomada/Filtro</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Desliga receptor de TV e videogame da tomada ao sair.</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${activePresets.tv_standby ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-600"}`}>
                  {activePresets.tv_standby && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                id="preset-tv-eco-mode"
                onClick={() => togglePreset("tv_eco_mode")}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-3 ${
                  activePresets.tv_eco_mode
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm">Opção B: Modo Eco / Sensor de Luminosidade</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Reduz o brilho da tela e economiza ~20% da potência.</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${activePresets.tv_eco_mode ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-600"}`}>
                  {activePresets.tv_eco_mode && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            </div>
          </div>

          {/* Grupo 6: Lavanderia & Ferro */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
              6. Máquina de Lavar & Ferro
            </span>
            <div className="space-y-2">
              <button
                id="preset-laundry-full-load"
                onClick={() => togglePreset("laundry_full_load")}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-3 ${
                  activePresets.laundry_full_load
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm">Opção A: Lavar apenas com máquina cheia</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Acumula roupas e corta até 40% dos ciclos mensais.</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${activePresets.laundry_full_load ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-600"}`}>
                  {activePresets.laundry_full_load && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                id="preset-iron-batch"
                onClick={() => togglePreset("iron_batch")}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-3 ${
                  activePresets.iron_batch
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm">Opção B: Passar roupas em lote</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Aproveita o aquecimento único e o calor residual.</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${activePresets.iron_batch ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-600"}`}>
                  {activePresets.iron_batch && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Action: Save Simulation as Separate Test Diagnosis */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              Salvar como teste arquiva a hipótese separadamente na aba Histórico, sem alterar o diagnóstico principal.
            </span>
          </div>
          <button
            id="btn-save-test-simulation"
            onClick={saveSimulationAsTest}
            disabled={deltaKwh <= 0}
            className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-md ${
              deltaKwh > 0
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Save className="w-4 h-4" />
            Salvar Diagnóstico de Teste
          </button>
        </div>
      </div>

      {/* Contextual Educational Modal */}
      {explanatoryTopic && (
        <div
          id="simulator-help-modal-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-start justify-center pt-12 pb-16 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 no-print"
          onClick={(e) => {
            if (e.target === e.currentTarget) setExplanatoryTopic(null);
          }}
        >
          <div
            id="simulator-help-modal"
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-slate-300 dark:border-slate-800 p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-base">
                <Lightbulb className="w-5 h-5" />
                <h3>{explanatoryTopic.title}</h3>
              </div>
              <button
                id="btn-close-simulator-help"
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
              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{explanatoryTopic.tip}</span>
              </div>
            )}

            <button
              id="btn-understand-simulator-help"
              onClick={() => setExplanatoryTopic(null)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
