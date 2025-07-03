import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LockClosedIcon } from '@heroicons/react/24/outline';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault(); // ESSENCIAL
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/auth/register', { name, email, password });
            setSuccess('Usuário cadastrado com sucesso!');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao registrar usuário.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl">
                <div className="text-center">
                    <LockClosedIcon className="mx-auto h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Criar Conta</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Preencha os campos abaixo para se cadastrar.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5 mt-6">
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {success && <p className="text-sm text-green-500">{success}</p>}

                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300">Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 shadow"
                    >
                        Criar Conta
                    </button>
                </form>

                <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
                    Já tem conta?{' '}
                    <a href="/login" className="text-indigo-600 hover:underline">
                        Faça login aqui
                    </a>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
