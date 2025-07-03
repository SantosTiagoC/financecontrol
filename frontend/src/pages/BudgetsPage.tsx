import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import BudgetRow from '../components/BudgetRow'; // <-- Importa o novo componente

interface Budget {
    category_id: number;
    category_name: string;
    budget_amount: number | null;
    spent_amount: number;
}

function BudgetsPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const { user, logout } = useAuth();

    const fetchBudgets = useCallback(async () => {
        if (!user || (user.plan !== 'premium' && user.role !== 'admin')) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        try {
            const response = await api.get(`/budgets?month=${month}&year=${year}`);
            setBudgets(response.data);
        } catch (error: any) {
            if (error.response?.status === 403) {
                toast.error("Orçamentos é uma funcionalidade premium.");
            } else {
                toast.error("Não foi possível carregar os orçamentos.");
            }
            console.error("Falha ao buscar orçamentos", error);
        } finally {
            setLoading(false);
        }
    }, [currentDate, user, logout]);

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    // Função para salvar um novo valor de orçamento
    const handleSaveBudget = async (categoryId: number, amount: number) => {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const promise = api.post('/budgets', {
            category_id: categoryId,
            amount: amount,
            month: month,
            year: year,
        });

        toast.promise(promise, {
            loading: 'Salvando orçamento...',
            success: 'Orçamento salvo com sucesso!',
            error: 'Não foi possível salvar o orçamento.',
        });

        try {
            await promise;
            fetchBudgets(); // Re-busca os dados para atualizar a tela
        } catch (error) {
            console.error("Falha ao salvar orçamento", error);
        }
    };

    // Se o usuário não for premium (e não for admin), mostra a tela de upgrade.
    if (user && user.plan !== 'premium' && user.role !== 'admin') {
        return (
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Funcionalidade Premium</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Controle seus gastos com orçamentos personalizados. Faça o upgrade para o plano Premium e tenha acesso completo!</p>
                <button className="mt-6 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Fazer Upgrade</button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Orçamentos Mensais</h1>
                <p className="mt-1 text-md text-slate-600 dark:text-slate-400">Defina limites para suas categorias de despesa e acompanhe seus gastos.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Orçamento de {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                {loading ? <p className="dark:text-gray-300 text-center py-4">Carregando...</p> : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {budgets.map(budget => (
                            <BudgetRow
                                key={budget.category_id}
                                budget={budget}
                                onSave={handleSaveBudget}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default BudgetsPage;