import {
  ApplianceDefinition,
  ApplianceEstimate,
  ApplianceInput,
  ApplianceKey,
  BillCostData,
  DiagnosisInput,
  DiagnosisResult,
  LightingRoom,
  LightingType,
  Recommendation,
  UsageUnit,
} from "../types";

export const lightingTechnologyOptions: {
  key: LightingType;
  label: string;
  referenceWatts: number;
  description: string;
}[] = [
  {
    key: "led",
    label: "LED",
    referenceWatts: 9,
    description: "Referência de 9 W (equivale a ~60W incandescente em fluxo luminoso ~800 lúmens). Mais eficiente e durável.",
  },
  {
    key: "fluorescente",
    label: "Fluorescente Compacta",
    referenceWatts: 15,
    description: "Referência de 15 W. Eficiência intermediária, aquece mais que LED e tem menor vida útil.",
  },
  {
    key: "incandescente",
    label: "Incandescente / Halógena",
    referenceWatts: 60,
    description: "Referência de 60 W. Mais de 85% da energia é dissipada em calor e não em luz visível.",
  },
];

export const applianceCatalog: ApplianceDefinition[] = [
  {
    key: "air-fryer",
    label: "Fritadeira Sem Óleo (Air Fryer)",
    category: "cozinha",
    defaultPower: 1400,
    defaultUtilizationFactor: 1.0,
    mode: "pontual",
    usageLabel: "tempo real de preparo",
    source: "Tabela Inmetro / Fabricantes (1.200 W a 1.800 W)",
    description: "Resistência de alta potência concentrada durante o tempo de cozimento.",
  },
  {
    key: "ar-condicionado",
    label: "Ar-Condicionado",
    category: "climatizacao",
    defaultPower: 1200,
    defaultUtilizationFactor: 0.65,
    mode: "ciclica",
    usageLabel: "horas em que o ambiente fica climatizado",
    source: "Cooperluz / PROCEL (1.000 W a 1.600 W). Fator médio 0.65 (Inverter varia entre 0.45 e 0.60; Convencional 0.70 a 0.80)",
    description: "Compressor opera em ciclos térmicos dependendo do isolamento, temperatura externa e tecnologia (Inverter vs On/Off).",
  },
  {
    key: "aspirador",
    label: "Aspirador de Pó",
    category: "limpeza",
    defaultPower: 1200,
    defaultUtilizationFactor: 1.0,
    mode: "pontual",
    usageLabel: "tempo real de aspiração",
    source: "Cooperluz (1.000 W a 1.400 W)",
    description: "Motor elétrico universal potente para sucção contínua.",
  },
  {
    key: "batedeira",
    label: "Batedeira",
    category: "cozinha",
    defaultPower: 300,
    defaultUtilizationFactor: 1.0,
    mode: "pontual",
    usageLabel: "tempo de mistura e preparo",
    source: "Referência PROCEL / Inmetro (200 W a 450 W)",
    description: "Motor fracionário com uso pontual de curta duração.",
  },
  {
    key: "bomba",
    label: "Bomba d'Água Residencial",
    category: "motores_outros",
    defaultPower: 550,
    defaultUtilizationFactor: 1.0,
    mode: "continua",
    usageLabel: "tempo em que a bomba permanece acionada",
    source: "Dados técnicos de motores de 1/2 CV (370W a 550W de entrada elétrica)",
    description: "Acionamento contínuo durante abastecimento de reservatório.",
  },
  {
    key: "cafeteira",
    label: "Cafeteira Elétrica",
    category: "cozinha",
    defaultPower: 800,
    defaultUtilizationFactor: 0.5,
    mode: "pontual",
    usageLabel: "tempo de preparo e aquecimento",
    source: "Cooperluz / Inmetro (600 W a 1.000 W)",
    description: "Alta potência durante fervura e menor potência na placa aquecedora de manutenção.",
  },
  {
    key: "carro-eletrico",
    label: "Carregador de Veículo Elétrico (Wallbox)",
    category: "motores_outros",
    defaultPower: 7000,
    defaultUtilizationFactor: 0.95,
    mode: "continua",
    usageLabel: "horas de recarga da bateria",
    source: "Carregadores AC residenciais padrão monofásico/bifásico (3,7 kW a 7,4 kW)",
    description: "Carga contínua muito pesada com pequenas perdas de conversão (~5%).",
  },
  {
    key: "chapinha",
    label: "Prancha de Cabelo (Chapinha)",
    category: "aquecimento",
    defaultPower: 50,
    defaultUtilizationFactor: 0.6,
    mode: "ciclica",
    usageLabel: "tempo de uso para alisamento",
    source: "Referência de resistências cerâmicas PTC (40 W a 60 W)",
    description: "Termostato desliga a resistência quando atinge a temperatura desejada.",
  },
  {
    key: "chuveiro",
    label: "Chuveiro Elétrico",
    category: "aquecimento",
    defaultPower: 5500,
    defaultUtilizationFactor: 1.0,
    mode: "pontual",
    usageLabel: "tempo total de banho por dia",
    source: "Inmetro / Fabricantes (4.500 W em 127V a 7.500 W em 220V - média nacional 5.500 W)",
    description: "Uma das maiores cargas da residência; transforma eletricidade diretamente em calor por efeito Joule.",
  },
  {
    key: "computador",
    label: "Computador Desktop com Monitor",
    category: "eletronicos",
    defaultPower: 250,
    defaultUtilizationFactor: 0.85,
    mode: "continua",
    usageLabel: "horas ligado em atividade",
    source: "Média de PCs domésticos/escritório com monitor LED (180 W a 350 W)",
    description: "Varia conforme carga da CPU/GPU; em repouso consome cerca de 40 W.",
  },
  {
    key: "exaustor",
    label: "Coifa / Depurador / Exaustor",
    category: "cozinha",
    defaultPower: 180,
    defaultUtilizationFactor: 1.0,
    mode: "continua",
    usageLabel: "horas em funcionamento durante cozimento",
    source: "Fabricantes (120 W a 250 W incluindo iluminação auxiliar)",
    description: "Ventilador de exaustão centrífugo com lâmpada halógena ou LED.",
  },
  {
    key: "ferro",
    label: "Ferro Elétrico de Passar Roupa",
    category: "aquecimento",
    defaultPower: 1200,
    defaultUtilizationFactor: 0.7,
    mode: "ciclica",
    usageLabel: "tempo em que passa roupas",
    source: "Cooperluz / Inmetro (1.000 W a 1.500 W)",
    description: "Termostato bimetálico liga e desliga a resistência para manter a temperatura do tecido.",
  },
  {
    key: "forno-eletrico",
    label: "Forno Elétrico de Embutir ou Bancada",
    category: "cozinha",
    defaultPower: 1800,
    defaultUtilizationFactor: 0.75,
    mode: "ciclica",
    usageLabel: "tempo real de assamento",
    source: "Inmetro (1.500 W a 2.400 W)",
    description: "Resistências superior e inferior controladas por termostato.",
  },
  {
    key: "freezer",
    label: "Freezer Vertical ou Horizontal",
    category: "cozinha",
    defaultPower: 160,
    defaultUtilizationFactor: 0.45,
    mode: "ciclica",
    usageLabel: "tempo conectado (24 horas)",
    source: "Selo Procel / ENCE (30 a 55 kWh/mês; compressor 140W a 200W)",
    description: "Ciclo térmico de congelamento; compressor liga quando a temperatura interna sobe.",
  },
  {
    key: "gela-agua",
    label: "Bebedouro / Purificador de Água Refrigerado",
    category: "cozinha",
    defaultPower: 100,
    defaultUtilizationFactor: 0.3,
    mode: "ciclica",
    usageLabel: "tempo conectado (24 horas)",
    source: "Inmetro / Procel (compressor ~100W a 120W; modelos com placa peltier gastam ~70W contínuos)",
    description: "Mantém reservatório de água fria com acionamento periódico.",
  },
  {
    key: "geladeira",
    label: "Geladeira / Refrigerador Duplex",
    category: "cozinha",
    defaultPower: 180,
    defaultUtilizationFactor: 0.4,
    mode: "ciclica",
    usageLabel: "tempo conectada (24 horas)",
    source: "ENCE / PROCEL (refrigeradores Frost Free modernos consomem de 30 a 50 kWh/mês; compressor opera ~10h/dia = 0.41)",
    description: "Compressor opera em ciclos intermitentes (~35% a 45% do tempo) para manter -18°C no freezer e +4°C no refrigerador.",
  },
  {
    key: "iluminacao",
    label: "Iluminação Geral da Residência",
    category: "climatizacao",
    defaultPower: 9,
    defaultUtilizationFactor: 1.0,
    mode: "continua",
    usageLabel: "horas acesas por dia",
    source: "Catálogo de lâmpadas (LED 9W, Fluorescente 15W, Incandescente 60W)",
    description: "Soma das lâmpadas em uso por cômodo.",
  },
  {
    key: "irrigacao",
    label: "Sistema Automatizado de Irrigação",
    category: "motores_outros",
    defaultPower: 750,
    defaultUtilizationFactor: 1.0,
    mode: "continua",
    usageLabel: "tempo de bombeamento para o jardim",
    source: "Bomba 1 CV (750 W)",
    description: "Acionamento por solenoides e bomba pressurizadora.",
  },
  {
    key: "lava-loucas",
    label: "Lava-Louças",
    category: "limpeza",
    defaultPower: 1500,
    defaultUtilizationFactor: 0.75,
    mode: "pontual",
    usageLabel: "tempo médio do ciclo de lavagem",
    source: "Inmetro (1.200 W a 1.800 W com aquecimento da água)",
    description: "Grande parte da energia é gasta aquecendo a água para desengordurar as louças.",
  },
  {
    key: "lavadora",
    label: "Máquina de Lavar Roupas",
    category: "limpeza",
    defaultPower: 600,
    defaultUtilizationFactor: 0.5,
    mode: "pontual",
    usageLabel: "tempo do ciclo de lavagem e centrifugação",
    source: "Inmetro / PROCEL (400 W a 800 W para lavagem com água fria; ciclo médio 1h a 1h30)",
    description: "Motor opera em agitação alternada e centrifugação contínua.",
  },
  {
    key: "liquidificador",
    label: "Liquidificador",
    category: "cozinha",
    defaultPower: 500,
    defaultUtilizationFactor: 1.0,
    mode: "pontual",
    usageLabel: "tempo de uso diário",
    source: "Cooperluz (400 W a 800 W)",
    description: "Uso pontual de poucos minutos com motor de alto torque.",
  },
  {
    key: "maquina-costura",
    label: "Máquina de Costura Doméstica",
    category: "motores_outros",
    defaultPower: 90,
    defaultUtilizationFactor: 0.6,
    mode: "pontual",
    usageLabel: "tempo de trabalho de costura",
    source: "Dados técnicos de motores domésticos (70 W a 120 W)",
    description: "Motor controlado por pedal; consome apenas durante o acionamento.",
  },
  {
    key: "microondas",
    label: "Forno Micro-ondas",
    category: "cozinha",
    defaultPower: 1200,
    defaultUtilizationFactor: 1.0,
    mode: "pontual",
    usageLabel: "minutos reais de aquecimento",
    source: "Inmetro (potência elétrica de entrada 1.100 W a 1.400 W)",
    description: "Magnetron converte energia elétrica em micro-ondas de 2,45 GHz.",
  },
  {
    key: "notebook",
    label: "Notebook / Laptop",
    category: "eletronicos",
    defaultPower: 50,
    defaultUtilizationFactor: 0.8,
    mode: "continua",
    usageLabel: "horas de uso conectado à tomada",
    source: "Fontes de alimentação padrão (45 W a 65 W; consumo médio 35 W a 55 W)",
    description: "Muito mais eficiente que desktop tradicional graças a processadores móveis.",
  },
  {
    key: "panela-eletrica",
    label: "Panela Elétrica (Arroz / Pressão)",
    category: "cozinha",
    defaultPower: 800,
    defaultUtilizationFactor: 0.65,
    mode: "ciclica",
    usageLabel: "tempo de preparo e aquecimento",
    source: "Inmetro (600 W a 900 W)",
    description: "Aquecimento contínuo inicial e chaveamento térmico após atingir pressão ou cozimento.",
  },
  {
    key: "piscina",
    label: "Bomba de Filtragem de Piscina",
    category: "motores_outros",
    defaultPower: 550,
    defaultUtilizationFactor: 1.0,
    mode: "continua",
    usageLabel: "horas diárias de filtragem",
    source: "Motores de piscina 1/2 CV a 3/4 CV (370 W a 550 W)",
    description: "Filtragem programada da água para manutenção química e física.",
  },
  {
    key: "receptor-tv",
    label: "Receptor de TV / TV Box / Conversor",
    category: "eletronicos",
    defaultPower: 15,
    defaultUtilizationFactor: 1.0,
    mode: "continua",
    usageLabel: "horas ligado ou em standby ativo",
    source: "Medições PROCEL (12 W a 25 W; em standby consome quase o mesmo que ligado)",
    description: "Dispositivo frequentemente esquecido ligado 24h por dia acumulando consumo silencioso.",
  },
  {
    key: "roteador",
    label: "Roteador Wi-Fi / Modem de Fibra",
    category: "eletronicos",
    defaultPower: 12,
    defaultUtilizationFactor: 1.0,
    mode: "continua",
    usageLabel: "horas ligado (geralmente 24h)",
    source: "Fontes 12V 1A a 1.5A (consumo real 8 W a 14 W contínuos)",
    description: "Equipamento essencial de rede operando ininterruptamente.",
  },
  {
    key: "sanduicheira",
    label: "Sanduicheira / Grill",
    category: "cozinha",
    defaultPower: 750,
    defaultUtilizationFactor: 0.7,
    mode: "ciclica",
    usageLabel: "tempo de preparo de lanches",
    source: "Inmetro (650 W a 850 W)",
    description: "Resistência de contato com termostato de temperatura máxima.",
  },
  {
    key: "secador",
    label: "Secador de Cabelo",
    category: "aquecimento",
    defaultPower: 1800,
    defaultUtilizationFactor: 1.0,
    mode: "pontual",
    usageLabel: "tempo de secagem do cabelo",
    source: "Inmetro (1.400 W a 2.200 W na temperatura quente)",
    description: "Resistência de alta potência associada a ventoinha de ar forçado.",
  },
  {
    key: "secadora-roupas",
    label: "Secadora de Roupas Elétrica",
    category: "limpeza",
    defaultPower: 2200,
    defaultUtilizationFactor: 0.85,
    mode: "ciclica",
    usageLabel: "tempo do ciclo de secagem",
    source: "Inmetro (1.800 W a 2.600 W)",
    description: "Grande resistência térmica associada ao tambor rotativo.",
  },
  {
    key: "televisao",
    label: "Televisão Smart",
    category: "eletronicos",
    defaultPower: 110,
    defaultUtilizationFactor: 1.0,
    mode: "continua",
    usageLabel: "horas assistindo TV por dia",
    source: "Inmetro / PROCEL (Smart TVs LED 50\": 80 W a 130 W em operação; standby < 1 W)",
    description: "Painel de iluminação traseira (Backlight LED) e processador.",
  },
  {
    key: "torneira",
    label: "Torneira Elétrica da Pia",
    category: "aquecimento",
    defaultPower: 4500,
    defaultUtilizationFactor: 1.0,
    mode: "pontual",
    usageLabel: "minutos de água morna/quente na torneira",
    source: "Inmetro (3.500 W a 5.500 W)",
    description: "Resistência de aquecimento instantâneo de água.",
  },
  {
    key: "ventilador",
    label: "Ventilador de Mesa ou Coluna",
    category: "climatizacao",
    defaultPower: 80,
    defaultUtilizationFactor: 1.0,
    mode: "continua",
    usageLabel: "horas ligado por dia",
    source: "Inmetro / PROCEL (60 W a 120 W dependendo da velocidade 1, 2 ou 3)",
    description: "Motor monofásico de indução gerando deslocamento de ar.",
  },
  {
    key: "ventilador-teto",
    label: "Ventilador de Teto",
    category: "climatizacao",
    defaultPower: 120,
    defaultUtilizationFactor: 1.0,
    mode: "continua",
    usageLabel: "horas ligado por dia",
    source: "Inmetro / PROCEL (100 W a 140 W na velocidade máxima)",
    description: "Motor de indução de teto com pás maiores.",
  },
  {
    key: "videogame",
    label: "Videogame (Console)",
    category: "eletronicos",
    defaultPower: 180,
    defaultUtilizationFactor: 1.0,
    mode: "continua",
    usageLabel: "horas de jogo por dia",
    source: "Medições de fabricantes em gameplay ativo (150 W a 220 W)",
    description: "Processador gráfico de alta performance sob demanda térmica intensa.",
  },
];

