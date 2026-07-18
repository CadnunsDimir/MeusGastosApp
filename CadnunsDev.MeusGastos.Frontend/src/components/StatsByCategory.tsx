import { useState, useMemo } from "react";
import { BRL } from "@/services/currency";
import { DashboardItemDTO } from "@/types/finance";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChart as ChartIcon, List as TableIcon } from "lucide-react";

interface StatsByCategoryProps {
  categories: DashboardItemDTO[];
}

// Paleta de cores vintage-ledger, derivada de brass/stamp/sage/brick
const COLORS = [
  "#C08A3E", "#2f496b", "#9C3B2E", "#4f6b78",
  "#D9A94F", "#7FA8D9", "#B8926A", "#A85C42",
  "#5F7F8A", "#D4A574", "#6B5B54", "#9B8B7E"
];

export function StatsByCategory({ categories }: StatsByCategoryProps) {
  const [view, setView] = useState<"chart" | "table">("chart");

  // Filtra categorias com valor zerado para não poluírem o gráfico
  const activeCategories = useMemo(() => {
    return categories.filter(cat => cat.totalSum > 0);
  }, [categories]);

  // Calcula o total geral para exibir a porcentagem no tooltip
  const totalAmount = useMemo(() => {
    return activeCategories.reduce((acc, cat) => acc + cat.totalSum, 0);
  }, [activeCategories]);

  // Formata os dados para o Recharts
  const chartData = useMemo(() => {
    return activeCategories.map((cat) => ({
      name: cat.category,
      value: cat.totalSum,
    }));
  }, [activeCategories]);

  return (
    <article className="rounded-2xl border border-rule bg-white p-6 shadow-sm dark:border-rule-dark dark:bg-panel">
      {/* Cabeçalho com Alternador de Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4 dark:border-rule-dark">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-sage dark:text-sage-light font-medium">
            Visão geral
          </p>
          <h3 className="font-display text-lg font-semibold text-ink dark:text-paper mt-1">
            Gastos por Categoria
          </h3>
        </div>

        {/* Abas de Navegação (Tabs) */}
        <div className="flex bg-paper-dark/40 dark:bg-night-soft p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setView("chart")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "chart"
                ? "bg-white text-ink shadow-sm dark:bg-panel dark:text-paper"
                : "text-ink-soft hover:text-ink dark:text-stone dark:hover:text-paper"
            }`}
          >
            <ChartIcon size={16} />
            Gráfico
          </button>
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "table"
                ? "bg-white text-ink shadow-sm dark:bg-panel dark:text-paper"
                : "text-ink-soft hover:text-ink dark:text-stone dark:hover:text-paper"
            }`}
          >
            <TableIcon size={16} />
            Tabela
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="mt-6 min-h-[350px] flex items-center justify-center">
        {view === "chart" ? (
          activeCategories.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum dado financeiro registrado.</p>
          ) : (
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60} // Estilo Donut (mude para 0 se quiser pizza cheia)
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [
                      `${BRL(value)} (${((value / totalAmount) * 100).toFixed(1)}%)`,
                      "Total",
                    ]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-slate-650 dark:text-slate-350 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )
        ) : (
          /* Visualização da Tabela Original (Melhorada para economizar espaço vertical) */
          <div className="w-full max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid gap-3">
              {categories.map((cat, index) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between rounded-2xl border border-rule bg-paper-dark/20 p-4 dark:border-rule-dark dark:bg-night-soft/40 hover:bg-paper-dark/30 dark:hover:bg-night-soft transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Indicador de cor correspondente ao gráfico */}
                    {cat.totalSum > 0 && (
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[activeCategories.indexOf(cat) % COLORS.length] }}
                      />
                    )}
                    <p className="text-sm font-medium text-ink dark:text-paper">
                      {cat.category}
                    </p>
                  </div>
                  <p className="text-md font-semibold text-ink dark:text-paper">
                    {BRL(cat.totalSum)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}