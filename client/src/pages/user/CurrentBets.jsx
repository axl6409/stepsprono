import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";

const CurrentBets = ({ user, token }) => {
  const [matchs, setMatchs] = useState([]);
  const [weekPoints, setWeekPoints] = useState(0);

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
        const response = await axios.get(`${apiUrl}/api/user/${user.id}/bets/last`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const fetchedMatchs = response.data;
        const totalPoints = fetchedMatchs.reduce((sum, match) => {
          return sum + (match.points >= 0 ? match.points : 0);
        }, 0)
        setMatchs(fetchedMatchs)
        setWeekPoints(totalPoints)
      } catch (error) {
        console.error('Erreur lors de la récupération des paris', error);
      }
    };

    if (user && token) {
      fetchBets();
    }
  }, [user, token]);

  return (
    <div>
      <div className="flex flex-row">
        <div className="flex flex-col w-fit px-4 py-2 bg-electric-blue border-2 border-black shadow-flat-black">
          <p className="font-sans text-xs font-bold leading-4 uppercase">Points <br/>de la semaine</p>
          <p className="font-title text-xl font-bold leading-5">{weekPoints}</p>
        </div>
      </div>
      <div>
        <p className="font-sans text-l font-bold my-4 leading-5">Pronostics <br/>de la semaine</p>
        <div className="w-full">
          {matchs && matchs.length > 0 ? (
            <div className="flex flex-col w-full">
              <div className="relative flex flex-row border-2 border-black rounded-xs shadow-flat-black-adjust">
                <div className="w-[5%]"></div>
                <div scope="col" className="py-0.5 px-1 w-[25%]">
                  <p className="font-sans text-xxs font-bold">Match</p>
                </div>
                <div scope="col" className="py-0.5 px-1 w-[20%]">
                  <p className="font-sans text-xxs font-bold">Gagnant</p>
                </div>
                <div scope="col" className="py-0.5 px-1 w-[20%]">
                  <p className="font-sans text-xxs font-bold">Score</p>
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
                       className="flex flex-row py-1 mx-0.5 border-b last-of-type:border-0 border-black even:bg-sky-50">
                    <div className="w-[5%] p-1">
                      <p className="font-title text-base font-bold inline-block align-sub">{index}</p>
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
                        ) : (
                          <img className="h-auto w-8" src={bet.Match.AwayTeam.logoUrl} alt={bet.Match.AwayTeam.name}/>
                        )}
                      </div>
                    </div>
                    <div className="w-[20%] p-1">
                      {bet.homeScore && bet.awayScore ? (
                        <p className="font-title text-base font-bold">{`${bet.homeScore} - ${bet.awayScore}`}</p>
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