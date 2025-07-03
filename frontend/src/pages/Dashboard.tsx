import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SummaryCards from '../components/SummaryCards';
import ExpensesPieChart from '../components/ExpensesPieChart';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { PlusIcon } from '@heroicons/react/20/solid';

function DashboardPage() {
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    // --- LÓGICA DE MODAIS ADICIONADA AQUI ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    const { logout } = useAuth();
    const currentMonthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        try {
            // Busca todos os dados em paralelo
            const [summaryRes, expensesRes, incomesRes] = await Promise.all([
                api.get(`/reports/summary?month=${month}&year=${year}`),
                api.get('/expenses'),
                api.get('/incomes')
            ]);

            setSummary(summaryRes.data);

            // Unifica e ordena as transações para a lista de "Recentes"
            const expensesData = expensesRes.data.map(item => ({ ...item, type: 'expense', date: item.expense_date }));
            const incomesData = incomesRes.data.map(item => ({ ...item, type: 'income', date: item.income_date }));
            const allTransactions = [...expensesData, ...incomesData]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5); // Mostra apenas as 5 mais recentes no dashboard

            setTransactions(allTransactions);

        } catch (error) {
            console.error("Falha ao buscar dados do dashboard", error);
            if (error.response?.status === 401) logout();
        } finally {
            setLoading(false);
        }
    }, [currentDate, logout]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // --- FUNÇÕES PARA CONTROLAR OS MODAIS ---
    const handleOpenFormModal = (transaction = null) => {
        setTransactionToEdit(transaction);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setTransactionToEdit(null);
    };

    const handleTransactionUpserted = () => {
        handleCloseFormModal();
        fetchDashboardData(); // Atualiza todos os dados do dashboard
    };

    const openDeleteModal = (transaction) => {
        setTransactionToDelete(transaction);
    };

    const closeDeleteModal = () => {
        setTransactionToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!transactionToDelete) return;
        const { type, id } = transactionToDelete;
        const endpoint = type === 'expense' ? `/expenses/${id}` : `/incomes/${id}`;
        try {
            await api.delete(endpoint);
            closeDeleteModal();
            fetchDashboardData(); // Atualiza os dados após deletar
        } catch (error) {
            console.error("Falha ao deletar transação", error);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
                    <p className="mt-1 text-md text-slate-600 dark:text-slate-400">Olá, bem-vindo de volta! Aqui está o resumo financeiro de <span className="font-semibold capitalize text-indigo-500">{currentMonthName}</span>.</p>
                </div>
                <button onClick={() => handleOpenFormModal()} className="flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 ...">
                    <PlusIcon className="-ml-0.5 h-5 w-5" /> Nova Transação
                </button>
            </div>

            {loading ? <p className="dark:text-gray-300">Carregando...</p> : <SummaryCards summary={summary} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Análise de Despesas</h3>
                        {loading ? <p>Carregando...</p> : summary?.expensesByCategory?.length > 0 ? (
                            <div className="max-w-xs mx-auto h-64"><ExpensesPieChart data={summary.expensesByCategory} /></div>
                        ) : (<p className="text-center ...">Sem dados...</p>)}
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Transações Recentes</h3>
                        {/* MUDANÇA: Passando as funções onEdit e onDelete para a lista */}
                        {loading ? <p>Carregando...</p> : <TransactionList transactions={transactions} onEdit={handleOpenFormModal} onDelete={openDeleteModal} />}
                    </div>
                </div>

                {/* O formulário não é mais renderizado aqui, e sim dentro do modal */}
                <div className="lg:col-span-1 hidden lg:block">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-full">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Atalhos</h3>
                        {/* Espaço livre para futuras funcionalidades */}
                    </div>
                </div>
            </div>

            {/* RENDERIZAÇÃO DOS MODAIS (não aparecem visualmente até serem ativados) */}
            <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={transactionToEdit ? 'Editar Transação' : 'Adicionar Nova Transação'}>
                <TransactionForm onTransactionAdded={handleTransactionUpserted} transactionToEdit={transactionToEdit} />
            </Modal>

            {transactionToDelete && (
                <ConfirmationModal isOpen={!!transactionToDelete} onClose={closeDeleteModal} onConfirm={handleConfirmDelete} title="Excluir Transação">
                    Você tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                </ConfirmationModal>
            )}
        </div>
    );
}

export default DashboardPage;