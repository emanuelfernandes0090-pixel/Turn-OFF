import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Zap,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Phone,
  Info,
} from "lucide-react";
import { AccessibilitySettings } from "../types";

interface SafetyGuideProps {
  settings: AccessibilitySettings;
}

const MYTHS = [
  {
    id: "myth-220v",
    title: 'Mito: "Equipamentos 220V gastam metade da energia que em 127V"',
    verdict: "Falso",
    reality:
      "A conta de luz cobra por quilowatt-hora (kWh), que é Potência (W) multiplicada pelo tempo. Um ferro de passar de 1.000 Watts consome exatamente a mesma energia em 127V ou 220V. Em 220V, a corrente elétrica (amperes) é menor, o que permite cabos mais finos e menores perdas por aquecimento nos fios em distâncias longas, mas o consumo cobrado na fatura é rigorosamente o mesmo.",
    simple:
      "220V não gasta menos que 110V. O que gasta energia é a potência do aparelho e o tempo que fica ligado.",
  },
  {
    id: "myth-breaker",
    title: 'Mito: "Se o disjuntor do chuveiro está desarmando, basta trocar por um disjuntor maior"',
    verdict: "Perigo Extremo",
    reality:
      "O disjuntor é uma proteção térmica e magnética projetada para proteger os fios dentro da parede contra derretimento e incêndio. Se o disjuntor desarma, significa que a corrente do chuveiro superou o limite de segurança da fiação. Colocar um disjuntor maior sem substituir os condutores por fios de bitola adequada (ex: 6 mm² ou 10 mm²) transformará os fios dentro do conduite em uma resistência incandescente, gerando alto risco de incêndio estrutural.",
    simple:
      "Nunca aumente o disjuntor sem trocar os fios com um eletricista. O disjuntor desarma para a casa não pegar fogo.",
  },
  {
    id: "myth-light-turn-off",
    title: 'Mito: "Apagar e acender a lâmpada toda hora consome um pico enorme de energia"',
    verdict: "Falso",
    reality:
      "O surto elétrico de partida em lâmpadas LED e eletrônicas dura poucos milissegundos e consome o equivalente a menos de 1 segundo de funcionamento normal. Se você for sair do cômodo por mais de 1 minuto, vale a pena apagar a luz.",
    simple:
      "Pode apagar a luz sempre que sair da sala ou quarto. O pico ao ligar não gasta quase nada.",
  },
  {
    id: "myth-standby",
    title: 'Mito: "Aparelhos na tomada em modo Standby (luzinha vermelha) não gastam nada"',
    verdict: "Falso",
    reality:
      "Aparelhos como decodificadores de TV por assinatura, videogames, micro-ondas com relógio, receptores e fontes de notebook conectados continuam consumindo de 2 W a 25 W continuamente. Em uma residência média com múltiplos itens, o consumo fantasma de standby pode representar entre 5% e 12% da conta de luz todo mês.",
    simple:
      "As luzinhas e relógios dos aparelhos gastam energia 24 horas por dia se ficarem na tomada.",
  },
  {
    id: "myth-fridge-wall",
    title: 'Mito: "Aproximar a geladeira da parede ou colocar roupas para secar atrás é inofensivo"',
    verdict: "Perigo e Desperdício",
    reality:
      "A grade traseira da geladeira (condensador) precisa dissipar o calor extraído de dentro do aparelho para o ar ambiente. Colocar roupas ou encostar/aproximar a geladeira da parede bloqueia a circulação de ar, impedindo a dissipação de calor e fazendo com que o compressor trabalhe sob sobreaquecimento e fique ligado até 30% mais tempo por dia, além de encurtar drasticamente a vida útil do motor.",
    simple:
      "Nunca seque panos ou roupas atrás da geladeira nem a encoste na parede. Deixe ao menos 10 cm de espaço livre para o ar circular.",
  },
  {
    id: "myth-generator",
    title: 'Mito: "Posso ligar um gerador a combustível direto numa tomada da casa durante a falta de energia"',
    verdict: "Perigo Extremo",
    reality:
      "Sem uma chave de transferência reversível (transfer switch) que isole fisicamente a residência da rede pública, a energia do gerador pode retroalimentar a rede da distribuidora (backfeed). Isso coloca em risco imediato de morte eletricistas trabalhando nos postes da rua acreditando que a rede está desenergizada, além de poder danificar ou explodir o gerador quando a energia da concessionária retornar de repente.",
    simple:
      "Nunca plugue gerador direto na tomada sem chave de transferência. Você pode eletrocutar os técnicos na rua e destruir seu gerador.",
  },
  {
    id: "myth-thick-wire",
    title: 'Mito: "Colocar fio mais grosso na instalação da casa toda derruba o valor da conta de luz"',
    verdict: "Falso",
    reality:
      "A bitola do fio afeta as perdas por aquecimento (efeito Joule) de forma mínima nas distâncias curtas de uma residência. Embora fios dimensionados corretamente sejam essenciais para segurança contra incêndios e estabilidade de tensão, o medidor registra o trabalho útil dos aparelhos. Trocar cabos além da norma não derruba a conta; o que reduz a fatura é a eficiência e o tempo de uso dos equipamentos.",
    simple:
      "Fio mais grosso não derruba a conta de luz. Ele serve para proteger a fiação contra fogo e sobrecarga, não para diminuir o consumo dos aparelhos.",
  },
  {
    id: "myth-benjamim-small",
    title: 'Mito: "Benjamim/T de tomada aguenta qualquer coisa desde que os aparelhos sejam pequenos"',
    verdict: "Perigo",
    reality:
      "A soma das correntes elétricas de vários aparelhos pequenos ligados ao mesmo tempo pode superar facilmente o limite do adaptador (geralmente 10A) e da própria tomada. Essa sobrecarga de contato gera superaquecimento invisível, derretimento de plástico e faíscas, figurando entre as principais causas de curtos-circuitos residenciais.",
    simple:
      "Vários aparelhos pequenos no mesmo T somam força de corrente e podem superaquecer a tomada e iniciar fogo.",
  },
  {
    id: "myth-hidden-wire-risk",
    title: 'Mito: "Se o fio não está desencapado visivelmente à vista, não há risco de choque"',
    verdict: "Falso",
    reality:
      "O isolamento de cabos elétricos antigos se deteriora internamente com o tempo (ressecamento térmico, perda de flexibilidade e roeduras de insetos/roedores dentro de conduítes e forros) sem nenhum sinal visível externo. Isso pode energizar paredes úmidas e carcaças de eletrodomésticos, gerando risco severo de choque. Instalações antigas devem passar por inspeção periódica com eletricista habilitado.",
    simple:
      "Fios velhos estragam por dentro da parede mesmo parecendo perfeitos por fora. Peça revisão periódica com eletricista.",
  },
  {
    id: "myth-shower-season-switch",
    title: 'Mito: "A chave Verão/Inverno do chuveiro só deixa a água mais quente, não muda a conta"',
    verdict: "Falso",
    reality:
      "A posição Inverno aciona uma seção de menor comprimento da resistência, resultando em maior potência elétrica em Watts (ex: 5.500 W a 7.500 W vs. 3.500 W no Verão). Isso significa mais quilowatts-hora consumidos a cada minuto de banho. Manter o chuveiro na posição Verão sempre que o clima estiver ameno reduz entre 30% e 40% o gasto elétrico de cada banho.",
    simple:
      "A posição Inverno gasta muito mais energia por minuto porque aciona a potência máxima da resistência. Use Verão para economizar.",
  },
];

