import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { createBill, deleteBill, listBills, searchCategories } from '../services/finance';
import type { BillResponseDTO, CategorySuggestionDTO, NewBillDTO } from '../types/finance';
import { MonthSelector } from '@/components/MonthSelector';
import { NumericFormat } from 'react-number-format';
import { BRL } from '@/services/currency';

export function Bills() {
  const today = new Date();
  const [bills, setBills] = useState<BillResponseDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [value, setValue] = useState<number | undefined>();
  const [paymentDay, setPaymentDay] = useState('1');
  const [repeatNextMonth, setRepeatNextMonth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<CategorySuggestionDTO[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    void fetchBills();
  }, [year, month]);

  useEffect(() => {
    if (category.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);

        const data = await searchCategories(category);

        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [category]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await listBills(year, month);
      setBills(data.sort((a, b) => a.paymentDay - b.paymentDay));
    } catch {
      setError('Não foi possível carregar as contas a pagar.');
    } finally {
      setLoading(false);
    }
  };

  const setCurrentDate = (date: Date) => {
    setYear(date.getFullYear());
    setMonth(date.getMonth());
  }

  const handleCreateBill = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedValue = Number(value);
    const parsedPaymentDay = parseInt(paymentDay, 10);

    if (!description.trim() || !category.trim() || Number.isNaN(parsedValue) || Number.isNaN(parsedPaymentDay)) {
      setError('Preencha todos os campos corretamente.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const newBill = await createBill(year, month, {
        description,
        category,
        value: parsedValue,
        paymentDay: parsedPaymentDay,
        repeatValueNextMonth: repeatNextMonth
      } as NewBillDTO);

      setBills((current) => [newBill, ...current]);
      setIsOpen(false);
      setDescription('');
      setCategory('');
      setValue(undefined);
      setPaymentDay('1');
      setRepeatNextMonth(true);
    } catch {
      setError('Não foi possível salvar a fatura.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    setError('');

    try {
      await deleteBill(year, month, billId);
      setBills((current) => current.filter((bill) => bill.billId !== billId));
    } catch {
      setError('Não foi possível remover a fatura.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Contas a pagar</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Gerencie suas faturas</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MonthSelector
            date={new Date(year, month - 1, 1)}
            onDateChange={date => setCurrentDate(date)} />
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" /> Nova fatura
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.2em] dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3 text-center">Pago</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  Carregando faturas...
                </td>
              </tr>
            ) : bills.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  Nenhuma fatura encontrada para este mês.
                </td>
              </tr>
            ) : (
              bills.map((bill) => (
                <tr key={bill.billId} className="hover:bg-slate-50 dark:hover:bg-slate-900/80">
                  <td className="px-4 py-4 text-slate-900 dark:text-slate-100">{bill.billDescription}</td>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{bill.category}</td>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400">Dia {bill.paymentDay}</td>
                  <td className="px-4 py-4 text-slate-900 dark:text-slate-100">{BRL(bill.value)}</td>
                  <td className="px-4 py-4 text-center text-sm font-semibold">
                    <span className={`inline-flex rounded-full px-3 py-1 ${bill.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {bill.isPaid ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-slate-500 dark:text-slate-400">
                    <button
                      onClick={() => handleDeleteBill(bill.billId)}
                      className="inline-flex items-center gap-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" /> Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Nova conta a pagar</h2>
              <button className="text-slate-500 hover:text-slate-900 dark:text-slate-400" onClick={() => setIsOpen(false)}>
                Fechar
              </button>
            </div>
            <form className="mt-6 grid gap-4" onSubmit={handleCreateBill}>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Descrição"
                required
              />
              <NumericFormat
                value={value}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                inputMode="decimal"
                placeholder="Valor"
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale
                prefix="R$ "
                allowNegative={false}
                onValueChange={(values) => {
                  setValue(values.floatValue);
                }}
                required
              />
              <input
                value={paymentDay}
                onChange={(e) => setPaymentDay(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Dia de pagamento"
                type="number"
                min="1"
                max="31"
                required
              />
              <div ref={wrapperRef} className="relative">
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Categoria"
                  required
                />

                {showSuggestions && (
                  <div className="absolute left-0 right-0 z-20 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                    {suggestions.map((item) => (
                      <button
                        key={item.categoryId}
                        type="button"
                        onClick={() => {
                          setCategory(item.description);
                          setShowSuggestions(false);
                        }}
                        className="block w-full px-4 py-3 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        {item.description}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                <input
                  type="checkbox"
                  checked={repeatNextMonth}
                  onChange={(e) => setRepeatNextMonth(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                />
                Continuar com o mesmo valor no próximo mês
              </label>
              <button
                type="submit"
                className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar fatura'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
