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
        backgroundColor: ['#00CC99', '#CC99FF', '#F7B009', '#6666FF', '#FDD41D', '#FFB5BE'], // Couleurs
        hoverBackgroundColor: ['#1af0ba', '#dab8fc', '#fcc43f', '#9595fc', '#fce165', '#fcccd2'], // Couleurs au survol
        borderWidth: 1,
        borderColor: 'black',
      },
    ],
  };

  // Options pour le graphique
  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'right', // Position de la légende
        labels: {
          font: {
            size: 12,
            family: 'Montserrat',
            style: 'normal',
            weight: '700',
          },
          color: '#414141',
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
    <div className="chart-container border border-black shadow-flat-black-adjust rounded-xl bg-white px-4" style={{ width: '90%', height: '240px', margin: '0 auto' }}>
      <Doughnut translate="no" data={data} options={options} />
    </div>
  );
};

export default DoughnutChart;