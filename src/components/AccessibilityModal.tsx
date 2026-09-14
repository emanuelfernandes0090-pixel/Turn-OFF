import React from "react";
import {
  Type,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  X,
  Sliders,
  Sparkles,
  Sun,
  Moon,
  Eye,
  MessageSquareText,
  ExternalLink,
  Download,
} from "lucide-react";
import { AccessibilitySettings } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onUpdateSettings?: (newSettings: AccessibilitySettings) => void;
  onSaveSettings?: (newSettings: AccessibilitySettings) => void;
  onClearData?: () => void;
  onOpenTutorial?: () => void;
}

export const AccessibilityModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onSaveSettings,
  onClearData,
  onOpenTutorial,
}) => {
  const [confirmClear, setConfirmClear] = React.useState(false);

  const applyUpdate = (newSettings: AccessibilitySettings) => {
    if (onUpdateSettings) onUpdateSettings(newSettings);
    if (onSaveSettings) onSaveSettings(newSettings);
  };

  if (!isOpen) return null;

  const currentScale = settings.fontScale || 1.0;
  const currentPercentage = Math.round(currentScale * 100);

  const handleFontSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const scale = Number(e.target.value) / 100;
    applyUpdate({ ...settings, fontScale: scale });
  };

  const handleFontPreset = (scale: number) => {
    applyUpdate({ ...settings, fontScale: scale });
  };

  const handleSimpleLanguageToggle = () => {
    applyUpdate({ ...settings, simpleLanguage: !settings.simpleLanguage });
  };

  return (
    <div
      id="accessibility-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-start justify-center pt-6 sm:pt-12 pb-16 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 no-print"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="accessibility-modal-container"
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-slate-300 dark:border-slate-800 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                <Sliders className="w-5 h-5" />
              </span>
              Acessibilidade & Personalização
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ajuste o tamanho do texto, síntese de voz e linguagem para o seu conforto.
            </p>
          </div>
          <button
            id="btn-close-accessibility"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Fechar configurações de acessibilidade"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Replay Tutorial Section */}
        {onOpenTutorial && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 flex items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Tutorial Interativo do Aplicativo
              </span>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                Reveja os passos principais: leitura de contas, diagnóstico e simulação da Tarifa Social.
              </p>
            </div>
            <button
              id="btn-modal-reopen-tutorial"
              onClick={() => {
                onClose();
                onOpenTutorial();
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 shadow-sm transition flex items-center gap-1.5"
            >
              Rever Tutorial
            </button>
          </div>
        )}

        {/* Dynamic Font Size Range Slider */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Tamanho da Fonte (Escala Real de Texto)
              </span>
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {currentPercentage}%
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Arraste a barra para aumentar ou diminuir todo o texto do aplicativo instantaneamente:
          </p>

          <div className="space-y-2">
            <input
              id="slider-font-scale"
              type="range"
              min="85"
              max="150"
              step="5"
              value={currentPercentage}
              onChange={handleFontSliderChange}
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1">
              <span>85% (Compacto)</span>
              <span>100% (Normal)</span>
              <span>125% (Grande)</span>
              <span>150% (Extra)</span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex gap-2 pt-1">
            {[
              { label: "Padrão (100%)", scale: 1.0 },
              { label: "Grande (120%)", scale: 1.2 },
              { label: "Muito Grande (140%)", scale: 1.4 },
            ].map((p) => (
              <button
                key={p.scale}
                onClick={() => handleFontPreset(p.scale)}
                className={`flex-1 py-1.5 px-2 text-xs rounded-xl font-bold border transition ${
                  Math.abs(currentScale - p.scale) < 0.03
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme and Contrast Controls */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              Tema Visual & Contraste
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              id="btn-modal-theme-light"
              onClick={() => applyUpdate({ ...settings, theme: "light" })}
              className={`p-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                settings.theme !== "dark"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              <Sun className="w-4 h-4 text-amber-400" />
              Modo Claro
            </button>
            <button
              id="btn-modal-theme-dark"
              onClick={() => applyUpdate({ ...settings, theme: "dark" })}
              className={`p-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                settings.theme === "dark"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              Modo Escuro (Padrão)
            </button>
          </div>
        </div>

        {/* Simple Language Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Linguagem Simplificada
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Substitui termos técnicos por frases diretas e palavras do dia a dia, facilitando a compreensão de cálculos e dicas.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                settings.simpleLanguage
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
              }`}
            >
              {settings.simpleLanguage ? "Ativado" : "Desativado"}
            </span>
            <button
              id="toggle-simple-language"
              role="switch"
              aria-checked={settings.simpleLanguage}
              onClick={handleSimpleLanguageToggle}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                settings.simpleLanguage ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.simpleLanguage ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Ouvidoria e Canal de Feedback */}
        <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/70 text-blue-700 dark:text-blue-300">
                <MessageSquareText className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ouvidoria & Sugestões
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Dê sua opinião, envie sugestões, pedidos de melhoria ou reclamações.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Sua opinião é fundamental para aprimorarmos o Turn OFF e mantermos o projeto alinhado com a realidade das famílias.
          </p>

          <a
            id="link-ouvidoria-form"
            href="https://forms.gle/yFHNmcvSwQfGbJdv5"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Acessar Formulário da Ouvidoria</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Documentação e Contexto Completo para Migração (Download TXT) */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Documentação Completa de Migração (.TXT)</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Baixe o arquivo de texto contendo toda a especificação arquitetural, instruções de chaves gratuitas e o código completo do Turn OFF para restauração idêntica em qualquer nova conta.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              id="link-download-context-doc"
              href="/CONTEXTO_E_CODIGO_MIGRACAO.txt"
              download="CONTEXTO_E_CODIGO_MIGRACAO_TURNOFF.txt"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar Contexto + Código Integral (.TXT)
            </a>
            <a
              id="link-download-summary-doc"
              href="/CONTEXTO_MIGRACAO_TURNOFF.txt"
              download="ESPECIFICACAO_MIGRACAO_TURNOFF.txt"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              Baixar Apenas Especificação (.TXT)
            </a>
          </div>
        </div>

        {/* Clear Data Reset */}
        {onClearData && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {!confirmClear ? (
              <button
                id="btn-trigger-clear-data"
                onClick={() => setConfirmClear(true)}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar dados salvos e histórico local
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 space-y-2">
                <p className="text-xs text-red-800 dark:text-red-300 font-medium">
                  Tem certeza que deseja apagar os diagnósticos e faturas salvas neste navegador?
                </p>
                <div className="flex gap-2">
                  <button
                    id="btn-confirm-clear-data"
                    onClick={() => {
                      onClearData();
                      setConfirmClear(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                  >
                    Sim, apagar tudo
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
