import React from 'react';
import { Bar } from 'react-chartjs-2';

const BarChartGrouped = ({ data, userId }) => {
  const labels = Array.from(new Set(data.map(item => `Journée ${item.matchday}`)));

  const chartData = {
    labels,
    datasets: data.reduce((datasets, item) => {
      let userDataset = datasets.find(ds => ds.label === item.user_name);
      if (!userDataset) {
        userDataset = {
          label: item.user_name,
          data: Array(labels.length).fill(0),
          backgroundColor: item.user_id === userId ? 'rgba(255, 99, 132, 0.8)' : `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
        };
        datasets.push(userDataset);
      }
      const index = labels.indexOf(`Journée ${item.matchday}`);
      userDataset.data[index] = item.totalPoints || 0;
      return datasets;
    }, []),
  };

  const options = { responsive: true, maintainAspectRatio: false };

  return <Bar data={chartData} options={options} />;
};

export default BarChartGrouped;
