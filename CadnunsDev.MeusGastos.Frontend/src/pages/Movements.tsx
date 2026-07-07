import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { createMovement, deleteMovement, listAccounts, listMovements } from '@/services/finance';
import { BankAccountDTO, MovementDTO } from '@/types/finance';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateOnly } from '@/services/dates';

interface MovementMonth{
    month: number,
    year: number
}

export function Movements() {
    const [accounts, setAccounts] = useState<BankAccountDTO[]>([]);
    const [movements, setMovements] = useState<MovementDTO[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [movementMonth, setMovementMonth] = useState<MovementMonth>((()=> {
        var todayDate = new Date();
        return {
            month: todayDate.getMonth()+ 1,
            year: todayDate.getFullYear()
        }
    })());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        void fetchApis();
    }, []);

    const fetchApis = async () => {
        setLoading(true);
        setError('');

        try {
            const [accountsResponse, movementsResponse] = await Promise.all([
                listAccounts(),
                listMovements(movementMonth.year, movementMonth.month)
            ]);
            setAccounts(accountsResponse);
            setMovements(movementsResponse);
        } catch {
            setError('Não foi possível carregar as movimentações');
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const parsedAmount = Number(amount);
        if (!description || !selectedAccountId || !date || Number.isNaN(parsedAmount)) {
            setError("Preencha todos os campos!")
            return;
        }

        const payload: MovementDTO = {
            description,
            accountId: selectedAccountId,
            value: parsedAmount,
            date
        };

        try{
            var dateParsed = new Date(payload.date);
            var newMoviment = await createMovement(dateParsed.getFullYear(), dateParsed.getMonth()+1, payload);
            setMovements((current) => [newMoviment, ...current]);
            setIsOpen(false);
            setDescription('');
            setAmount('');
            setDate('');
        } catch {
            setError("Ocorreu um erro ao salvar")
        }        
    };

    const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>, id?: string) =>{
        try {
            setLoading(true);
            await deleteMovement(movementMonth.year, movementMonth.month, id ?? "");
            setMovements((current) => current.filter(x=> x.movementId !== id));
            setLoading(false);
        } catch {
            setError("Ocorreu um erro ao remover movimento")
        }        
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Movimentações</p>
                    <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Controle de entradas e saídas</h1>
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                    <Plus className="h-4 w-4" /> Nova movimentação
                </button>
            </div>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.2em] dark:bg-slate-900 dark:text-slate-400">
                        <tr>
                            <th className="px-4 py-3">Descrição</th>
                            <th className="px-4 py-3">Data</th>
                            <th className="px-4 py-3 text-right">Valor</th>
                            <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {
                            loading ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                    Carregando movimentos...
                                    </td>
                                </tr>
                            ) : movements.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                Nenhum movimento cadastrado ainda.
                                </td>
                            </tr>
                            ) : (
                                movements.map((movement) => (
                                    <tr key={movement.movementId} className="hover:bg-slate-50 dark:hover:bg-slate-900/80">
                                        <td className="px-4 py-4 text-slate-900 dark:text-slate-100">{movement.description}</td>
                                        <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{formatDateOnly(movement.date)}</td>
                                        <td className={`px-4 py-4 text-right font-semibold ${movement.value >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                            R$ {Math.abs(movement.value).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-4 text-right text-slate-500 dark:text-slate-400">
                                            <button className="mr-3 inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
                                                <Pencil className="h-4 w-4" /> Editar
                                            </button>
                                            <button 
                                                onClick={event => handleDelete(event, movement.movementId)}
                                                className="inline-flex items-center gap-1 text-red-500 hover:text-red-600">
                                                <Trash2 className="h-4 w-4" /> Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )
                        }
                    </tbody>
                </table>
            </div>            

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-950">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Nova movimentação</h2>
                            <button className="text-slate-500 hover:text-slate-900 dark:text-slate-400" onClick={() => setIsOpen(false)}>
                                Fechar
                            </button>
                        </div>

                        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>                            
                            <input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                placeholder="Descrição"
                                required
                            />
                            <input
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                placeholder="Valor"
                                type="number"
                                required
                            />
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
                                        {account.name} (R$ {account.balance.toFixed(2)})
                                    </option>
                                ))}
                            </select>
                            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
                            <button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600" type="submit">
                                Salvar movimentação
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
