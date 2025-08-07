import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const LineChart = ({ pointsByMatchday, userId }) => {
  const labels = Array.from(new Set(pointsByMatchday.map(item => `Journée ${item.matchday}`)));

  const data = {
    labels: labels,
    datasets: pointsByMatchday.reduce((datasets, item) => {
      let userDataset = datasets.find(ds => ds.label === item.user_name);
      if (!userDataset) {
        userDataset = {
          label: item.user_name,
          data: Array(labels.length).fill(0),
          borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
          backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`,
          tension: 0.3,
          hidden: item.user_id !== parseInt(userId, 10),
        };
        datasets.push(userDataset);
      }

      const matchdayIndex = labels.indexOf(`Journée ${item.matchday}`);
      if (matchdayIndex !== -1) {
        userDataset.data[matchdayIndex] = item.totalPoints || 0;
      }

      return datasets;
    }, []),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 20,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="chart-container relative z-[12]" style={{ height: '600px' }}>
      <h2>Points par Journée Sportive</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
