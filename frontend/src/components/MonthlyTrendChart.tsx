import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface TrendData {
    month: string;
    totalIncome: number;
    totalExpenses: number;
}
interface ChartProps {
    data: TrendData[];
}

function MonthlyTrendChart({ data }: ChartProps) {
    const chartLabels = data.map(d => new Date(d.month + '-02').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
    const incomeData = data.map(d => d.totalIncome);
    const expenseData = data.map(d => d.totalExpenses);

    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Receitas',
                data: incomeData,
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgb(34, 197, 94)',
            },
            {
                label: 'Despesas',
                data: expenseData,
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgb(239, 68, 68)',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const, labels: { color: '#9ca3af' } },
            title: { display: true, text: 'Tendência Mensal (Últimos 12 Meses)', color: '#cbd5e1', font: { size: 16 } },
        },
        scales: {
            y: {
                ticks: { color: '#9ca3af', callback: (value: any) => `R$ ${value}` },
                grid: { color: 'rgba(156, 163, 175, 0.2)' }
            },
            x: {
                ticks: { color: '#9ca3af' },
                grid: { color: 'rgba(156, 163, 175, 0.1)' }
            }
        }
    };

    return <Line options={options} data={chartData} />;
}
export default MonthlyTrendChart;