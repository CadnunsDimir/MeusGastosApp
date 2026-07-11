const PtBRCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function BRL(value: number): string{
    return PtBRCurrencyFormatter.format(value);
}