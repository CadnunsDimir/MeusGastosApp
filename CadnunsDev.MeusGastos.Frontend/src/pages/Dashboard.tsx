import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, DollarSign, Home, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboard, listAccounts, listBills, listMovements } from '../services/finance';
import type { BankAccountDTO, BillResponseDTO, DashboardItemDTO, MovementDTO } from '../types/finance';
import { formatDateOnly } from '@/services/dates';
import { MonthSelector } from '@/components/MonthSelector';
import { PayBillModal } from '@/components/PayBillModal';
import { BRL } from '@/services/currency';
import { StatsByCategory } from '@/components/StatsByCategory';

export function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [accounts, setAccounts] = useState<BankAccountDTO[]>([]);
  const [bills, setBills] = useState<BillResponseDTO[]>([]);
  const [movements, setMovements] = useState<MovementDTO[]>([]);
  const [stats, setStats] = useState<DashboardItemDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBill, setSelectedBill] = useState<BillResponseDTO | null>(null);
  const [isShowPayBillModal, setIsShowPayBillModal] = useState<boolean>(false);
  const { logout, toggleTheme, firstName } = useAuth();

  async function fetchDashboardData() {
    setLoading(true);
    setError(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    try {
      console.log("[Dashboard] Calling apis");
      const [accountsResponse, billsResponse, movementsResponse, dashboardResponse] = await Promise.all([
        listAccounts(),
        listBills(year, month),
        listMovements(year, month),
        getDashboard(year, month)
      ]);

      setAccounts(accountsResponse);
      setBills(billsResponse);
      setMovements(movementsResponse);
      setStats(dashboardResponse)
    } catch (err) {
      setError('Não foi possível carregar os dados do dashboard. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, [currentDate]);

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
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
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

  const showPayBillModal = (bill: BillResponseDTO) => {
    setSelectedBill(bill);
    setIsShowPayBillModal(true);
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-rule bg-white p-6 shadow-sm shadow-ink/5 backdrop-blur dark:border-rule-dark dark:bg-panel">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-sm font-semibold uppercase tracking-widest text-sage dark:text-sage-light">Dashboard</p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-ink dark:text-paper">Olá, {firstName || 'usuário'}</h1>
            <p className="mt-2 text-ink-soft dark:text-stone">Veja seu fluxo financeiro e acompanhe contas, movimentações e saldos.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-2xl border border-rule bg-paper-dark/30 px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-brass/40 dark:border-rule-dark dark:bg-night-soft dark:text-stone dark:hover:border-brass-light/40"
            >
              <Wallet className="h-4 w-4" /> Tema
            </button>
            <Link
              to="/accounts"
              className="inline-flex items-center gap-2 rounded-2xl border border-rule bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-brass/40 dark:border-rule-dark dark:bg-panel dark:text-paper"
            >
              Contas
            </Link>
            <Link
              to="/bills"
              className="inline-flex items-center gap-2 rounded-2xl border border-rule bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-brass/40 dark:border-rule-dark dark:bg-panel dark:text-paper"
            >
              Faturas
            </Link>
            <Link
              to="/movements"
              className="inline-flex items-center gap-2 rounded-2xl border border-rule bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-brass/40 dark:border-rule-dark dark:bg-panel dark:text-paper"
            >
              Movimentações
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-2xl border border-rule bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-brass/40 dark:border-rule-dark dark:bg-panel dark:text-paper"
            >
              Perfil
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full bg-brass px-4 py-2 text-sm font-semibold text-white transition hover:bg-brass-dark"
            >
              <ArrowRight className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-brick/30 bg-brick/10 p-4 text-sm text-brick dark:border-brick-light/30 dark:bg-brick-light/10 dark:text-brick-light">
          {error}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6 min-w-0">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
            <article className="rounded-2xl border border-rule bg-white p-6 shadow-sm dark:border-rule-dark dark:bg-panel">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-sm uppercase tracking-widest text-sage dark:text-sage-light">Saldo Total</p>
                  <p className="mt-3 font-mono text-3xl font-semibold text-stamp dark:text-stamp-light">{ BRL(totalBalance) }</p>
                </div>
                <div className="rounded-2xl bg-stamp/10 p-3 text-stamp dark:bg-stamp-light/15 dark:text-stamp-light">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {loading ? (
                  <div className="rounded-2xl bg-paper-dark/30 p-4 text-sm text-ink-soft dark:bg-night-soft dark:text-stone">Carregando contas...</div>
                ) : accounts.length === 0 ? (
                  <div className="rounded-2xl bg-paper-dark/30 p-4 text-sm text-ink-soft dark:bg-night-soft dark:text-stone">Nenhuma conta encontrada.</div>
                ) : (
                  accounts.map((account) => (
                    <div key={account.accountId} className="flex items-center justify-between rounded-2xl bg-paper-dark/30 px-4 py-3 text-sm text-ink dark:bg-night-soft dark:text-paper">
                      <span>{account.name}</span>
                      <strong>{BRL(account.balance)}</strong>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-rule bg-white p-6 shadow-sm dark:border-rule-dark dark:bg-panel">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-sm uppercase tracking-widest text-sage dark:text-sage-light">Contas a pagar</p>
                  <h2 className="mt-3 font-display text-2xl font-semibold text-ink dark:text-paper">Resumo mensal</h2>
                </div>
                <div className="rounded-2xl bg-paper-dark/40 p-3 text-ink-soft dark:bg-night-soft dark:text-stone">
                  <Home className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl bg-paper-dark/30 p-4 dark:bg-night-soft">
                  <p className="text-sm text-ink-soft dark:text-stone">Até dia 15</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-brick dark:text-brick-light">{BRL(toPayBefore)}</p>
                </div>
                <div className="rounded-2xl bg-paper-dark/30 p-4 dark:bg-night-soft">
                  <p className="text-sm text-ink-soft dark:text-stone">Após dia 15</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-brick dark:text-brick-light">{BRL(toPayAfter)}</p>
                </div>
              </div>
            </article>
          </div>

          <article className="rounded-2xl border border-rule bg-white p-6 shadow-sm dark:border-rule-dark dark:bg-panel">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-sm uppercase tracking-widest text-sage dark:text-sage-light">Movimentações</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-ink dark:text-paper">Este mês</h2>
              </div>
              <MonthSelector
                date={currentDate}
                onDateChange={date=> setCurrentDate(date)} />
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-rule text-left text-sm dark:divide-rule-dark">
                <thead>
                  <tr className="font-mono text-sage uppercase tracking-[0.2em] text-xs dark:text-sage-light">
                    <th className="px-4 py-3">Descrição</th>
                    <th className="px-4 py-3">Conta</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule dark:divide-rule-dark">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-ink-soft dark:text-stone">Carregando movimentações...</td>
                    </tr>
                  ) : movementsWithDetails.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-ink-soft dark:text-stone">Nenhuma movimentação encontrada para este mês.</td>
                    </tr>
                  ) : (
                    movementsWithDetails.map((movement) => (
                      <tr key={movement.movementId} className="hover:bg-paper/60 dark:hover:bg-night-soft/60">
                        <td className="px-4 py-4 text-ink dark:text-paper">{movement.description}</td>
                        <td className="px-4 py-4 text-ink-soft dark:text-stone">{movement.accountName}</td>
                        <td className="px-4 py-4 text-ink-soft dark:text-stone">{formatDateOnly(movement.date)}</td>
                        <td className={`px-4 py-4 text-right font-semibold ${movement.value >= 0 ? 'text-stamp dark:text-stamp-light' : 'text-brick dark:text-brick-light'}`}>
                          { BRL(Math.abs(movement.value)) }
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
          <StatsByCategory
            categories={stats}
          />
          <article className="rounded-2xl border border-rule bg-white p-6 shadow-sm dark:border-rule-dark dark:bg-panel">
            <p className="font-mono text-sm uppercase tracking-widest text-sage dark:text-sage-light">Próximas contas</p>
            <div className="mt-5 space-y-4">
              {nextBills.length === 0 ? (
                <div className="rounded-2xl bg-paper-dark/30 p-4 text-sm text-ink-soft dark:bg-night-soft dark:text-stone">Nenhuma conta pendente para este mês.</div>
              ) : (
                nextBills.map((bill) => (
                  <div key={bill.billId}
                    onClick={() => showPayBillModal(bill) }
                  className="flex items-center justify-between gap-4 rounded-2xl bg-paper-dark/30 px-4 py-4 dark:bg-night-soft cursor-pointer">
                    <div>
                      <p className="font-semibold text-ink dark:text-paper">{bill.billDescription}</p>
                      <p className="text-sm text-ink-soft dark:text-stone">Vencimento dia {bill.paymentDay}</p>
                    </div>
                    <span className={`rounded-2xl px-3 py-1 text-sm font-semibold ${bill.isPaid ? 'bg-stamp/10 text-stamp dark:bg-stamp-light/10 dark:text-stamp-light' : 'bg-brick/10 text-brick dark:bg-brick-light/10 dark:text-brick-light'}`}>
                      {bill.isPaid ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                ))
              )}
            </div>
            <PayBillModal
              accounts={accounts}
              bill={selectedBill}
              isOpen={isShowPayBillModal}
              setIsOpen={setIsShowPayBillModal}
              onSuccess={()=> fetchDashboardData()}
            />
          </article>
          <article className="rounded-2xl border border-rule bg-white p-6 shadow-sm dark:border-rule-dark dark:bg-panel">
            <p className="font-mono text-sm uppercase tracking-widest text-sage dark:text-sage-light">Visão geral</p>
            <div className="mt-5 grid gap-4">
              {overviewCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-rule bg-paper-dark/30 p-4 dark:border-rule-dark dark:bg-night-soft">
                  <p className="text-sm text-ink-soft dark:text-stone">{card.title}</p>
                  <p className="mt-3 font-mono text-xl font-semibold text-ink dark:text-paper">{BRL(card.value)}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-rule bg-white p-6 shadow-sm dark:border-rule-dark dark:bg-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-sm uppercase tracking-widest text-sage dark:text-sage-light">Distribuição</p>
                <h2 className="mt-2 font-display text-xl font-semibold text-ink dark:text-paper">Por conta</h2>
              </div>
              <div className="rounded-2xl bg-paper-dark/40 p-3 text-ink-soft dark:bg-night-soft dark:text-stone">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {distributionItems.map((item) => (
                <div key={item.category} className="flex items-center justify-between gap-3 rounded-2xl bg-paper-dark/30 px-4 py-3 text-sm text-ink dark:bg-night-soft dark:text-paper">
                  <span>{item.category}</span>
                  <strong>{BRL(item.value)}</strong>
                </div>
              ))}
            </div>
          </article>


        </aside>
      </section>
    </div>
  );
}
