import React from 'react';
import correctIcon from '../../assets/icons/correct-icon.svg';
import redcardIcon from '../../assets/icons/redcard-icon.svg';
import warningIcon from '../../assets/icons/warning-icon.webp';

const AlertModal = ({ message, type, onConfirm, onCancel }) => {
  if (!message) return null;

  let textColor, icon;

  switch (type) {
    case 'error':
      textColor = 'text-deep-red';
      icon = redcardIcon;
      break;
    case 'warning':
      textColor = 'text-black';
      icon = warningIcon;
      break;
    default: // success
      textColor = 'text-green-soft';
      icon = correctIcon;
      break;
  }

  return (
    <div className="modal-error fixed z-[90] inset-0">
      <div onClick={onCancel} className={`absolute w-full h-auto block z-[1] inset-0 bg-black opacity-40`}></div>
      <div className="absolute z-[2] w-10/12 left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <div className="relative p-4 w-full h-auto border border-black rounded-xl bg-white">
          <img className="w-[50px] block mx-auto" src={icon} alt="" />
          <p
            translate="no"
            className={`font-roboto no-correct uppercase ${textColor} font-black text-center text-sm`}
          >
            {message}
          </p>

          {type === 'warning' && (
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="px-4 py-1 bg-green-soft border border-black rounded-md font-rubik shadow-flat-black-adjust"
                onClick={onConfirm}
              >
                Oui
              </button>
              <button
                className="px-4 py-1 bg-red-light border border-black rounded-md font-rubik shadow-flat-black-adjust"
                onClick={onCancel}
              >
                Non
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
