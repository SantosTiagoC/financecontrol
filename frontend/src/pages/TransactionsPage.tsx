import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import TransactionList from '../components/TransactionList';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';
import TransactionForm from '../components/TransactionForm';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Tipagem para os objetos que virão da API
interface Transaction {
    id: number;
    description: string;
    value: number;
    type: 'income' | 'expense';
    date: string;
    category_id?: number;
    category_name?: string;
    account_id: number;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
}

function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationInfo>({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [filters, setFilters] = useState({ search: '', type: 'all', startDate: '', endDate: '' });
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const { logout } = useAuth();

    const fetchTransactions = useCallback(async (page = 1) => {
        setLoading(true);
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '10', // Define 10 itens por página
        });
        // Adiciona filtros apenas se eles tiverem valor
        if (filters.search) params.append('search', filters.search);
        if (filters.type !== 'all') params.append('type', filters.type);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);

        try {
            const response = await api.get(`/transactions?${params.toString()}`);
            setTransactions(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error("Não foi possível buscar as transações.");
            if ((error as any).response?.status === 401) logout();
        } finally {
            setLoading(false);
        }
    }, [filters, logout]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTransactions(1); // Sempre busca a página 1 ao mudar os filtros
        }, 500); // Debounce para evitar muitas chamadas à API ao digitar
        return () => clearTimeout(timer);
    }, [filters, fetchTransactions]);

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            // Atualiza o estado da página e busca os dados da nova página
            setPagination(prev => ({ ...prev, currentPage: newPage }));
            fetchTransactions(newPage);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => { setFilters(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleTypeChange = (type: string) => { setFilters(prev => ({ ...prev, type })); };
    const handleOpenFormModal = (transaction: Transaction | null = null) => { setTransactionToEdit(transaction); setIsFormModalOpen(true); };
    const handleCloseFormModal = () => { setIsFormModalOpen(false); setTransactionToEdit(null); };
    const openDeleteModal = (transaction: Transaction) => { setTransactionToDelete(transaction); };
    const closeDeleteModal = () => { setTransactionToDelete(null); };

    const handleTransactionSuccess = () => {
        const isEditing = !!transactionToEdit;
        handleCloseFormModal();
        // Se estava editando, recarrega a página atual. Se estava adicionando, vai para a primeira página.
        fetchTransactions(isEditing ? pagination.currentPage : 1);
    };

    const handleConfirmDelete = async () => {
        if (!transactionToDelete) return;
        const { type, id } = transactionToDelete;
        const endpoint = type === 'expense' ? `/expenses/${id}` : `/incomes/${id}`;
        const promise = api.delete(endpoint);
        toast.promise(promise, { loading: 'Excluindo...', success: 'Excluído!', error: 'Falha ao excluir.' });
        try {
            await promise;
            closeDeleteModal();
            fetchTransactions(1);
        } catch (error) {
            console.error("Falha ao deletar transação", error);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Transações</h1>
                    <p className="mt-1 text-md text-slate-600 dark:text-slate-400">Veja, busque e filtre todo o seu histórico financeiro.</p>
                </div>
                <button onClick={() => handleOpenFormModal()} className="flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    <PlusIcon className="-ml-0.5 h-5 w-5" /> Nova Transação
                </button>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Buscar por descrição</label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></div>
                            <input type="text" name="search" id="search" placeholder="Ex: Aluguel, Salário..." value={filters.search} onChange={handleFilterChange} className="py-2 pl-10 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-400">De</label>
                        <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="py-2 mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 shadow-sm sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Até</label>
                        <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="py-2 mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 shadow-sm sm:text-sm" />
                    </div>
                </div>
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtrar por tipo:</span>
                    <button onClick={() => handleTypeChange('all')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${filters.type === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Todos</button>
                    <button onClick={() => handleTypeChange('income')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${filters.type === 'income' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Receitas</button>
                    <button onClick={() => handleTypeChange('expense')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${filters.type === 'expense' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Despesas</button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                {loading ? <p className="text-center dark:text-gray-300 py-10">Buscando transações...</p> :
                    <TransactionList transactions={transactions} onDelete={openDeleteModal} onEdit={handleOpenFormModal} />
                }
                <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
            </div>

            <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={transactionToEdit ? 'Editar Transação' : 'Adicionar Nova Transação'}>
                <TransactionForm onTransactionAdded={handleTransactionSuccess} transactionToEdit={transactionToEdit} />
            </Modal>

            {transactionToDelete && (
                <ConfirmationModal isOpen={!!transactionToDelete} onClose={closeDeleteModal} onConfirm={handleConfirmDelete} title="Excluir Transação">
                    Você tem certeza que deseja excluir esta transação?
                </ConfirmationModal>
            )}
        </div>
    );
}
export default TransactionsPage;