import { format } from "date-fns";

export function formatDateOnly(date: string) {
    return format(new Date(date + "T00:00:00"), 'dd/MM/yyyy')
}