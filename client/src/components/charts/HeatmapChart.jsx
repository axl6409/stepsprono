import React from 'react';
import HeatMap from 'react-heatmap-grid';

const HeatmapChart = ({ data }) => {
  const labelsX = Array.from(new Set(data.map(item => `Journée ${item.matchday}`)));
  const labelsY = [...new Set(data.map(item => item.user_name))];

  const heatmapData = labelsY.map(user =>
    labelsX.map(day => {
      const userPoints = data.find(d => d.user_name === user && `Journée ${d.matchday}` === day);
      return userPoints ? userPoints.totalPoints : 0;
    })
  );

  return <HeatMap xLabels={labelsX} yLabels={labelsY} data={heatmapData} />;
};

export default HeatmapChart;
