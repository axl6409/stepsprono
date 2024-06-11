import React, {useContext, useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {UserContext} from "../contexts/UserContext.jsx";
import Week from "../components/matchs/Week.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft} from "@fortawesome/free-solid-svg-icons";
import arrowIcon from "../assets/icons/arrow-left.svg";
import Passed from "../components/matchs/Passed.jsx";

const Matchs = () => {
  const { user, setUser } = useContext(UserContext)
  const [matchs, setMatchs] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const token = localStorage.getItem('token') || cookies.token
  const navigate = useNavigate()

  useEffect(() => {
  }, [currentPage, itemsPerPage]);

  return (
    <div className="text-center relative h-auto flex flex-col justify-center overflow-x-hidden pt-12">
      <Link
        to="/dashboard"
        className="swiper-button-prev w-[30px] h-[30px] rounded-full bg-white top-7 left-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
      >
        <img src={arrowIcon} alt="Icône flèche"/>
      </Link>
      <h1
        className={`font-black mt-0 uppercase relative w-fit mx-auto text-xl5`}>Pronostics
        <span
          className="absolute left-0 top-0 right-0 text-purple-soft z-[-1] translate-x-0.5 translate-y-0.5">Pronostics</span>
        <span
          className="absolute left-0 top-0 right-0 text-green-soft z-[-2] translate-x-1 translate-y-1">Pronostics</span>
      </h1>
      <div className="px-4 relative">
        <Week token={token} user={user}/>
      </div>
    </div>
  );
}

export default Matchs
