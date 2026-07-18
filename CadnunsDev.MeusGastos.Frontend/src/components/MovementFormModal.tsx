import { BRL } from "@/services/currency";
import { BankAccountDTO, MovementType } from "@/types/finance";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { uiClasses } from "@/styles/theme";

export interface MovementFormFields {
    description: string;
    amount: number;
    date: string;
    type: MovementType;
    accountId: string;
    destinationAccountId?: string;
}

export interface MovementFormModalProps {
    isOpen : boolean;
    accounts: BankAccountDTO[];
    error: string | undefined;
    setIsOpen: (status: boolean) => void;
    onSubmit: (data: MovementFormFields) => void;
}

export function MovementFormModal({
    isOpen,
    accounts,
    error,
    onSubmit,
    setIsOpen
}: MovementFormModalProps) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | undefined>();
    const [date, setDate] = useState('');
    const [type, setType] = useState<MovementType>(MovementType.Expense);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [destinationAccountId, setDestinationAccountId] = useState<string>('');

    useEffect(()=> {
        if(isOpen) return;
        setDescription('');
        setAmount(undefined);
        setDate('');
        setType(MovementType.Expense);
        setSelectedAccountId('');
        setDestinationAccountId('');
    }, [isOpen]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit({
            description,
            amount: Number(amount),
            date,
            type,
            accountId: selectedAccountId,
            destinationAccountId: type === MovementType.Transfer ? destinationAccountId : undefined
        });
    };

    return (
        <>
        {isOpen && (
                <div className={uiClasses.modalOverlay}>
                    <div className={uiClasses.modalPanel}>
                        <div className="flex items-center justify-between">
                            <h2 className="font-display text-xl font-semibold text-ink dark:text-paper">Nova movimentação</h2>
                            <button className="text-ink-soft hover:text-ink dark:text-stone dark:hover:text-paper" onClick={() => setIsOpen(false)}>
                                Fechar
                            </button>
                        </div>

                        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>                            
                            <input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={uiClasses.formInput}
                                placeholder="Descrição"
                                required
                            />
                             <NumericFormat
                                value={amount}
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
                                    setAmount(values.floatValue);
                                }}
                                required
                            />
                            <input
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className={uiClasses.formInput}
                                placeholder="Data"
                                type="date"
                                required
                            />

                            <select
                                value={type}
                                onChange={(e) => setType(Number(e.target.value) as MovementType)}
                                className={uiClasses.formInput}
                                required
                            >
                                <option value={MovementType.Expense}>Despesa</option>
                                <option value={MovementType.Revenue}>Receita</option>
                                <option value={MovementType.Transfer}>Transferência entre contas</option>
                                <option value={MovementType.Investment}>Investimento</option>
                            </select>
                           
                            <select
                                value={selectedAccountId}
                                onChange={(e) => setSelectedAccountId(e.target.value)}
                                className={uiClasses.formInput}
                                required
                            >
                                <option value="">{type === MovementType.Transfer ? "Selecione a conta de origem" : "Selecione uma conta"}</option>
                                {accounts.map((account) => (
                                    <option key={account.accountId} value={account.accountId}>
                                        {account.name} ({ BRL(account.balance) })
                                    </option>
                                ))}
                            </select>

                            {type === MovementType.Transfer && (
                                <select
                                    value={destinationAccountId}
                                    onChange={(e) => setDestinationAccountId(e.target.value)}
                                    className={uiClasses.formInput}
                                    required
                                >
                                    <option value="">Selecione a conta de destino</option>
                                    {accounts
                                        .filter((account) => account.accountId !== selectedAccountId)
                                        .map((account) => (
                                            <option key={account.accountId} value={account.accountId}>
                                                {account.name} ({ BRL(account.balance) })
                                            </option>
                                        ))}
                                </select>
                            )}

                            {error && <p className="mt-4 text-sm text-brick dark:text-brick-light">{error}</p>}
                            <button className="rounded-2xl bg-brass px-4 py-3 text-sm font-semibold text-white transition hover:bg-brass-dark" type="submit">
                                Salvar movimentação
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}