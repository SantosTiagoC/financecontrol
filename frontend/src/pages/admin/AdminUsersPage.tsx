import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface User {
    id: number;
    email: string;
    plan: 'free' | 'premium';
    role: 'user' | 'admin';
    created_at: string;
}

function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            toast.error("Não foi possível carregar os usuários.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleUpdateUser = async (userId: number, plan: string, role: string) => {
        const promise = api.put(`/admin/users/${userId}`, { plan, role });
        toast.promise(promise, {
            loading: 'Atualizando usuário...',
            success: 'Usuário atualizado com sucesso!',
            error: 'Falha ao atualizar usuário.'
        });
        try {
            await promise;
            fetchUsers();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Gerenciamento de Usuários</h1>
                <p className="mt-1 text-md text-slate-600 dark:text-slate-400">Visualize e gerencie todos os usuários da plataforma.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                {loading ? <p className="dark:text-gray-300">Carregando...</p> : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuário (Email)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plano</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Função</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select value={user.plan} onChange={(e) => handleUpdateUser(user.id, e.target.value, user.role)} className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                                            <option value="free">Free</option>
                                            <option value="premium">Premium</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select value={user.role} onChange={(e) => handleUpdateUser(user.id, user.plan, e.target.value)} className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default AdminUsersPage;