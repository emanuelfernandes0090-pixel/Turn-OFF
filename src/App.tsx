import React, { useState, useEffect } from "react";
import {
  Header,
} from "./components/Header";
import {
  HomeDashboard,
} from "./components/HomeDashboard";
import {
  BillScanner,
} from "./components/BillScanner";
import {
  DiagnosisWizard,
} from "./components/DiagnosisWizard";
import {
  WhatIfSimulator,
} from "./components/WhatIfSimulator";
import {
  TarifaSocialGuide,
} from "./components/TarifaSocialGuide";
import {
  SafetyGuide,
} from "./components/SafetyGuide";
import {
  LearningGuide,
} from "./components/LearningGuide";
import {
  EquipmentPaybackSimulator,
} from "./components/EquipmentPaybackSimulator";
import {
  HistoryView,
} from "./components/HistoryView";
import {
  AccessibilityModal,
} from "./components/AccessibilityModal";
import {
  BottomNav,
} from "./components/BottomNav";
import {
  OnboardingModal,
} from "./components/OnboardingModal";
import {
  AdBanner,
} from "./components/AdBanner";
import {
  ShareModal,
  SharePayload,
} from "./components/ShareModal";
import {
  AIAssistantChat,
} from "./components/AIAssistantChat";
import {
  AppTab,
  AccessibilitySettings,
  SavedDiagnosis,
  BillScanRecord,
  ExtractedBill,
} from "./types";
import {
  loadAccessibilitySettings,
  saveAccessibilitySettings,
  loadDiagnoses,
  saveDiagnoses,
  loadBillScans,
  saveBillScans,
  saveBillScan,
  loadPlanProgress,
} from "./lib/storage";
import {
  CheckCircle2,
  Info,
} from "lucide-react";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<AppTab>("home");

  // Persistent storage states
  const [settings, setSettings] = useState<AccessibilitySettings>(() =>
    loadAccessibilitySettings()
  );
  const [diagnoses, setDiagnoses] = useState<SavedDiagnosis[]>(() =>
    loadDiagnoses()
  );
  const [billScans, setBillScans] = useState<BillScanRecord[]>(() =>
    loadBillScans()
  );
  const [planProgress, setPlanProgress] = useState<string[]>(() =>
    loadPlanProgress()
  );

  // Cross-view state passings
  const [selectedBillForDiagnosis, setSelectedBillForDiagnosis] = useState<BillScanRecord | null>(null);
  const [activeSimulatorBaseline, setActiveSimulatorBaseline] = useState<SavedDiagnosis | null>(null);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Modal and state
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    // O tutorial deve sempre ser exibido ao abrir o app/site pela primeira vez
    return !localStorage.getItem("turnoff:first_visit_tutorial_seen");
  });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);
  const [selectedDiagnosisForShare, setSelectedDiagnosisForShare] = useState<SavedDiagnosis | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Close tutorial and remember preference for first-time visits
  const handleCloseOnboarding = () => {
    setIsOnboardingOpen(false);
    try {
      localStorage.setItem("turnoff:first_visit_tutorial_seen", "true");
    } catch {
      // ignore
    }
  };

  // Sync settings with document classes and CSS custom variables
  useEffect(() => {
    const root = document.documentElement;

    // Theme (dark mode is default)
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Dynamic Font Scaling
    const scale = settings.fontScale || 1.0;
    root.style.setProperty("--app-font-scale", `${Math.round(scale * 100)}%`);

    saveAccessibilitySettings(settings);
  }, [settings]);

  // Robust theme toggler ensuring immediate DOM reaction
  const handleToggleTheme = () => {
    const nextTheme: "light" | "dark" = settings.theme === "dark" ? "light" : "dark";
    const updated: AccessibilitySettings = {
      ...settings,
      theme: nextTheme,
    };
    setSettings(updated);
    saveAccessibilitySettings(updated);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    showToast(nextTheme === "dark" ? "Modo escuro ativado." : "Modo claro ativado.");
  };

  // Sync diagnoses
  const handleSaveDiagnosis = (newDiagnosis: SavedDiagnosis) => {
    const updated = [newDiagnosis, ...diagnoses.filter((d) => d.id !== newDiagnosis.id)];
    setDiagnoses(updated);
    saveDiagnoses(updated);
    showToast("Diagnóstico registrado e salvo no histórico com sucesso!");
  };

  // Delete diagnosis
  const handleDeleteDiagnosis = (id: string) => {
    const updated = diagnoses.filter((d) => d.id !== id);
    setDiagnoses(updated);
    saveDiagnoses(updated);
    showToast("Diagnóstico removido.");
  };

  // Sync bill scans with automatic anomaly & goal evaluation
  const handleSaveBill = (bill: ExtractedBill) => {
    saveBillScan(bill);
    setBillScans(loadBillScans());
    showToast("Fatura salva no histórico com sucesso!");
  };

  // Delete bill
  const handleDeleteBill = (id: string) => {
    const updated = billScans.filter((b) => b.id !== id);
    setBillScans(updated);
    saveBillScans(updated);
    showToast("Fatura removida.");
  };

  // Clear all data
  const handleClearAllData = () => {
    setDiagnoses([]);
    setBillScans([]);
    saveDiagnoses([]);
    saveBillScans([]);
    showToast("Todos os dados salvos foram apagados.");
  };

  // Refresh from imported file
  const handleDataImported = () => {
    setDiagnoses(loadDiagnoses());
    setBillScans(loadBillScans());
    setSettings(loadAccessibilitySettings());
    showToast("Backup importado com sucesso!");
  };

  // Action from Scanner -> Open in Diagnosis Wizard
  const handleUseBillInDiagnosis = (bill: ExtractedBill) => {
    const record = saveBillScan(bill);
    setBillScans(loadBillScans());
    setSelectedBillForDiagnosis(record);
    setActiveTab("diagnosis");
    showToast("Dados da fatura carregados no assistente de diagnóstico.");
  };

  // Action from Diagnosis -> Open in What-If Simulator
  const handleOpenSimulator = (diagnosis: SavedDiagnosis) => {
    setActiveSimulatorBaseline(diagnosis);
    setActiveTab("simulator");
  };

  // Action from History -> Open diagnosis
  const handleSelectDiagnosisFromHistory = (diag: SavedDiagnosis) => {
    if (diag.kind === "teste") {
      setActiveSimulatorBaseline(diag);
      setActiveTab("simulator");
    } else {
      setActiveSimulatorBaseline(diag);
      setActiveTab("diagnosis");
    }
  };

  // Action from History -> Open bill
  const handleSelectBillFromHistory = (billRecord: BillScanRecord) => {
    setSelectedBillForDiagnosis(billRecord);
    setActiveTab("diagnosis");
  };

  // Text-To-Speech read aloud for active view
  // Pick the latest primary diagnosis for the simulator if none manually selected
  const defaultSimulatorBaseline =
    activeSimulatorBaseline ||
    diagnoses.find((d) => d.kind !== "teste") ||
    diagnoses[0] ||
    null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-100 flex flex-col font-['Inter',sans-serif] selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-emerald-700 text-white shadow-xl flex items-center gap-2 text-xs sm:text-sm font-bold animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        currentTab={activeTab}
        onSelectTab={(tab) => {
          setIsFocusMode(false);
          setActiveTab(tab);
        }}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        onOpenAccessibility={() => setIsAccessModalOpen(true)}
        onOpenTutorial={() => setIsOnboardingOpen(true)}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        onOpenShare={() => {
          setSharePayload({ type: "app" });
          setIsShareModalOpen(true);
        }}
        settings={settings}
      />

      {/* Main Content Area with bottom padding for fixed BottomNav */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        {activeTab === "home" && (
          <HomeDashboard
            diagnoses={diagnoses}
            billScans={billScans}
            completedActions={planProgress}
            onNavigate={setActiveTab}
            onOpenTutorial={() => setIsOnboardingOpen(true)}
            settings={settings}
          />
        )}

        {activeTab === "scanner" && (
          <BillScanner
            onSaveBill={handleSaveBill}
            onUseInDiagnosis={handleUseBillInDiagnosis}
            onShareBill={(bill) => {
              setSharePayload({
                type: "bill",
                bill,
              });
              setIsShareModalOpen(true);
            }}
            settings={settings}
          />
        )}

        {activeTab === "diagnosis" && (
          <DiagnosisWizard
            onSaveDiagnosis={handleSaveDiagnosis}
            onOpenSimulator={handleOpenSimulator}
            onExit={() => {
              setIsFocusMode(false);
              setActiveTab("home");
            }}
            billScans={billScans}
            initialBillScan={selectedBillForDiagnosis}
            settings={settings}
            onFocusModeChange={setIsFocusMode}
            onShareDiagnosis={(diag) => {
              setSharePayload({
                type: "diagnosis",
                diagnosis: diag,
              });
              setIsShareModalOpen(true);
            }}
          />
        )}

        {activeTab === "simulator" && (
          <WhatIfSimulator
            baselineDiagnosis={defaultSimulatorBaseline}
            onSaveTestSimulation={handleSaveDiagnosis}
            onShareSimulation={(scenario) => {
              setSharePayload({
                type: "simulation",
                baseline: defaultSimulatorBaseline,
                scenario,
              });
              setIsShareModalOpen(true);
            }}
            settings={settings}
          />
        )}

        {activeTab === "payback" && (
          <EquipmentPaybackSimulator
            settings={settings}
            onSharePayback={(payload) => {
              setSharePayload({
                type: "payback",
                equipmentName: payload.equipmentName,
                investmentCost: payload.investmentBrl,
                monthlySavings: payload.monthlySavingsBrl,
                annualSavings: payload.annualSavingsBrl,
                paybackMonths: payload.paybackMonths,
                return5Years: payload.monthlySavingsBrl * 60 - payload.investmentBrl,
                viable: payload.viable,
              });
              setIsShareModalOpen(true);
            }}
          />
        )}

        {activeTab === "safety" && (
          <SafetyGuide settings={settings} />
        )}

        {activeTab === "learn" && (
          <LearningGuide settings={settings} />
        )}

        {activeTab === "tarifa-social" && (
          <TarifaSocialGuide settings={settings} />
        )}

        {activeTab === "history" && (
          <HistoryView
            diagnoses={diagnoses}
            billScans={billScans}
            onSelectDiagnosis={handleSelectDiagnosisFromHistory}
            onSelectBill={handleSelectBillFromHistory}
            onDeleteDiagnosis={handleDeleteDiagnosis}
            onDeleteBill={handleDeleteBill}
            onClearAll={handleClearAllData}
            onDataImported={handleDataImported}
            onOpenShare={(diag) => {
              setSelectedDiagnosisForShare(diag || defaultSimulatorBaseline);
              setIsShareModalOpen(true);
            }}
            onOpenSimulator={handleOpenSimulator}
            settings={settings}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation (Original App Standard) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setIsFocusMode(false);
          setActiveTab(tab);
        }}
        isFocusMode={isFocusMode}
        savedDiagnosisCount={diagnoses.length}
        savedBillsCount={billScans.length}
      />

      {/* Guided Tutorial Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={handleCloseOnboarding}
        onNavigateToTab={setActiveTab}
      />

      {/* Share and PDF Export Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSharePayload(null);
        }}
        payload={sharePayload}
        latestDiagnosis={selectedDiagnosisForShare || defaultSimulatorBaseline}
      />

      {/* Accessibility Preferences Modal */}
      <AccessibilityModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          saveAccessibilitySettings(newSettings);
        }}
        onClearData={handleClearAllData}
        onOpenTutorial={() => setIsOnboardingOpen(true)}
      />

      {/* Interactive Explanatory AI Assistant (Acessível exclusivamente pelo botão do topo) */}
      <AIAssistantChat
        currentTab={activeTab}
        onNavigateTab={setActiveTab}
        isOpen={isAIChatOpen}
        onToggleOpen={setIsAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />

      {/* Espaço reservado para Publicidade não intrusiva (Permanece inativo até configuração de cliente e slot) */}
      <AdBanner />

      {/* Footer Simplified & Clean */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-6 mb-16 sm:mb-16 pb-24 sm:pb-24 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="space-y-0.5 text-center sm:text-left">
            <p className="font-bold text-slate-800 dark:text-slate-200">
              Turn OFF — Eficiência Energética Residencial
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Projeto do GT-02 · EEEP Dom Walfrido Teixeira Vieira
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveTab("learn")}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition underline cursor-pointer"
            >
              Normas Técnicas e Metodologia
            </button>
            <button
              onClick={() => setIsAccessModalOpen(true)}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition underline cursor-pointer"
            >
              Acessibilidade
            </button>
            <a
              href="https://forms.gle/yFHNmcvSwQfGbJdv5"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 font-bold transition underline"
              title="Ouvidoria: dê opiniões, sugestões, pedidos ou reclamações"
            >
              Ouvidoria & Sugestões
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
