import React, {useContext, useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {UserContext} from "../../contexts/UserContext.jsx";
import axios from "axios";
import Pagination from "../../components/partials/Pagination.jsx";

const UpcomingMatchs = () => {
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
    <div className="text-center relative h-auto pt-16 flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-4">Matchs</h1>
      <div className="px-4">
        <h2 className="font-title uppercase font-black bg-white w-fit h-[35px] mx-auto px-2.5 text-[22px] border-r-2 border-b-2 border-l-2 border-black rounded-br-md rounded-bl-md relative z-[5] bottom-[-35px] shadow-flat-black-adjust">Ce Weekend</h2>
      </div>
    </div>
  );
}

export default UpcomingMatchs
