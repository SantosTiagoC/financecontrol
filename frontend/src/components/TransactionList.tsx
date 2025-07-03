import React from 'react';
import { PencilSquareIcon, TrashIcon, ArrowUpCircleIcon, ArrowDownCircleIcon } from '@heroicons/react/24/outline';

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

function TransactionList({ transactions, onEdit, onDelete }) {
    if (!transactions || transactions.length === 0) {
        return <div className="text-center py-10 text-slate-500 dark:text-slate-400">Nenhuma transação encontrada.</div>;
    }

    return (
        <div className="flow-root">
            <ul role="list" className="-my-4 divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => {
                    const isIncome = transaction.type === 'income';
                    return (
                        <li key={`${transaction.type}-${transaction.id}`} className="flex items-center justify-between gap-x-6 py-4">
                            <div className="flex items-center min-w-0 gap-x-4">
                                <div className={`p-2 rounded-full ${isIncome ? 'bg-green-100 dark:bg-green-800/50' : 'bg-red-100 dark:bg-red-800/50'}`}>
                                    {isIncome
                                        ? <ArrowUpCircleIcon className="h-6 w-6 text-green-600" />
                                        : <ArrowDownCircleIcon className="h-6 w-6 text-red-600" />}
                                </div>
                                <div className="min-w-0 flex-auto">
                                    <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">{transaction.description}</p>
                                    <p className="mt-1 truncate text-xs leading-5 text-gray-500 dark:text-gray-400">
                                        {isIncome ? 'Receita' : transaction.category_name} &middot; {formatDate(transaction.date)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-x-1 sm:gap-x-2">
                                <p className={`text-sm font-semibold leading-6 ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {isIncome ? '+' : '-'} {formatCurrency(transaction.value)}
                                </p>
                                <div className="flex items-center">
                                    <button onClick={() => onEdit(transaction)} className="p-2 text-gray-500 rounded-md hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <PencilSquareIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => onDelete(transaction)} className="p-2 text-gray-500 rounded-md hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default TransactionList;