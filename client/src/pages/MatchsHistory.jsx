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
  const [currentSeason, setCurrentSeason] = useState(null)
  const token = localStorage.getItem('token') || cookies.token

  const handleDayChange = (newMatchday) => {
    setCurrentPage(newMatchday);
  }
  const handleSeasonChange = (newSeason) => {
    setCurrentSeason(newSeason);
  }

  return (
    <div className="text-center relative z-10 h-auto flex flex-col justify-center w-full py-20">
      <DashboardButton />
      <AnimatedTitle title={"Historique"} stickyStatus={true}/>
      <div className="relative">
        <Passed token={token} user={user} onDayChange={handleDayChange} selectedDay={currentPage} onSeasonChange={handleSeasonChange} selectedSeason={currentSeason} apiUrl={apiUrl}/>
        <DayRanking matchday={currentPage} season={currentSeason} token={token} apiUrl={apiUrl} />
      </div>
    </div>
  );
}

export default MatchsHistory
