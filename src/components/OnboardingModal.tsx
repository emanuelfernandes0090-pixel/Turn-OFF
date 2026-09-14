import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkles,
  Zap,
  Activity,
  FileScan,
  Sliders,
  ShoppingBag,
  ShieldAlert,
  GraduationCap,
  HeartHandshake,
  History,
  Settings,
  MapPin,
  ListChecks,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  ExternalLink,
  Bot,
  Share2,
} from "lucide-react";
import { AppTab } from "../types";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: AppTab) => void;
}

interface TutorialStep {
  badge: string;
  title: string;
  subtitle: string;
  location: string;
  description: string;
  steps: string[];
  targetId: string;
  secondaryTargetId?: string;
  targetTab: AppTab;
  actionTab?: AppTab;
  actionLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    badge: "Passo 1 de 12 · Início & Eficiência Geral",
    title: "Painel Central & Índice de Eficiência",
    subtitle: "Visão Geral e Ações Rápidas",
    location: "Aba 'Início' no menu inferior ou clicando na logo Turn OFF no topo",
    targetId: "home-efficiency-box",
    secondaryTargetId: "home-hero-card",
    targetTab: "home",
    actionTab: "home",
    actionLabel: "Explorar Tela Inicial",
    description:
      "O ponto de partida do Turn OFF. Apresenta o seu Índice Geral de Eficiência Energética (de 0 a 100), alertas de segurança em destaque e botões de ação rápida para todos os recursos.",
    steps: [
      "Acompanhe seu Índice de Eficiência Energética: calculado com rigor a partir dos seus diagnósticos e do equilíbrio de consumo.",
      "Utilize o botão 'Fazer Diagnóstico Agora' (ou 'Atualizar') para mapear os vilões de consumo da sua casa.",
      "Toque no botão 'Escanear Conta de Luz' para auditar uma fatura recente de forma transparente.",
      "Navegue diretamente pelos 8 cartões de acesso rápido posicionados logo abaixo do painel.",
    ],
    icon: Zap,
  },
  {
    badge: "Passo 2 de 12 · IA Explicativa Inteligente",
    title: "IA Explicativa do Turn OFF",
    subtitle: "Assistente Inteligente na Barra Superior",
    location: "Botão 'IA Explicativa' (ícone de robô) na barra superior do aplicativo",
    targetId: "btn-header-ai-chat",
    secondaryTargetId: "btn-header-ai-chat",
    targetTab: "home",
    actionTab: "home",
    actionLabel: "Localizar IA no Topo",
    description:
      "Dúvidas sobre faturas, fórmulas físicas de kWh, normas de segurança elétrica ou uso das telas? A IA Explicativa fica centralizada na barra superior para te ajudar a qualquer momento.",
    steps: [
      "Toque no botão 'IA Explicativa' no cabeçalho superior de qualquer tela para abrir a janela de atendimento inteligente.",
      "Faça perguntas em texto livre ou selecione perguntas rápidas com um toque (ex: como calcular kWh, regras da Tarifa Social, por que o chuveiro consome tanto).",
      "Receba explicações claras, técnicas e em linguagem acessível sobre qualquer termo da sua conta de luz.",
      "Use os botões no cabeçalho do chat para minimizar a janela ou fechar quando terminar de tirar suas dúvidas.",
    ],
    icon: Bot,
  },
  {
    badge: "Passo 3 de 12 · Diagnóstico Residencial",
    title: "Diagnóstico Completo por Cômodo",
    subtitle: "Inventário Físico de Aparelhos e Resultados",
    location: "Card 'Diagnóstico Energético' no Início ou aba 'Diagnóstico' no menu inferior",
    targetId: "card-quick-diagnostico",
    secondaryTargetId: "btn-nav-bottom-diagnosis",
    targetTab: "home",
    actionTab: "diagnosis",
    actionLabel: "Fazer Diagnóstico Agora",
    description:
      "Mapeie detalhadamente todos os eletrodomésticos da casa com física real: duty cycle de refrigeradores, potência em Watts, BTUs e modulação Inverter de ar-condicionado.",
    steps: [
      "Etapa 1 (Fatura): Preencha o consumo faturado em kWh, o valor total em R$ e o número de moradores.",
      "Etapa 2 (Aparelhos): Adicione equipamentos cômodo por cômodo (geladeira, chuveiro, ar-condicionado, lâmpadas, motores) com horas de uso diário.",
      "Etapa 3 (Segurança): Responda ao checklist de segurança conforme as normas NBR 5410.",
      "Etapa 4 (Resultados & Ações): Visualize gráficos comparativos, ranking de vilões de gasto e utilize os botões para Salvar no Histórico, Imprimir Relatório ou Exportar em PDF.",
    ],
    icon: Activity,
  },
  {
    badge: "Passo 4 de 12 · Leitor & Scanner de Faturas",
    title: "Auditoria Completa da Conta de Luz",
    subtitle: "Foto pela Câmera, Upload de Imagem, PDF ou Manual",
    location: "Card 'Leitor de Conta' no Início ou aba 'Leitor' no menu inferior",
    targetId: "card-quick-leitor",
    secondaryTargetId: "btn-nav-bottom-scanner",
    targetTab: "home",
    actionTab: "scanner",
    actionLabel: "Escanear Conta Agora",
    description:
      "Audita as tarifas cobradas pela distribuidora (TE e TUSD), decompõe os tributos (ICMS, PIS, COFINS, CIP) e identifica se a bandeira tarifária está Verde, Amarela, Vermelha 1 ou 2.",
    steps: [
      "Escolha a forma de envio: captura instantânea pela câmera, envio de imagem/foto salva, arquivo PDF da fatura ou digitação manual.",
      "O leitor extrai automaticamente distribuidora, consumo em kWh, valor total em R$, vencimento e bandeira tarifária.",
      "Examine o quadro detalhado de impostos e verifique se a conta já possui ou tem direito ao desconto da Tarifa Social.",
      "Utilize o botão 'Salvar Conta no Histórico' ou 'Usar Dados no Diagnóstico' para integrar as informações com um clique.",
    ],
    icon: FileScan,
  },
  {
    badge: "Passo 5 de 12 · Simulador 'E se...?'",
    title: "Simulador de Mudança de Hábitos",
    subtitle: "Impacto Imediato na Conta em kWh e em Reais",
    location: "Card 'Simulador E se...' no Início ou aba 'E Se?' no menu inferior",
    targetId: "card-quick-simulador",
    secondaryTargetId: "btn-nav-bottom-simulator",
    targetTab: "home",
    actionTab: "simulator",
    actionLabel: "Abrir Simulador Agora",
    description:
      "Descubra exatamente quantos Reais sobram no seu bolso ao ajustar hábitos diários da família, com fórmulas físicas sem suposições fantasiosas.",
    steps: [
      "Selecione um diagnóstico salvo da sua residência para servir de base realista.",
      "Ajuste os controles deslizantes: reduza o tempo de banho no chuveiro elétrico de 15 para 8 minutos ou passe para a chave 'Verão'.",
      "Simule a troca de lâmpadas antigas por modelos LED e a regulação da temperatura do ar-condicionado em 24°C.",
      "Acompanhe o painel em tempo real exibindo a economia mensal em kWh e em Reais (R$/mês).",
    ],
    icon: Sliders,
  },
  {
    badge: "Passo 6 de 12 · Troca de Eletrodomésticos",
    title: "Simulador de Payback (Retorno)",
    subtitle: "Vale a Pena Comprar um Aparelho Novo?",
    location: "Card 'Simulador de Payback' no Início ou aba 'Payback' no menu inferior",
    targetId: "card-quick-payback",
    secondaryTargetId: "btn-nav-bottom-payback",
    targetTab: "home",
    actionTab: "payback",
    actionLabel: "Calcular Payback Agora",
    description:
      "Calcula com precisão em quanto tempo (em meses) o valor investido na compra de um equipamento novo com Selo Procel A ou motor Inverter se paga na redução da sua conta de energia.",
    steps: [
      "Escolha a categoria do aparelho no catálogo oficial integrado (geladeira, ar-condicionado, máquina de lavar ou chuveiro).",
      "Informe a idade e o consumo do modelo antigo vs. o preço de compra e consumo do novo modelo eficiente.",
      "Analise o prazo exato de amortização (Payback em meses) onde a economia mensal paga o custo do aparelho.",
      "Consulte os gráficos com a projeção de economia acumulada em 1 ano, 3 anos e 5 anos.",
    ],
    icon: ShoppingBag,
  },
  {
    badge: "Passo 7 de 12 · Segurança da Família",
    title: "Guia de Segurança Elétrica (NBR 5410)",
    subtitle: "Prevenção de Choques, Incêndios e Sobrecargas",
    location: "Card 'Segurança Elétrica' no Início ou aba 'Segurança' no menu inferior",
    targetId: "card-quick-seguranca",
    secondaryTargetId: "btn-nav-bottom-safety",
    targetTab: "home",
    actionTab: "safety",
    actionLabel: "Ver Guia de Segurança",
    description:
      "A diretriz fundamental do Turn OFF: economizar energia NUNCA deve colocar a sua família em risco. Aprenda a reconhecer perigos invisíveis e proteja seu patrimônio.",
    steps: [
      "Conheça os 6 sinais críticos de perigo elétrico: tomadas mornas, cheiro de plástico queimado, disjuntor desarmando e choques ao tocar em aparelhos.",
      "Entenda o que NUNCA fazer: nunca troque um disjuntor por outro de amperagem maior sem substituir toda a fiação compatível.",
      "Evite o uso de adaptadores múltiplos (T's / benjamins) em tomadas de alta potência para evitar sobreaquecimento.",
      "Jogue no módulo interativo de 'Mitos e Verdades' sobre fiação, chuveiros e aterramento para reforçar o aprendizado.",
    ],
    icon: ShieldAlert,
  },
  {
    badge: "Passo 8 de 12 · Educação Energética",
    title: "Guia Educativo & Medidor de Luz",
    subtitle: "Aprenda a Ler o Relógio e Domine o kWh",
    location: "Card 'Guia de Aprendizado' no Início ou aba 'Aprender' no menu inferior",
    targetId: "card-quick-aprender",
    secondaryTargetId: "btn-nav-bottom-learn",
    targetTab: "home",
    actionTab: "learn",
    actionLabel: "Abrir Guia Educativo",
    description:
      "Desvende a física da eletricidade de forma simples: compreenda como a distribuidora calcula o kWh e aprenda a conferir seu relógio medidor no meio do mês.",
    steps: [
      "Entenda a fórmula oficial do kWh: Potência do aparelho em Watts × Horas de uso por dia ÷ 1000.",
      "Aprenda na prática como ler relógios medidores digitais e relógios analógicos com 4 ponteiros.",
      "Realize anotações no meio do mês para estimar o valor aproximado da conta antes da chegada da distribuidora.",
      "Consulte dicas práticas de conservação divididas por cada cômodo da sua casa.",
    ],
    icon: GraduationCap,
  },
  {
    badge: "Passo 9 de 12 · Tarifa Social (TSEE)",
    title: "Benefício da Tarifa Social",
    subtitle: "Descontos Oficiais de até 65% na Fatura",
    location: "Card 'Tarifa Social (TSEE)' no Início ou aba 'Tarifa Social' no menu inferior",
    targetId: "card-quick-beneficios",
    secondaryTargetId: "btn-nav-bottom-tarifa-social",
    targetTab: "home",
    actionTab: "tarifa-social",
    actionLabel: "Conferir Direitos da TSEE",
    description:
      "Tudo sobre o benefício regulamentado pela Aneel que reduz drasticamente o valor da conta de energia para famílias de baixa renda e inscritas no Cadastro Único.",
    steps: [
      "Verifique se sua família atende aos requisitos: CadÚnico com renda até 1/2 salário mínimo per capita ou beneficiários do BPC/LOAS.",
      "Conheça as faixas oficiais de desconto: até 30 kWh (65% desc.), 31 a 100 kWh (40% desc.) e 101 a 220 kWh (10% desc.).",
      "Consulte as regras de gratuidade de até 50 kWh/mês para famílias indígenas e quilombolas cadastradas.",
      "Veja a lista de documentos e instruções para solicitar ou atualizar seu cadastro junto à concessionária de energia.",
    ],
    icon: HeartHandshake,
  },
  {
    badge: "Passo 10 de 12 · Histórico, Gráficos & Backup",
    title: "Histórico de Análises & Backup Local",
    subtitle: "Gráficos em kWh/R$, Detalhes de Aparelhos e Proteção",
    location: "Card 'Histórico & Exportação' no Início ou aba 'Histórico' no menu inferior",
    targetId: "card-quick-historico",
    secondaryTargetId: "btn-nav-bottom-history",
    targetTab: "home",
    actionTab: "history",
    actionLabel: "Acessar Histórico",
    description:
      "Consulte diagnósticos e contas anteriores, examine detalhes completos com gráficos individuais de cada aparelho e faça backup seguro dos seus dados locais.",
    steps: [
      "Toque no botão 'Ver Detalhes' em qualquer diagnóstico salvo para inspecionar potências, horários e recomendações de cada aparelho.",
      "Alterne a visualização dos gráficos históricos entre consumo em kWh e Custo em Reais (R$) com um único clique.",
      "Clique no botão 'Exportar Backup' para baixar um arquivo JSON seguro com todos os seus dados no seu dispositivo.",
      "Utilize o botão 'Importar Backup' para restaurar seus registros com rapidez em outro celular ou computador.",
    ],
    icon: History,
  },
  {
    badge: "Passo 11 de 12 · Configurações & Ouvidoria",
    title: "Configurações, Acessibilidade & Ouvidoria",
    subtitle: "Temas Visuais, Escala de Fontes e Ouvidoria Oficial",
    location: "Botão 'Configurações' com ícone de engrenagem no canto superior direito",
    targetId: "btn-open-accessibility",
    secondaryTargetId: "btn-open-accessibility",
    targetTab: "home",
    actionTab: "home",
    actionLabel: "Abrir Configurações",
    description:
      "Personalize a interface para seu conforto visual, ative textos fáceis e entre em contato direto com a equipe através do formulário oficial da Ouvidoria.",
    steps: [
      "Alterne entre o Modo Escuro profundo (#020617) e o Modo Claro de alto contraste para perfeita visualização.",
      "Ajuste o tamanho dos textos através do controle deslizante (de 85% até 150%) ou pelos botões de atalho rápido.",
      "Ative a Linguagem Simplificada para substituir termos técnicos por explicações diretas do cotidiano.",
      "Toque no botão 'Acessar Formulário da Ouvidoria' para enviar dúvidas, sugestões de melhoria ou reclamações aos criadores.",
      "Use a opção 'Limpar dados salvos' caso deseje reiniciar os diagnósticos armazenados neste navegador.",
    ],
    icon: Settings,
  },
  {
    badge: "Passo 12 de 12 · Compartilhamento & Ajuda",
    title: "Compartilhar com QR Code & Tutorial",
    subtitle: "Espalhe a Economia e Reabra o Guia Quando Quiser",
    location: "Botões 'Compartilhar' e 'Tutorial' no topo, e menu de navegação inferior",
    targetId: "btn-header-share",
    secondaryTargetId: "btn-open-tutorial-header",
    targetTab: "home",
    actionTab: "home",
    actionLabel: "Concluir Tutorial",
    description:
      "Parabéns! Você conheceu todas as funcionalidades e botões do Turn OFF. O aplicativo foi desenhado para ser intuitivo, educativo e totalmente seguro para todas as famílias.",
    steps: [
      "Clique no botão 'Compartilhar' no cabeçalho para gerar o QR Code instantâneo na tela ou copiar o link para o WhatsApp.",
      "Sempre que quiser rever como usar qualquer função, clique no botão 'Tutorial' no topo para reabrir este guia passo a passo.",
      "Use o menu fixo inferior para alternar de forma prática entre todas as telas principais em qualquer celular.",
      "Pronto! Toque em 'Concluir' abaixo e comece agora mesmo a planejar a redução da sua conta de luz com total segurança!",
    ],
    icon: Share2,
  },
];

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeView, setActiveView] = useState<"overview" | "steps">("overview");
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const stepData = TUTORIAL_STEPS[currentStep] || TUTORIAL_STEPS[0];

  // Helper to locate target element with primary and secondary fallback IDs
  const findElement = useCallback(
    (primaryId: string, secondaryId?: string): HTMLElement | null => {
      let el = document.getElementById(primaryId);
      if (el) return el;
      if (secondaryId) {
        el = document.getElementById(secondaryId);
        if (el) return el;
      }
      return null;
    },
    []
  );

  // Measure target element position and calculate spotlight rect
  const updateRect = useCallback(() => {
    if (!isOpen || !stepData) return;
    const el = findElement(stepData.targetId, stepData.secondaryTargetId);
    if (el) {
      const r = el.getBoundingClientRect();
      const padding = 6;
      setTargetRect({
        top: Math.max(0, r.top - padding),
        left: Math.max(0, r.left - padding),
        width: r.width + padding * 2,
        height: r.height + padding * 2,
        bottom: r.bottom + padding,
        right: r.right + padding,
      });
    } else {
      setTargetRect(null);
    }
  }, [isOpen, stepData, findElement]);

  // Navigate to target tab and smartly scroll target into clear viewport area
  useEffect(() => {
    if (!isOpen || !stepData) return;

    if (stepData.targetTab) {
      onNavigateToTab(stepData.targetTab);
    }

    // Retries to ensure target element exists in DOM and scrolls into non-obscured view
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const el = findElement(stepData.targetId, stepData.secondaryTargetId);
      if (el) {
        const isHeaderTarget =
          stepData.targetId.includes("header") ||
          stepData.targetId.includes("btn-open");

        if (isHeaderTarget) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          const rect = el.getBoundingClientRect();
          const isQuickCard = stepData.targetId.startsWith("card-quick-");

          // Check if element is already comfortably visible in the viewport
          // Top margin accounts for the tutorial card when docked at the top (~320px)
          const minVisibleTop = isQuickCard ? 300 : 180;
          const maxVisibleBottom = window.innerHeight - 80;
          const isAlreadyWellPositioned =
            rect.top >= minVisibleTop && rect.bottom <= maxVisibleBottom;

          if (!isAlreadyWellPositioned) {
            const elAbsTop = window.scrollY + rect.top;
            let targetY: number;

            if (isQuickCard) {
              // Position the quick cards nicely below the top coach card (needs ~300px space from top of window)
              // If the element is too high up, scroll down slightly; if too low down, scroll up gently
              targetY = Math.max(0, elAbsTop - 310);
            } else {
              targetY = Math.max(0, elAbsTop - 180);
            }

            // Only scroll if the difference is substantial to avoid annoying micro-jumps
            if (Math.abs(window.scrollY - targetY) > 60) {
              window.scrollTo({ top: targetY, behavior: "smooth" });
            }
          }
        }

        updateRect();
        if (attempts >= 3) {
          clearInterval(interval);
        }
      } else if (attempts >= 8) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentStep, stepData, onNavigateToTab, updateRect, findElement]);

  // Keep spotlight anchored to the element during scrolling or window resize
  useEffect(() => {
    if (!isOpen) return;
    const handleRecalc = () => updateRect();
    window.addEventListener("resize", handleRecalc);
    window.addEventListener("scroll", handleRecalc, true);
    return () => {
      window.removeEventListener("resize", handleRecalc);
      window.removeEventListener("scroll", handleRecalc, true);
    };
  }, [isOpen, updateRect]);

  // Reset step and view whenever newly opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setActiveView("overview");
    }
  }, [isOpen]);

  if (!isOpen || !stepData) return null;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setActiveView("overview");
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setActiveView("overview");
    }
  };

  const handleTryFeatureNow = () => {
    if (stepData.actionTab) {
      onNavigateToTab(stepData.actionTab);
    }
    onClose();
  };

  const StepIcon = stepData.icon;
  const isTargetVisible = targetRect !== null;

  // Decide if coach mark card should dock at TOP or BOTTOM.
  // If target element is in the middle or bottom half of viewport (or is one of the 8 quick cards),
  // dock card at TOP (16px from top) so the cards below are 100% visible and uncovered!
  const isQuickCard = stepData.targetId.startsWith("card-quick-");
  const isTargetNearBottom =
    isTargetVisible &&
    (isQuickCard ||
      targetRect.top > window.innerHeight * 0.42 ||
      stepData.secondaryTargetId?.includes("btn-nav-bottom"));

  return (
    <div
      id="interactive-tutorial-overlay"
      className="fixed inset-0 z-50 overflow-hidden pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial Interativo do Aplicativo Turn OFF"
    >
      {/* Darkened Backdrop with Spotlight Cutout */}
      {isTargetVisible ? (
        <div
          id="tutorial-spotlight-box"
          className="absolute transition-all duration-300 ease-out pointer-events-none rounded-2xl"
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.78)",
            border: "2px solid #10b981",
          }}
        >
          {/* Animated beacon tag highlighting location */}
          <div
            className={`absolute ${
              targetRect.top < 50 ? "top-full mt-2" : "-top-3.5"
            } left-4 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 animate-bounce pointer-events-none z-10`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-ping" />
            <MapPin className="w-3 h-3 inline-block" />
            <span>Localização</span>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity duration-200" />
      )}

      {/* Floating Tutorial Card - Docked smartly to never cover the target */}
      <div
        ref={cardRef}
        id="tutorial-coach-mark-wrapper"
        className="fixed z-50 transition-all duration-300 ease-out px-4 pointer-events-auto"
        style={
          isTargetNearBottom
            ? {
                top: "16px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "100%",
                maxWidth: "540px",
              }
            : {
                bottom: "16px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "100%",
                maxWidth: "540px",
              }
        }
      >
        <div
          id="tutorial-coach-mark-card"
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3 max-h-[50vh] sm:max-h-[46vh] flex flex-col justify-between transition-all"
        >
          {/* Scrollable content area so buttons never cover text */}
          <div className="overflow-y-auto space-y-3 pr-1">
            {/* Top Bar: Progress, Badge, and Close Button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {currentStep + 1} de {TUTORIAL_STEPS.length}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-xs">
                        {stepData.subtitle}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight mt-0.5">
                      {stepData.title}
                    </h3>
                  </div>
                </div>

                <button
                  id="btn-tutorial-skip-x"
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                  title="Fechar tutorial"
                  aria-label="Fechar tutorial"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Subtitle / Location indicator */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">
                  <strong className="text-slate-800 dark:text-slate-100">Onde fica:</strong> {stepData.location}
                </span>
              </div>
            </div>

            {/* Toggle View Tabs: "Resumo" vs "Passo a Passo" */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveView("overview")}
                className={`flex-1 py-1 px-2 rounded-lg transition text-center cursor-pointer ${
                  activeView === "overview"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Para que serve
              </button>
              <button
                type="button"
                onClick={() => setActiveView("steps")}
                className={`flex-1 py-1 px-2 rounded-lg transition text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeView === "steps"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <ListChecks className="w-3 h-3" />
                Passo a Passo ({stepData.steps.length})
              </button>
            </div>

            {/* Tab Content Area */}
            <div className="min-h-[56px] text-xs pb-1">
              {activeView === "overview" ? (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {stepData.description}
                </p>
              ) : (
                <div className="space-y-1.5">
                  {stepData.steps.map((st, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300 leading-snug"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fixed Bottom Action Area: Try Now Button + Controls */}
          <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 shrink-0">
            {/* Quick Action Button: Try now if not on last step */}
            {stepData.actionLabel && currentStep !== TUTORIAL_STEPS.length - 1 && (
              <button
                type="button"
                id={`btn-tutorial-try-now-${currentStep}`}
                onClick={handleTryFeatureNow}
                className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 hover:text-emerald-900 dark:hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-emerald-300/80 dark:border-emerald-700/60 shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Experimentar agora: {stepData.actionLabel}</span>
              </button>
            )}

            {/* Stepper Dots and Next/Prev/Skip */}
            <div className="flex items-center justify-between gap-2">
            {/* Progress Dots */}
            <div className="flex items-center gap-1">
              {TUTORIAL_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentStep(idx);
                    setActiveView("overview");
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentStep
                      ? "w-4 bg-emerald-600 dark:bg-emerald-400"
                      : "w-1 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                  }`}
                  aria-label={`Passo ${idx + 1}`}
                  title={`Passo ${idx + 1}`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-tutorial-skip-text"
                type="button"
                onClick={onClose}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
              >
                Pular
              </button>

              {currentStep > 0 && (
                <button
                  id="btn-tutorial-prev"
                  type="button"
                  onClick={handlePrev}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Voltar
                </button>
              )}

              <button
                id="btn-tutorial-next"
                type="button"
                onClick={handleNext}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1 cursor-pointer"
              >
                {currentStep === TUTORIAL_STEPS.length - 1 ? (
                  <>
                    <Check className="w-3 h-3" />
                    Concluir
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

