import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { createAccount, deleteAccount, listAccounts } from '../services/finance';
import type { BankAccountDTO, NewBankAccountDTO } from '../types/finance';
import { BRL } from '@/services/currency';
import { NumericFormat } from 'react-number-format';

export function Accounts() {
  const [accounts, setAccounts] = useState<BankAccountDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [bankName, setBankName] = useState('');
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await listAccounts();
      setAccounts(data);
    } catch {
      setError('Não foi possível carregar as contas.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedBalance = Number(initialBalance);

    if (!bankName.trim() || Number.isNaN(parsedBalance)) {
      setError('Preencha o nome do banco e o saldo inicial corretamente.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const newAccount = await createAccount({
        accountName: bankName,
        initialBalance: parsedBalance
      } as NewBankAccountDTO);

      setAccounts((current) => [...current, newAccount]);
      setIsOpen(false);
      setBankName('');
      setInitialBalance(0);
    } catch {
      setError('Não foi possível criar a conta.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    setError('');

    try {
      await deleteAccount(accountId);
      setAccounts((current) => current.filter((account) => account.accountId !== accountId));
    } catch {
      setError('Não foi possível remover a conta.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Contas / Bancos</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Gerencie suas contas bancárias</h1>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" /> Nova conta
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.2em] dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Banco</th>
              <th className="px-4 py-3">Saldo</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  Carregando contas...
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  Nenhuma conta cadastrada ainda.
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.accountId} className="hover:bg-slate-50 dark:hover:bg-slate-900/80">
                  <td className="px-4 py-4 text-slate-900 dark:text-slate-100">{account.name}</td>
                  <td className="px-4 py-4 text-slate-900 dark:text-slate-100">{BRL(account.balance)}</td>
                  <td className="px-4 py-4 text-right text-slate-500 dark:text-slate-400">
                    <button
                      onClick={() => handleDeleteAccount(account.accountId)}
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
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Nova conta bancária</h2>
              <button className="text-slate-500 hover:text-slate-900 dark:text-slate-400" onClick={() => setIsOpen(false)}>
                Fechar
              </button>
            </div>
            <form className="mt-6 grid gap-4" onSubmit={handleCreateAccount}>
              <input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Nome do banco"
                required
              />
              <NumericFormat
                value={initialBalance}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                inputMode="decimal"
                placeholder="Valor"
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale
                prefix="R$ "
                allowNegative={true}
                onValueChange={(values) => {
                  setInitialBalance(values.floatValue ?? 0);
                }}
                required
              />
              <button
                type="submit"
                className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar conta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
