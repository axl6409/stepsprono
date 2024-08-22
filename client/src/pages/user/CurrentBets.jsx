import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import defaultUserImage from "../../assets/components/user/default-user-profile.png";
import weekPointsImage from "../../assets/components/dashboard/points-de-la-semaine.svg";
import monthPointsImage from "../../assets/components/dashboard/points-du-mois.svg";
import seasonPointsImage from "../../assets/components/dashboard/points-de-la-saison.svg";
import {Link} from "react-router-dom";
import vsIcon from "../../assets/components/matchs/vs-icon.png";
import nullSymbol from "../../assets/icons/null-symbol.svg";
import clockIcon from "../../assets/icons/clock-icon.svg";
import WeekPoints from "../../components/svg/WeekPoints.jsx";
import MonthPoints from "../../components/svg/MonthPoints.jsx";
import SeasonPoints from "../../components/svg/SeasonPoints.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const CurrentBets = ({ loggedUser, user, token }) => {
  const [matchs, setMatchs] = useState([]);
  const [bets, setBets] = useState([]);
  const [noMatches, setNoMatches] = useState(false);
  const [weekPoints, setWeekPoints] = useState(0);
  const [monthPoints, setMonthPoints] = useState(0);
  const [seasonPoints, setSeasonPoints] = useState(0);
  const [canDisplayBets, setCanDisplayBets] = useState(false);
  const [betColors, setBetColors] = useState({});
  const colors = ['#6666FF', '#CC99FF', '#00CC99', '#F7B009', '#F41731'];

  useEffect(() => {
    const fetchLastBets = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${user.id}/bets/last`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const currentBets = response.data;
        if (Array.isArray(currentBets)) {
          const sortedBets = currentBets.sort((a, b) => new Date(a.MatchId.utc_date) - new Date(b.MatchId.utc_date));
          setBets(sortedBets);
        }
        const newBetColors = {};
        response.data.forEach((bet, index) => {
          newBetColors[bet.id] = colors[index % colors.length];
        });
        setBetColors(newBetColors);
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
    const fetchMonthPoints = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${user.id}/bets/month`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const monthPoints = response.data;
        if (monthPoints.points === undefined) {
          return;
        }
        setMonthPoints(monthPoints.points)
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
      } catch (error) {
        console.error('Erreur lors de la récupération des paris', error);
      }
    };

    const fetchMatchs = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/matchs/current-week`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const sortedMatchs = response.data.data
        if (sortedMatchs.length === 0) {
          setNoMatches(true);
          return;
        }
        setMatchs(sortedMatchs)
        const firstMatch = sortedMatchs[0];
        const firstMatchDate = moment(firstMatch.utc_date);
        const now = moment();
        if (now.isSame(firstMatchDate, 'day') && now.hour() >= 12) {
          setCanDisplayBets(true);
        } else {
          setCanDisplayBets(false);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des matchs :', error);
      }
    }

    if (user && token) {
      fetchMatchs()
      fetchLastBets()
      fetchWeekPoints()
      fetchMonthPoints()
      fetchSeasonPoints()
    }
  }, [user, token]);

  return (
    <div>
      <div
        className="flex flex-col justify-center items-center overflow-hidden w-[200px] h-[200px] mx-auto rounded-full border-2 border-black">
        <img
          className="w-full h-full object-cover"
          src={user.img ? `${apiUrl}/uploads/users/${user.id}/${user.img}` : defaultUserImage}
          alt="Image de profil"
        />
      </div>
      <div className="flex flex-row flex-wrap justify-between px-4 -mt-8">
        <div
          className="h-fit flex flex-col w-1/3 max-w-[120px] relative">
          <MonthPoints />
          <p
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-rubik text-xl4 stroke-black font-black text-white leading-7">
            {monthPoints}
          </p>
        </div>
        <div
          className="h-fit flex flex-col w-1/3 max-w-[120px] relative mt-12">
          <WeekPoints />
          <p
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-rubik text-xl4 stroke-black font-black text-white leading-5">
            {weekPoints}
          </p>
        </div>
        <div
          className="h-fit flex flex-col w-1/3 max-w-[120px] relative">
          <SeasonPoints />
          <p
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-rubik text-xl4 stroke-black font-black text-white leading-5">
            {seasonPoints}
          </p>
        </div>
      </div>
      {loggedUser.id === user.id && (
          <div className="pt-8">
            {noMatches ? (
              <div
                  className="w-4/5 block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border">
                <span
                    className="relative z-[2] w-full block border border-black text-black bg-white uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-gray-light cursor-not-allowed"
                >
                  Pronostics Fermés
                </span>
              </div>
            ) : (
              <Link
                  to="/matchs"
                  className="w-4/5 block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
              >
                <span
                    className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1.5 group-hover:-translate-y-0"
                >
                  {bets.length > 0 ? 'Modifier mes pronos' : 'Faire mes pronos'}
                </span>
              </Link>
            )}
          </div>
      )}
      {noMatches ? (
          <div className="relative my-[25%]">
            <p className="text-center text-lg font-medium mt-4">
              Aucun matchs et pronostics pour cette semaine.
            </p>
          </div>
      ) : (
        !canDisplayBets && loggedUser.id !== user.id ? (
          <div className="relative my-[25%]">
            <p className="text-center text-lg font-medium mt-4 px-12">
              Attends la fin des pronos pour voir les siens 😉
            </p>
          </div>
          ) : (
          bets && bets.length > 0 && (
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
                      <div
                        className="relative flex flex-row border border-black rounded-full shadow-flat-black-adjust bg-white">
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
                    {bets.map((bet, index) => (
                      <div key={index}
                         className="relative min-h-[65px] flex flex-row my-2 border border-black rounded-xl shadow-flat-black-adjust">
                          <p className="absolute z-[1] font-rubik font-black text-xl6 -top-8 -left-2 opacity-20" style={{color: betColors[bet.id]}}>{index + 1}</p>
                        <div className="relative z-[2] w-[50%] py-2 pl-2 pr-4 border-r-2 border-black border-dotted">
                          <div className="flex flex-col justify-evenly h-full">
                            {bet.home_score !== null && bet.away_score !== null ? (
                              <>
                                <div className="relative flex flex-row justify-center items-center">
                                  <img className="h-[50px] w-auto mt-[-15px] mr-[-10px] relative z-[1]" src={apiUrl + "/uploads/teams/" + bet.MatchId.HomeTeam.id + "/" + bet.MatchId.HomeTeam.logo_url}
                                       alt={bet.MatchId.HomeTeam.name}/>
                                  <img className="h-[40px] relative z-[3]"
                                       src={vsIcon}
                                       alt=""/>
                                  <img className="h-[50px] w-auto mb-[-15px] ml-[-10px] relative z-[2]" src={apiUrl + "/uploads/teams/" + bet.MatchId.AwayTeam.id + "/" + bet.MatchId.AwayTeam.logo_url}
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
                            {bet.home_score !== null && bet.away_score !== null ? (
                              <div>
                                <p className="font-rubik font-medium text-xl">
                                  {bet.home_score} - {bet.away_score}
                                </p>
                                {bet.PlayerGoal !== null && (
                                  <p className="font-title text-base font-bold">{bet.PlayerGoal.name}</p>
                                )}
                              </div>
                            ) : (
                              bet.winner_id === bet.MatchId.HomeTeam.id ? (
                                <img className="h-auto w-8" src={apiUrl + "/uploads/teams/" + bet.MatchId.HomeTeam.id + "/" + bet.MatchId.HomeTeam.logo_url}
                                     alt={bet.MatchId.HomeTeam.name}/>
                              ) : bet.winner_id === bet.MatchId.AwayTeam.id ? (
                                <img className="h-auto w-8" src={apiUrl + "/uploads/teams/" + bet.MatchId.AwayTeam.id + "/" + bet.MatchId.AwayTeam.logo_url}
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
                            <img className="block mx-auto rotate-clock-animation" style={{ animationDelay: `${index * 0.2}s` }} src={clockIcon} alt="icone d'horloge"/>
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
          )
        )
      )}
    </div>
  );
};

export default CurrentBets;