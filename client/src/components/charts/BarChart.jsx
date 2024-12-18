import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {Bar, Doughnut} from 'react-chartjs-2';

// Enregistrer les éléments nécessaires pour les graphiques à barres
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ userCorrectPredictions, averageCorrectPredictions }) => {
  const data = {
    labels: ['Mes Pronostics (%)', 'Moyenne Globale (%)'],
    datasets: [
      {
        label: 'Bons Pronostics',
        data: [userCorrectPredictions, averageCorrectPredictions],
        backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Comparaison des bons pronostics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="chart-container" style={{width: '90%', margin: '0 auto'}}>
      <Bar data={data} options={options}/>
    </div>
  )
}

export default BarChart;