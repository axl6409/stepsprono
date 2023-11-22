import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft, faCheck, faCircleQuestion, faXmark} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";

const InformationModal = ({message, closeModal }) => {

  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      closeModal();
    }, 500);
  };

  const renderContent = () => {
    if (typeof message === 'string') {
      return <div dangerouslySetInnerHTML={{ __html: message }}></div>;
    }
    if (typeof message === 'object' && message !== null) {
      return (
        <ul>
          {Object.entries(message).map(([key, value], index) => (
            <li key={index}>
              <span>{key}</span>
              <span>{value.long}</span>
              <span>{value.type}</span>
              <span>{value.description}</span>
            </li>
          ))}
        </ul>
      );
    }
    return <div>Contenu non valide</div>;
  };

  return (
    <div className={`modal ${isExiting ? 'modal-exit' : 'modal-enter'} fixed z-[20] right-0 left-0 top-0 w-full h-100vh flex flex-col justify-center pt-4 pb-8 border-2 border-black bg-electric-blue`}>
      <button
        onClick={handleClose}
        className="relative ml-auto mr-4 mb-4 block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
      >
        <span className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
          <FontAwesomeIcon icon={faXmark} className="cursor-pointer" />
        </span>
      </button>
      <div className="modal-content block w-[95%] mx-auto bg-white">
        <div className="py-4 px-6 mx-auto border-2 border-black w-full shadow-flat-black">
          <div className="font-sans text-left font-l font-medium leading-7 informations-text-styles">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformationModal