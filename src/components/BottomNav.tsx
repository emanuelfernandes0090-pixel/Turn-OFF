import React from "react";
import {
  Home,
  FileScan,
  Activity,
  Sliders,
  ShoppingBag,
  ShieldAlert,
  GraduationCap,
  HeartHandshake,
  History,
} from "lucide-react";
import { AppTab } from "../types";

interface BottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  savedDiagnosisCount?: number;
  savedBillsCount?: number;
  isFocusMode?: boolean;
}

interface NavItem {
  id: AppTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  savedDiagnosisCount = 0,
  savedBillsCount = 0,
  isFocusMode = false,
}) => {
  const navItems: NavItem[] = [
    { id: "home", label: "Início", icon: Home },
    { id: "scanner", label: "Leitor", icon: FileScan },
    { id: "diagnosis", label: "Diagnóstico", icon: Activity },
    { id: "simulator", label: "E Se?", icon: Sliders },
    { id: "payback", label: "Payback", icon: ShoppingBag },
    { id: "safety", label: "Segurança", icon: ShieldAlert },
    { id: "learn", label: "Aprender", icon: GraduationCap },
    { id: "tarifa-social", label: "Tarifa Social", icon: HeartHandshake },
    {
      id: "history",
      label: "Histórico",
      icon: History,
      badge: savedDiagnosisCount + savedBillsCount > 0 ? savedDiagnosisCount + savedBillsCount : undefined,
    },
  ];

  return (
    <nav
      id="bottom-nav-bar"
      aria-label="Navegação Principal do Aplicativo"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg no-print transition-all duration-300 ease-in-out translate-y-0 opacity-100"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between sm:justify-around overflow-x-auto py-1.5 no-scrollbar gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`btn-nav-bottom-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center justify-center min-w-[62px] sm:min-w-[76px] py-1.5 px-1.5 rounded-2xl transition-all relative group shrink-0 ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {/* Active Indicator Bar / Pill */}
                {isActive && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                )}

                <div className="relative">
                  <span
                    className={`p-1.5 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/60"
                        : "group-hover:bg-slate-100 dark:group-hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </span>

                  {/* Badge Notification */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] sm:text-[11px] tracking-tight whitespace-nowrap mt-0.5 leading-tight ${
                    isActive ? "font-bold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
