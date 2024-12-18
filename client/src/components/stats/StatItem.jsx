import React from 'react';

const StatItem = ({ title, value, status }) => (
  <div className={`w-[100px] h-[120px] border border-black m-4 p-2 rounded-xl shadow-flat-black-adjust ${status ? 'bg-green-light' : 'bg-red-light'}`}>
    <h2 className="font-rubik font-light text-sm text-center leading-4">{title}</h2>
    <div className="stat-item mt-4 text-center">
      <p className="font-rubik font-bold text-3xl text-center">{value}</p>
    </div>
  </div>
);

export default StatItem;
