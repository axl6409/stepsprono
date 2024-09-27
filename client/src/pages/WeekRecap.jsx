import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import {useCookies} from "react-cookie";
import DashboardButton from "../components/nav/DashboardButton.jsx";
import SimpleTitle from "../components/partials/SimpleTitle.jsx";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const WeekRecap = () => {
  const [cookies, setCookie] = useCookies(["user"]);
  const token = localStorage.getItem('token') || cookies.token
  const [matchs, setMatchs] = useState([]);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const fetchMatchs = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/matchs/current-week`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setMatchs(response.data.data);
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
        Veuillez tourner votre appareil pour voir les pronostics en mode paysage.
      </div>
      <DashboardButton/>
      <div className="landscape-only relative">
        <div className="absolute left-0 top-8">
          <SimpleTitle title={"Récap"} />
        </div>
        <div className="overflow-x-auto relative z-[2]">
          <div className="table-auto w-full text-left border-collapse">
            <div className="text-xs uppercase relative z-[4] -bottom-4">
              <div className="flex flex-row justify-start">
                <div className="px-4 py-2 w-[10%]"></div>
                {matchs.map(match => (
                  <div
                    key={match.id}
                    className="px-2 py-2 text-black bg-white border border-black font-roboto rotate-[-20deg] -translate-x-6 pb-8 text-center"
                    style={{ width: `${90 / matchs.length}%` }}
                  >
                    <p className="writing-vertical">
                      {match.HomeTeam.name}
                      <br/>
                      {match.AwayTeam.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative z-[5] flex flex-col justify-start">
            {uniqueUsers.map(user => (
              <div key={user.id} className="bg-white border-b hover:bg-gray-100 flex flex-row justify-start items-center">
                <div className="px-2 py-2 w-[10%]">{user.username}</div>

                {matchs.map(match => {
                  const prediction = getPredictionForMatchAndUser(match.id, user.id);

                  if (prediction) {
                    if (match.require_details) {
                      return (
                        <div
                          key={`${user.id}-${match.id}`}
                          className="px-2 py-2"
                          style={{ width: `${90 / matchs.length}%` }}
                        >
                          {prediction.home_score} - {prediction.away_score}
                          <br/>
                          {prediction.PlayerGoal
                            ? `${prediction.PlayerGoal.name.length > 8
                              ? prediction.PlayerGoal.name.substring(0, 8) + '...'
                              : prediction.PlayerGoal.name}`
                            : 'Aucun butteur'}
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
                          className="px-1 py-2"
                          style={{ width: `${90 / matchs.length}%` }}
                        >
                          {winnerTeam ? (
                            <img
                              className="h-[50px] w-[50px] object-contain object-center relative z-[1]"
                              src={`${apiUrl}/uploads/teams/${winnerTeam.id}/${winnerTeam.logo_url}`}
                              alt={winnerTeam.name}
                            />
                          ) : <p className="text-center">NUL</p>}
                        </div>
                      );
                    }
                  } else {
                    return <div key={`${user.id}-${match.id}`} className="px-4 py-2">N/A</div>;
                  }
                })}
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekRecap;
