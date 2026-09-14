import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Zap,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  Minimize2,
  Maximize2,
  RotateCcw,
} from "lucide-react";
import { AppTab } from "../types";
import { MathFormula } from "./MathFormula";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  currentTab: AppTab | string;
  onNavigateTab: (tab: AppTab) => void;
  isOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
  onClose?: () => void;
}

const QUICK_QUESTIONS = [
  "Como o app calcula o consumo em kWh?",
  "O que é a Tarifa Social e como conseguir?",
  "Por que o chuveiro e o ar gastam tanto?",
  "Qual a diferença entre potência e consumo?",
  "Como usar o simulador 'E se...'?",
];

export const AIAssistantChat: React.FC<Props> = ({
  currentTab,
  onNavigateTab,
  isOpen: controlledIsOpen,
  onToggleOpen,
  onClose,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (val: boolean) => {
    setInternalIsOpen(val);
    onToggleOpen?.(val);
    if (!val) onClose?.();
  };

  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou a **IA Explicativa do Turn OFF**.\n\nPosso tirar dúvidas sobre como usar cada função do app, regras de desconto na conta (Tarifa Social), cálculos físicos de kWh e orientações de segurança elétrica (NBR 5410). Como posso te ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || isLoading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          userContext: { currentTab },
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "O Turn OFF calcula o consumo mensal pela fórmula: **(Watts × Horas/dia × Dias/mês × Fator de Ciclo) ÷ 1000**. Aparelhos térmicos e com compressor exigem maior atenção!",
          },
        ]);
      }
    } catch (err) {
      console.error("[AIAssistantChat] Erro na requisição:", err);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "O Turn OFF funciona com cálculos matemáticos certificados pelo Inmetro e Procel. Você pode explorar todas as telas pelo menu superior ou inferior!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format text cleanly without raw asterisks, messy dashes or bad formula syntax
  const formatText = (rawText: string) => {
    // 1. Normalize line breaks and remove excessive blank lines
    let text = rawText
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // 2. Separate LaTeX / math formula blocks
    const formulaRegex = /\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|(\\text\{[^}]+\}[\s\S]*?\\frac\{[^}]+\}\{[^}]+\})/g;
    const blocks: Array<{ type: "formula" | "text"; content: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = formulaRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        blocks.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
        });
      }
      blocks.push({
        type: "formula",
        content: match[1] || match[2] || match[3] || "",
      });
      lastIndex = formulaRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      blocks.push({
        type: "text",
        content: text.substring(lastIndex),
      });
    }

    return blocks.map((block, bIdx) => {
      if (block.type === "formula") {
        return <MathFormula key={`formula-${bIdx}`} formula={block.content} />;
      }

      const lines = block.content.split("\n");
      return (
        <div key={`block-${bIdx}`} className="space-y-1 my-1">
          {lines.map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) {
              return <div key={i} className="h-1" />;
            }

            // Detect headers (### or ##)
            if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
              const headerText = trimmed.replace(/^#{2,3}\s+/, "").replace(/\*\*/g, "");
              return (
                <div
                  key={i}
                  className="font-bold text-xs text-emerald-700 dark:text-emerald-400 mt-2.5 mb-1 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{headerText}</span>
                </div>
              );
            }

            // Detect horizontal dividers
            if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
              return (
                <hr
                  key={i}
                  className="my-2 border-slate-200 dark:border-slate-800"
                />
              );
            }

            // Detect bullet points (- or * or •)
            const isBullet = /^[-*•]\s+/.test(trimmed);
            // Detect numbered list (e.g., 1. or 2.)
            const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);

            let prefixElement = null;
            let lineContent = trimmed;

            if (isBullet) {
              lineContent = trimmed.replace(/^[-*•]\s+/, "");
              prefixElement = <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>;
            } else if (numMatch) {
              lineContent = numMatch[2];
              prefixElement = (
                <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                  {numMatch[1]}
                </span>
              );
            }

            // Detect inline math like $...$ and clean it
            lineContent = lineContent.replace(/\$([^$]+)\$/g, "$1");

            // Split on **...** to render emphasis with distinct bold typography without literal **
            const parts = lineContent.split(/(\*\*[^*]+\*\*)/g);

            return (
              <div
                key={i}
                className={`leading-relaxed text-xs text-slate-700 dark:text-slate-200 ${
                  prefixElement ? "pl-1 flex items-start gap-2" : ""
                }`}
              >
                {prefixElement}
                <div className="flex-1">
                  {parts.map((part, pIdx) => {
                    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
                      const cleanInner = part.slice(2, -2).trim();
                      return (
                        <strong
                          key={pIdx}
                          className="font-semibold text-slate-900 dark:text-white"
                        >
                          {cleanInner}
                        </strong>
                      );
                    }
                    // Clean any stray asterisks or unclosed markdown markers
                    const cleanPart = part.replace(/\*\*/g, "").replace(/^\s*[-–—]\s*/, "");
                    return <span key={pIdx}>{cleanPart}</span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      id="modal-ai-chat-window"
      className={`fixed z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl transition-all duration-300 no-print flex flex-col overflow-hidden ${
        isMinimized
          ? "bottom-20 sm:bottom-6 right-4 sm:right-6 w-80 h-14"
          : "bottom-16 sm:bottom-6 right-2 sm:right-6 w-[calc(100vw-1rem)] sm:w-[420px] max-w-lg h-[560px] max-h-[82vh]"
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-['Space_Grotesk']">IA Explicativa</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-emerald-500/40 text-emerald-100">
                Gemini
              </span>
            </div>
            <p className="text-[10px] text-emerald-100/80">Tire dúvidas de uso, física e tarifas</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition cursor-pointer"
            title={isMinimized ? "Expandir" : "Minimizar"}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition cursor-pointer"
            title="Fechar chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body when not minimized */}
      {!isMinimized && (
        <>
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950/60 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-wrap break-words text-xs ${
                    m.role === "user"
                      ? "bg-emerald-600 text-white rounded-tr-xs shadow-xs font-medium"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700 shadow-xs"
                  }`}
                >
                  {formatText(m.content)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-xs flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-medium ml-1">Processando resposta...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Pills */}
          <div className="px-3 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 whitespace-nowrap shrink-0 transition cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              id="input-ai-chat-text"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida sobre o Turn OFF..."
              className="flex-1 py-2 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
              disabled={isLoading}
            />
            <button
              id="btn-send-ai-chat"
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold transition shadow-xs cursor-pointer shrink-0"
              title="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