export function definitionFor(key: ApplianceKey): ApplianceDefinition | undefined {
  return applianceCatalog.find((item) => item.key === key);
}

export function createLightingRoom(id = `room-${Date.now()}`): LightingRoom {
  return {
    id,
    name: "Sala de Estar",
    frequency: 30,
    hoursPerDay: 4,
    usageUnit: "horas",
    lamps: { led: 2, fluorescente: 0, incandescente: 0 },
  };
}

const clamp = (val: number, min: number, max: number) => {
  const n = Number.isFinite(val) ? val : 0;
  return Math.max(min, Math.min(max, n));
};

export function dailyHours(value: number, unit?: UsageUnit): number {
  return unit === "minutos" ? clamp(value, 0, 1440) / 60 : clamp(value, 0, 24);
}

/**
 * FÓRMULA FÍSICA CORRETA:
 * Consumo Mensal (kWh) = (Potência Elétrica (W) / 1000) * Horas/dia * Dias/mês * Fator de Utilização (Duty Cycle)
 */
export function estimateAppliance(item: ApplianceInput): ApplianceEstimate {
  const days = clamp(item.frequency, 0, 30);
  const hours = dailyHours(item.hoursPerDay, item.usageUnit);
  const quantity = clamp(item.quantity, 0, 99);
  const used = clamp(item.quantityUsed, 0, quantity);
  const def = definitionFor(item.key);
  const mode = item.mode ?? def?.mode ?? "continua";

  // Compute duty cycle factor
  let factor = 1.0;
  if (mode === "ciclica") {
    // If user provided inverter technology for AC, adjust factor
    if (item.key === "ar-condicionado" && item.inverterTechnology) {
      factor = 0.50; // Inverter operates at variable speeds once room stabilizes
    } else {
      factor = clamp(item.utilizationFactor || def?.defaultUtilizationFactor || 0.4, 0.05, 1.0);
    }
  }

  // Room-based lighting computation
  const isRoomLighting = item.key === "iluminacao" && (item.lightingRooms?.length ?? 0) > 0;
  let lightingKwh = 0;
  let totalLightingWatts = 0;
  let totalLamps = 0;

  if (isRoomLighting && item.lightingRooms) {
    for (const room of item.lightingRooms) {
      const roomHours = dailyHours(room.hoursPerDay, room.usageUnit);
      const roomDays = clamp(room.frequency, 0, 30);
      for (const tech of lightingTechnologyOptions) {
        const count = clamp(room.lamps[tech.key] || 0, 0, 99);
        totalLamps += count;
        const techWatts = count * tech.referenceWatts;
        totalLightingWatts += techWatts;
        lightingKwh += (techWatts / 1000) * roomHours * roomDays;
      }
    }
  }

  // Power handling for multi-unit items
  const unitPowers = item.powerWattsPerUnit?.filter((w) => Number.isFinite(w) && w > 0).slice(0, used);
  const fallbackPower = Number.isFinite(item.powerWatts) && item.powerWatts > 0 ? item.powerWatts : (def?.defaultPower || 100);
  const totalPowerWatts = isRoomLighting
    ? totalLightingWatts
    : unitPowers && unitPowers.length > 0
    ? unitPowers.reduce((acc, w) => acc + w, 0)
    : fallbackPower * used;

  const estimatedPowerWatts = isRoomLighting
    ? (totalLamps > 0 ? totalLightingWatts / totalLamps : 9)
    : used > 0
    ? totalPowerWatts / used
    : fallbackPower;

  const monthlyKwh = item.present
    ? isRoomLighting
      ? lightingKwh
      : (totalPowerWatts / 1000) * hours * days * factor
    : 0;

  const relativeScore = monthlyKwh * (item.source === "placa" ? 1.2 : item.source === "nao-sei" ? 0.7 : 1.0);

  return {
    ...item,
    quantity,
    quantityUsed: used,
    frequency: days,
    hoursPerDay: hours,
    utilizationFactor: factor,
    effectiveDutyCycle: factor,
    mode,
    totalPowerWatts: item.present ? totalPowerWatts : 0,
    estimatedPowerWatts,
    monthlyKwh: Math.round(monthlyKwh * 100) / 100,
    relativeScore,
  };
}

