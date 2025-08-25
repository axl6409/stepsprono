import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ correctResult, incorrectResult, correctScore, incorrectScore, correctScorer, incorrectScorer }) => {
  // Données pour le graphique
  const data = {
    labels: ['Prono Correct', 'Prono Incorrect', 'Score Exact', 'Score Incorrect', 'Buteur Correct', 'Buteur Incorrect'], // Légendes
    datasets: [
      {
        data: [correctResult, incorrectResult, correctScore, incorrectScore, correctScorer, incorrectScorer], // Valeurs dynamiques
        backgroundColor: ['#02D302', '#F41731', '#02D302', '#FFB5BE', '#02D302', '#F41731'], // Couleurs
        hoverBackgroundColor: ['#1af0ba', '#dab8fc', '#fcc43f', '#9595fc', '#fce165', '#fcccd2'], // Couleurs au survol
        borderWidth: 0.5,
        borderColor: 'black',
      },
    ],
  };

  // Options pour le graphique
  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          font: {
            size: 10,
            family: 'Roboto Mono',
            style: 'normal',
            weight: '800',
          },
          color: '#000000',
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const label = data.labels[tooltipItem.dataIndex] || '';
            const value = tooltipItem.raw || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
    maintainAspectRatio: false, // Permet de gérer la taille du graphique
    responsive: true,
  };

  return (
    <div className="relative z-[12] chart-container border border-black shadow-flat-black bg-white px-2" style={{ width: '100%', height: '240px', margin: '0 auto' }}>
      <Doughnut translate="no" data={data} options={options} />
    </div>
  );
};

export default DoughnutChart;