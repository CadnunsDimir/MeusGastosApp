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
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900">
            <button
                onClick={() => onDateChange(subMonths(date, 1))}
                className="rounded-2xl p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Mês anterior"
            >
                <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{monthLabel}</span>
            <button
                onClick={() => onDateChange(addMonths(date, 1))}
                className="rounded-2xl p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Próximo mês"
            >
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    )
}