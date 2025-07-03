import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Category {
    id: number;
    name: string;
}

interface CategoryFormProps {
    onSuccess: () => void;
    categoryToEdit: Category | null;
}

function CategoryForm({ onSuccess, categoryToEdit }: CategoryFormProps) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const isEditing = !!categoryToEdit;

    useEffect(() => {
        if (isEditing) {
            setName(categoryToEdit.name);
        } else {
            setName('');
        }
        setError('');
    }, [categoryToEdit]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('O nome da categoria é obrigatório.');
            return;
        }

        const endpoint = isEditing ? `/categories/${categoryToEdit.id}` : '/categories';
        const method = isEditing ? 'put' : 'post';
        const promise = api[method](endpoint, { name });

        toast.promise(promise, {
            loading: 'Salvando categoria...',
            success: `Categoria ${isEditing ? 'atualizada' : 'criada'} com sucesso!`,
            error: `Não foi possível salvar a categoria.`,
        });

        try {
            await promise;
            onSuccess();
        } catch (err) {
            console.error("Falha ao salvar categoria", err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Nome da Categoria
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        id="category-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={`py-2 px-3 block w-full rounded-md dark:bg-gray-700 dark:text-gray-200 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    />
                </div>
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    {isEditing ? 'Salvar Alterações' : 'Criar Categoria'}
                </button>
            </div>
        </form>
    );
}

export default CategoryForm;