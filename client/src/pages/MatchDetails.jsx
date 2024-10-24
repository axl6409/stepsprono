import React, { useEffect, useState } from 'react';
import moment from "moment";
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import AnimatedTitle from "../components/partials/AnimatedTitle.jsx";
import vsIcon from "../assets/components/matchs/vs-icon.png";
import BackButton from "../components/nav/BackButton.jsx";
import nullSymbol from "../assets/icons/null-symbol.svg";
import clockIcon from "../assets/icons/clock-icon.svg";
import {useCookies} from "react-cookie";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const MatchDetails = () => {
  const [cookies] = useCookies(["user"]);
  const token = localStorage.getItem('token') || cookies.token;
  const { matchId } = useParams();
  const location = useLocation();
  const { canDisplayBets } = location.state || {};
  const [match, setMatch] = useState(null);
  const [bets, setBets] = useState([]);
  const [betColors, setBetColors] = useState({});
  const [homeScorers, setHomeScorers] = useState([]);
  const [awayScorers, setAwayScorers] = useState([]);
  const colors = ['#6666FF', '#CC99FF', '#00CC99', '#F7B009', '#F41731'];

  useEffect(() => {
    const fetchMatchAndBets = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/match/${matchId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        if (response.data) {
          const matchDatas = response.data.match || {};
          let betDatas = response.data.match.MatchId || [];

          betDatas = betDatas.sort((a, b) => {
            if (b.points === a.points) {
              return a.UserId.id - b.UserId.id;
            }
            return b.points - a.points;
          });

          setMatch(matchDatas);
          setBets(betDatas);
          const newBetColors = {};
          betDatas.forEach((bet, index) => {
            newBetColors[bet.id] = colors[index % colors.length];
          });
          setBetColors(newBetColors);

          const scorersString = matchDatas.scorers;
          const scorers = typeof scorersString === 'string' ? JSON.parse(scorersString) : [];
          const homeScorersList = [];
          const awayScorersList = [];

          for (const scorer of scorers) {

            if (!scorer || !scorer.playerId) {
              continue;
            }

            try {
              const playerResponse = await axios.get(`${apiUrl}/api/player/${scorer.playerId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              const playerData = playerResponse.data;
              if (playerData && playerData.team_id) {
                if (playerData.team_id === matchDatas.home_team_id) {
                  homeScorersList.push(scorer.playerName);
                } else if (playerData.team_id === matchDatas.away_team_id) {
                  awayScorersList.push(scorer.playerName);
                }
              } else {
                console.warn(`team_id non trouvé pour le joueur avec l'ID ${scorer.playerId}`);
              }
            } catch (playerError) {
              console.error(`Erreur lors de la récupération des données du joueur ${scorer.playerId}:`, playerError);
            }
          }

          setHomeScorers(homeScorersList);
          setAwayScorers(awayScorersList);
        } else {
          console.error('Aucune donnée trouvée dans la réponse');
        }
      } catch (error) {
        console.error('Error fetching match and bets:', error);
      }
    }
    fetchMatchAndBets();
  }, [token, matchId]);

  if (!match) return <div>Loading...</div>;

  const matchDate = moment(match.utc_date);
  const isHistoricalMatch = matchDate.isBefore(moment());

  return (
    <div className="text-center relative h-auto flex flex-col justify-center overflow-x-hidden pt-20 pb-28">
      <BackButton/>
      <AnimatedTitle title={"Détails du match"} stickyStatus={false}/>
      <div>
        <div className="w-full text-center flex flex-col justify-center px-6 py-4">
          <p className="date-hour fade-in delay-150 capitalize font-medium bg-white border-2 border-black shadow-flat-black-adjust w-fit mx-auto px-8 mb-8" translate="no">
            <span className="block font-roboto text-sm" translate="no">{matchDate.format('DD MMMM YY')}</span>
            <span className="block font-roboto text-sm" translate="no">{matchDate.format('HH:mm:ss')}</span>
          </p>
        </div>
        <div className="relative flex flex-row justify-center items-center">
          <div>
            <img className="w-[150px] h-[150px] object-contain fade-in delay-150"
                 src={apiUrl + "/uploads/teams/" + match.HomeTeam.id + "/" + match.HomeTeam.logo_url} alt=""/>
          </div>
          <div className="absolute z-[10]">
            <img className="fade-in delay-300" src={vsIcon} alt=""/>
          </div>
          <div>
            <img className="w-[150px] h-[150px] object-contain fade-in delay-200"
                 src={apiUrl + "/uploads/teams/" + match.AwayTeam.id + "/" + match.AwayTeam.logo_url} alt=""/>
            <ul>
              {awayScorers.map((scorer, index) => (
                <li key={index} translate="no">{scorer.playerName}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative flex flex-row justify-center items-start">
          <div className="w-[150px]">
            <p translate="no"  className="font-rubik font-bold text-xl4 fade-in delay-150">{match.goals_home}</p>
            <ul>
              {homeScorers.map((scorer, index) => (
                <li key={index} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <p className="font-rubik font-medium text-sm" translate="no">{scorer}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-[150px]">
            <p className="font-rubik font-bold text-xl4" translate="no">{match.goals_away}</p>
            <ul>
              {awayScorers.map((scorer, index) => (
                <li key={index} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <p className="font-rubik font-medium text-sm" translate="no">{scorer}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <h2 translate="no"  className={`relative fade-in delay-200 mb-8 mt-12 w-fit mx-auto`}>
        <span
          className="absolute inset-0 py-4 w-full h-full bg-purple-soft z-[2] translate-x-1 translate-y-0.5"></span>
        <span
          className="absolute inset-0 py-4 w-full h-full bg-green-soft z-[1] translate-x-2 translate-y-1.5"></span>
        <span
          className="relative bg-white uppercase left-0 top-0 right-0 font-rubik font-black text-xl2 border border-black text-black px-4 leading-6 z-[3] translate-x-1 translate-y-1">Pronostics</span>
      </h2>
      <div className="w-full fade-in px-2">
        {canDisplayBets || isHistoricalMatch ? (
          <div className="flex flex-col w-full">
            <div className={`flex flex-col mt-2 `}>
              {bets.map((bet, index) => (
                <div key={index}
                     style={{ animationDelay: `${index * 0.1}s` }}
                     className={`history-single-match-${index} fade-in relative bg-white min-h-[55px] flex flex-row my-2 border border-black rounded-xl shadow-flat-black-adjust`}>
                  <style>
                    {`
                      .history-single-match-${index}::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: ${betColors[bet.id]};
                        z-index: 1;
                        border-radius: inherit;
                        opacity: 0.3;
                      }
                    `}
                  </style>
                  <p
                    translate="no"
                    className="absolute hidden z-[1] font-rubik font-black text-xl6 -top-8 -left-2 opacity-20">{index + 1}</p>
                  <div className="relative z-[2] w-[50%] py-2 pl-2 pr-4 border-r-2 border-black border-dotted">
                    <div className="flex flex-col justify-evenly h-full">
                      <p className="font-rubik font-medium text-l" translate="no">{bet.UserId.username}</p>
                    </div>
                  </div>
                  <div className="relative z-[2] w-[40%] py-2 border-r-2 border-black border-dotted">
                    <div className="h-full flex flex-row justify-center items-center">
                      {bet.home_score !== null && bet.away_score !== null ? (
                        <div>
                          <p className="font-rubik font-medium text-xl leading-5" translate="no">
                            {bet.home_score} - {bet.away_score}
                          </p>
                          {bet.player_goal !== null && (
                            <p className="font-title text-base font-bold" translate="no">{bet.PlayerGoal.name}</p>
                          )}
                        </div>
                      ) : (
                        bet.winner_id === match.HomeTeam.id ? (
                          <img className="h-auto w-8"
                               src={apiUrl + "/uploads/teams/" + match.HomeTeam.id + "/" + match.HomeTeam.logo_url}
                               alt={match.HomeTeam.name}/>
                        ) : bet.winner_id === match.AwayTeam.id ? (
                          <img className="h-auto w-8"
                               src={apiUrl + "/uploads/teams/" + match.AwayTeam.id + "/" + match.AwayTeam.logo_url}
                               alt={match.AwayTeam.name}/>
                        ) : (
                          <img className="h-auto w-8" src={nullSymbol}
                               alt="symbole match null"/>
                        )
                      )}
                    </div>
                  </div>
                  <div className="w-[10%] flex flex-col justify-center items-center py-2">
                    <p className="font-rubik font-medium text-xl" translate="no">{bet.points}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative fade-in my-[25%]">
            <p className="text-center text-lg font-medium mt-4 px-12" translate="no">
              Attends la fin des pronos pour voir ceux des autres 😉
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchDetails;
