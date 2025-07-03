import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import GoalForm from '../components/GoalForm';
import ContributionForm from '../components/ContributionForm';
import ConfirmationModal from '../components/ConfirmationModal';
import GoalCard from '../components/GoalCard';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, RocketLaunchIcon } from '@heroicons/react/20/solid';
import toast from 'react-hot-toast';

interface Goal {
    id: number;
    name: string;
    target_amount: number;
    current_amount: number;
    target_date: string;
}

function GoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGoalFormModalOpen, setIsGoalFormModalOpen] = useState(false);
    const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [goalToAction, setGoalToAction] = useState<Goal | null>(null);
    const { user, logout } = useAuth();

    const canCreateGoal = user?.plan === 'premium' || goals.length < 1;

    const fetchGoals = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/goals');
            setGoals(response.data);
        } catch (error) {
            console.error("Falha ao buscar metas", error);
            if ((error as any).response?.status === 401) logout();
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const handleOpenGoalForm = (goal: Goal | null = null) => {
        setGoalToAction(goal);
        setIsGoalFormModalOpen(true);
    };

    const handleOpenNewGoalModal = () => {
        if (canCreateGoal) {
            handleOpenGoalForm(null);
        } else {
            toast.error('Você atingiu o limite de 1 meta gratuita. Torne-se Premium para criar mais!');
        }
    };

    const handleOpenContributionModal = (goal: Goal) => {
        setGoalToAction(goal);
        setIsContributionModalOpen(true);
    };

    const handleOpenDeleteModal = (goal: Goal) => {
        setGoalToAction(goal);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsGoalFormModalOpen(false);
        setIsContributionModalOpen(false);
        setIsDeleteModalOpen(false);
        setGoalToAction(null);
    };

    const handleSuccess = () => {
        handleCloseModals();
        fetchGoals();
    };

    const handleConfirmDelete = async () => {
        if (!goalToAction) return;
        const promise = api.delete(`/goals/${goalToAction.id}`);
        toast.promise(promise, {
            loading: 'Excluindo meta...',
            success: 'Meta excluída com sucesso!',
            error: 'Não foi possível excluir a meta.',
        });
        try {
            await promise;
            handleSuccess();
        } catch (error) {
            console.error("Falha ao deletar meta", error);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Metas de Economia</h1>
                    <p className="mt-1 text-md text-slate-600 dark:text-slate-400">Crie e acompanhe seus objetivos financeiros para o futuro.</p>
                </div>
                <button onClick={handleOpenNewGoalModal} className="flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    <PlusIcon className="-ml-0.5 h-5 w-5" /> Nova Meta
                </button>
            </div>
            {loading ? (
                <p className="text-center dark:text-gray-300 py-10">Carregando metas...</p>
            ) : goals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {goals.map(goal => (
                        <GoalCard key={goal.id} goal={goal} onAddContribution={handleOpenContributionModal} onEdit={handleOpenGoalForm} onDelete={handleOpenDeleteModal} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <RocketLaunchIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Nenhuma meta criada ainda</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Comece a planejar seu futuro. Crie seu primeiro objetivo!</p>
                    <div className="mt-6">
                        <button onClick={handleOpenNewGoalModal} className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                            <PlusIcon className="-ml-0.5 h-5 w-5" /> Criar Nova Meta
                        </button>
                    </div>
                </div>
            )}
            <Modal isOpen={isGoalFormModalOpen} onClose={handleCloseModals} title={goalToAction ? 'Editar Meta' : 'Criar Nova Meta'}>
                <GoalForm onSuccess={handleSuccess} goalToEdit={goalToAction} />
            </Modal>
            {goalToAction && (
                <Modal isOpen={isContributionModalOpen} onClose={handleCloseModals} title={`Adicionar Aporte para "${goalToAction.name}"`}>
                    <ContributionForm goalId={goalToAction.id} onContributionAdded={handleSuccess} />
                </Modal>
            )}
            {goalToAction && (
                <ConfirmationModal isOpen={isDeleteModalOpen} onClose={handleCloseModals} onConfirm={handleConfirmDelete} title="Excluir Meta">
                    Tem certeza que deseja excluir a meta "{goalToAction.name}"? Todas as contribuições também serão perdidas.
                </ConfirmationModal>
            )}
        </div>
    );
}
export default GoalsPage;