import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../Loader.jsx";
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
        return response.data;
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
    <div className="relative border-t-2 border-b-2 border-black overflow-hidden py-8 px-2 pt-0 bg-flat-yellow">
      <div className="section-head relative">
        <ul
          className={`overflow-hidden bg-white w-fit min-w-[200px] py-1.5 pb-0 relative -top-1.5 border-2 border-black rounded-br-md rounded-bl-md shadow-flat-black transition duration-300`}>
          <li>
            <p>Classement</p>
          </li>
        </ul>
      </div>
      <div className="flex flex-row justify-center mb-4">
        <button onClick={() => setFilter('week')} className="mx-2">Cette semaine</button>
        <button onClick={() => setFilter('month')} className="mx-2">Ce mois</button>
        <button onClick={() => setFilter('season')} className="mx-2">Cette saison</button>
      </div>
      <div className="flex flex-col justify-start">
        <div className="flex flex-row justify-around mb-8">
          {updatedUsers.slice(0, 3).map(user => (
            <div key={user.id} className="border-2 border-black p-4 rounded-md">
              <p className="font-bold">{user.username}</p>
              <p>Points: {user.points}</p>
            </div>
          ))}
        </div>
        <ul>
          {updatedUsers.slice(3).map(user => (
            <li className="flex flex-row relative justify-between my-2 border-2 border-black bg-white py-1 px-4 h-fit shadow-flat-black" key={user.id}>
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
