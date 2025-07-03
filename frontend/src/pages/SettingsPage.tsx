import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import Modal from '../components/Modal';
import CategoryForm from '../components/CategoryForm';
import ConfirmationModal from '../components/ConfirmationModal';
import toast from 'react-hot-toast';

// Tipagem para o objeto de categoria
interface Category {
    id: number;
    name: string;
    user_id: number | null;
}

function SettingsPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // States para controlar os modais e a categoria selecionada para uma ação
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToAction, setCategoryToAction] = useState<Category | null>(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error("Falha ao buscar categorias", error);
            toast.error("Não foi possível carregar as categorias.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // --- Funções para gerenciar os modais ---
    const handleOpenFormModal = (category: Category | null = null) => {
        setCategoryToAction(category);
        setIsFormModalOpen(true);
    };

    const handleOpenDeleteModal = (category: Category) => {
        setCategoryToAction(category);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsFormModalOpen(false);
        setIsDeleteModalOpen(false);
        setCategoryToAction(null);
    };

    // Função chamada após criar ou editar com sucesso
    const handleSuccess = () => {
        handleCloseModals();
        fetchCategories(); // Atualiza a lista
    };

    // Função para confirmar e executar a exclusão
    const handleConfirmDelete = async () => {
        if (!categoryToAction) return;

        const promise = api.delete(`/categories/${categoryToAction.id}`);

        toast.promise(promise, {
            loading: 'Excluindo categoria...',
            success: 'Categoria excluída com sucesso!',
            error: 'Não foi possível excluir a categoria.',
        });

        try {
            await promise;
            handleSuccess();
        } catch (error) {
            console.error("Falha ao deletar categoria", error);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Configurações</h1>
                <p className="mt-1 text-md text-slate-600 dark:text-slate-400">Gerencie suas preferências e dados da aplicação.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gerenciar Categorias de Despesa</h2>
                    <button onClick={() => handleOpenFormModal(null)} className="flex items-center gap-x-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                        <PlusIcon className="h-5 w-5" /> Nova Categoria
                    </button>
                </div>

                <div className="mt-4">
                    {loading ? <p className="text-center text-gray-500 dark:text-gray-400 py-4">Carregando...</p> : (
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                            {categories.map((category) => (
                                <li key={category.id} className="py-4 flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{category.name}</p>
                                    {category.user_id ? ( // Mostra botões apenas para categorias do usuário
                                        <div className="space-x-4">
                                            <button onClick={() => handleOpenFormModal(category)} className="p-1 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => handleOpenDeleteModal(category)} className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">Padrão</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Modal para Criar/Editar Categoria */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={handleCloseModals}
                title={categoryToAction ? 'Editar Categoria' : 'Criar Nova Categoria'}
            >
                <CategoryForm
                    onSuccess={handleSuccess}
                    categoryToEdit={categoryToAction}
                />
            </Modal>

            {/* Modal de Confirmação de Exclusão */}
            {categoryToAction && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={handleCloseModals}
                    onConfirm={handleConfirmDelete}
                    title="Excluir Categoria"
                >
                    Você tem certeza que deseja excluir a categoria "{categoryToAction.name}"? Esta ação não pode ser desfeita.
                </ConfirmationModal>
            )}
        </div>
    );
}

export default SettingsPage;