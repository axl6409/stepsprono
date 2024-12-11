import React, {useState} from 'react';
import defaultUserImage from "../../assets/components/user/default-user-profile.png";
import weekPointsShape from "../../assets/components/dashboard/week/week-points-shape.png";
import weekPointsText from "../../assets/components/dashboard/week/week-points-txt.png";
import monthPointsShape from "../../assets/components/dashboard/month/month-points-shape.png";
import monthPointsText from "../../assets/components/dashboard/month/month-points-txt.png";
import seasonPointsShape from "../../assets/components/dashboard/season/season-points-shape.png";
import seasonPointsText from "../../assets/components/dashboard/season/season-points-txt.png";
import {Link, useNavigate} from "react-router-dom";
import useUserData from '../../hooks/useUserData.jsx';
import vsIcon from "../../assets/components/matchs/vs-icon.png";
import nullSymbol from "../../assets/icons/null-symbol.svg";
import clockIcon from "../../assets/icons/clock-icon.svg";
import defaultTeamImage from "../../assets/components/icons/hidden-trophy.webp";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const CurrentBets = ({ loggedUser, user, token }) => {
  const {
    weekPoints,
    monthPoints,
    seasonPoints,
    bets,
    betColors,
    noMatches,
    matchs,
    canDisplayBets
  } = useUserData(user, token, apiUrl);
  const [flipped, setFlipped] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (bet) => {
    navigate(`/matchs/history/${bet.MatchId.id}`, {
      state: { canDisplayBets: canDisplayBets }
    });
  };

  return (
    <div key={user.id} className="relative">
      {/*<img className="mx-auto h-full w-4/5 fixed opacity-10 z-[1] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"*/}
      {/*     src={user.team_id ? `${apiUrl}/uploads/teams/${user.team_id}/${user.team?.logo_url}` : defaultTeamImage}*/}
      {/*     alt=""/>*/}
      <div className="relative z-[2]">
        <div
          className="relative w-[200px] h-[200px] mx-auto"
          style={{perspective: '1000px'}}
          onClick={() => setFlipped(!flipped)}
        >
          <div
            className={`relative w-full h-full transition-transform duration-500 ease-in-out`}
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            <div
              className="absolute inset-0 bg-white rounded-full border-2 border-black"
              style={{
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
                transform: 'translateZ(1px)'
              }}
            >
              <img
                className="w-full h-full object-cover rounded-full"
                src={user.img ? `${apiUrl}/uploads/users/${user.id}/${user.img}` : defaultUserImage}
                alt="Image de profil"
              />
            </div>
            <div
              className="absolute inset-0 bg-white rounded-full border-2 border-black flex justify-center items-center p-4"
              style={{
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
                transform: 'rotateY(180deg) translateZ(1px)'
              }}
            >
              <img
                className="h-full w-full object-contain"
                src={user.team_id ? `${apiUrl}/uploads/teams/${user.team_id}/${user.team?.logo_url}` : defaultTeamImage}
                alt=""
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row flex-wrap justify-between px-4 -mt-8">
          <div
            className="h-fit flex flex-col w-1/3 p-1 max-w-[120px] relative fade-in">
            {/*<MonthPoints />*/}
            <div className="w-full relative">
              <img className="block" src={monthPointsShape} alt=""/>
              <img className="absolute inset-0 rotate-animation delay-500 origin-center" src={monthPointsText}
                   alt=""/>
            </div>
            <p
              translate="no"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-rubik text-xl4 stroke-black font-black text-white leading-7">
              {monthPoints}
            </p>
          </div>
          <div
            className="h-fit flex flex-col w-1/3 p-1 max-w-[120px] relative mt-12 fade-in">
            {/*<WeekPoints/>*/}
            <div className="w-full relative">
              <img className="block" src={weekPointsShape} alt=""/>
              <img className="absolute inset-0 rotate-animation delay-500 origin-center" src={weekPointsText} alt=""/>
            </div>
            <p
              translate="no"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-rubik text-xl4 stroke-black font-black text-white leading-5">
              {weekPoints}
            </p>
          </div>
          <div
            className="h-fit flex flex-col w-1/3 p-1 max-w-[120px] relative fade-in">
            {/*<SeasonPoints/>*/}
            <div className="w-full relative">
              <img className="block" src={seasonPointsShape} alt=""/>
              <img className="absolute inset-0 rotate-animation delay-500 origin-center" src={seasonPointsText}
                   alt=""/>
            </div>
            <p
              translate="no"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-rubik text-xl4 stroke-black font-black text-white leading-5">
              {seasonPoints}
            </p>
          </div>
        </div>
        {loggedUser.id === user.id && (
          <div className="pt-8">
            {noMatches ? (
              <div
                className="w-4/5 fade-in block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border">
              <span
                translate="no"
                className="no-correct relative z-[2] w-full block border border-black text-black bg-white uppercase font-regular text-base font-roboto px-3 py-2 rounded-full text-center shadow-md bg-gray-light cursor-not-allowed"
              >
                Aucun match cette semaine
              </span>
              </div>
            ) : !canDisplayBets ? (
              <Link
                to="/matchs"
                className="w-4/5 fade-in block relative my-4 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
              >
              <span
                translate="no"
                className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1.5 group-hover:-translate-y-0"
              >
                {bets.length > 0 ? 'Modifier mes pronos' : 'Faire mes pronos'}
              </span>
              </Link>
            ) : (
              <>
                <Link
                  to="/week-recap"
                  className="w-4/5 fade-in block relative mt-12 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
                >
                <span
                  translate="no"
                  className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-green-soft transition -translate-y-1.5 group-hover:-translate-y-0"
                >
                  Voir tous les pronos
                </span>
                </Link>
              </>
            )}
          </div>
        )}
        {noMatches ? (
          <div className="relative fade-in my-[25%]">
            <p translate="no" className="no-correct text-center text-lg font-medium mt-4">
              Aucun matchs et pronostics pour cette semaine.
            </p>
          </div>
        ) : (
          !canDisplayBets && loggedUser.id !== user.id ? (
            <div className="relative fade-in my-[25%]">
              <p translate="no" className="no-correct text-center text-lg font-medium mt-4 px-12">
                Attends la fin des pronos pour voir les siens 😉
              </p>
            </div>
          ) : (
            bets && bets.length > 0 ? (
              <div
                className="relative my-[25%]">
                <h2 className={`relative fade-in mb-12 w-fit mx-auto`}>
                  <span
                    className="absolute inset-0 py-4 w-full h-full bg-purple-soft z-[2] translate-x-1 translate-y-0.5"></span>
                  <span
                    className="absolute inset-0 py-4 w-full h-full bg-green-soft z-[1] translate-x-2 translate-y-1.5"></span>
                  <span
                    translate="no"
                    className="relative no-correct bg-white left-0 top-0 right-0 font-rubik font-black text-xl2 border border-black text-black px-4 leading-6 z-[3] translate-x-1 translate-y-1">Pronos de la semaine</span>
                </h2>
                <div className="w-full fade-in px-2">
                  <div className="flex flex-col w-full">
                    <div
                      className="relative flex flex-row border border-black rounded-full shadow-flat-black-adjust bg-white">
                      <div scope="col" className="py-0.5 pr-4 w-[50%] border-r-2 border-black border-dotted">
                        <p translate="no"
                           className="font-rubik no-correct font-medium text-right uppercase text-xxs">Match</p>
                      </div>
                      <div scope="col" className="py-0.5 px-1 w-[30%] border-r-2 border-black border-dotted">
                        <p translate="no" className="font-rubik no-correct font-medium text-xxs uppercase">Prono</p>
                      </div>
                      <div scope="col" className="py-0.5 px-1 w-[20%]">
                        <p translate="no" className="font-rubik no-correct font-medium text-xxs uppercase">Points</p>
                      </div>
                    </div>
                    <div className={`flex flex-col mt-2 `}>
                      {bets.map((bet, index) => (
                        <div key={bet.id}
                             onClick={() => handleNavigate(bet)}
                             className="relative bg-white min-h-[65px] flex flex-row my-2 border border-black rounded-xl shadow-flat-black-adjust">
                          <p className="absolute z-[1] font-rubik font-black text-xl6 -top-8 -left-2 opacity-20"
                             translate="no"
                             style={{color: betColors[bet.id]}}>{index + 1}</p>
                          <div
                            className="relative z-[2] w-[50%] py-2 pl-2 pr-4 border-r-2 border-black border-dotted">
                            <div className="flex flex-col justify-evenly h-full">
                              {bet.home_score !== null && bet.away_score !== null ? (
                                <>
                                  <div className="relative flex flex-row justify-center items-center">
                                    <img className="h-[50px] w-auto mt-[-15px] mr-[-10px] relative z-[1]"
                                         src={apiUrl + "/uploads/teams/" + bet.MatchId.HomeTeam.id + "/" + bet.MatchId.HomeTeam.logo_url}
                                         alt={bet.MatchId.HomeTeam.name}/>
                                    <img className="h-[40px] relative z-[3]"
                                         src={vsIcon}
                                         alt=""/>
                                    <img className="h-[50px] w-auto mb-[-15px] ml-[-10px] relative z-[2]"
                                         src={apiUrl + "/uploads/teams/" + bet.MatchId.AwayTeam.id + "/" + bet.MatchId.AwayTeam.logo_url}
                                         alt={bet.MatchId.AwayTeam.name}/>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <p
                                    translate="no"
                                    className="font-roboto no-correct text-left uppercase text-xs font-medium">{bet.MatchId.HomeTeam.name}</p>
                                  <p
                                    translate="no"
                                    className="font-roboto no-correct text-left uppercase text-xs font-medium">{bet.MatchId.AwayTeam.name}</p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="relative z-[2] w-[30%] py-2 border-r-2 border-black border-dotted">
                            <div className="h-full flex flex-row justify-center items-center">
                              {bet.home_score !== null && bet.away_score !== null ? (
                                <div>
                                  <p translate="no" className="font-rubik no-correct font-medium text-xl">
                                    {bet.home_score} - {bet.away_score}
                                  </p>
                                  {bet.PlayerGoal !== null && (
                                    <p translate="no"
                                       className="font-title no-correct text-base font-bold">{bet.PlayerGoal.name}</p>
                                  )}
                                </div>
                              ) : (
                                bet.winner_id === bet.MatchId.HomeTeam.id ? (
                                  <img className="h-auto w-8"
                                       src={apiUrl + "/uploads/teams/" + bet.MatchId.HomeTeam.id + "/" + bet.MatchId.HomeTeam.logo_url}
                                       alt={bet.MatchId.HomeTeam.name}/>
                                ) : bet.winner_id === bet.MatchId.AwayTeam.id ? (
                                  <img className="h-auto w-8"
                                       src={apiUrl + "/uploads/teams/" + bet.MatchId.AwayTeam.id + "/" + bet.MatchId.AwayTeam.logo_url}
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
                              <img className="block mx-auto rotate-clock-animation"
                                   style={{animationDelay: `${index * 0.2}s`}} src={clockIcon} alt="icone d'horloge"/>
                            ) : bet.points === 0 ? (
                              <p translate="no" className="font-rubik no-correct font-medium text-xl">{bet.points}</p>
                            ) : (
                              <p translate="no" className="font-rubik no-correct font-medium text-xl">{bet.points}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="font-rubik text-l text-center my-8">Aucun pronos en cours</p>
            )
          )
        )}
      </div>
    </div>
  );
};

export default CurrentBets;