import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CurrencyInput from 'react-currency-input-field';
import { FlagIcon, BanknotesIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface GoalFormData {
    id: number;
    name: string;
    target_amount: number;
    target_date: string | null;
}
interface GoalFormProps {
    onSuccess: () => void;
    goalToEdit: GoalFormData | null;
}

function GoalForm({ onSuccess, goalToEdit }: GoalFormProps) {
    const isEditing = !!goalToEdit;

    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState<string | undefined>('');
    const [targetDate, setTargetDate] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (isEditing) {
            setName(goalToEdit.name);
            setTargetAmount(goalToEdit.target_amount.toString());
            setTargetDate(goalToEdit.target_date ? new Date(goalToEdit.target_date).toISOString().slice(0, 10) : '');
        } else {
            setName('');
            setTargetAmount('');
            setTargetDate('');
        }
        setErrors({});
    }, [goalToEdit]);

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!name.trim()) {
            newErrors.name = 'O nome da meta é obrigatório.';
        }
        const numericAmount = targetAmount ? parseFloat(targetAmount) : 0;
        if (!targetAmount || numericAmount <= 0) {
            newErrors.targetAmount = 'O valor alvo deve ser maior que zero.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;

        const endpoint = isEditing ? `/goals/${goalToEdit.id}` : '/goals';
        const method = isEditing ? 'put' : 'post';

        // MUDANÇA CRÍTICA AQUI: Simplificamos a conversão do valor
        const data = {
            name,
            target_amount: parseFloat(targetAmount || '0'),
            target_date: targetDate || null,
        };

        const promise = api[method](endpoint, data);
        toast.promise(promise, {
            loading: 'Salvando meta...',
            success: `Meta ${isEditing ? 'atualizada' : 'criada'} com sucesso!`,
            error: (err) => err.response?.data?.message || `Não foi possível salvar a meta.`
        });

        try {
            await promise;
            onSuccess();
        } catch (err) {
            console.error("Falha na meta", err);
        }
    };

    return (
        <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-gray-900">
                <FlagIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                    {isEditing ? 'Editar Meta' : 'Defina seu Objetivo'}
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {isEditing ? 'Ajuste os detalhes do seu objetivo.' : 'Qual é a próxima grande conquista que você está planejando?'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 mt-6" noValidate>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome da Meta</label>
                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <FlagIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Ex: Viagem para o Japão"
                            className={`py-2 pl-10 block w-full rounded-md dark:bg-gray-700 dark:text-gray-200 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Valor Alvo</label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <BanknotesIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <CurrencyInput
                                id="targetAmount"
                                name="targetAmount"
                                value={targetAmount}
                                onValueChange={(value) => setTargetAmount(value)}
                                required
                                placeholder="R$ 10.000,00"
                                intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                                className={`py-2 pl-10 block w-full rounded-md dark:bg-gray-700 dark:text-gray-200 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.targetAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            />
                        </div>
                        {errors.targetAmount && <p className="mt-1 text-xs text-red-500">{errors.targetAmount}</p>}
                    </div>
                    <div>
                        <label htmlFor="targetDate" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Prazo (Opcional)</label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                id="targetDate"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="py-2 pl-10 block w-full rounded-md dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>
                </div>
                {errors.form && <p className="text-red-500 text-xs text-center">{errors.form}</p>}
                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                        {isEditing ? 'Salvar Alterações' : 'Criar Meta'}
                    </button>
                </div>
            </form>
        </div>
    );
}
export default GoalForm;