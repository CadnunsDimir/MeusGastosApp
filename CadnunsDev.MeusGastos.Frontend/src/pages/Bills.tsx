import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Bill {
  id: string;
  billDescription: string;
  value: number;
  paymentDay: number;
  category: string;
  isPaid: boolean;
}

const dummyBills: Bill[] = [
  { id: '1', billDescription: 'Internet', value: 120, paymentDay: 10, category: 'Utilities', isPaid: false },
  { id: '2', billDescription: 'Aluguel', value: 1800, paymentDay: 5, category: 'Moradia', isPaid: true }
];

export function Bills() {
  const [bills, setBills] = useState<Bill[]>(dummyBills);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Contas a pagar</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Gerencie suas faturas</h1>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" /> Nova fatura
        </button>
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
            {bills.map((bill) => (
              <tr key={bill.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/80">
                <td className="px-4 py-4 text-slate-900 dark:text-slate-100">{bill.billDescription}</td>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{bill.category}</td>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400">Dia {bill.paymentDay}</td>
                <td className="px-4 py-4 text-slate-900 dark:text-slate-100">R$ {bill.value.toFixed(2)}</td>
                <td className="px-4 py-4 text-center text-sm font-semibold">
                  <span className={`inline-flex rounded-full px-3 py-1 ${bill.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {bill.isPaid ? 'Sim' : 'Não'}
                  </span>
                </td>
                <td className="px-4 py-4 text-right text-slate-500 dark:text-slate-400">
                  <button className="mr-3 inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
                    <Pencil className="h-4 w-4" /> Editar
                  </button>
                  <button className="inline-flex items-center gap-1 text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" /> Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Nova conta a pagar</h2>
              <button className="text-slate-500 hover:text-slate-900 dark:text-slate-400" onClick={() => setIsOpen(false)}>
                Fechar
              </button>
            </div>
            <form className="mt-6 grid gap-4">
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Descrição" />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Valor" type="number" />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Dia de pagamento" type="number" />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Categoria" />
              <button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600">
                Salvar fatura
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
