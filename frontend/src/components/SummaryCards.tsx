import React from 'react';
import { ArrowUpCircleIcon, ArrowDownCircleIcon, BanknotesIcon } from '@heroicons/react/24/outline';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

function SummaryCard({ title, value, icon: Icon, colorClass }) {
    return (
        // MUDANÇA: de dark:bg-slate-800 para dark:bg-gray-800
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1`}>
            <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${colorClass}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{formatCurrency(value)}</p>
                </div>
            </div>
        </div>
    );
}

function SummaryCards({ summary }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard
                title="Total de Entradas"
                value={summary?.totalIncome}
                icon={ArrowUpCircleIcon}
                colorClass="bg-green-500"
            />
            <SummaryCard
                title="Total de Saídas"
                value={summary?.totalExpenses}
                icon={ArrowDownCircleIcon}
                colorClass="bg-red-500"
            />
            <SummaryCard
                title="Saldo do Mês"
                value={summary?.balance}
                icon={BanknotesIcon}
                colorClass={summary?.balance >= 0 ? "bg-sky-500" : "bg-red-500"}
            />
        </div>
    );
}

export default SummaryCards;