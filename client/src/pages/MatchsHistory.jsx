import React, {useContext, useEffect, useState} from 'react';
import {UserContext} from "../contexts/UserContext.jsx";
import Passed from "../components/matchs/Passed.jsx";
import AnimatedTitle from "../components/partials/AnimatedTitle.jsx";
import DashboardButton from "../components/nav/DashboardButton.jsx";
import {useCookies} from "react-cookie";
import DayRanking from "../components/partials/DayRanking.jsx";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const MatchsHistory = () => {
  const [cookies] = useCookies(['token']);
  const { user } = useContext(UserContext)
  const [currentPage, setCurrentPage] = useState(1)
  const token = localStorage.getItem('token') || cookies.token

  const handleDayChange = (newMatchday) => {
    setCurrentPage(newMatchday);
  }

  return (
    <div className="text-center relative h-auto flex flex-col justify-center w-full pt-20">
      <DashboardButton />
      <AnimatedTitle title={"Historique"} animate={false}/>
      <div className="relative">
        <Passed token={token} user={user} onDayChange={handleDayChange} selectedDay={currentPage} apiUrl={apiUrl}/>
        <DayRanking matchday={currentPage} token={token} apiUrl={apiUrl} />
      </div>
    </div>
  );
}

export default MatchsHistory
