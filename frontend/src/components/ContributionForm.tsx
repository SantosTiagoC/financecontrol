import React, { useState } from 'react';
import api from '../services/api';
import CurrencyInput from 'react-currency-input-field';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ContributionFormProps {
    goalId: number;
    onContributionAdded: () => void;
}

function ContributionForm({ goalId, onContributionAdded }: ContributionFormProps) {
    const [amount, setAmount] = useState<string | undefined>('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        const numericAmount = amount ? parseFloat(amount.replace(/\./g, '').replace(',', '.')) : 0;
        if (!numericAmount || numericAmount <= 0) {
            setError('O valor do aporte deve ser maior que zero.');
            return;
        }

        const promise = api.post(`/goals/${goalId}/contribute`, {
            amount: numericAmount,
            contribution_date: new Date().toISOString().slice(0, 10),
        });

        toast.promise(promise, {
            loading: 'Salvando aporte...',
            success: 'Aporte adicionado com sucesso!',
            error: 'Não foi possível adicionar o aporte.',
        });

        try {
            await promise;
            onContributionAdded();
        } catch (err) {
            console.error("Falha ao adicionar aporte", err);
        }
    };

    return (
        <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-gray-900">
                <BanknotesIcon className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">Adicionar Aporte</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Quanto você deseja economizar para este objetivo agora?</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 mt-6" noValidate>
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Valor do Aporte</label>
                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><BanknotesIcon className="h-5 w-5 text-gray-400" /></div>
                        <CurrencyInput id="amount" name="amount" placeholder="R$ 0,00" value={amount} onValueChange={(value) => setAmount(value)} intlConfig={{ locale: 'pt-BR', currency: 'BRL' }} required className={`py-2 pl-10 block w-full rounded-md dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${error ? 'border-red-500' : ''}`} />
                    </div>
                    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                </div>
                <div className="pt-4">
                    <button type="submit" className="w-full inline-flex justify-center rounded-lg border border-transparent bg-green-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">Salvar Aporte</button>
                </div>
            </form>
        </div>
    );
}
export default ContributionForm;