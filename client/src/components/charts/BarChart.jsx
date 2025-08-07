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
        text: 'Mes pronos / Moyenne générale',
        font: {
          size: 14,
          family: 'Montserrat',
          weight: '600',
        },
        color: '#333333',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 14,
            family: 'Rubik',
            weight: 'medium',
            style: 'normal',
          },
          color: '#6666FF',
        },
        title: {
          display: true,
          text: 'Pourcentage',
          font: {
            size: 12,
            family: 'Rubik',
            weight: '600',
            style: 'normal',
          },
          color: '#414141',
        },
      },
      x: {
        ticks: {
          font: {
            size: 14,
            family: 'Rubik',
            weight: 'medium',
            style: 'normal',
          },
          color: '#6666FF',
        },
        title: {
          display: true,
          text: 'Bons pronos',
          font: {
            size: 14,
            family: 'Rubik',
            weight: '600',
            style: 'normal',
          },
          color: '#414141',
        },
      },
    },
  };

  return (
    <div className="relative z-[12] chart-container border border-black shadow-flat-black-adjust rounded-xl bg-white" style={{width: '90%', margin: '0 auto'}}>
      <Bar data={data} options={options}/>
    </div>
  )
}

export default BarChart;