/**
 * TARIFA SOCIAL DE ENERGIA ELÉTRICA (TSEE) — REGRA VIGENTE
 * Desde julho de 2025, beneficiários cadastrados no CadÚnico ou BPC possuem gratuidade
 * de 100% da parcela de consumo de energia nos primeiros 80 kWh faturados no mês.
 * Acima de 80 kWh, incide a tarifa regular.
 * Impostos e iluminação pública (COSIP) podem incidir conforme regras locais.
 */
export const TSEE_FREE_LIMIT_KWH = 80;

export function calculateTarifaSocialDiscountedKwh(consumptionKwh: number): number {
  return Math.min(Math.max(0, consumptionKwh), TSEE_FREE_LIMIT_KWH);
}

export function resolveCostDetails(input: DiagnosisInput, bill?: BillCostData) {
  const safeInputKwh = Number.isFinite(input.monthlyKwh) && input.monthlyKwh > 0 ? input.monthlyKwh : 0;
  const safeInputValue = Number.isFinite(input.billValue) && input.billValue > 0 ? input.billValue : 0;

  if (bill?.consumo_kwh && bill.consumo_kwh > 0 && bill.tarifa_te !== null && bill.tarifa_tusd !== null) {
    const taxesAndFlag = (bill.impostos.icms ?? 0) + (bill.impostos.pis_cofins ?? 0) + (bill.valor_bandeira ?? 0);
    const energyRate = bill.tarifa_te + bill.tarifa_tusd;
    const tarifaSocialApplied = Boolean(bill.tarifa_social_identificada);
    const discountedKwh = tarifaSocialApplied ? calculateTarifaSocialDiscountedKwh(bill.consumo_kwh) : 0;

    const billedEnergyKwh = Math.max(0, bill.consumo_kwh - discountedKwh);
    const effective = (energyRate * billedEnergyKwh + taxesAndFlag) / bill.consumo_kwh;

    if (Number.isFinite(effective) && effective > 0) {
      return { costPerKwh: effective, tarifaSocialApplied, discountedKwh };
    }
  }

  // Fallback to informed bill value / informed kWh
  const avgCost = safeInputKwh > 0 ? safeInputValue / safeInputKwh : 0.85; // Brazilian average fallback ~R$ 0,85/kWh
  return { costPerKwh: avgCost, tarifaSocialApplied: false, discountedKwh: 0 };
}

