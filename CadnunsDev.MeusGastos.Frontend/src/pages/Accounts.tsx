import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { createAccount, deleteAccount, listAccounts } from '../services/finance';
import type { BankAccountDTO, NewBankAccountDTO } from '../types/finance';
import { BRL } from '@/services/currency';
import { NumericFormat } from 'react-number-format';
import { useNavigate } from 'react-router-dom';
import { uiClasses } from '@/styles/theme';

export function Accounts() {
  const navigate = useNavigate();
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
        <div className="flex flex-nowrap items-center gap-5">
          <button
            onClick={() => navigate('/dashboard')}
            className={uiClasses.pageBackButton}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className={uiClasses.pageSubtitle}>Contas / Bancos</p>
            <h1 className={uiClasses.pageTitle}>Gerencie suas contas bancárias</h1>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className={uiClasses.primaryButton}
        >
          <Plus className="h-4 w-4" /> Nova conta
        </button>
      </div>

      <div className={`mt-6 ${uiClasses.tableCard}`}>
        <table className="min-w-full divide-y divide-rule text-left text-sm dark:divide-rule-dark">
          <thead className={uiClasses.tableHead}>
            <tr>
              <th className="px-4 py-3">Banco</th>
              <th className="px-4 py-3">Saldo</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule dark:divide-rule-dark">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-ink-soft dark:text-stone">
                  Carregando contas...
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-ink-soft dark:text-stone">
                  Nenhuma conta cadastrada ainda.
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.accountId} className={uiClasses.tableRowHover}>
                  <td className="px-4 py-4 text-ink dark:text-paper">{account.name}</td>
                  <td className="px-4 py-4 font-mono text-ink dark:text-paper">{BRL(account.balance)}</td>
                  <td className="px-4 py-4 text-right text-ink-soft dark:text-stone">
                    <button
                      onClick={() => handleDeleteAccount(account.accountId)}
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
              <h2 className="font-display text-xl font-semibold text-ink dark:text-paper">Nova conta bancária</h2>
              <button className="text-ink-soft hover:text-ink dark:text-stone dark:hover:text-paper" onClick={() => setIsOpen(false)}>
                Fechar
              </button>
            </div>
            <form className="mt-6 grid gap-4" onSubmit={handleCreateAccount}>
              <input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className={uiClasses.formInput}
                placeholder="Nome do banco"
                required
              />
              <NumericFormat
                value={initialBalance}
                className={uiClasses.formInput}
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
                className="rounded-2xl bg-brass px-4 py-3 text-sm font-semibold text-white transition hover:bg-brass-dark disabled:cursor-not-allowed disabled:opacity-60"
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
