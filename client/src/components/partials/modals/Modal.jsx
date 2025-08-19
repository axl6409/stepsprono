import React, { useRef } from "react";
import ReactDOM from "react-dom";
import navClose from "../../../assets/icons/nav-cross.svg";

const Modal = ({ isOpen, onClose, children }) => {
  const popupRef = useRef();

  if (!isOpen) return null;

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 fade-in delay-1000 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={handleClickOutside}>
      <div ref={popupRef} className="bg-white w-11/12 h-auto py-4 px-4 rounded shadow-lg relative">
        <button
          onClick={onClose}
          className="swiper-button-prev fade-in w-[40px] h-[40px] rounded-full bg-white top-8 right-3 left-[inherit] shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
        >
          <img src={navClose} alt="Icône flèche"/>
        </button>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default Modal;