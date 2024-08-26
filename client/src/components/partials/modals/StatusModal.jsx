import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faCaretLeft,
  faCheck,
  faCircleQuestion,
  faTriangleExclamation,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";

const StatusModal = ({message, status, closeModal }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      closeModal();
    }, 500);
  };

  return (
    <div className={`modal ${isExiting ? 'modal-exit' : 'modal-enter'} fixed z-[20] right-0 left-0 top-4 w-full flex flex-col justify-center py-4`}>
      <div className="modal-content block w-[95%] mx-auto bg-white">
        <div className="relative flex flex-row justify-between py-2 pr-2 pl-10 mx-auto border-2 border-black w-full shadow-flat-black">
          <div className={`absolute top-0 left-0 bottom-0 flex flex-col justify-center p-4 ${status === true ? 'bg-green-lime' : 'bg-deep-red'} border-r-2 border-black`}>
            {status === true ? (
              <FontAwesomeIcon icon={faCheck} />
            ) : (
              <FontAwesomeIcon icon={faTriangleExclamation} />
            )}
          </div>
          <div translate="no" className="font-sans text-left font-l font-medium leading-7 informations-text-styles mx-4">
            {message}
          </div>
          <button
            translate="no"
            onClick={handleClose}
            className="relative my-auto block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
          >
            <span translate="no" className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
              <FontAwesomeIcon icon={faXmark} className="cursor-pointer" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal