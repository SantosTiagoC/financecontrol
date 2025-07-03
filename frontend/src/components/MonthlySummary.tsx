import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ExpensesPieChart from './ExpensesPieChart'; // Importa nosso novo gráfico

function MonthlySummary() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            const month = currentDate.getMonth() + 1; // JS month é 0-11
            const year = currentDate.getFullYear();
            try {
                const response = await api.get(`/reports/summary?month=${month}&year=${year}`);
                setSummary(response.data);
            } catch (error) {
                console.error("Falha ao buscar resumo", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [currentDate]);

    if (loading) return <p className="text-center dark:text-gray-300">Carregando relatório...</p>;
    if (!summary) return <p className="text-center dark:text-gray-300">Não foi possível carregar o relatório.</p>;

    // Função para formatar moeda
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Resumo de {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                {/* Card de Entradas */}
                <div className="bg-green-100 dark:bg-green-800/50 p-4 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-300">Total de Entradas</p>
                    <p className="text-2xl font-semibold text-green-900 dark:text-green-200">{formatCurrency(summary.totalIncome)}</p>
                </div>
                {/* Card de Saídas */}
                <div className="bg-red-100 dark:bg-red-800/50 p-4 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300">Total de Saídas</p>
                    <p className="text-2xl font-semibold text-red-900 dark:text-red-200">{formatCurrency(summary.totalExpenses)}</p>
                </div>
                {/* Card de Saldo */}
                <div className="bg-blue-100 dark:bg-blue-800/50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">Saldo do Mês</p>
                    <p className={`text-2xl font-semibold ${summary.balance >= 0 ? 'text-blue-900 dark:text-blue-200' : 'text-red-900 dark:text-red-200'}`}>{formatCurrency(summary.balance)}</p>
                </div>
            </div>

            {/* Container do Gráfico */}
            {summary.expensesByCategory && summary.expensesByCategory.length > 0 && (
                <div className="mt-8 max-w-sm mx-auto">
                    <ExpensesPieChart data={summary.expensesByCategory} />
                </div>
            )}
        </div>
    );
}

export default MonthlySummary;