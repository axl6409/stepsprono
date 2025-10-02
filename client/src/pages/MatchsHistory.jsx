import React, {useContext, useEffect, useState} from 'react';
import {UserContext} from "../contexts/UserContext.jsx";
import Passed from "../components/matchs/Passed.jsx";
import AnimatedTitle from "../components/partials/AnimatedTitle.jsx";
import DashboardButton from "../components/nav/DashboardButton.jsx";
import {useCookies} from "react-cookie";
import DayRanking from "../components/partials/DayRanking.jsx";
import BackButton from "../components/nav/BackButton.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const MatchsHistory = () => {
  const [cookies] = useCookies(['token']);
  const { user } = useContext(UserContext)
  const [currentSeason, setCurrentSeason] = useState(null)
  const token = localStorage.getItem('token') || cookies.token
  const storedSeasonId = localStorage.getItem('selectedSeasonId');
  const storedMatchday = storedSeasonId
    ? localStorage.getItem(`selectedMatchdayIndex_${storedSeasonId}`)
    : null;
  const [currentPage, setCurrentPage] = useState(storedMatchday ? parseInt(storedMatchday, 10) : 1);

  const handleDayChange = (newMatchday) => {
    setCurrentPage(newMatchday);
  }

  const handleSeasonChange = (newSeason) => {
    setCurrentSeason(newSeason);
  }

  return (
    <div className="text-center relative z-10 h-auto flex flex-col justify-center w-full py-20">
      <BackButton bottom={true}/>
      <AnimatedTitle title={"Historique"} backgroundColor={'bg-white'} stickyStatus={true}/>
      <div className="relative">
        <Passed token={token} user={user} onDayChange={handleDayChange} selectedDay={currentPage} onSeasonChange={handleSeasonChange} selectedSeason={currentSeason} apiUrl={apiUrl}/>
        <DayRanking matchday={currentPage} season={currentSeason} token={token} apiUrl={apiUrl} onDayChange={handleDayChange}/>
      </div>
    </div>
  );
}

export default MatchsHistory
