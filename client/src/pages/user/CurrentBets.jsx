import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import bets from "../Bets.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const CurrentBets = ({ user, token }) => {
  const [matchs, setMatchs] = useState([]);
  const [weekPoints, setWeekPoints] = useState(0);
  const [monthPoints, setMonthPoints] = useState(0);
  const [seasonPoints, setSeasonPoints] = useState(0);

  useEffect(() => {
    const fetchLastBets = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${user.id}/bets/last`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const fetchedMatchs = response.data;
        if (fetchedMatchs.length === undefined || fetchedMatchs.length === 0) {
          return;
        }
        const totalPoints = fetchedMatchs.reduce((sum, match) => {
          return sum + (match.points >= 0 ? match.points : 0);
        }, 0)
        setMatchs(fetchedMatchs)
        setWeekPoints(totalPoints)
      } catch (error) {
        console.error('Erreur lors de la récupération des paris', error);
      }
    };
    const fetchMonthBets = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${user.id}/bets/month`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const fetchedMatchs = response.data;
        if (fetchedMatchs.length === undefined || fetchedMatchs.length === 0) {
          return;
        }
        const totalPoints = fetchedMatchs.reduce((sum, match) => {
          return sum + (match.points >= 0 ? match.points : 0);
        }, 0)
        setMonthPoints(totalPoints)
      } catch (error) {
        console.error('Erreur lors de la récupération des paris', error);
      }
    };
    const fetchSeasonPoints = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${user.id}/bets/season`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const seasonPoints = response.data;
        if (seasonPoints === undefined || seasonPoints === 0) {
          return;
        }
        setSeasonPoints(seasonPoints)
        console.log(seasonPoints)
      } catch (error) {
        console.error('Erreur lors de la récupération des paris', error);
      }
    };
    if (user && token) {
      fetchLastBets()
      fetchMonthBets()
      fetchSeasonPoints()
    }
  }, [user, token]);

  console.log(seasonPoints)
  return (
    <div>
      <div className="flex flex-row flex-wrap justify-between px-4">
        <div className="flex flex-col w-2/5 px-4 py-2 bg-white border-2 border-black shadow-flat-black rounded-md">
          <p className="font-sans text-xs font-bold leading-4 uppercase">Points <br/>de la semaine</p>
          <div className="bg-electric-blue border-2 mt-2 border-black rounded-md shadow-flat-black-adjust py-4">
            <p className="font-title text-xl font-bold leading-5">
              {weekPoints}
            </p>
          </div>
        </div>
        <div className="flex flex-col w-2/5 px-4 py-2 bg-white border-2 border-black shadow-flat-black rounded-md">
          <p className="font-sans text-xs font-bold leading-4 uppercase">Points <br/>du mois</p>
          <div className="bg-electric-blue border-2 mt-2 border-black rounded-md shadow-flat-black-adjust py-4">
            <p className="font-title text-xl font-bold leading-5">
              {monthPoints}
            </p>
          </div>
        </div>
        <div className="flex flex-col w-1/2 mx-auto px-4 py-2 bg-white border-2 border-black shadow-flat-black rounded-md">
          <p className="font-sans text-xs font-bold leading-4 uppercase">Points <br/>de la saison</p>
          <div className="bg-electric-blue border-2 mt-2 border-black rounded-md shadow-flat-black-adjust py-4">
            <p className="font-title text-xl font-bold leading-5">
              {seasonPoints}
            </p>
          </div>
        </div>
      </div>
      <div
        className="relative px-2 pt-8 pb-16 mt-8 bg-flat-yellow border-t-2 border-b-2 border-black rounded-[30px] before:content-[''] before:absolute before:z-[-1] before:-top-1 before:left-0 before:-right-0.5 before:-bottom-1 before:bg-black before:rounded-[30px]">
        <p className="font-sans text-l font-bold mb-4 leading-5">Pronostics <br/>de la semaine</p>
        <div className="w-full">
          {matchs && matchs.length > 0 ? (
            <div className="flex flex-col w-full">
              <div className="relative flex flex-row border-2 border-black rounded-xs shadow-flat-black-adjust bg-white">
                <div className="w-[5%]"></div>
                <div scope="col" className="py-0.5 px-1 w-[25%]">
                  <p className="font-sans text-xxs font-bold">Match</p>
                </div>
                <div scope="col" className="py-0.5 px-1 w-[20%]">
                  <p className="font-sans text-xxs font-bold">Gagnant</p>
                </div>
                <div scope="col" className="py-0.5 px-1 w-[20%]">
                  <p className="font-sans text-xxs font-bold leading-4">Score / Butteur</p>
                </div>
                <div scope="col" className="py-0.5 px-1 w-[15%]">
                  <p className="font-sans text-xxs font-bold">Status</p>
                </div>
                <div scope="col" className="py-0.5 px-1 w-[15%]">
                  <p className="font-sans text-xxs font-bold">Points</p>
                </div>
              </div>
              <div className={`flex flex-col mt-2 border-2 border-black rounded-xs shadow-flat-black-adjust`}>
                {matchs.map((bet, index) => (
                  <div key={index}
                       className="flex flex-row py-1 px-0.5 border-b last-of-type:border-0 border-black odd:bg-white even:bg-sky-50">
                    <div className="w-[5%] p-1">
                      <p className="font-title text-base font-bold inline-block align-sub">{index + 1}</p>
                    </div>
                    <div className="w-[25%] p-1">
                      <div className="flex flex-row justify-between">
                        <img className="inline-block h-auto w-8" src={bet.Match.HomeTeam.logoUrl}
                             alt={bet.Match.HomeTeam.name}/>
                        <span className="font-sans font-bold text-center block my-auto"> - </span>
                        <img className="inline-block h-auto w-8" src={bet.Match.AwayTeam.logoUrl}
                             alt={bet.Match.AwayTeam.name}/>
                      </div>
                    </div>
                    <div className="w-[20%] p-1">
                      <div className="flex flex-row justify-center">
                        {bet.winnerId === bet.Match.HomeTeam.id ? (
                          <img className="h-auto w-8" src={bet.Match.HomeTeam.logoUrl} alt={bet.Match.HomeTeam.name}/>
                        ) : bet.winnerId === bet.Match.AwayTeam.id ? (
                          <img className="h-auto w-8" src={bet.Match.AwayTeam.logoUrl} alt={bet.Match.AwayTeam.name}/>
                        ) : (
                          <p className="font-title text-base font-bold">NUL</p>
                        )}
                      </div>
                    </div>
                    <div className="w-[20%] p-1">
                      {bet.homeScore !== null && bet.awayScore !== null ? (
                        <>
                          <p className="font-title text-base font-bold">{`${bet.homeScore} - ${bet.awayScore}`}</p>
                        </>
                      ) : (
                        <p></p>
                      )}
                    </div>
                    <div className="w-[18%] p-1">
                      {bet.points === null ? (
                        <FontAwesomeIcon className="inline-block align-bottom text-flat-orange" icon={faHourglassHalf}/>
                      ) : bet.points === 0 ? (
                        <p></p>
                      ) : (
                        <p>{bet.points}</p>
                      )}
                    </div>
                    <div className="w-[15%] p-1">
                      <p className="font-title text-base font-bold inline-block align-sub">{bet.points}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>Aucun pari pour la semaine en cours</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentBets;