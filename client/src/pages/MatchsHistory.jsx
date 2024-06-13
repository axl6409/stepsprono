import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {UserContext} from "../contexts/UserContext.jsx";
import Passed from "../components/matchs/Passed.jsx";
import BackButton from "../components/nav/BackButton.jsx";

const MatchsHistory = () => {
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
    <div className="text-center relative h-auto flex flex-col justify-center overflow-x-hidden pt-20">
      <BackButton />
      <h1
        className={`font-black mt-0 uppercase relative w-fit mx-auto text-xl5`}>Historique
        <span
          className="absolute left-0 top-0 right-0 text-purple-soft z-[-1] translate-x-0.5 translate-y-0.5">Historique</span>
        <span
          className="absolute left-0 top-0 right-0 text-green-soft z-[-2] translate-x-1 translate-y-1">Historique</span>
      </h1>
      <div className="relative">
        <Passed token={token} user={user}/>
      </div>
    </div>
  );
}

export default MatchsHistory
