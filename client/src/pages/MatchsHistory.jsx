import React, {useContext, useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {UserContext} from "../contexts/UserContext.jsx";
import Passed from "../components/matchs/Passed.jsx";
import BackButton from "../components/nav/BackButton.jsx";
import arrowIcon from "../assets/icons/arrow-left.svg";
import AnimatedTitle from "../components/partials/AnimatedTitle.jsx";
import DashboardButton from "../components/nav/DashboardButton.jsx";

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
      <DashboardButton />
      <AnimatedTitle title={"Historique"} animate={false}/>
      <div className="relative">
        <Passed token={token} user={user}/>
      </div>
    </div>
  );
}

export default MatchsHistory