export function recommendationForAppliance(item: ApplianceEstimate): Omit<Recommendation, "priority" | "equipmentLabel"> {
  const key = item.key;
  let title = "Otimizar tempo de uso e regulagem";
  let action = `Evite manter ${item.label.toLowerCase()} ligado sem necessidade e adote bons hábitos de uso.`;
  let actionSimple = `Desligue quando não estiver usando.`;
  let why = "Reduzir o tempo de operação diminui diretamente o consumo mensal do aparelho.";
  let whySimple = "Aparelho ligado consome energia.";
  let effort: Recommendation["effort"] = "baixo";
  let cost: Recommendation["cost"] = "gratuito";
  let comfort: Recommendation["comfort"] = "preserva";
  let rateMin = 0.08;
  let rateMax = 0.20;

  switch (key) {
    case "chuveiro":
      title = "Reduzir 5 minutos de banho e usar modo Verão no calor";
      action = "Diminua de 3 a 5 minutos por banho e coloque a chave na posição Verão (ou morno) em dias quentes. Nunca altere disjuntor ou fiação sozinho.";
      actionSimple = "Tome banho 3 a 5 minutos mais rápido e use água morna no calor.";
      why = "O chuveiro é a carga de maior potência da casa (~5.500 W). Cada minuto a menos economiza muita energia.";
      whySimple = "O chuveiro puxa muita força para esquentar a água.";
      rateMin = 0.15;
      rateMax = 0.35;
      break;
    case "ar-condicionado":
      title = "Ajustar termostato para 23°C–24°C e manter filtros limpos";
      action = "Mantenha portas e janelas vedadas, ajuste a temperatura em 23°C ou 24°C (evitando 17°C que força o compressor a 100%) e limpe os filtros quinzenalmente.";
      actionSimple = "Use 23°C ou 24°C, feche portas e janelas e lave o filtro a cada 15 dias.";
      why = "Temperaturas extremas forçam o compressor a não ciclar. Manter em 23°C economiza até 30% sem perder conforto.";
      whySimple = "Não precisa colocar no mais frio. Em 23°C o aparelho gasta bem menos.";
      rateMin = 0.12;
      rateMax = 0.30;
      break;
    case "geladeira":
      title = "Verificar vedação da borracha e não guardar alimentos quentes";
      action = "Teste a vedação prendendo uma folha de papel na porta (se cair fácil, a borracha precisa de troca). Deixe 10 cm de espaço traseiro para ventilação e nunca seque roupas atrás da grade.";
      actionSimple = "Veja se a borracha da porta fecha bem, não guarde comida quente e não seque pano atrás.";
      why = "A borracha ressecada deixa o calor entrar, fazendo o compressor ligar muito mais vezes ao longo do dia.";
      whySimple = "Se a borracha solta ar frio, o motor da geladeira trabalha o dobro.";
      rateMin = 0.10;
      rateMax = 0.25;
      break;
    case "iluminacao": {
      const hasIncandescent = item.lightingRooms?.some((r) => r.lamps.incandescente > 0) || item.lightingType === "incandescente";
      const hasFluorescent = item.lightingRooms?.some((r) => r.lamps.fluorescente > 0) || item.lightingType === "fluorescente";
      if (hasIncandescent) {
        title = "Substituir lâmpadas incandescentes por LED";
        action = "Troque as lâmpadas incandescentes (60W) por lâmpadas LED (9W). Elas iluminam o mesmo consumindo 85% menos energia e duram até 15 vezes mais.";
        actionSimple = "Troque as lâmpadas amarelas incandescentes por LED de 9W.";
        why = "Lâmpadas incandescentes perdem 90% da energia em calor e gastam 6 vezes mais que uma LED equivalente.";
        whySimple = "Lâmpada LED gasta muito menos que a lâmpada antiga de filamento.";
        cost = "baixo";
        rateMin = 0.30;
        rateMax = 0.60;
      } else if (hasFluorescent) {
        title = "Modernizar lâmpadas fluorescentes para LED";
        action = "Ao final da vida útil das fluorescentes, substitua por LED. Aproveite melhor a iluminação natural abrindo cortinas durante o dia.";
        actionSimple = "Quando a lâmpada fluorescente queimar, troque por LED.";
        why = "LED consome cerca de 40% a menos que a fluorescente compacta e não contém mercúrio.";
        whySimple = "LED dura mais e gasta menos que fluorescente.";
        cost = "baixo";
        rateMin = 0.15;
        rateMax = 0.35;
      } else {
        title = "Hábito consciente de apagar luzes em ambientes vazios";
        action = "Apague a luz ao sair do cômodo e aproveite a luz solar durante o dia.";
        actionSimple = "Apague a luz de quarto ou sala vazios.";
        why = "Iluminação acesa sem ninguém no cômodo é desperdício direto na conta de energia.";
        whySimple = "Luz acesa à toa gasta dinheiro.";
        rateMin = 0.08;
        rateMax = 0.20;
      }
      break;
    }
    case "air-fryer":
    case "forno-eletrico":
      title = "Agrupar preparos e evitar abrir a porta ou cesto repetidamente";
      action = "Planeje as porções para assar em sequência aproveitando o forno já pré-aquecido e evite abrir desnecessariamente para não perder calor.";
      actionSimple = "Faça os alimentos em sequência para aproveitar que o forno já está quente.";
      why = "Cada abertura de porta derruba a temperatura interna em até 25°C, acionando a resistência de alta potência novamente.";
      whySimple = "Abrir a tampa faz o calor escapar e o aparelho precisa puxar mais força.";
      rateMin = 0.10;
      rateMax = 0.25;
      break;
    case "ferro":
      title = "Acumular roupas para passar tudo de uma só vez";
      action = "Junte quantidade suficiente de roupas antes de ligar o ferro. Comece pelas roupas que exigem menos calor e termine aproveitando o calor residual com o ferro desligado.";
      actionSimple = "Junte bastante roupa antes de ligar o ferro e passe tudo de uma vez só.";
      why = "Aquecer o ferro várias vezes na semana gasta muito mais energia do que uma sessão única concentrada.";
      whySimple = "Ligar o ferro todo dia gasta muito mais energia.";
      rateMin = 0.12;
      rateMax = 0.28;
      break;
    case "lavadora":
      title = "Usar a máquina de lavar na capacidade máxima indicada";
      action = "Acumule roupas para atingir a capacidade recomendada do cesto. Utilize o sabão na dosagem certa para não exigir enxágues adicionais.";
      actionSimple = "Ligue a máquina de lavar apenas quando estiver cheia de roupas.";
      why = "Fazer três lavagens com meia carga gasta quase o dobro de eletricidade e água de uma lavagem cheia.";
      whySimple = "Lavar pouca roupa várias vezes gasta água e luz à toa.";
      rateMin = 0.15;
      rateMax = 0.30;
      break;
    case "computador":
    case "videogame":
    case "televisao":
      title = "Ativar modo de suspensão e desligar da régua ao sair";
      action = "Configure suspensão automática após 15 minutos de inatividade. Desligue periféricos e receptores de TV que ficam consumindo em standby.";
      actionSimple = "Coloque o computador em suspensão e não deixe o videogame ligado à toa.";
      why = "Telas ligadas sem uso e standby de consoles mantêm consumo oculto 24h por dia.";
      whySimple = "Equipamento em espera também puxa energia da tomada.";
      rateMin = 0.10;
      rateMax = 0.25;
      break;
    case "carro-eletrico":
      title = "Programar recarga para horários fora de pico se aplicável";
      action = "Se você tiver tarifa horária/branca, programe a recarga para o período noturno (madrugada). Mantenha a instalação elétrica revisada por engenheiro.";
      actionSimple = "Carregue o carro na tomada nos horários certos e com instalação segura.";
      why = "A recarga de EV tem volume elevado de energia. Acompanhar a curva de carga otimiza custos.";
      whySimple = "O carro puxa bastante energia, então programar o horário ajuda.";
      rateMin = 0.05;
      rateMax = 0.15;
      break;
    default:
      break;
  }

  const potMin = Math.round(item.monthlyKwh * rateMin * 10) / 10;
  const potMax = Math.round(item.monthlyKwh * rateMax * 10) / 10;

  return {
    id: key,
    title,
    action,
    actionSimple,
    why,
    whySimple,
    effort,
    cost,
    comfort,
    potentialKwh: [potMin, potMax],
  };
}

