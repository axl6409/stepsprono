import React, {useContext, useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {UserContext} from "../contexts/UserContext.jsx";
import Week from "../components/matchs/Week.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft} from "@fortawesome/free-solid-svg-icons";
import arrowIcon from "../assets/icons/arrow-left.svg";
import Passed from "../components/matchs/Passed.jsx";
import {useCookies} from "react-cookie";
import AnimatedTitle from "../components/partials/AnimatedTitle.jsx";
import Pronostic from "../components/matchs/Pronostic.jsx";

const Matchs = () => {
  const { user, setUser } = useContext(UserContext)
  const [cookies, setCookie] = useCookies(["user"]);
  const [matchs, setMatchs] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const token = localStorage.getItem('token') || cookies.token
  const navigate = useNavigate()

  useEffect(() => {
  }, [currentPage, itemsPerPage]);

  return (
    <div className="text-center relative h-auto flex flex-col justify-center overflow-x-hidden py-12">
      <Link
        to="/dashboard"
        className="swiper-button-prev w-[30px] h-[30px] rounded-full bg-white top-7 left-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
      >
        <img src={arrowIcon} alt="Icône flèche"/>
      </Link>
      <AnimatedTitle title={"Pronostics"} />
      <div className="px-4 relative">
        <Week token={token} user={user}/>
      </div>
    </div>
  );
}

export default Matchs
