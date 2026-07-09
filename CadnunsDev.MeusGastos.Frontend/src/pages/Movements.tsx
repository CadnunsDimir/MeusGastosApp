import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { createMovement, deleteMovement, listAccounts, listMovements } from '@/services/finance';
import { BankAccountDTO, MovementDTO } from '@/types/finance';
import { formatDateOnly } from '@/services/dates';
import { MonthSelector } from '@/components/MonthSelector';
import { MovementFormFields, MovementFormModal } from '@/components/MovementFormModal';

interface MovementMonth{
    month: number,
    year: number
}

export function Movements() {
    const [accounts, setAccounts] = useState<BankAccountDTO[]>([]);
    const [movements, setMovements] = useState<MovementDTO[]>([]);
    const [isOpen, setIsOpen] = useState(false);    
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
    }, [movementMonth]);

    const fetchApis = async () => {
        setLoading(true);
        setError('');

        try {
            const [accountsResponse, movementsResponse] = await Promise.all([
                listAccounts(),
                listMovements(movementMonth.year, movementMonth.month)
            ]);
            setAccounts(accountsResponse);
            setMovements(movementsResponse.sort((a, b) => a.date.localeCompare(b.date)));
        } catch {
            setError('Não foi possível carregar as movimentações');
        } finally {
            setLoading(false);
        }
    }

    

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

    function toDate(month: MovementMonth) {
        return new Date(month.year, month.month - 1, 1)
    }

    function setMonthUsingDate(date: Date) {
        var currentDate = new Date();
        if (date <= currentDate) {
            setMovementMonth({
                month: date.getMonth() + 1,
                year: date.getFullYear()
            });
        }
    }

    const handleSubmit = async ({
        description,
        accountId,
        amount,
        date
    }: MovementFormFields)=>{
        if (!description || !accountId || !date || Number.isNaN(amount)) {
            setError("Preencha todos os campos!")
            return;
        }

        const payload: MovementDTO = {
            description,
            accountId,
            value: amount,
            date
        };

        try{
            var dateParsed = new Date(payload.date);
            var newMoviment = await createMovement(dateParsed.getFullYear(), dateParsed.getMonth()+1, payload);
            setMovements((current) => [newMoviment, ...current]);
            setIsOpen(false);
        } catch {
            setError("Ocorreu um erro ao salvar")
        }
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Movimentações</p>
                    <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Controle de entradas e saídas</h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <MonthSelector
                        date={toDate(movementMonth)}
                        onDateChange={date => setMonthUsingDate(date)}
                    />
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                    >
                        <Plus className="h-4 w-4" /> Nova fatura
                    </button>
                </div>
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

            <MovementFormModal 
                isOpen={isOpen} 
                accounts={accounts} 
                error={error} 
                setIsOpen={setIsOpen} onSubmit={handleSubmit} />
        </div>
    );
}
