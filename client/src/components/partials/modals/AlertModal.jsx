import React from 'react';
import correctIcon from '../../../assets/icons/correct-icon.svg';
import redcardIcon from '../../../assets/icons/redcard-icon.svg';

const AlertModal = ({ message, type }) => {
  if (!message) return null;

  const color = type === 'error' ? 'deep-red' : 'green-soft';

  return (
    <div className={`modal-error fixed z-[90] w-11/12 left-1/2 translate-x-[-50%] top-1/2 translate-y-[-50%]`}>
      <div className={`absolute w-full h-auto rounded-xl block z-[1] inset-0 bg-${color} border-black border translate-x-1 translate-y-1`}></div>
      <div className={`relative p-4 w-full h-auto border border-black rounded-xl z-[2] bg-white`}>
        <img className="w-[50px] block mx-auto" src={`${type === 'error' ? redcardIcon : correctIcon}`} alt=""/>
        <p className={`font-roboto uppercase ${ type === 'error' ? 'text-deep-red' : 'text-green-soft' } font-black text-l`}>{message}</p>
      </div>
    </div>
  );
};

export default AlertModal;
