import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import {useCookies} from "react-cookie";
import DashboardButton from "../components/nav/DashboardButton.jsx";
import SimpleTitle from "../components/partials/SimpleTitle.jsx";
import nullSymbol from "../assets/icons/null-symbol.svg";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const WeekRecap = () => {
  const [cookies, setCookie] = useCookies(["user"]);
  const token = localStorage.getItem('token') || cookies.token
  const [matchs, setMatchs] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [betColors, setBetColors] = useState({});
  const colors = ['#6666FF', '#CC99FF', '#00CC99', '#F7B009', '#F41731'];

  useEffect(() => {
    const fetchMatchs = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/matchs/current-week`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const currentMatchs = response.data.data;
        setMatchs(currentMatchs);
        const newBetColors = {};
        currentMatchs.forEach((bet, index) => {
          newBetColors[bet.id] = colors[index % colors.length];
        });
        setBetColors(newBetColors);
      } catch (error) {
        console.error('Erreur lors de la récupération des matchs :', error);
      }
    };

    const fetchPredictions = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/users/bets/last`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setPredictions(response.data.bets);
      } catch (error) {
        console.error('Erreur lors de la récupération des pronostics :', error);
      }
    };
    fetchMatchs();
    fetchPredictions();
  }, [token]);

  const getPredictionForMatchAndUser = (matchId, userId) => {
    const prediction = predictions?.find(pred => pred.match_id === matchId && pred.user_id === userId);
    if (prediction) {
      return prediction;
    }
    return null;
  };

  const uniqueUsers = [...new Map(predictions.map(prediction => [prediction.user_id, prediction.UserId])).values()];

  return (
    <div className="recap-container">
      <div className="portrait-warning">
        <p
            translate="no"
            className="font-roboto text-xl text-black font-bold">Tourne le téléphone bandit !</p>
      </div>
      <DashboardButton/>
      <div className="landscape-only relative">
        <div className="absolute left-4 top-16 *:text-[30px]">
          <h1
            className={`font-black fade-in mb-12 text-center relative w-fit mx-auto text-xl3 leading-[50px]`}>
            <span translate="no" className="relative z-[3]">Récap</span>
            <span
              translate="no"
              className="absolute left-0 top-0 right-0 text-purple-soft z-[2] translate-x-0.5 translate-y-0.5">Récap</span>
            <span
              translate="no"
              className="absolute left-0 top-0 right-0 text-green-soft z-[1] translate-x-1 translate-y-1">Récap</span>
          </h1>
        </div>
        <div className="overflow-x-auto relative z-[2]">
          <div className="table-auto w-full text-left border-collapse max-w-[95%] ml-auto mr-[2%]">
            <div className="text-xs uppercase relative z-[6] bottom-0 max-h-[170px] overflow-hidden pt-2 h-[125px]">
              <div className="flex flex-row justify-start relative bottom-[-12px] left-[7px]">
                <div className="px-2 py-2 w-[20%]"></div>
                {matchs.map((match, index) => (
                  <div
                    key={match.id}
                    className="recap_table_head_cel px-1 py-2 bg-white border border-black h-[140px] rotate-[-27deg] rounded-xl sec-child-shadow-left translate-x-[-1.35rem] pb-8 last:rounded-br-[40px]"
                    style={{width: `${90 / matchs.length}%`}}
                  >
                    <p className="absolute z-[1] font-rubik font-black text-xl6 bottom-0 right-0 opacity-20 rotate-[27deg]"
                       translate="no"
                       style={{color: betColors[match.id]}}>{index + 1}</p>
                    <p
                      className="writing-vertical text-black text-sm w-full h-full text-center font-roboto flex flex-col leading-[20px] justify-center items-center" translate="no">
                      <span>
                        <img
                          className="inline-block align-baseline h-[22px] w-[22px] opacity-80 object-contain object-center relative z-[1]"
                          src={`${apiUrl}/uploads/teams/${match.HomeTeam.id}/${match.HomeTeam.logo_url}`}
                          alt={match.HomeTeam.name}/>
                        <span className="inline-block">{match.HomeTeam.code}</span>
                      </span>
                      <span>
                        <img
                          className="inline-block align-baseline h-[22px] w-[22px] opacity-80 object-contain object-center relative z-[1]"
                          src={`${apiUrl}/uploads/teams/${match.AwayTeam.id}/${match.AwayTeam.logo_url}`}
                          alt={match.AwayTeam.name}/>
                        <span className="inline-block">{match.AwayTeam.code}</span>
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="relative z-[5] flex flex-col justify-start border border-black border-r-0 rounded-tl-2xl overflow-hidden shadow-flat-black-adjust-left">
              <div className="overflow-y-scroll h-[65vh] recap_table_body_inner_shadow">
                {uniqueUsers.map(user => (
                  <div key={user.id} className="h-[60px] relative z-[-1] bg-white border-dashed border-b border-black hover:bg-gray-100 flex flex-row justify-start items-center">
                    <div className="px-2 py-2 w-[20%] h-full border-r border-black flex flex-col justify-center">
                      <p className="font-rubik text-sm font-medium text-black" translate="no">{user.username}</p>
                    </div>

                    {matchs.map((match, index) => {
                      const prediction = getPredictionForMatchAndUser(match.id, user.id);

                      if (prediction) {
                        if (match.require_details) {
                          return (
                            <div
                              key={`${user.id}-${match.id}`}
                              className="px-1 py-2 h-full relative text-xxs flex flex-col justify-center border-r border-black"
                              style={{width: `${90 / matchs.length}%`}}
                            >
                              <span
                                className="font-rubik font-bold text-l text-center" translate="no">{prediction.home_score} : {prediction.away_score}</span>
                              <span
                                className="font-rubik font-medium text-xxxs text-center leading-[10px]" translate="no">{prediction.PlayerGoal
                                ? `${prediction.PlayerGoal.name.length > 8
                                  ? prediction.PlayerGoal.name.substring(0, 8) + '...'
                                  : prediction.PlayerGoal.name}`
                                : 'Aucun butteur'}</span>
                            </div>
                          );
                        } else {
                          const winnerTeam = prediction.winner_id === match.home_team_id
                            ? match.HomeTeam
                            : prediction.winner_id === match.away_team_id
                              ? match.AwayTeam
                              : null;

                          return (
                            <div
                              key={`${user.id}-${match.id}`}
                              className="px-1 py-2 border-r border-black h-full flex flex-col justify-center"
                              style={{ width: `${90 / matchs.length}%` }}
                            >
                              {winnerTeam ? (
                                <img
                                  className="h-[50px] w-[50px] object-contain object-center relative z-[1]"
                                  src={`${apiUrl}/uploads/teams/${winnerTeam.id}/${winnerTeam.logo_url}`}
                                  alt={winnerTeam.name}
                                />
                              ) :
                                <img
                                className="h-[25px] w-[25px] mx-auto object-contain object-center relative z-[1]"
                                src={nullSymbol}
                                alt="match nul symbol"
                                />
                              }
                            </div>
                          );
                        }
                      } else {
                        return <div key={`${user.id}-${match.id}`} style={{width: `${90 / matchs.length}%`}}
                                    className="px-1 py-2 h-full flex flex-col justify-center relative border-r border-black z-[1]">
                          <p className="text-center" translate="no"> </p>
                        </div>;
                      }
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekRecap;