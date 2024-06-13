import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useNavigate } from "react-router-dom";
import arrowIcon from "../../assets/icons/arrow-left.svg";

const BackButton = () => {
  const history = useNavigate();

  const handleBackClick = () => {
    history(-1);
  };

  return (
    <button
      onClick={handleBackClick}
      className="swiper-button-prev w-[40px] h-[40px] rounded-full bg-white top-7 left-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
    >
      <img src={arrowIcon} alt="Icône flèche"/>
    </button>
  );
};

export default BackButton