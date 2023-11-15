import React, {useContext, useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft, faAnglesRight,
  faCirclePlus,
  faCircleXmark,
  faPen
} from "@fortawesome/free-solid-svg-icons";
import {UserContext} from "../contexts/UserContext.jsx";
import axios from "axios";
import Pagination from "../components/partials/Pagination.jsx";
import ConfirmationModal from "../components/partials/ConfirmationModal.jsx";
import Weekend from "../components/matchs/Weekend.jsx";

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
    <div className="text-center relative h-auto flex flex-col justify-center my-8">
      <h1 className="text-3xl font-black my-8 uppercase relative w-fit mx-auto">Matchs
        <span className="absolute left-0 bottom-0 text-flat-purple z-[-1] transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">Matchs</span>
        <span className="absolute left-0 bottom-0 text-green-lime z-[-2] transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">Matchs</span>
      </h1>
      <div className="px-4 relative">
        <h2 className="font-title uppercase font-black bg-white w-fit h-[35px] mx-auto px-2.5 text-[22px] border-2 border-black rounded-br-md rounded-bl-md absolute top-[-2px] left-[5%] mt-0 z-[5] shadow-flat-black-adjust">Ce Weekend</h2>
        <Weekend token={token} user={user}/>
      </div>
    </div>
  );
}

export default Matchs