/**
 * Cálculos sem dupla contagem:
 * As economias individuais são ponderadas e limitadas a um teto físico conservador (máximo 35% do consumo total).
 */
export function calculateDiagnosis(input: DiagnosisInput, bill?: BillCostData): DiagnosisResult {
  const safeMonthlyKwh = Number.isFinite(input.monthlyKwh) && input.monthlyKwh > 0 ? input.monthlyKwh : 0;
  const safeOccupants = Number.isFinite(input.occupants) && input.occupants > 0 ? input.occupants : 1;

  // Calculate each appliance estimate
  const estimates = input.appliances
    .filter((a) => a.present)
    .map(estimateAppliance)
    .sort((a, b) => b.monthlyKwh - a.monthlyKwh || b.relativeScore - a.relativeScore);

  const totalEstimated = Math.round(estimates.reduce((sum, item) => sum + item.monthlyKwh, 0) * 10) / 10;

  // Known inputs ratio for confidence calculation
  const knownInputs = input.appliances.filter((a) => a.present && a.source !== "nao-sei").length;
  const totalPresent = estimates.length;
  const dataRatio = totalPresent > 0 ? knownInputs / totalPresent : 0;

  // Coherence evaluation and realistic confidence score calculation
  let coherence: DiagnosisResult["coherence"] = "sem referência";
  let confidenceScore = 60;

  if (safeMonthlyKwh > 0 && totalEstimated > 0) {
    const absDiff = Math.abs(totalEstimated - safeMonthlyKwh);
    const relDiff = absDiff / safeMonthlyKwh;

    if (relDiff <= 0.15) {
      coherence = "coerente";
      confidenceScore = Math.round(85 + (1 - relDiff / 0.15) * 10 + (input.detailed ? 4 : 0));
    } else if (relDiff <= 0.35) {
      coherence = "coerente";
      confidenceScore = Math.round(65 + (1 - (relDiff - 0.15) / 0.20) * 18);
    } else if (relDiff <= 0.80) {
      coherence = "diferença relevante";
      confidenceScore = Math.round(25 + (1 - (relDiff - 0.35) / 0.45) * 35);
    } else if (relDiff <= 2.0) {
      coherence = "diferença relevante";
      confidenceScore = Math.max(5, Math.round(25 - ((relDiff - 0.80) / 1.2) * 20));
    } else {
      // Massive discrepancy (e.g. 2000 kWh above the bill) -> drops to 1% - 3%
      coherence = "diferença relevante";
      confidenceScore = Math.max(1, Math.round(5 - Math.min(4, (relDiff - 2.0) * 0.5)));
    }
  } else {
    // No bill reference provided: confidence based on quality of appliance data
    coherence = "sem referência";
    confidenceScore = clamp(Math.round(45 + dataRatio * 40 + (input.detailed ? 8 : 0)), 20, 85);
  }

  confidenceScore = clamp(confidenceScore, 1, 99);

  const confidence: DiagnosisResult["confidence"] =
    confidenceScore >= 75 ? "alta" : confidenceScore >= 45 ? "média" : "baixa";

  // Top contributors: show all significant appliances
  const significant = totalEstimated > 0
    ? estimates.filter((e) => (e.monthlyKwh / totalEstimated) >= 0.04).slice(0, 8)
    : [];
  const topContributors = significant.length > 0 ? significant : estimates.slice(0, 5);

  // Build calibrated recommendations without double-counting
  const recommendations: Recommendation[] = topContributors.map((item, idx) => {
    const baseRec = recommendationForAppliance(item);
    const impactShare = totalEstimated > 0 ? item.monthlyKwh / totalEstimated : 0;
    const priority = Math.round(impactShare * 100 + baseRec.potentialKwh[1] * 0.4 - idx * 2);
    return {
      ...baseRec,
      equipmentLabel: item.label,
      priority,
    };
  }).sort((a, b) => b.priority - a.priority);

  // Realistic savings calculation based on mapped consumption
  const referenceBaseKwh = safeMonthlyKwh > 0 && Math.abs(totalEstimated - safeMonthlyKwh) / safeMonthlyKwh <= 0.6
    ? safeMonthlyKwh
    : totalEstimated;

  const sumMaxPotential = recommendations.reduce((acc, r) => acc + r.potentialKwh[1], 0);
  const maxCeiling = Math.max(0, referenceBaseKwh * 0.30); // Realistic max 30% savings
  const boundedPotential = Math.min(maxCeiling, sumMaxPotential > 0 ? sumMaxPotential : referenceBaseKwh * 0.15);

  const savings = {
    conservative: [
      Math.round(boundedPotential * 0.55 * 10) / 10,
      Math.round(boundedPotential * 0.75 * 10) / 10,
    ] as [number, number],
    probable: [
      Math.round(boundedPotential * 0.75 * 10) / 10,
      Math.round(boundedPotential * 0.95 * 10) / 10,
    ] as [number, number],
    optimistic: [
      Math.round(boundedPotential * 0.95 * 10) / 10,
      Math.round(Math.min(maxCeiling, boundedPotential * 1.15) * 10) / 10,
    ] as [number, number],
  };

  const costDetails = resolveCostDetails(input, bill);
  const kwhPerPerson = safeOccupants > 0 ? safeMonthlyKwh / safeOccupants : 0;
  const costPerPerson = kwhPerPerson * costDetails.costPerKwh;

  // Electrical safety alert: check for dangerous symptoms
  const safetyAlert =
    input.hasSafetyRisk ||
    Boolean(input.safety?.riskSigns && input.safety.riskSigns.length > 0) ||
    input.safety?.grounding === "nao" ||
    input.safety?.dr === "nao";

  return {
    effectiveCostPerKwh: costDetails.costPerKwh,
    totalEstimated,
    kwhPerPerson: Math.round(kwhPerPerson * 10) / 10,
    costPerPerson: Math.round(costPerPerson * 100) / 100,
    estimates,
    topContributors,
    confidence,
    confidenceScore,
    coherence,
    attention: topContributors[0] ?? null,
    savings,
    recommendations,
    safetyAlert,
    tarifaSocialApplied: costDetails.tarifaSocialApplied,
    tarifaSocialDiscountedKwh: costDetails.discountedKwh,
  };
}

export function formatBRL(value: number): string {
  return (Number.isFinite(value) ? value : 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatNumber(value: number, digits = 1): string {
  return (Number.isFinite(value) ? value : 0).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function describeConsumptionDifference(estimatedKwh: number, informedKwh: number, simple = false): string {
  const delta = estimatedKwh - informedKwh;
  const absDelta = Math.abs(delta);

  if (delta > 0) {
    return simple
      ? `A soma dos aparelhos deu ${formatNumber(delta)} kWh a mais que a conta. Verifique se colocou aparelhos ou horas a mais.`
      : `O consumo estimado pelos equipamentos cadastrados ficou ${formatNumber(delta)} kWh acima do consumo informado na conta. Isso geralmente acontece quando o tempo de uso diário foi superestimado, quando há equipamentos que ficam desligados parte do mês, ou caso a fatura tenha descontos de Tarifa Social.`;
  } else {
    return simple
      ? `A soma dos aparelhos deu ${formatNumber(absDelta)} kWh a menos que a conta. Pode haver aparelhos esquecidos fora do cadastro.`
      : `O consumo estimado pelos equipamentos ficou ${formatNumber(absDelta)} kWh abaixo do consumo faturado. Isso indica que alguns aparelhos não foram cadastrados, que foram usados por mais tempo que o informado ou que há outras cargas na casa.`;
  }
}

export function calculateTseeDiscount(
  monthlyKwh: number,
  tariffR$PerKwh = 0.85
): {
  standardCost: number;
  tseeCost: number;
  totalDiscountValue: number;
  discountedKwh: number;
  tierBreakdown: { tier: string; kwhInTier: number; discountPercent: number; discountValue: number }[];
} {
  const kwh = Math.max(0, monthlyKwh);
  const standardCost = kwh * tariffR$PerKwh;

  // Faixa única vigente (Lei 15.235/2025 / MP 1.300/2025):
  // 100% de gratuidade na parcela de consumo até 80 kWh;
  // Acima de 80 kWh, incide a tarifa integral sobre o consumo excedente, sem desconto.
  const tier1Kwh = Math.min(kwh, TSEE_FREE_LIMIT_KWH);
  const tier1Discount = tier1Kwh * tariffR$PerKwh * 1.0;

  const tier2Kwh = Math.max(0, kwh - TSEE_FREE_LIMIT_KWH);
  const tier2Discount = 0;

  const totalDiscountValue = tier1Discount;
  const tseeCost = Math.max(0, standardCost - totalDiscountValue);
  const discountedKwh = tier1Kwh;

  return {
    standardCost,
    tseeCost,
    totalDiscountValue,
    discountedKwh,
    tierBreakdown: [
      { tier: "Até 80 kWh — 100% gratuito", kwhInTier: tier1Kwh, discountPercent: 100, discountValue: tier1Discount },
      { tier: "Acima de 80 kWh — tarifa integral sobre o excedente", kwhInTier: tier2Kwh, discountPercent: 0, discountValue: 0 },
    ],
  };
}

export function calculateEfficiencyIndex(input: {
  confidenceScore: number;
  safetyAlert: boolean;
  recommendationCount: number;
  completedRecommendations: number;
  goalReached?: boolean;
}): number {
  const planScore = input.recommendationCount > 0
    ? Math.min(1, input.completedRecommendations / input.recommendationCount) * 45
    : 10;
  const dataScore = (clamp(input.confidenceScore, 0, 100) / 100) * 35;
  const safetyScore = input.safetyAlert ? 0 : 15;
  const goalScore = input.goalReached ? 5 : 0;

  return Math.round(clamp(planScore + dataScore + safetyScore + goalScore, 5, 100));
}

/**
 * BANCO DE DADOS OFICIAL DE CONCESSIONÁRIAS E TARIFAS RESIDENCIAIS (ANEEL / ONEE)
 * Valores médios homologados para Classe Residencial B1 (com impostos médios estaduais).
 */
export interface ConcessionariaData {
  uf: string;
  estado: string;
  distribuidora: string;
  nomeCurto: string;
  tarifaHomologadaR$PerKwh: number;
  tarifaComImpostos: number;
  tributosAproxPercent: number; // ICMS + PIS/COFINS
  siteOficial: string;
}

export const OFFICIAL_CONCESSIONARIAS: ConcessionariaData[] = [
  {
    uf: "CE",
    estado: "Ceará",
    distribuidora: "Enel Distribuição Ceará",
    nomeCurto: "Enel Ceará",
    tarifaHomologadaR$PerKwh: 0.772,
    tarifaComImpostos: 0.941,
    tributosAproxPercent: 22.0,
    siteOficial: "https://www.enel.com.br/pt-ceara.html",
  },
  {
    uf: "SP",
    estado: "São Paulo",
    distribuidora: "Enel Distribuição São Paulo",
    nomeCurto: "Enel São Paulo",
    tarifaHomologadaR$PerKwh: 0.715,
    tarifaComImpostos: 0.852,
    tributosAproxPercent: 19.2,
    siteOficial: "https://www.enel.com.br/pt-saopaulo.html",
  },
  {
    uf: "SP",
    estado: "São Paulo",
    distribuidora: "CPFL Paulista",
    nomeCurto: "CPFL Paulista",
    tarifaHomologadaR$PerKwh: 0.728,
    tarifaComImpostos: 0.865,
    tributosAproxPercent: 18.8,
    siteOficial: "https://www.cpfl.com.br",
  },
  {
    uf: "RJ",
    estado: "Rio de Janeiro",
    distribuidora: "Light Serviços de Eletricidade",
    nomeCurto: "Light (RJ)",
    tarifaHomologadaR$PerKwh: 0.798,
    tarifaComImpostos: 1.025,
    tributosAproxPercent: 28.5,
    siteOficial: "https://www.light.com.br",
  },
  {
    uf: "RJ",
    estado: "Rio de Janeiro",
    distribuidora: "Enel Distribuição Rio",
    nomeCurto: "Enel Rio",
    tarifaHomologadaR$PerKwh: 0.835,
    tarifaComImpostos: 1.072,
    tributosAproxPercent: 28.5,
    siteOficial: "https://www.enel.com.br/pt-rio.html",
  },
  {
    uf: "MG",
    estado: "Minas Gerais",
    distribuidora: "Cemig Distribuição",
    nomeCurto: "Cemig (MG)",
    tarifaHomologadaR$PerKwh: 0.732,
    tarifaComImpostos: 0.884,
    tributosAproxPercent: 20.8,
    siteOficial: "https://www.cemig.com.br",
  },
  {
    uf: "BA",
    estado: "Bahia",
    distribuidora: "Neoenergia Coelba",
    nomeCurto: "Coelba (BA)",
    tarifaHomologadaR$PerKwh: 0.758,
    tarifaComImpostos: 0.923,
    tributosAproxPercent: 21.8,
    siteOficial: "https://www.neoenergia.com/coelba",
  },
  {
    uf: "PE",
    estado: "Pernambuco",
    distribuidora: "Neoenergia Pernambuco (Celpe)",
    nomeCurto: "Neoenergia PE",
    tarifaHomologadaR$PerKwh: 0.742,
    tarifaComImpostos: 0.895,
    tributosAproxPercent: 20.6,
    siteOficial: "https://www.neoenergia.com/pernambuco",
  },
  {
    uf: "PR",
    estado: "Paraná",
    distribuidora: "Copel Distribuição",
    nomeCurto: "Copel (PR)",
    tarifaHomologadaR$PerKwh: 0.695,
    tarifaComImpostos: 0.832,
    tributosAproxPercent: 19.7,
    siteOficial: "https://www.copel.com",
  },
  {
    uf: "RS",
    estado: "Rio Grande do Sul",
    distribuidora: "RGE Sul Distribuidora",
    nomeCurto: "RGE (RS)",
    tarifaHomologadaR$PerKwh: 0.739,
    tarifaComImpostos: 0.891,
    tributosAproxPercent: 20.5,
    siteOficial: "https://www.rge-rs.com.br",
  },
  {
    uf: "SC",
    estado: "Santa Catarina",
    distribuidora: "Celesc Distribuição",
    nomeCurto: "Celesc (SC)",
    tarifaHomologadaR$PerKwh: 0.648,
    tarifaComImpostos: 0.775,
    tributosAproxPercent: 19.6,
    siteOficial: "https://www.celesc.com.br",
  },
  {
    uf: "GO",
    estado: "Goiás",
    distribuidora: "Equatorial Energia Goiás",
    nomeCurto: "Equatorial Goiás",
    tarifaHomologadaR$PerKwh: 0.712,
    tarifaComImpostos: 0.863,
    tributosAproxPercent: 21.2,
    siteOficial: "https://www.equatorialenergia.com.br/goias",
  },
  {
    uf: "PA",
    estado: "Pará",
    distribuidora: "Equatorial Energia Pará (Celpa)",
    nomeCurto: "Equatorial Pará",
    tarifaHomologadaR$PerKwh: 0.845,
    tarifaComImpostos: 1.042,
    tributosAproxPercent: 23.3,
    siteOficial: "https://www.equatorialenergia.com.br/para",
  },
  {
    uf: "MA",
    estado: "Maranhão",
    distribuidora: "Equatorial Energia Maranhão (Cemar)",
    nomeCurto: "Equatorial MA",
    tarifaHomologadaR$PerKwh: 0.768,
    tarifaComImpostos: 0.935,
    tributosAproxPercent: 21.7,
    siteOficial: "https://www.equatorialenergia.com.br/maranhao",
  },
  {
    uf: "DF",
    estado: "Distrito Federal",
    distribuidora: "Neoenergia Brasília (CEB)",
    nomeCurto: "Neoenergia Brasília",
    tarifaHomologadaR$PerKwh: 0.675,
    tarifaComImpostos: 0.812,
    tributosAproxPercent: 20.3,
    siteOficial: "https://www.neoenergia.com/brasilia",
  },
  {
    uf: "AM",
    estado: "Amazonas",
    distribuidora: "Amazonas Energia",
    nomeCurto: "Amazonas Energia",
    tarifaHomologadaR$PerKwh: 0.812,
    tarifaComImpostos: 0.998,
    tributosAproxPercent: 22.9,
    siteOficial: "https://www.amazonasenergia.com",
  },
];

/**
 * SIMULADOR DE COMPRA DE EQUIPAMENTO E CÁLCULO DE PAYBACK (PONTO DE EQUILÍBRIO)
 */
export function calculateEquipmentPayback(input: {
  currentPowerWatts: number;
  currentHoursPerDay: number;
  currentDaysPerMonth: number;
  newPriceBrl: number;
  newPowerWatts: number;
  newHoursPerDay: number;
  newDaysPerMonth: number;
  tariffKwhBrl: number;
  applianceKey?: string;
}) {
  const def = input.applianceKey ? definitionFor(input.applianceKey as ApplianceKey) : undefined;
  const factor = def?.defaultUtilizationFactor || 1.0;

  // Current appliance monthly consumption
  const currentMonthlyKwh = (input.currentPowerWatts / 1000) * input.currentHoursPerDay * input.currentDaysPerMonth * factor;
  const currentMonthlyCost = currentMonthlyKwh * input.tariffKwhBrl;

  // New appliance monthly consumption
  const newMonthlyKwh = (input.newPowerWatts / 1000) * input.newHoursPerDay * input.newDaysPerMonth * factor;
  const newMonthlyCost = newMonthlyKwh * input.tariffKwhBrl;

  // Savings
  const monthlyKwhSaved = Math.max(0, currentMonthlyKwh - newMonthlyKwh);
  const monthlyBrlSaved = Math.max(0, currentMonthlyCost - newMonthlyCost);
  const annualBrlSaved = monthlyBrlSaved * 12;

  // Payback in months
  const viable = monthlyBrlSaved > 0 && input.newPriceBrl > 0;
  const paybackMonths = viable ? Math.round((input.newPriceBrl / monthlyBrlSaved) * 10) / 10 : 0;
  const paybackYears = viable ? Math.round((paybackMonths / 12) * 10) / 10 : 0;

  // 36-month timeline curve for break-even chart
  const timelineMaxMonths = Math.min(60, Math.max(24, Math.ceil(paybackMonths * 1.4)));
  const timeline: Array<{ month: number; cumulativeSavings: number; investmentCost: number; netBenefit: number }> = [];

  for (let m = 0; m <= timelineMaxMonths; m += 2) {
    const cumulative = Math.round(monthlyBrlSaved * m);
    const net = Math.round(cumulative - input.newPriceBrl);
    timeline.push({
      month: m,
      cumulativeSavings: cumulative,
      investmentCost: Math.round(input.newPriceBrl),
      netBenefit: net,
    });
  }

  return {
    currentMonthlyKwh: Math.round(currentMonthlyKwh * 10) / 10,
    currentMonthlyCost: Math.round(currentMonthlyCost * 100) / 100,
    newMonthlyKwh: Math.round(newMonthlyKwh * 10) / 10,
    newMonthlyCost: Math.round(newMonthlyCost * 100) / 100,
    monthlyKwhSaved: Math.round(monthlyKwhSaved * 10) / 10,
    monthlyBrlSaved: Math.round(monthlyBrlSaved * 100) / 100,
    annualBrlSaved: Math.round(annualBrlSaved * 100) / 100,
    paybackMonths,
    paybackYears,
    viable,
    timeline,
  };
}
