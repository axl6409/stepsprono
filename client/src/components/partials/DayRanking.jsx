import React, { useEffect, useState } from "react";
import Loader from "../partials/Loader.jsx";
import axios from "axios";
import useSticky from "../../hooks/useSticky.jsx";
import {Link} from "react-router-dom";

const DayRanking = ({ matchday, token, apiUrl }) => {
  const { isSticky } = useSticky(100);
  const [isLoading, setIsLoading] = useState(true);
  const [ranking, setRanking] = useState([]);
  const colors = ['#6666FF', '#CC99FF', '#00CC99', '#F7B009', '#F41731'];
  const [usersColors, setUsersColors] = useState({});

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${apiUrl}/api/users/bets/ranking/${matchday}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const rankingDatas = response.data.ranking;
        console.log(rankingDatas)
        setRanking(rankingDatas);
        const newUsersColors = {};
        rankingDatas.forEach((user, index) => {
          newUsersColors[user.user_id] = colors[index % colors.length];
        });
        setUsersColors(newUsersColors);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération du classement:", error);
        setIsLoading(false);
      }
    };

    if (matchday && token) {
      fetchRanking();
    }
  }, [matchday, token, apiUrl]);

  if (isLoading) {
    return (
      <div className="text-center flex flex-col justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative z-20 p-8 px-0 pt-8">
      <h2
        translate="no"
        style={isSticky ? { top: `50px` } : {}}
        className={`bg-white ${isSticky ? 'sticky-element pb-2 !text-xl border-b-black border-b' : ''} font-rubik text-xl4 font-black text-black text-center leading-9 text-balance`}>Classement de la journée {matchday}</h2>
      <ul className="px-6">
        {ranking.map((user, index) => (
          <Link
            to={`/dashboard/${user.user_id}`}
            key={user.user_id}
            className="relative bg-white flex justify-between border border-black rounded-xl my-4 shadow-flat-black-adjust">
            <div
              className="absolute z-[25] bg-white -top-3 -left-4 border-2 border-black w-[40px] text-center h-[40px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust"
              style={{backgroundColor: usersColors[user.user_id]}}
            >
              <p
                translate="no"
                className="font-rubik w-full font-black text-stroke-black-2 text-white text-[140%] inline-block leading-[35px]">{index + 1}</p>
            </div>
            <p translate="no" className="w-4/5 font-roboto font-medium text-base text-black py-2">{user.username}</p>
            <p translate="no" className="w-1/5 font-rubik font-black text-l text-black py-2 border-l border-dashed border-black">{String(user.points).padStart(2, '0')}</p>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default DayRanking;
