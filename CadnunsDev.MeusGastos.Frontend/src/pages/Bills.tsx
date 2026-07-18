import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { createBill, deleteBill, listBills, searchCategories } from '../services/finance';
import type { BillResponseDTO, CategorySuggestionDTO, NewBillDTO } from '../types/finance';
import { MonthSelector } from '@/components/MonthSelector';
import { NumericFormat } from 'react-number-format';
import { BRL } from '@/services/currency';
import { useNavigate } from 'react-router-dom';
import { uiClasses } from '@/styles/theme';

export function Bills() {
  const navigate = useNavigate();
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
        <div className="flex flex-nowrap items-center gap-5">
          <button
            onClick={() => navigate('/dashboard')}
            className={uiClasses.pageBackButton}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className={uiClasses.pageSubtitle}>Contas a pagar</p>
            <h1 className={uiClasses.pageTitle}>Gerencie suas faturas</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MonthSelector
            date={new Date(year, month - 1, 1)}
            onDateChange={date => setCurrentDate(date)} />
          <button
            onClick={() => setIsOpen(true)}
            className={uiClasses.primaryButton}
          >
            <Plus className="h-4 w-4" /> Nova fatura
          </button>
        </div>
      </div>

      <div className={`mt-6 ${uiClasses.tableCard}`}>
        <table className="min-w-full divide-y divide-rule text-left text-sm dark:divide-rule-dark">
          <thead className={uiClasses.tableHead}>
            <tr>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3 text-center">Pago</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule dark:divide-rule-dark">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft dark:text-stone">
                  Carregando faturas...
                </td>
              </tr>
            ) : bills.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft dark:text-stone">
                  Nenhuma fatura encontrada para este mês.
                </td>
              </tr>
            ) : (
              bills.map((bill) => (
                <tr key={bill.billId} className={uiClasses.tableRowHover}>
                  <td className="px-4 py-4 text-ink dark:text-paper">{bill.billDescription}</td>
                  <td className="px-4 py-4 text-ink-soft dark:text-stone">{bill.category}</td>
                  <td className="px-4 py-4 text-ink-soft dark:text-stone">Dia {bill.paymentDay}</td>
                  <td className="px-4 py-4 font-mono text-ink dark:text-paper">{BRL(bill.value)}</td>
                  <td className="px-4 py-4 text-center text-sm font-semibold">
                    <span className={`inline-flex rounded-full px-3 py-1 ${bill.isPaid ? 'bg-stamp/10 text-stamp dark:bg-stamp-light/10 dark:text-stamp-light' : 'bg-brick/10 text-brick dark:bg-brick-light/10 dark:text-brick-light'}`}>
                      {bill.isPaid ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-ink-soft dark:text-stone">
                    <button
                      onClick={() => handleDeleteBill(bill.billId)}
                      className="inline-flex items-center gap-1 text-brick hover:text-brick-light dark:text-brick-light"
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

      {error && <p className="mt-4 text-sm text-brick dark:text-brick-light">{error}</p>}

      {isOpen && (
        <div className={uiClasses.modalOverlay}>
          <div className={uiClasses.modalPanel}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink dark:text-paper">Nova conta a pagar</h2>
              <button className="text-ink-soft hover:text-ink dark:text-stone dark:hover:text-paper" onClick={() => setIsOpen(false)}>
                Fechar
              </button>
            </div>
            <form className="mt-6 grid gap-4" onSubmit={handleCreateBill}>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={uiClasses.formInput}
                placeholder="Descrição"
                required
              />
              <NumericFormat
                value={value}
                className={uiClasses.formInput}
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
                className={uiClasses.formInput}
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
                  className={uiClasses.formInput}
                  placeholder="Categoria"
                  required
                />

                {showSuggestions && (
                  <div className="absolute left-0 right-0 z-20 mt-1 rounded-xl border border-rule bg-white shadow-lg dark:border-rule-dark dark:bg-panel">
                    {suggestions.map((item) => (
                      <button
                        key={item.categoryId}
                        type="button"
                        onClick={() => {
                          setCategory(item.description);
                          setShowSuggestions(false);
                        }}
                        className="block w-full px-4 py-3 text-left text-sm hover:bg-paper-dark/30 dark:hover:bg-night-soft"
                      >
                        {item.description}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <label className="inline-flex items-center gap-3 rounded-2xl border border-rule bg-paper-dark/30 px-4 py-3 text-sm text-ink dark:border-rule-dark dark:bg-night dark:text-paper">
                <input
                  type="checkbox"
                  checked={repeatNextMonth}
                  onChange={(e) => setRepeatNextMonth(e.target.checked)}
                  className="h-4 w-4 rounded border-rule text-brass focus:ring-brass"
                />
                Continuar com o mesmo valor no próximo mês
              </label>
              <button
                type="submit"
                className="rounded-2xl bg-brass px-4 py-3 text-sm font-semibold text-white transition hover:bg-brass-dark disabled:cursor-not-allowed disabled:opacity-60"
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
