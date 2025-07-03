import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import MonthlyTrendChart from '../components/MonthlyTrendChart';

interface TrendData {
    month: string;
    totalIncome: number;
    totalExpenses: number;
}

function ReportsPage() {
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTrendData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/reports/monthly-trend');
            setTrendData(response.data);
        } catch (error) {
            console.error("Falha ao buscar dados de tendência", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrendData();
    }, [fetchTrendData]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Relatórios</h1>
                <p className="mt-1 text-md text-slate-600 dark:text-slate-400">Analise a evolução da sua saúde financeira ao longo do tempo.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                <div className="h-96"> {/* Container com altura fixa para o gráfico */}
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-center text-gray-500 dark:text-gray-400">Carregando gráfico...</p>
                        </div>
                    ) : trendData.length > 0 ? (
                        <MonthlyTrendChart data={trendData} />
                    ) : (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-center text-gray-500 dark:text-gray-400">Não há dados suficientes para gerar o relatório de tendência.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default ReportsPage;