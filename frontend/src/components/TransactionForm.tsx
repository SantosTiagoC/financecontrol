import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CurrencyInput from 'react-currency-input-field';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, PencilSquareIcon, BanknotesIcon, CalendarDaysIcon, TagIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function TransactionForm({ onTransactionAdded, transactionToEdit }) {
    const [transactionType, setTransactionType] = useState('expense');
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const isEditing = !!transactionToEdit;

    useEffect(() => {
        setErrors({});
        if (isEditing) {
            setTransactionType(transactionToEdit.type);
            setDescription(transactionToEdit.description);
            setValue(transactionToEdit.value.toString());
            setDate(new Date(transactionToEdit.date).toISOString().slice(0, 10));
            if (transactionToEdit.type === 'expense') {
                setCategoryId(transactionToEdit.category_id);
            }
        } else {
            setDescription('');
            setValue('');
            setDate(new Date().toISOString().slice(0, 10));
            setTransactionType('expense');
            if (categories.length > 0) {
                setCategoryId(categories[0].id);
            } else {
                setCategoryId('');
            }
        }
    }, [transactionToEdit, categories]);

    useEffect(() => {
        if (transactionType === 'expense') {
            api.get('/categories')
                .then(res => setCategories(res.data))
                .catch(() => toast.error('Erro ao carregar categorias'));
        }
    }, [transactionType]);

    const validateForm = () => {
        const newErrors = {};
        if (!description) newErrors.description = 'Informe uma descrição';
        if (!value || parseFloat(value.replace('.', '').replace(',', '.')) <= 0) newErrors.value = 'Informe um valor válido';
        if (!date) newErrors.date = 'Informe a data';
        if (transactionType === 'expense' && !categoryId) newErrors.category = 'Selecione uma categoria';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const data = {
            description,
            value: parseFloat(value.replace('.', '').replace(',', '.')),
            date,
            type: transactionType,
            ...(transactionType === 'expense' && { category_id: categoryId })
        };

        try {
            if (isEditing) {
                await api.put(`/transactions/${transactionToEdit.id}`, data);
                toast.success('Transação atualizada com sucesso!');
            } else {
                await api.post('/transactions', data);
                toast.success('Transação adicionada com sucesso!');
            }
            onTransactionAdded?.();
        } catch (err) {
            console.error(err);
            toast.error('Erro ao salvar a transação');
        }
    };

    const selectedCategory = categories.find(c => c.id === categoryId);
    const typeForColor = isEditing ? transactionToEdit.type : transactionType;
    const expenseButtonClasses = typeForColor === 'expense' ? 'bg-red-500 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50';
    const incomeButtonClasses = typeForColor === 'income' ? 'bg-green-500 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50';
    const submitButtonClasses = typeForColor === 'expense' ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500' : 'bg-green-500 hover:bg-green-600 focus:ring-green-500';

    return (
        <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-gray-900">
                <BanknotesIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                    {isEditing ? 'Editar Transação' : 'Adicionar Nova Transação'}
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {isEditing ? 'Ajuste os detalhes da sua movimentação.' : 'Registre uma nova movimentação financeira.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 mt-6" noValidate>
                <div className="flex items-center justify-center p-1 rounded-xl bg-gray-100 dark:bg-gray-900">
                    <button
                        type="button"
                        onClick={() => setTransactionType('expense')}
                        disabled={isEditing}
                        className={`w-full py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${isEditing ? 'cursor-not-allowed opacity-60' : ''} ${expenseButtonClasses}`}
                    >
                        Despesa
                    </button>
                    <button
                        type="button"
                        onClick={() => setTransactionType('income')}
                        disabled={isEditing}
                        className={`w-full py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${isEditing ? 'cursor-not-allowed opacity-60' : ''} ${incomeButtonClasses}`}
                    >
                        Receita
                    </button>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                        {isEditing ? 'Descrição' : (transactionType === 'expense' ? 'Descrição da Despesa' : 'Descrição da Receita')}
                    </label>
                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <PencilSquareIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="Ex: Aluguel, Salário"
                            className={`py-2 pl-10 block w-full rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.description ? 'border-red-500' : ''}`}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="value" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Valor</label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <BanknotesIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <CurrencyInput
                                id="value"
                                name="value"
                                value={value}
                                onValueChange={(value) => setValue(value)}
                                required
                                placeholder="R$ 0,00"
                                intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                                className={`py-2 pl-10 block w-full rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.value ? 'border-red-500' : ''}`}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Data</label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className={`py-2 pl-10 block w-full rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.date ? 'border-red-500' : ''}`}
                            />
                        </div>
                    </div>
                </div>

                {transactionType === 'expense' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Categoria</label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <TagIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <Listbox value={categoryId} onChange={setCategoryId}>
                                <Listbox.Button className={`py-2 pl-10 relative w-full cursor-default rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-left shadow-sm border focus:outline-none sm:text-sm ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                    <span className="block truncate">
                                        {selectedCategory ? selectedCategory.name : "Selecione uma categoria"}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                                    </span>
                                </Listbox.Button>
                                <Transition as={React.Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                        {categories.map((category) => (
                                            <Listbox.Option
                                                key={category.id}
                                                value={category.id}
                                                className={({ active }) =>
                                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 rounded-md transition ${active
                                                        ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-500 dark:text-white'
                                                        : 'text-gray-900 dark:text-gray-200'
                                                    }`
                                                }
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                            {category.name}
                                                        </span>
                                                        {selected && (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-300">
                                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </Listbox>
                        </div>
                    </div>
                )}

                <div className="pt-4">
                    <button type="submit" className={`w-full inline-flex justify-center rounded-lg border border-transparent px-4 py-3 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${isEditing ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' : submitButtonClasses}`}>
                        {isEditing ? 'Salvar Alterações' : `Adicionar ${typeForColor === 'expense' ? 'Despesa' : 'Receita'}`}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TransactionForm;
