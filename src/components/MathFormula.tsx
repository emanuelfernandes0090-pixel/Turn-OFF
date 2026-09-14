import React from "react";

interface MathFormulaProps {
  formula: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({ formula }) => {
  // If it's a fraction formula (like \frac{A}{B} or standard consumption formulas)
  const fracMatch = formula.match(/\\frac\{([\s\S]*?)\}\{([\s\S]*?)\}/);

  if (fracMatch) {
    // Extract numerator and denominator
    const cleanNum = fracMatch[1]
      .replace(/\\text\{([^}]+)\}/g, "$1")
      .replace(/\\times/g, " × ")
      .replace(/\\cdot/g, " · ")
      .trim();

    const cleanDen = fracMatch[2]
      .replace(/\\text\{([^}]+)\}/g, "$1")
      .replace(/\\times/g, " × ")
      .replace(/\\cdot/g, " · ")
      .trim();

    // Extract LHS before the equal sign
    const beforeFrac = formula.split("=")[0] || "";
    const cleanLHS = beforeFrac
      .replace(/\\text\{([^}]+)\}/g, "$1")
      .replace(/\$/g, "")
      .trim();

    return (
      <div className="my-2.5 p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-100 font-sans shadow-md">
        <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300/90 mb-1.5 flex items-center justify-between border-b border-emerald-800/60 pb-1">
          <span>Fórmula de Cálculo</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 font-bold">Inmetro / Procel</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-semibold py-2">
          {cleanLHS && (
            <span className="text-white font-bold text-center sm:text-left">
              {cleanLHS} =
            </span>
          )}
          <div className="inline-flex flex-col items-center justify-center">
            <span className="px-3 py-1 border-b-2 border-emerald-400 text-emerald-100 text-center font-bold">
              {cleanNum}
            </span>
            <span className="text-emerald-300 font-black text-center pt-0.5 text-sm">
              {cleanDen}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Common electrical / efficiency formulas formatted cleanly
  if (
    formula.includes("Consumo") ||
    formula.includes("Potência") ||
    formula.includes("Watts") ||
    formula.includes("kWh")
  ) {
    return (
      <div className="my-2.5 p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-100 font-sans shadow-md">
        <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300/90 mb-1.5 flex items-center justify-between border-b border-emerald-800/60 pb-1">
          <span>Fórmula Física Oficial</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 font-bold">kWh</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-semibold py-2">
          <span className="text-white font-bold whitespace-nowrap">Consumo Mensal (kWh) =</span>
          <div className="inline-flex flex-col items-center justify-center">
            <span className="px-3 py-1 border-b-2 border-emerald-400 text-emerald-100 font-bold whitespace-nowrap">
              Potência (Watts) × Horas/dia × Dias/mês
            </span>
            <span className="text-emerald-300 font-black text-sm pt-0.5">1000</span>
          </div>
        </div>
      </div>
    );
  }

  // Generic fallback rendering for any mathematical notation
  const clean = formula
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1) ÷ ($2)")
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\div/g, "÷")
    .replace(/\\approx/g, "≈")
    .replace(/\\le/g, "≤")
    .replace(/\\ge/g, "≥")
    .replace(/\$/g, "")
    .trim();

  return (
    <div className="my-2 p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-200 font-mono text-xs overflow-x-auto text-center font-bold">
      {clean}
    </div>
  );
};
