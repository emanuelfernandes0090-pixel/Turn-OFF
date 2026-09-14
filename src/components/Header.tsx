import React from "react";
import {
  Zap,
  Moon,
  Sun,
  Sliders,
  Settings,
  Sparkles,
  HelpCircle,
  Share2,
  Volume2,
  Play,
  Pause,
  Square,
  BookOpen,
  Bot,
} from "lucide-react";
import { TurnOffLogo } from "./Logo";
import { AccessibilitySettings, AppTab } from "../types";

interface HeaderProps {
  currentTab?: AppTab | string;
  activeTab?: AppTab | string;
  onSelectTab: (tab: AppTab) => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  onOpenAccessibility: () => void;
  onOpenTutorial?: () => void;
  onOpenAIChat?: () => void;
  onOpenShare: () => void;
  settings?: AccessibilitySettings;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  activeTab,
  onSelectTab,
  theme = "light",
  onToggleTheme,
  onOpenAccessibility,
  onOpenTutorial,
  onOpenAIChat,
  onOpenShare,
  settings,
}) => {
  const effectiveTab: AppTab = (activeTab || currentTab || "home") as AppTab;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors no-print">
      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <button
            id="nav-logo"
            onClick={() => onSelectTab("home")}
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-hidden text-left"
            title="Ir para o Início"
          >
            <TurnOffLogo size={38} withBadge={true} className="group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-['Space_Grotesk']">
                  Turn <span className="text-emerald-600 dark:text-emerald-400">OFF</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  v2.5
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Energia & Segurança
              </p>
            </div>
          </button>

          {/* Action Buttons Right */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* IA Explicativa Button */}
            {onOpenAIChat && (
              <button
                id="btn-header-ai-chat"
                onClick={onOpenAIChat}
                className="h-9 w-9 md:w-auto px-0 md:px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 transition flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
                title="Abrir IA Explicativa Turn OFF"
                aria-label="Abrir IA Explicativa"
              >
                <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="hidden md:inline">IA Explicativa</span>
              </button>
            )}

            {/* Tutorial Button */}
            {onOpenTutorial && (
              <button
                id="btn-open-tutorial-header"
                onClick={onOpenTutorial}
                className="h-9 w-9 md:w-auto px-0 md:px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 transition flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
                title="Abrir Tutorial e Guia do Aplicativo"
                aria-label="Abrir Tutorial Passo a Passo"
              >
                <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="hidden md:inline">Tutorial</span>
              </button>
            )}

            {/* Share App Button */}
            <button
              id="btn-header-share"
              onClick={onOpenShare}
              className="h-9 w-9 md:w-auto px-0 md:px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 transition flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
              title="Compartilhar Aplicativo Turn OFF"
              aria-label="Compartilhar Aplicativo"
            >
              <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="hidden md:inline">Compartilhar</span>
            </button>

            {/* Settings & Accessibility Button */}
            <button
              id="btn-open-accessibility"
              onClick={onOpenAccessibility}
              className="h-9 w-9 md:w-auto px-0 md:px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 transition flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
              title="Configurações, Acessibilidade e Ouvidoria"
              aria-label="Abrir configurações e ouvidoria"
            >
              <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="hidden md:inline">Configurações</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              id="btn-toggle-theme"
              onClick={onToggleTheme}
              className="h-9 w-9 p-0 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 transition flex items-center justify-center cursor-pointer shadow-xs"
              title={theme === "dark" ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
              aria-label="Alternar entre modo claro e modo escuro"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
