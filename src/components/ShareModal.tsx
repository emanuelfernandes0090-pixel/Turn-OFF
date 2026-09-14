import React, { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  X,
  Printer,
  FileText,
  Sparkles,
  Zap,
  TrendingDown,
  ShoppingBag,
  FileCheck,
} from "lucide-react";
import { SavedDiagnosis, ExtractedBill } from "../types";
import { formatBRL, formatNumber } from "../lib/energy";

export type SharePayload =
  | { type: "app" }
  | { type: "diagnosis"; diagnosis: SavedDiagnosis }
  | {
      type: "simulation";
      baseline?: SavedDiagnosis | null;
      scenario: {
        label: string;
        monthlyKwh: number;
        savingsKwh: number;
        monthlyCost: number;
        savingsBrl: number;
        changesSummary?: string[];
      };
    }
  | {
      type: "payback";
      equipmentName: string;
      investmentCost: number;
      monthlySavings: number;
      annualSavings?: number;
      paybackMonths: number;
      return5Years?: number;
      viable?: boolean;
    }
  | { type: "bill"; bill: ExtractedBill };

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload?: SharePayload | null;
  latestDiagnosis?: SavedDiagnosis | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  payload,
  latestDiagnosis,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "https://turnoff.app";

  // Resolve active payload
  const activePayload: SharePayload = payload
    ? payload
    : latestDiagnosis
    ? { type: "diagnosis", diagnosis: latestDiagnosis }
    : { type: "app" };

  let modalTitle = "Compartilhar & Exportar";
  let modalSubtitle = "Divulgue o Turn OFF ou compartilhe seus resultados";
  let shareText = "";

  switch (activePayload.type) {
    case "diagnosis": {
      const diag = activePayload.diagnosis;
      modalTitle = "Compartilhar Diagnóstico Energético";
      modalSubtitle = "Resumo dos aparelhos, consumo e potencial de economia";
      shareText =
        `💡 Turn OFF - Diagnóstico Energético Residencial:\n` +
        `• Consumo Residencial Mapeado: ${formatNumber(diag.result.totalEstimated)} kWh/mês\n` +
        `• Economia Média Projetada: ${formatNumber(diag.result.savings.probable[0])} a ${formatNumber(
          diag.result.savings.probable[1]
        )} kWh/mês\n` +
        `• Confiabilidade dos Dados: ${diag.result.confidenceScore}%\n` +
        `• Prioridades: ${diag.result.recommendations?.slice(0, 2).map((a) => a.title).join("; ") || "Consumo eficiente"}\n` +
        `Acesse o app gratuito desenvolvido pela EEEP Dom Walfrido Teixeira Vieira (GT-02): ${currentUrl}`;
      break;
    }
    case "simulation": {
      const sim = activePayload.scenario;
      modalTitle = 'Compartilhar Simulação "E se..."';
      modalSubtitle = "Comparativo entre consumo atual e novo hábito simulado";
      shareText =
        `💡 Turn OFF - Simulação de Economia "E se...":\n` +
        `• Novo Consumo Simulado: ${formatNumber(sim.monthlyKwh)} kWh/mês\n` +
        `• Redução Estimada: -${formatNumber(sim.savingsKwh)} kWh/mês\n` +
        `• Economia Financeira na Conta: ${formatBRL(sim.savingsBrl)}/mês\n` +
        `Faça sua própria simulação gratuitamente: ${currentUrl}`;
      break;
    }
    case "payback": {
      modalTitle = "Compartilhar Análise de Payback";
      modalSubtitle = "Tempo de retorno financeiro para troca de equipamento";
      shareText =
        `💡 Turn OFF - Análise de Viabilidade Financeira (Payback):\n` +
        `• Equipamento Eficiente: ${activePayload.equipmentName}\n` +
        `• Custo do Investimento: ${formatBRL(activePayload.investmentCost)}\n` +
        `• Economia Mensal na Conta: ${formatBRL(activePayload.monthlySavings)}/mês\n` +
        `• Retorno do Investimento (Payback): ${activePayload.paybackMonths} meses\n` +
        `• Lucro Líquido em 5 anos: ${formatBRL(activePayload.return5Years ?? (activePayload.monthlySavings * 60 - activePayload.investmentCost))}\n` +
        `Calcule o payback de seus aparelhos no Turn OFF: ${currentUrl}`;
      break;
    }
    case "bill": {
      const b = activePayload.bill;
      modalTitle = "Compartilhar Auditoria da Conta";
      modalSubtitle = "Resumo dos dados auditados da fatura de energia";
      shareText =
        `💡 Turn OFF - Auditoria de Conta de Energia Elétrica:\n` +
        `• Distribuidora: ${b.distribuidora || "Concessionária"}\n` +
        `• Mês de Referência: ${b.mes_referencia || "Atual"}\n` +
        `• Consumo Faturado: ${b.consumo_kwh ?? "—"} kWh\n` +
        `• Valor Total: ${formatBRL(b.valor_total || 0)}\n` +
        `• Tarifa Social Aplicada: ${b.tarifa_social_identificada ? "Sim" : "Não"}\n` +
        `Audite sua fatura grátis pelo Turn OFF: ${currentUrl}`;
      break;
    }
    case "app":
    default: {
      modalTitle = "Compartilhar o Turn OFF";
      modalSubtitle = "Educação, Eficiência Energética e Cidadania";
      shareText =
        `💡 Conheça o Turn OFF — Aplicativo gratuito de eficiência energética e cidadania desenvolvido pelo GT-02 da EEEP Dom Walfrido Teixeira Vieira:\n` +
        `Auditoria de conta de luz com IA, diagnóstico inteligente de aparelhos, simulação "E se...", cálculo de payback e guia de segurança elétrica residencial!\n${currentUrl}`;
      break;
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Turn OFF - Eficiência Energética Residencial",
          text: shareText,
          url: currentUrl,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(modalTitle);
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="share-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-start justify-center pt-6 sm:pt-12 pb-16 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 no-print"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="share-modal-container"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-slate-300 dark:border-slate-800 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {modalTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {modalSubtitle}
              </p>
            </div>
          </div>
          <button
            id="btn-close-share"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* WhatsApp */}
          <button
            id="btn-share-whatsapp"
            onClick={handleWhatsApp}
            className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
          >
            <span>Enviar no WhatsApp</span>
          </button>

          {/* Native Share */}
          <button
            id="btn-share-native"
            onClick={handleNativeShare}
            className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar pelo Celular</span>
          </button>

          {/* Copy Link / Summary */}
          <button
            id="btn-share-copy"
            onClick={handleCopy}
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Copiado com Sucesso!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copiar Resumo & Link</span>
              </>
            )}
          </button>

          {/* Print to PDF */}
          <button
            id="btn-share-print"
            onClick={handlePrint}
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>

        {/* Text preview box */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Pré-visualização da Mensagem:
          </label>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
            {shareText}
          </div>
        </div>
      </div>
    </div>
  );
};
