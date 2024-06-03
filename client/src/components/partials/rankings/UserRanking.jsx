import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../Loader.jsx";
import defaultUserImage from "../../../assets/components/user/default-user-profile.png";
import crown from "../../../assets/components/ranking/crown.svg";
import crownOpacity from "../../../assets/components/ranking/crown-opacity.svg";
import purpleStar from "../../../assets/components/ranking/purple-star.svg";
import purpleStarOpacity from "../../../assets/components/ranking/purple-star-opacity.svg";
import yellowStar from "../../../assets/components/ranking/yellow-star.svg";
import blackStar from "../../../assets/components/ranking/black-star.svg";
import purpleFlower from "../../../assets/components/ranking/purple-flower.svg";
import flowerYellowOpacity from "../../../assets/components/ranking/flower-yellow-opacity.svg";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const UserRanking = ({ users, token }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [updatedUsers, setUpdatedUsers] = useState([]);
  const [filter, setFilter] = useState('season');

  useEffect(() => {
    const fetchUserPoints = async (userId) => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${userId}/bets/${filter}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (typeof response.data === 'object' && response.data.points !== undefined) {
          return response.data.points;
        } else if (Array.isArray(response.data)) {
          return response.data.reduce((total, bet) => total + bet.points, 0);
        } else {
          return 0;
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération des points pour l'utilisateur ${userId}`, error);
        return null;
      }
    }

    const fetchUsersWithPoints = async () => {
      const usersWithPoints = await Promise.all(users.map(async (user) => {
        const points = await fetchUserPoints(user.id);
        return { ...user, points };
      }));
      usersWithPoints.sort((a, b) => b.points - a.points);
      setUpdatedUsers(usersWithPoints);
      setIsLoading(false);
    }

    if (users.length > 0) {
      fetchUsersWithPoints();
    }
  }, [users, token, filter]);

  if (isLoading) {
    return (
      <div className="text-center flex flex-col justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative p-8 px-2 pt-0">

      {/* Podium: Top 3 users */}
      <div className="relative flex flex-row justify-center items-end mb-8">
        <img className="absolute -top-20 left-4 w-20" src={crownOpacity} alt=""/>
        <div className="relative z-[2] flex flex-col items-center order-1 -mr-6">
          <p
            className="absolute -top-4 rounded-full bg-blue-medium w-9 h-9 text-center font-rubik font-black text-white text-xl2 leading-8">2</p>
          <div
            className="w-28 h-28 flex items-center justify-center rounded-full bg-white mb-2 border-blue-medium border-2">
            <img src={updatedUsers[1]?.img || defaultUserImage} alt={updatedUsers[1]?.username}/>
          </div>
          <p className="font-bold">{updatedUsers[1]?.username}</p>
          <p>{updatedUsers[1]?.points}</p>
        </div>
        <div className="relative z-[3] flex flex-col items-center order-2 transform -translate-y-4">
          <img className="absolute -top-20 w-20" src={crown} alt=""/>
          <img className="absolute z-[1] -top-2 -left-4 w-20" src={purpleFlower} alt=""/>
          <div
            className="w-40 h-40 relative z-[2] flex items-center justify-center rounded-full bg-white mb-2 border-yellow-medium border-2">
            <img className="absolute z-[3] top-1 left-2 w-8" src={blackStar} alt=""/>
            <img className="z-[2]" src={updatedUsers[0]?.img || defaultUserImage} alt={updatedUsers[0]?.username}/>
            <img className="absolute z-[3] bottom-0 right-1.5 w-8" src={yellowStar} alt=""/>
          </div>
          <p className="font-bold">{updatedUsers[0]?.username}</p>
          <p>{updatedUsers[0]?.points}</p>
        </div>
        <div className="relative z-[1] flex flex-col items-center order-3 -ml-6">
          <p
            className="absolute -top-4 rounded-full bg-blue-medium w-9 h-9 text-center font-rubik font-black text-white text-xl2 leading-8">3</p>
          <div
            className="w-28 h-28 flex items-center justify-center rounded-full bg-white mb-2 border-blue-medium border-2">
            <img src={updatedUsers[2]?.img || defaultUserImage} alt={updatedUsers[2]?.username}/>
          </div>
          <p className="font-bold">{updatedUsers[2]?.username}</p>
          <p>{updatedUsers[2]?.points}</p>
        </div>
      </div>

      <div className="flex flex-row justify-center mb-4">
        <button onClick={() => setFilter('week')} className="mx-2">Cette semaine</button>
        <button onClick={() => setFilter('month')} className="mx-2">Ce mois</button>
        <button onClick={() => setFilter('season')} className="mx-2">Cette saison</button>
      </div>

      <div className="flex flex-col justify-start">
        <ul>
          {updatedUsers.slice(3).map(user => (
            <li
              className="flex flex-row relative justify-between my-2 border-2 border-black bg-white py-1 px-4 h-fit shadow-flat-black"
              key={user.id}>
              <Link to={`/dashboard/${user.id}`}
                    className="w-fit h-fit block relative my-2 before:content-[''] before:inline-block before:absolute before:z-[1] before:shadow-inner-black-light before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group">
                <span
                  className="relative z-[2] w-full block border-2 border-black text-black px-4 py-1 rounded-full text-center shadow-md bg-white transition -translate-y-1.5 group-hover:-translate-y-0">
                  {user.username}
                </span>
              </Link>
              <p className="font-title text-black uppercase text-l font-bold leading-4 h-fit my-auto">
              <span className="inline-block mr-2">Points</span>
                <span className="inline-block bg-black text-white p-2 ">{user.points}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default UserRanking;
