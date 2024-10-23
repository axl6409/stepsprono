import React, {useEffect, useState} from 'react';
import useSticky from "../../hooks/useSticky.jsx";

const AnimatedTitle = ({ title, stickyStatus = true }) => {
  const { isSticky } = useSticky(50);
  const [animateTitle, setAnimateTitle] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateTitle(true);
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <h1
      translate="no"
      style={isSticky ? { top: `0px` } : {}}
      className={`font-black animatedTitle ${isSticky && stickyStatus === true ? 'sticky-element' : ''} w-full bg-white fade-in overflow-hidden mb-8 mt-0 uppercase transition-all duration-200 text-center ease-in relative mx-auto ${animateTitle ? 'title-animated' : 'text-base'}`}>
      <span translate="no" className="relative z-[3] block left-0 top-0 right-0">{title}</span>
      <span
        translate="no"
        className="absolute left-0 top-0 right-0 text-purple-soft z-[2] transition-all opacity-0 duration-400 ease-in-out translate-x-0.5 translate-y-0.5">
        {title}
      </span>
      <span
        translate="no"
        className="absolute left-0 top-0 right-0 text-green-soft z-[1] transition-all opacity-0 duration-300 ease-in-out translate-x-1 translate-y-1">
        {title}
      </span>
    </h1>
  );
};

export default AnimatedTitle;