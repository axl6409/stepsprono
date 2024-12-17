import React from 'react';
import CircularText from "../partials/CircularText.jsx";

const StatItem = ({ title, value }) => (
  <div>
    <h2>{title}</h2>
    <div className="stat-item relative w-fit">
      <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-rubik font-bold text-3xl">{value}</p>
      <CircularText text={title} radius={50}/>
    </div>
  </div>
);

export default StatItem;
