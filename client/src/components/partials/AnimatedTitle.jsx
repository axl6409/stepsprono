import React, {useEffect, useState} from 'react';
import useSticky from "../../hooks/useSticky.jsx";

const AnimatedTitle = ({ title, stickyStatus = true, backgroundColor = 'bg-transparent', fontSize, uppercase, darkMode = false }) => {
  const { isSticky } = useSticky(48);
  const [animateTitle, setAnimateTitle] = useState(false);
  const style = {
    ...(isSticky ? { top: '0px' } : {}),
    ...(fontSize ? { fontSize: fontSize } : { fontSize: '3rem' }),
    ...(uppercase ? { textTransform: 'uppercase' } : {})
  };
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
      style={style}
      data-text={title}
      className={`font-black animatedTitle ${isSticky && stickyStatus === true ? 'sticky-element' : ''} w-full ${backgroundColor} fade-in py-2 overflow-hidden mb-8 mt-0 uppercase transition-all duration-200 text-center ease-in relative mx-auto ${animateTitle ? 'title-animated' : 'text-base'} leading-[70px] ${darkMode ? 'text-white' : 'text-black'}`}>
      <span translate="no" className="relative w-full z-[3] block left-0 top-0 right-0">{title}</span>
      <span
        translate="no"
        className={`absolute left-0 top-0 right-0 ${darkMode ? 'text-shadow-glow-purple text-purple-soft' : 'text-purple-soft'} z-[2] transition-all opacity-0 duration-400 ease-in-out translate-x-0.5 translate-y-2.5`}>
        {title}
      </span>
      <span
        translate="no"
        className={`absolute left-0 top-0 right-0 ${darkMode ? 'text-shadow-glow-green text-green-soft' : 'text-green-soft'} z-[1] transition-all opacity-0 duration-300 ease-in-out translate-x-1 translate-y-3`}>
        {title}
      </span>
    </h1>
  );
};

export default AnimatedTitle;