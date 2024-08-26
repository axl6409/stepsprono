import React from 'react';

const SimpleTitle = ({ title }) => {

  return (
    <h1
      className={`font-black fade-in mb-12 text-center relative w-fit mx-auto text-xl5 leading-[50px]`}>
      <span translate="no" className="relative z-[3]">{title}</span>
      <span
        translate="no"
        className="absolute left-0 top-0 right-0 text-purple-soft z-[2] translate-x-0.5 translate-y-0.5">{title}</span>
      <span
        translate="no"
        className="absolute left-0 top-0 right-0 text-green-soft z-[1] translate-x-1 translate-y-1">{title}</span>
    </h1>
  );
};

export default SimpleTitle;