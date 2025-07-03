import React, { useState, useEffect } from 'react';
import CurrencyInput from 'react-currency-input-field';
import { CheckCircleIcon } from '@heroicons/react/20/solid';

interface Budget {
    category_id: number;
    category_name: string;
    budget_amount: number | null;
    spent_amount: number;
}

interface BudgetRowProps {
    budget: Budget;
    onSave: (categoryId: number, amount: number) => Promise<void>;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

function BudgetRow({ budget, onSave }: BudgetRowProps) {
    const [amount, setAmount] = useState<string | undefined>(budget.budget_amount?.toString() || '');
    const [isEditing, setIsEditing] = useState(false);

    const spent = budget.spent_amount || 0;
    // Apenas convertemos o 'amount' do estado para número para o cálculo do progresso
    const budgetAmountForProgress = parseFloat(amount || '0');

    let progress = budgetAmountForProgress > 0 ? (spent / budgetAmountForProgress) * 100 : 0;
    const isOverBudget = progress > 100;
    if (isOverBudget) {
        progress = 100;
    }

    let progressBarColor = 'bg-green-500';
    if (progress > 75 && !isOverBudget) progressBarColor = 'bg-yellow-500';
    if (isOverBudget) progressBarColor = 'bg-red-500';

    const handleSave = () => {
        // --- MUDANÇA CRÍTICA AQUI ---
        // Converte o valor do estado (que é uma string como "60.00") diretamente para número.
        const numericAmount = parseFloat(amount || '0');

        // Chama a função onSave com o valor numérico correto.
        onSave(budget.category_id, numericAmount);
        setIsEditing(false); // Desativa o modo de edição após salvar
    };

    // Garante que o estado do input seja atualizado se a prop do orçamento mudar
    useEffect(() => {
        setAmount(budget.budget_amount?.toString() || '');
    }, [budget.budget_amount]);

    return (
        <li className="py-4 px-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                {/* Nome da Categoria e Valores */}
                <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{budget.category_name}</p>
                    <p className={`text-sm ${isOverBudget ? 'text-red-500 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                        Gasto: {formatCurrency(spent)} de {formatCurrency(budget.budget_amount || 0)}
                    </p>
                </div>

                {/* Barra de Progresso */}
                <div className="md:col-span-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div
                            className={`h-4 rounded-full text-white text-xs flex items-center justify-center transition-all duration-300 ${progressBarColor}`}
                            style={{ width: `${progress}%` }}
                        >
                            {progress > 15 && `${progress.toFixed(0)}%`}
                        </div>
                    </div>
                </div>

                {/* Input para definir o Orçamento */}
                <div className="flex items-center gap-2">
                    <CurrencyInput
                        name="budget_amount"
                        placeholder="Definir Limite"
                        value={amount}
                        onValueChange={(value) => { // 'value' aqui é a string numérica limpa (ex: "60.00")
                            setAmount(value);
                            setIsEditing(true);
                        }}
                        intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                        className="py-2 px-3 block w-full rounded-md dark:bg-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm"
                    />
                    {isEditing && (
                        <button onClick={handleSave} className="p-2 text-green-600 hover:text-green-500" title="Salvar Orçamento">
                            <CheckCircleIcon className="h-6 w-6" />
                        </button>
                    )}
                </div>
            </div>
        </li>
    );
}

export default BudgetRow;