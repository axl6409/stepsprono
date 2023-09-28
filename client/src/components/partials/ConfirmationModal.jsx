import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft, faCheck, faXmark} from "@fortawesome/free-solid-svg-icons";
import React from "react";

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="modal relative w-full py-1.5">
      <div className="modal-content py-4 px-6 mx-auto border-2 border-black w-[95%] my-auto block">
        <p className="font-sans text-center font-l leading-7">{message}</p>
        <div className="flex flex-row justify-evenly">
          <button
            className="w-fit block relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:bg-green-lime before:border-black before:border-2 group"
            onClick={onConfirm}>
            <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-1 text-center shadow-md bg-white transition -translate-y-1 translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0"><FontAwesomeIcon icon={faCheck} /></span>
          </button>
          <button
            className="w-fit block relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:bg-flat-red before:border-black before:border-2 group"
            onClick={onCancel}>
            <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-1 text-center shadow-md bg-white transition -translate-y-1 translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0"><FontAwesomeIcon icon={faXmark} /></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal