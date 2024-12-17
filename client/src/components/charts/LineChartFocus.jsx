import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChartFocus = ({ data, userId }) => {
  const labels = Array.from(new Set(data.map(item => `Journée ${item.matchday}`)));

  const chartData = {
    labels: labels,
    datasets: data.reduce((datasets, item) => {
      let userDataset = datasets.find(ds => ds.label === item.user_name);
      if (!userDataset) {
        userDataset = {
          label: item.user_name,
          data: Array(labels.length).fill(0),
          borderColor: item.user_id === userId ? 'rgba(255, 0, 0, 1)' : 'rgba(0, 0, 0, 0.2)',
          borderWidth: item.user_id === userId ? 3 : 1,
          backgroundColor: 'transparent',
          tension: 0.3,
        };
        datasets.push(userDataset);
      }
      const index = labels.indexOf(`Journée ${item.matchday}`);
      userDataset.data[index] = item.totalPoints || 0;
      return datasets;
    }, []),
  };

  const options = { responsive: true, maintainAspectRatio: false };

  return <Line data={chartData} options={options} />;
};

export default LineChartFocus;
