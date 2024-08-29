import React, {useContext, useEffect, useState} from 'react';
import {UserContext} from "../contexts/UserContext.jsx";
import Passed from "../components/matchs/Passed.jsx";
import AnimatedTitle from "../components/partials/AnimatedTitle.jsx";
import DashboardButton from "../components/nav/DashboardButton.jsx";
import {useCookies} from "react-cookie";

const MatchsHistory = () => {
  const [cookies] = useCookies(['token']);
  const { user, setUser } = useContext(UserContext)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const token = localStorage.getItem('token') || cookies.token

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
