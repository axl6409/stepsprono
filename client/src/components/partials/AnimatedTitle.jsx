import React, {useEffect, useState} from 'react';

const AnimatedTitle = ({ title }) => {

  const [animateTitle, setAnimateTitle] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateTitle(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <h1
      className={`font-black fade-in my-8 mt-0 uppercase transition-all duration-500 text-center ease-in-out relative w-fit mx-auto ${animateTitle ? 'title-animated' : 'text-base'}`}>
      <span className="relative z-[3]">{title}</span>
      <span
        className="absolute left-0 top-0 right-0 text-purple-soft z-[2] transition-all opacity-0 duration-400 ease-in-out translate-x-0.5 translate-y-0.5">
        {title}
      </span>
      <span
        className="absolute left-0 top-0 right-0 text-green-soft z-[1] transition-all opacity-0 duration-300 ease-in-out translate-x-1 translate-y-1">
        {title}
      </span>
    </h1>
  );
};

export default AnimatedTitle;