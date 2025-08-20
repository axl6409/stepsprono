import React from "react";
import {Link} from "react-router-dom";
import arrowIcon from "../../assets/icons/arrow-left.svg";

const DashboardButton = () => {

  return (
    <Link
      to="/dashboard"
      className="swiper-button-prev back-button fixed z-[500] fade-in w-[40px] h-[40px] rounded-full bg-white top-8 left-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
    >
      <img src={arrowIcon} alt="Icône flèche" />
    </Link>
  );
};

export default DashboardButton