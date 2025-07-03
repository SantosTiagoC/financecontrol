import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function ExpensesPieChart({ data }) {
    // Prepara os dados para o formato que a Chart.js espera
    const chartData = {
        labels: data.map(item => item.categoryName), // Ex: ['Alimentação', 'Transporte']
        datasets: [
            {
                label: 'Despesas por Categoria',
                data: data.map(item => item.total), // Ex: [500.50, 150.75]
                backgroundColor: [ // Cores para cada fatia do gráfico
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                ],
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Distribuição de Despesas'
            }
        }
    }

    return <Pie data={chartData} options={options} />;
}

export default ExpensesPieChart;