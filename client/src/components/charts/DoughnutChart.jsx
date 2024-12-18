import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ homePerformance, awayPerformance }) => {
  const data = {
    labels: ['Domicile', 'Extérieur'],
    datasets: [
      {
        data: [homePerformance, awayPerformance],
        backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="chart-container">
      <h2>Performances : Domicile vs Extérieur</h2>
      <Doughnut data={data} />
    </div>
  );
};

export default DoughnutChart;
