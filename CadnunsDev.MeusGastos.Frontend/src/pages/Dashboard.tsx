import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, DollarSign, Home, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, addMonths, subMonths } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { listAccounts, listBills, listMovements } from '../services/finance';
import type { BankAccountDTO, BillResponseDTO, MovementDTO } from '../types/finance';

export function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [accounts, setAccounts] = useState<BankAccountDTO[]>([]);
  const [bills, setBills] = useState<BillResponseDTO[]>([]);
  const [movements, setMovements] = useState<MovementDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, logout, toggleTheme } = useAuth();

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      try {
        console.log("[Dashboard] Calling apis");
        const [accountsResponse, billsResponse, movementsResponse] = await Promise.all([
          listAccounts(),
          listBills(year, month),
          listMovements(year, month)
        ]);

        setAccounts(accountsResponse);
        setBills(billsResponse);
        setMovements(movementsResponse);
      } catch (err) {
        setError('Não foi possível carregar os dados do dashboard. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [currentDate]);

  const monthLabel = useMemo(() => format(currentDate, 'MMMM yyyy'), [currentDate]);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts]
  );

  const toPayBefore = useMemo(
    () => bills.filter((bill) => !bill.isPaid && bill.paymentDay <= 15).reduce((sum, bill) => sum + bill.value, 0),
    [bills]
  );

  const toPayAfter = useMemo(
    () => bills.filter((bill) => !bill.isPaid && bill.paymentDay > 15).reduce((sum, bill) => sum + bill.value, 0),
    [bills]
  );

  const accountMap = useMemo(
    () => new Map(accounts.map((account) => [account.accountId, account.name])),
    [accounts]
  );

  const movementsWithDetails = useMemo(
    () =>
      movements.map((movement) => ({
        ...movement,
        accountName: accountMap.get(movement.accountId) ?? 'Conta'
      })),
    [movements, accountMap]
  );

  const totalIncome = useMemo(
    () => movements.filter((movement) => movement.value > 0).reduce((sum, movement) => sum + movement.value, 0),
    [movements]
  );

  const totalExpense = useMemo(
    () => movements.filter((movement) => movement.value < 0).reduce((sum, movement) => sum + movement.value, 0),
    [movements]
  );

  const overviewCards = useMemo(
    () => [
      { title: 'Receitas', value: totalIncome },
      { title: 'Despesas', value: Math.abs(totalExpense) },
      { title: 'Fluxo líquido', value: totalIncome + totalExpense }
    ],
    [totalIncome, totalExpense]
  );

  const distributionItems = useMemo(() => {
    const accountValues = accounts.map((account) => {
      const accountTotal = movements
        .filter((movement) => movement.accountId === account.accountId)
        .reduce((sum, movement) => sum + Math.abs(movement.value), 0);

      return {
        category: account.name,
        value: accountTotal
      };
    });

    if (accountValues.length > 0) return accountValues;

    return [{ category: 'Sem movimentações', value: 0 }];
  }, [accounts, movements]);

  const nextBills = useMemo(
    () => bills
      .filter((bill) => !bill.isPaid)
      .sort((a, b) => a.paymentDay - b.paymentDay)
      .slice(0, 4),
    [bills]
  );

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
              <Wallet className="h-4 w-4" /> Tema
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

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700/50 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

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
                {loading ? (
                  <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">Carregando contas...</div>
                ) : accounts.length === 0 ? (
                  <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">Nenhuma conta encontrada.</div>
                ) : (
                  accounts.map((account) => (
                    <div key={account.accountId} className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-900">
                      <span>{account.name}</span>
                      <strong>R$ {account.balance.toFixed(2)}</strong>
                    </div>
                  ))
                )}
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
                    <th className="px-4 py-3">Conta</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Carregando movimentações...</td>
                    </tr>
                  ) : movementsWithDetails.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Nenhuma movimentação encontrada para este mês.</td>
                    </tr>
                  ) : (
                    movementsWithDetails.map((movement) => (
                      <tr key={movement.movementId} className="hover:bg-slate-50 dark:hover:bg-slate-900/80">
                        <td className="px-4 py-4 text-slate-900 dark:text-slate-100">{movement.description}</td>
                        <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{movement.accountName}</td>
                        <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{format(new Date(movement.date), 'dd/MM/yyyy')}</td>
                        <td className={`px-4 py-4 text-right font-semibold ${movement.value >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          R$ {Math.abs(movement.value).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <aside className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Visão geral</p>
            <div className="mt-5 grid gap-4">
              {overviewCards.map((card) => (
                <div key={card.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{card.title}</p>
                  <p className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">R$ {card.value.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Distribuição</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Por conta</h2>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {distributionItems.map((item) => (
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
              {nextBills.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">Nenhuma conta pendente para este mês.</div>
              ) : (
                nextBills.map((bill) => (
                  <div key={bill.billId} className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 px-4 py-4 dark:bg-slate-900">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{bill.billDescription}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Vencimento dia {bill.paymentDay}</p>
                    </div>
                    <span className={`rounded-2xl px-3 py-1 text-sm font-semibold ${bill.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {bill.isPaid ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}
