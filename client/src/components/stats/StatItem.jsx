import React from 'react';

const StatItem = ({ title, value, status }) => (
  <div className={`w-[100px] h-[120px] border border-black m-4 p-2 rounded-xl shadow-flat-black-adjust ${status ? 'bg-green-light' : 'bg-red-light'}`}>
    <h2 translate="no" className={`font-rubik font-light text-sm text-center stroke-black leading-4 ${status ? 'text-white' : 'text-black'}`}>{title}</h2>
    <div className="stat-item mt-4 text-center">
      <p translate="no" className={`font-rubik font-bold text-[175%] stroke-black text-white text-center`}>{value}</p>
    </div>
  </div>
);

export default StatItem;
