import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, DollarSign, Home, Moon, Sun, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, addMonths, subMonths } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

const dummyAccounts = [
  { name: 'Itaú', balance: 6520.4 },
  { name: 'Inter', balance: 3280.7 },
  { name: 'Santander', balance: 1740.2 }
];

const dummyBills = [
  { description: 'Internet', value: 120.0, paymentDay: 10, isPaid: false },
  { description: 'Aluguel', value: 1800.0, paymentDay: 5, isPaid: true },
  { description: 'Energia', value: 210.0, paymentDay: 18, isPaid: false }
];

const dummyMovements = [
  { id: '1', description: 'Salário', amount: 7900, category: 'Receita', date: '2026-07-01', type: 'income' },
  { id: '2', description: 'Supermercado', amount: -450, category: 'Alimentação', date: '2026-07-06', type: 'expense' },
  { id: '3', description: 'Investimento', amount: 1200, category: 'Investimentos', date: '2026-07-08', type: 'income' },
  { id: '4', description: 'Farmácia', amount: -95, category: 'Saúde', date: '2026-07-11', type: 'expense' }
];

const categoryDistribution = [
  { category: 'Receita', value: 7900 },
  { category: 'Alimentação', value: 450 },
  { category: 'Investimentos', value: 1200 },
  { category: 'Saúde', value: 95 }
];

export function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { user, logout, toggleTheme } = useAuth();

  const totalBalance = useMemo(
    () => dummyAccounts.reduce((sum, account) => sum + account.balance, 0),
    []
  );

  const toPayBefore = useMemo(
    () => dummyBills.filter((bill) => bill.paymentDay <= 15).reduce((sum, bill) => sum + bill.value, 0),
    []
  );

  const toPayAfter = useMemo(
    () => dummyBills.filter((bill) => bill.paymentDay > 15).reduce((sum, bill) => sum + bill.value, 0),
    []
  );

  const monthLabel = format(currentDate, 'MMMM yyyy');

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">Olá, {user?.name || 'usuário'}</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Veja seu fluxo financeiro e acompanhe contas, movimentações e saldos.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Sun className="h-4 w-4" /> Tema
            </button>
            <Link
              to="/accounts"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              Contas
            </Link>
            <Link
              to="/bills"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              Faturas
            </Link>
            <Link
              to="/movements"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              Movimentações
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              <ArrowRight className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Saldo Total</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">R$ {totalBalance.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-700/10 dark:text-emerald-200">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {dummyAccounts.map((account) => (
                  <div key={account.name} className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-900">
                    <span>{account.name}</span>
                    <strong>R$ {account.balance.toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Contas a pagar</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">Resumo mensal</h2>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <Home className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Até dia 15</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">R$ {toPayBefore.toFixed(2)}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Após dia 15</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">R$ {toPayAfter.toFixed(2)}</p>
                </div>
              </div>
            </article>
          </div>

          <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Movimentações</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Este mês</h2>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900">
                <button
                  onClick={() => setCurrentDate((date) => subMonths(date, 1))}
                  className="rounded-2xl p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Mês anterior"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{monthLabel}</span>
                <button
                  onClick={() => setCurrentDate((date) => addMonths(date, 1))}
                  className="rounded-2xl p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Próximo mês"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                <thead>
                  <tr className="text-slate-500 uppercase tracking-[0.2em] text-xs dark:text-slate-400">
                    <th className="px-4 py-3">Descrição</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dummyMovements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/80">
                      <td className="px-4 py-4 text-slate-900 dark:text-slate-100">{movement.description}</td>
                      <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{movement.category}</td>
                      <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{format(new Date(movement.date), 'dd/MM/yyyy')}</td>
                      <td className={`px-4 py-4 text-right font-semibold ${movement.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                        R$ {Math.abs(movement.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <aside className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Visão geral</p>
            <div className="mt-5 grid gap-4">
              {['Salário', 'Investimentos', 'Poupança', 'Compras'].map((card) => (
                <div key={card} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{card}</p>
                  <p className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">R$ {Math.floor(Math.random() * 3000 + 400).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Distribuição</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Por categoria</h2>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {categoryDistribution.map((item) => (
                <div key={item.category} className="flex items-center justify-between gap-3 rounded-3xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-900">
                  <span>{item.category}</span>
                  <strong>R$ {item.value.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Próximas contas</p>
            <div className="mt-5 space-y-4">
              {dummyBills.map((bill) => (
                <div key={bill.description} className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 px-4 py-4 dark:bg-slate-900">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{bill.description}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Vencimento dia {bill.paymentDay}</p>
                  </div>
                  <span className={`rounded-2xl px-3 py-1 text-sm font-semibold ${bill.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {bill.isPaid ? 'Pago' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}
