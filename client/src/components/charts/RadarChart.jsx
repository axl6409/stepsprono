import React from 'react';
import { Radar } from 'react-chartjs-2';

const RadarChart = ({ data, userId }) => {
  const labels = Array.from(new Set(data.map(item => `Journée ${item.matchday}`)));

  const chartData = {
    labels,
    datasets: data.reduce((datasets, item) => {
      let userDataset = datasets.find(ds => ds.label === item.user_name);
      if (!userDataset) {
        userDataset = {
          label: item.user_name,
          data: Array(labels.length).fill(0),
          backgroundColor: item.user_id === userId ? 'rgba(255, 99, 132, 0.5)' : 'rgba(0, 0, 0, 0.1)',
          borderColor: item.user_id === userId ? 'rgba(255, 99, 132, 1)' : 'rgba(0, 0, 0, 0.3)',
          borderWidth: 1,
        };
        datasets.push(userDataset);
      }
      const index = labels.indexOf(`Journée ${item.matchday}`);
      userDataset.data[index] = item.totalPoints || 0;
      return datasets;
    }, []),
  };

  return <Radar data={chartData} />;
};

export default RadarChart;
