import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft, faCircleXmark, faPen} from "@fortawesome/free-solid-svg-icons";
import {useCookies} from "react-cookie";
import Loader from "../Loader.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const WeekRanking = ({users, token}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [updatedUsers, setUpdatedUsers] = useState([]);

  useEffect(() => {
    const fetchUserBets = async (userId) => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${userId}/bets/last`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        return response.data.reduce((sum, bet) => sum + (bet.points || 0), 0)
      } catch (error) {
        console.error(`Erreur lors de la sélection des paris pour l'utilisateur ${userId}`, error);
        return null
      }
    }
    const fetchUsersWithPoints = async () => {
      const usersWithPoints = await Promise.all(users.map(async (user) => {
        const points = await fetchUserBets(user.id);
        return { ...user, weekPoints: points };
      }));

      setUpdatedUsers(usersWithPoints);
      setIsLoading(false);
    }

    if (users.length > 0) {
      fetchUsersWithPoints();
    }
  }, [users, token]);

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
            <p>Cette semaine</p>
          </li>
        </ul>
      </div>
      <div className="flex flex-col justify-start">
        <ul>
          {updatedUsers.map(user => {
            return (
              <li className="flex flex-row justify-between" key={user.id}>
                <Link to={`/dashboard/${user.id}`}
                      className="username relative font-title font-bold text-xl leading-6 my-auto border-2 border-black bg-white py-1 px-4 h-fit shadow-flat-black">
                  {user.username}
                </Link>
                <p>
                  Points de la semaine: {user.weekPoints}
                </p>
              </li>
            )
            }
          )}
        </ul>
      </div>
    </div>
  )
}

export default WeekRanking