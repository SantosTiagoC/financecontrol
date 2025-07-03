import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Cog6ToothIcon, ChartBarIcon, HomeIcon, ArrowTrendingUpIcon, BanknotesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import ThemeToggleButton from './ThemeToggleButton';
import { useAuth } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { PresentationChartLineIcon } from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Transações', href: '/transactions', icon: BanknotesIcon },
    { name: 'Metas', href: '/goals', icon: ArrowTrendingUpIcon },
    { name: 'Relatórios', href: '/reports', icon: ChartBarIcon },
    { name: 'Configurações', href: '/settings', icon: Cog6ToothIcon },
    { name: 'Orçamentos', href: '/budgets', icon: PresentationChartLineIcon }, // <-- NOVO
];

function Layout() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex text-slate-800 dark:text-slate-200">
            <div><Toaster position="top-right" toastOptions={{ className: 'dark:bg-gray-700 dark:text-white', duration: 4000 }} /></div>
            <aside className="w-64 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">FinançaFutura</h1>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navigation.map((item) => (
                        <NavLink key={item.name} to={item.href} className={({ isActive }) => `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            <item.icon className="h-5 w-5 mr-3" /> {item.name}
                        </NavLink>
                    ))}
                    {/* MUDANÇA: Link do Admin só aparece se o usuário for admin */}
                    {user?.role === 'admin' && (
                        <NavLink to="/admin/users" className={({ isActive }) => `flex items-center px-4 py-2.5 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 text-sm font-medium transition-colors ${isActive ? 'bg-amber-600 text-white' : 'text-amber-700 dark:text-amber-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            <ShieldCheckIcon className="h-5 w-5 mr-3" /> Painel Admin
                        </NavLink>
                    )}
                </nav>
                <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700"><ThemeToggleButton /><button onClick={logout} className="mt-4 w-full text-left hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg text-sm font-medium">Sair</button></div>
            </aside>
            <main className="flex-1 overflow-y-auto"><div className="p-8"><Outlet /></div></main>
        </div>
    );
}
export default Layout;