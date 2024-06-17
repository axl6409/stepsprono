import React, { useEffect, useState } from 'react';
import axios from 'axios';
import weekPointsImage from "../../assets/components/dashboard/points-de-la-semaine.svg";
import monthPointsImage from "../../assets/components/dashboard/points-du-mois.svg";
import seasonPointsImage from "../../assets/components/dashboard/points-de-la-saison.svg";
import {Link} from "react-router-dom";
import vsIcon from "../../assets/components/matchs/vs-icon.png";
import nullSymbol from "../../assets/icons/null-symbol.svg";
import clockIcon from "../../assets/icons/clock-icon.svg";
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
        if (!Array.isArray(fetchedMatchs) || fetchedMatchs.length === 0) {
          return;
        }
        setMatchs(fetchedMatchs)
      } catch (error) {
        console.error('Erreur lors de la récupération des paris', error);
      }
    };
    const fetchWeekPoints = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${user.id}/bets/week`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const weekPoints = response.data;
        if (weekPoints === undefined || weekPoints === 0) {
          return;
        }
        setWeekPoints(weekPoints.points)
      } catch (error) {
        console.error('Erreur lors de la sélection des points de la semaine', error);
      }
    }
    const fetchMonthBets = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${user.id}/bets/month`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const monthPoints = response.data;
        // if (monthPoints.length === undefined || monthPoints.length === 0) {
        //   return;
        // }
        setMonthPoints(monthPoints.points)
        if (user.id === 2) {
          setMonthPoints(17)
        }
        if (user.id === 4) {
          setMonthPoints(23)
        }
        if (user.id === 5) {
          setMonthPoints(16)
        }
        if (user.id === 6) {
          setMonthPoints(12)
        }
        if (user.id === 7) {
          setMonthPoints(11)
        }
        if (user.id === 8) {
          setMonthPoints(21)
        }
        if (user.id === 9) {
          setMonthPoints(18)
        }
        if (user.id === 10) {
          setMonthPoints(14)
        }
        if (user.id === 11) {
          setMonthPoints(13)
        }
        if (user.id === 12) {
          setMonthPoints(11)
        }
        if (user.id === 13) {
          setMonthPoints(22)
        }
        if (user.id === 14) {
          setMonthPoints(12)
        }
        if (user.id === 15) {
          setMonthPoints(16)
        }
        if (user.id === 16) {
          setMonthPoints(15)
        }
        if (user.id === 17) {
          setMonthPoints(20)
        }
        if (user.id === 18) {
          setMonthPoints(19)
        }
        if (user.id === 20) {
          setMonthPoints(13)
        }
        if (user.id === 21) {
          setMonthPoints(6)
        }
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
        setSeasonPoints(seasonPoints.points)
        if (user.id === 2) {
          setSeasonPoints(154)
        }
        if (user.id === 4) {
          setSeasonPoints(162)
        }
        if (user.id === 5) {
          setSeasonPoints(154)
        }
        if (user.id === 6) {
          setSeasonPoints(163)
        }
        if (user.id === 7) {
          setSeasonPoints(143)
        }
        if (user.id === 8) {
          setSeasonPoints(173)
        }
        if (user.id === 9) {
          setSeasonPoints(131)
        }
        if (user.id === 10) {
          setSeasonPoints(146)
        }
        if (user.id === 11) {
          setSeasonPoints(147)
        }
        if (user.id === 12) {
          setSeasonPoints(152)
        }
        if (user.id === 13) {
          setSeasonPoints(176)
        }
        if (user.id === 14) {
          setSeasonPoints(166)
        }
        if (user.id === 15) {
          setSeasonPoints(166)
        }
        if (user.id === 16) {
          setSeasonPoints(162)
        }
        if (user.id === 17) {
          setSeasonPoints(174)
        }
        if (user.id === 18) {
          setSeasonPoints(148)
        }
        if (user.id === 20) {
          setSeasonPoints(168)
        }
        if (user.id === 21) {
          setSeasonPoints(148)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des paris', error);
      }
    };
    if (user && token) {
      fetchLastBets()
      fetchWeekPoints()
      fetchMonthBets()
      fetchSeasonPoints()
    }
  }, [user, token]);

  return (
    <div>
      <div
        className="flex flex-col justify-center items-center overflow-hidden w-[200px] h-[200px] mx-auto rounded-full border-2 border-black">
        <img className="w-full h-full object-cover" src={user.img} alt="Image de profil"/>
      </div>
      <div className="flex flex-row flex-wrap justify-between px-4 -mt-8">
        <div
          className="h-fit flex flex-col w-1/3 max-w-[120px] relative">
          <img src={monthPointsImage} alt="Points du mois"/>
          <p
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-rubik text-xl4 stroke-black font-black text-white leading-7">
            {monthPoints}
          </p>
        </div>
        <div
          className="h-fit flex flex-col w-1/3 max-w-[120px] relative mt-12">
          <img src={weekPointsImage} alt="Points de la semaine"/>
          <p
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-rubik text-xl4 stroke-black font-black text-white leading-5">
            {weekPoints}
          </p>
        </div>
        <div
          className="h-fit flex flex-col w-1/3 max-w-[120px] relative">
          <img src={seasonPointsImage} alt="Points de la saison"/>
          <p
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-rubik text-xl4 stroke-black font-black text-white leading-5">
            {seasonPoints}
          </p>
        </div>
      </div>
      <div className="pt-8">
        <Link
          to="/matchs"
          className="w-4/5 block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group">
          {matchs && matchs.length > 0 ? (
            <span
              className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1.5 group-hover:-translate-y-0">
              Modifier mes pronos
            </span>
          ) : (
            <span
              className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-green-medium transition -translate-y-1.5 group-hover:-translate-y-0">
              Faire mes pronos
            </span>
          )}
        </Link>
      </div>
      {matchs && matchs.length > 0 && (
        <div
          className="relative my-[25%]">
          <h2 className={`relative mb-12 w-fit mx-auto`}>
            <span
              className="absolute inset-0 py-4 w-full h-full bg-purple-soft z-[2] translate-x-1 translate-y-0.5"></span>
            <span
              className="absolute inset-0 py-4 w-full h-full bg-green-soft z-[1] translate-x-2 translate-y-1.5"></span>
            <span
              className="relative bg-white left-0 top-0 right-0 font-rubik font-black text-xl2 border border-black text-black px-4 leading-6 z-[3] translate-x-1 translate-y-1">Pronos de la semaine</span>
          </h2>
          <div className="w-full px-2">
            <div className="flex flex-col w-full">
              <div className="relative flex flex-row border border-black rounded-full shadow-flat-black-adjust bg-white">
                <div scope="col" className="py-0.5 pr-4 w-[50%] border-r-2 border-black border-dotted">
                  <p className="font-rubik font-medium text-right uppercase text-xxs">Match</p>
                </div>
                <div scope="col" className="py-0.5 px-1 w-[30%] border-r-2 border-black border-dotted">
                  <p className="font-rubik font-medium text-xxs uppercase">Prono</p>
                </div>
                <div scope="col" className="py-0.5 px-1 w-[20%]">
                  <p className="font-rubik font-medium text-xxs uppercase">Points</p>
                </div>
              </div>
              <div className={`flex flex-col mt-2 `}>
                {matchs.map((bet, index) => (
                  <div key={index}
                       className="relative min-h-[65px] flex flex-row my-2 border border-black rounded-xl shadow-flat-black-adjust">
                    <p className="absolute z-[1] font-rubik font-black text-xl6 -top-8 -left-2 opacity-20">{index + 1}</p>
                    <div className="relative z-[2] w-[50%] py-2 pl-2 pr-4 border-r-2 border-black border-dotted">
                      <div className="flex flex-col justify-evenly h-full">
                        {bet.homeScore !== null && bet.awayScore !== null ? (
                          <>
                            <div className="relative flex flex-row justify-center items-center">
                              <img className="h-[50px] w-auto mt-[-15px] mr-[-10px] relative z-[1]" src={bet.MatchId.HomeTeam.logoUrl + ".svg"}
                                   alt={bet.MatchId.HomeTeam.name}/>
                              <img className="h-[40px] relative z-[3]"
                                   src={vsIcon}
                                   alt=""/>
                              <img className="h-[50px] w-auto mb-[-15px] ml-[-10px] relative z-[2]" src={bet.MatchId.AwayTeam.logoUrl + ".svg"}
                                   alt={bet.MatchId.AwayTeam.name}/>
                            </div>
                          </>
                        ) : (
                          <>
                            <p
                              className="font-roboto text-left uppercase text-xs font-medium">{bet.MatchId.HomeTeam.name}</p>
                            <p
                              className="font-roboto text-left uppercase text-xs font-medium">{bet.MatchId.AwayTeam.name}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="relative z-[2] w-[30%] py-2 border-r-2 border-black border-dotted">
                      <div className="h-full flex flex-row justify-center items-center">
                        {bet.homeScore !== null && bet.awayScore !== null ? (
                          <div>
                            <p className="font-rubik font-medium text-xl">
                              {bet.homeScore} - {bet.awayScore}
                            </p>
                            {bet.playerGoal !== null && (
                              <p className="font-title text-base font-bold">{bet.PlayerGoal.name}</p>
                            )}
                          </div>
                        ) : (
                          bet.winnerId === bet.MatchId.HomeTeam.id ? (
                            <img className="h-auto w-8" src={bet.MatchId.HomeTeam.logoUrl + ".svg"}
                                 alt={bet.MatchId.HomeTeam.name}/>
                          ) : bet.winnerId === bet.MatchId.AwayTeam.id ? (
                            <img className="h-auto w-8" src={bet.MatchId.AwayTeam.logoUrl + ".svg"}
                                 alt={bet.MatchId.AwayTeam.name}/>
                          ) : (
                            <img className="h-auto w-8" src={nullSymbol}
                                 alt="symbole match null"/>
                          )
                        )}
                      </div>
                    </div>
                    <div className="w-[20%] flex flex-col justify-center items-center py-2">
                      {bet.points === null ? (
                        <img className="bblock mx-auto" src={clockIcon} alt="icone d'horloge"/>
                      ) : bet.points === 0 ? (
                        <p className="font-rubik font-medium text-xl">{bet.points}</p>
                      ) : (
                        <p className="font-rubik font-medium text-xl">{bet.points}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentBets;