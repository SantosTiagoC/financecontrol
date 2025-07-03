// ARQUIVO COMPLETO: /src/components/GoalCard.tsx

import React from 'react';
import { PencilIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
};

// Define os tipos das props para o TypeScript
interface Goal {
    id: number;
    name: string;
    target_amount: number;
    current_amount: number;
    target_date: string;
}
interface GoalCardProps {
    goal: Goal;
    onAddContribution: (goal: Goal) => void;
    onEdit: (goal: Goal) => void;
    onDelete: (goal: Goal) => void; // <-- Prop nova
}

function GoalCard({ goal, onAddContribution, onEdit, onDelete }: GoalCardProps) {
    const progress = goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col justify-between h-full hover:shadow-xl transition-shadow duration-300">
            <div>
                <div className="flex justify-between items-start gap-x-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 break-words">{goal.name}</h3>
                    <div className="flex items-center gap-x-2">
                        {goal.target_date && (
                            <span className="flex-shrink-0 text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-1 rounded-full">
                                Prazo: {formatDate(goal.target_date)}
                            </span>
                        )}
                        {/* --- BOTÃO DE DELETAR NOVO --- */}
                        <button onClick={() => onDelete(goal)} className="p-1 text-gray-400 hover:text-red-500 rounded-full"><TrashIcon className="h-4 w-4" /></button>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{formatCurrency(goal.current_amount)}</span> de {formatCurrency(goal.target_amount)}
                    <span className="float-right font-semibold">{progress.toFixed(1)}%</span>
                </div>
            </div>
            <div className="mt-6 flex justify-end items-center space-x-3">
                <button onClick={() => onEdit(goal)} className="flex items-center gap-x-1 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><PencilIcon className="h-4 w-4" />Editar</button>
                <button onClick={() => onAddContribution(goal)} className="flex items-center gap-x-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"><PlusCircleIcon className="h-5 w-5" />Aporte</button>
            </div>
        </div>
    );
}
export default GoalCard;