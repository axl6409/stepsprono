import React from "react";
import { useNavigate } from "react-router-dom";
import useCanGoBack from "../../hooks/useCanGoBack.jsx";
import arrowIcon from "../../assets/icons/arrow-left.svg";

const BackButton = ({ fallback = "/dashboard", bottom = false }) => {
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();

  if (!canGoBack) return null;

  const handleBackClick = () => {
    const idx = window.history?.state?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(fallback);
  };

  return (
    <button
      onClick={handleBackClick}
      className={`nav-back-button mt-0 cursor-pointer flex items-center justify-center back-button fixed z-[500] fade-in w-[40px] h-[40px] rounded-full bg-white ${bottom ? "bottom-5 left-2" : "top-2 left-2"} shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none`}
    >
      <img src={arrowIcon} alt="Icône flèche"/>
    </button>
  );
};

export default BackButton