export const SafetyGuide: React.FC<SafetyGuideProps> = ({ settings }) => {
  const [openMyth, setOpenMyth] = useState<string | null>("myth-breaker");

  return (
    <div id="safety-guide-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider border border-red-200 dark:border-red-800">
          <ShieldAlert className="w-3.5 h-3.5" />
          Segurança da Vida em Primeiro Lugar
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
          Guia de Segurança Elétrica Residencial & Mitos
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          {settings.simpleLanguage
            ? "Economizar energia nunca deve colocar sua vida ou sua casa em risco. Veja os sinais de perigo e o que nunca fazer na instalação elétrica."
            : "Diretrizes técnicas fundamentadas na NBR 5410 e boas práticas de proteção contra choques, sobreaquecimentos e incêndios elétricos."}
        </p>
      </div>

      {/* Critical Danger Signs Grid */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-base">
          <AlertTriangle className="w-5 h-5" />
          6 Sinais Visíveis de Perigo Imediato (Inspeção Visual Segura)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Tomadas ou Plugues Aquecendo",
              desc: "Indica mau contato ou sobrecarga. O plástico pode derreter e iniciar fogo dentro da caixa de alvenaria.",
            },
            {
              title: "Cheiro de Queimado ou Marcas Escuras",
              desc: "Manchas pretas ao redor de furos de tomadas revelam arco elétrico ou temperatura acima do limite do isolamento.",
            },
            {
              title: "Faíscas ao Conectar Equipamentos",
              desc: "Pequenos arcos ao plugar aparelhos pesados exigem revisão nos contatos internos da tomada.",
            },
            {
              title: "Fios Descascados ou Emendas Expostas",
              desc: "Fita isolante ressecada ou cabos expostos oferecem risco de choque letal direto, especialmente com crianças e animais.",
            },
            {
              title: "Disjuntor Desarmando Frequente",
              desc: "A fiação do circuito está sofrendo corrente acima da capacidade contínua segura calculada.",
            },
            {
              title: 'Múltiplos "Benjamins" e Extensões',
              desc: "Ligar micro-ondas, air fryer ou torneira elétrica na mesma extensão multiplica a corrente suportada pelo condutor.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 space-y-1.5"
            >
              <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold text-xs sm:text-sm">
                <Flame className="w-4 h-4 text-red-600 shrink-0" />
                {item.title}
              </div>
              <p className="text-[11px] sm:text-xs text-red-950 dark:text-red-200/80 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* What NOT to do under any circumstances */}
      <div className="p-6 sm:p-8 bg-red-900 text-white rounded-3xl shadow-lg space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950 text-red-200 text-xs font-bold uppercase tracking-wider">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            Regras de Ouro de Segurança
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk']">
            O Que NUNCA Fazer em Hipótese Alguma
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 bg-red-950/70 rounded-2xl border border-red-800/60 space-y-1">
            <strong className="text-red-200 block text-sm">
              1. Não quebre nem remova o pino central (terra)
            </strong>
            <p className="text-red-300 leading-relaxed text-xs">
              O terceiro pino conduz fugas elétricas de carcaças metálicas para o solo. Sem ele, seu corpo vira o condutor de fuga ao encostar na máquina de lavar ou micro-ondas.
            </p>
          </div>

          <div className="p-4 bg-red-950/70 rounded-2xl border border-red-800/60 space-y-1">
            <strong className="text-red-200 block text-sm">
              2. Nunca troque disjuntor sem trocar a fiação
            </strong>
            <p className="text-red-300 leading-relaxed text-xs">
              Disjuntor maior não "dá mais força", apenas deixa os fios esquentarem até derreter o PVC dentro da sua parede.
            </p>
          </div>

          <div className="p-4 bg-red-950/70 rounded-2xl border border-red-800/60 space-y-1">
            <strong className="text-red-200 block text-sm">
              3. Nunca manuseie aparelhos molhado ou descalço
            </strong>
            <p className="text-red-300 leading-relaxed text-xs">
              A água e a umidade nos pés reduzem a resistência elétrica natural da pele, tornando qualquer choque leve potencialmente letal.
            </p>
          </div>

          <div className="p-4 bg-red-950/70 rounded-2xl border border-red-800/60 space-y-1">
            <strong className="text-red-200 block text-sm">
              4. Não improvise fusíveis com papel alumínio ou fios de cobre
            </strong>
            <p className="text-red-300 leading-relaxed text-xs">
              Gambiarra em circuitos de proteção anula completamente a segurança contra curto-circuitos catastróficos.
            </p>
          </div>
        </div>
      </div>

      {/* Myths vs Technical Reality Accordion */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            Mitos Comuns da Eletricidade Residencial vs Realidade Técnica
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Clique em cada mito para entender a explicação técnica comprovada:
          </p>
        </div>

        <div className="space-y-3">
          {MYTHS.map((myth) => {
            const isOpen = openMyth === myth.id;
            return (
              <div
                key={myth.id}
                id={`myth-accordion-${myth.id}`}
                className="rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenMyth(isOpen ? null : myth.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        myth.verdict === "Perigo Extremo"
                          ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                          : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {myth.verdict}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {myth.title}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                    <p>{settings.simpleLanguage ? myth.simple : myth.reality}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
