import { addMonths, format, subMonths } from "date-fns";
import { ptBR } from 'date-fns/locale/pt-BR';
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo } from "react";

export interface MonthSelectorProps{
    date: Date | string;
    onDateChange: (newDate: Date) => void;
}

export function MonthSelector({
    date,
    onDateChange
}: MonthSelectorProps) {
    const monthLabel = useMemo(() => format(date, 'MMMM yyyy', { locale: ptBR }), [date]);

    return (
        <div className="flex items-center gap-2 rounded-2xl border border-rule bg-paper-dark/30 p-2 dark:border-rule-dark dark:bg-night-soft">
            <button
                onClick={() => onDateChange(subMonths(date, 1))}
                className="rounded-2xl p-2 text-ink-soft transition hover:bg-paper-dark/50 dark:text-stone dark:hover:bg-panel"
                aria-label="Mês anterior"
            >
                <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-sm font-mono text-ink dark:text-paper">{monthLabel}</span>
            <button
                onClick={() => onDateChange(addMonths(date, 1))}
                className="rounded-2xl p-2 text-ink-soft transition hover:bg-paper-dark/50 dark:text-stone dark:hover:bg-panel"
                aria-label="Próximo mês"
            >
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    )
}