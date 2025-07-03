import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Importações de todas as páginas, incluindo a nova de Orçamentos
import LoginPage from './pages/Login';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import GoalsPage from './pages/GoalsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import BudgetsPage from './pages/BudgetsPage'; // <-- Garanta que este import existe
import AdminUsersPage from './pages/admin/AdminUsersPage';
import Layout from './components/Layout';

// Componente para proteger rotas normais
function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
}

// Componente para proteger rotas de admin
function AdminRoute({ children }: { children: JSX.Element }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return user.role === 'admin' ? children : <Navigate to="/dashboard" />;
}

function App() {
    return (
        <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rotas protegidas que usam o Layout principal */}
            <Route path="/" element={<ProtectedRoute> <Layout /> </ProtectedRoute>}>
                <Route index element={<Navigate to="dashboard" />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="goals" element={<GoalsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />

                {/* ROTA NOVA A SER ADICIONADA */}
                <Route path="budgets" element={<BudgetsPage />} />

                <Route path="admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
            </Route>

            {/* Rota "pega-tudo" */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default App;