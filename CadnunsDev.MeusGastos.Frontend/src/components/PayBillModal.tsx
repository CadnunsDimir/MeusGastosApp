import { BRL } from '@/services/currency';
import { payBill } from '@/services/finance';
import { BankAccountDTO, BillResponseDTO, PayBillDTO } from '@/types/finance';
import { useState, useEffect } from 'react';

interface PayBillModalProps {
  isOpen: boolean;
  accounts: BankAccountDTO[];
  bill: BillResponseDTO | null;
  setIsOpen: (open: boolean) => void;
  onSuccess?: (payload: PayBillDTO, response: BillResponseDTO) => void;
}

export function PayBillModal({
  isOpen,
  accounts,
  bill,
  setIsOpen,
  onSuccess
}: PayBillModalProps) {
  const [date, setDate] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) return;
    setDate('');
    setSelectedAccountId('');
    setError(null);
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if(bill == null) return;

    setError(null);
    setIsSubmitting(true);

    const payload: PayBillDTO = {
      billId: bill.billId,
      date,
      accountId: selectedAccountId
    };

    try {
      const data = await payBill(payload);
      setIsOpen(false);
      onSuccess?.(payload, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado ao processar o pagamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Pagar conta
              </h2>
              <button
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Fechar
              </button>
            </div>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Data"
                type="date"
                required
              />
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                required
              >
                <option value="">Selecione uma conta</option>
                {accounts.map((account) => (
                  <option key={account.accountId} value={account.accountId}>
                    {account.name} ({ BRL(account.balance)})
                  </option>
                ))}
              </select>

              {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

              <button
                className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processando...' : 'Pagar conta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}