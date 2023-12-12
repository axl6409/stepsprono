import React, {useEffect, useState, useContext} from 'react';
import {UserContext} from "../contexts/UserContext.jsx";
import {Link} from "react-router-dom";
import futbol from "/img/futbol-solid.svg";
import {useCookies} from "react-cookie";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Dashboard = () => {
  const { user, updateUserStatus } = useContext(UserContext);
  const [cookies, setCookie] = useCookies(["user"]);
  const token = localStorage.getItem('token') || cookies.token
  const [matchs, setMatchs] = useState([])

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${user.id}/bets/last`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMatchs(response.data);
        console.log(matchs)
      } catch (error) {
        console.error('Erreur lors de la récupération des paris', error);
      }
    };

    if (user && token) {
      fetchBets();
    }
  }, [user, token])

  return (
    <div className="text-center relative p-10 flex flex-col justify-center">
      <span className="absolute top-10 left-4 text-xl text-black">
        <img className="w-[30px]" src={futbol} alt="football icon"/>
      </span>
      <span className="absolute top-10 right-4 text-xl text-black">
        <img className="w-[30px]" src={futbol} alt="football icon"/>
      </span>
      <h1 className="text-3xl font-black my-8 mt-0 uppercase relative w-fit mx-auto">Steps Prono
        <span className="absolute left-0 bottom-0 text-flat-purple z-[-1] transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">Steps Prono</span>
        <span className="absolute left-0 bottom-0 text-green-lime z-[-2] transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">Steps Prono</span>
      </h1>

      <div>
        <p>Pronostics</p>
        <div>
          {matchs && matchs.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th scope="col">Match</th>
                <th scope="col">Gagnant</th>
                <th scope="col">Score</th>
                <th scope="col">Status</th>
                <th scope="col">Points</th>
              </tr>
            </thead>
            <tbody>
              {matchs.map((bet, index) => (
                <tr key={index}>
                  <td>{`${bet.homeTeamName} - ${bet.awayTeamName}`}</td>
                  <td>{bet.winnerName}</td>
                  <td>{`${bet.homeScore} - ${bet.awayScore}`}</td>
                  <td>{bet.status}</td>
                  <td>{bet.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          ) : (
            <p>Aucun pari pour la semaine en cours</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
