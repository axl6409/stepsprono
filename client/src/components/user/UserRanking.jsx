import React, {useContext, useEffect, useState} from 'react';
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../partials/Loader.jsx";
import defaultUserImage from "../../assets/components/user/default-user-profile.png";
import crown from "../../assets/components/ranking/crown.svg";
import crownOpacity from "../../assets/components/ranking/crown-opacity.svg";
import purpleStar from "../../assets/components/ranking/purple-star.svg";
import purpleStarOpacity from "../../assets/components/ranking/purple-star-opacity.svg";
import yellowStar from "../../assets/components/ranking/yellow-star.svg";
import blackStar from "../../assets/components/ranking/black-star.svg";
import purpleFlower from "../../assets/components/ranking/purple-flower.svg";
import flowerYellowOpacity from "../../assets/components/ranking/flower-yellow-opacity.png";
import {RankingContext} from "../../contexts/RankingContext.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const UserRanking = () => {
  const { ranking, rankingType, changeRankingType, refreshRanking, isLoading, rankingMode } = useContext(RankingContext);
  console.log("UserRanking: ", ranking)
  const handleFilterChange = (newFilter) => {
    changeRankingType(newFilter);
  };

  const getTieBreakerExplanation = () => {
    console.log("rankingMode", rankingMode);
    if (rankingMode === 'history') {
      return "Classement départagé selon les points obtenus lors de la semaine précédente.";
    } else if (rankingMode === 'legit') {
      return "Classement départagé selon les points obtenus sans bonus.";
    }
    return "";
  };

  if (isLoading) {
    return (
      <div className="text-center flex flex-col justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative p-8 px-2 pt-0">

      {/* Podium: Top 3 users */}
      <div className="relative z-[10] flex flex-row justify-center items-end mb-8">
        <img className="absolute fade-in z-[1] -top-20 left-4 w-20" src={crownOpacity} alt=""/>
        <img className="absolute fade-in z-[1] -top-20 right-0 w-20" src={purpleStar} alt=""/>
        <img className="absolute fade-in z-[1] -top-20 right-12 w-4" src={blackStar} alt=""/>
        <img className="absolute fade-in z-[1] bottom-20 -left-2" src={flowerYellowOpacity} alt=""/>
        <img className="absolute fade-in z-[1] bottom-16 left-4 w-4" src={blackStar} alt=""/>
        <img className="absolute fade-in z-[1] -bottom-20 right-0 w-20 rotate-45" src={crownOpacity} alt=""/>
        <img className="absolute fade-in z-[1] -bottom-16 left-1/4 w-20" src={purpleStarOpacity} alt=""/>
        <div className="relative fade-in  z-[3] order-1 -mr-6">
          <Link to={`/dashboard/${ranking[1]?.user_id}`} className="relative fade-in z-[20] group flex flex-col items-center">
            <p translate="no"
               className="absolute -top-4 rounded-full bg-blue-medium w-9 h-9 text-center font-rubik font-black text-white text-xl2 leading-8">2</p>
            <div
              className="w-28 h-28 flex items-center justify-center rounded-full overflow-hidden bg-white mb-2 border-blue-medium border-2">
              <img
                src={ranking[1]?.img ? `${apiUrl}/uploads/users/${ranking[1].user_id}/${ranking[1].img}` : defaultUserImage}
                alt={ranking[1]?.username}/>
            </div>
            <div className="relative w-full">
              <p translate="no" className="font-bold text-center">{ranking[1]?.username}</p>
              <p translate="no"
                 className="flex flex-row relative z-[3] justify-center items-center font-rubik font-medium leading-[30px] text-xl2">{ranking[1]?.points}</p>
              {ranking[1]?.mode === 'history' && rankingType !== 'week' && (
                <p translate="no"
                   className="font-rubik absolute z-[2] right-4 -bottom-2 font-bold text-black rounded-full text-[10px] border border-black shadow-flat-black-adjust inline-block w-[21px] h-[21px] text-center leading-[21px]">+ {ranking[1]?.tie_breaker_points}</p>
              )}
              {ranking[1]?.mode === 'legit' && rankingType !== 'week' && (
                <p translate="no"
                   className="font-rubik absolute z-[2] right-4 -bottom-2 font-bold text-black rounded-full text-[10px] border border-black shadow-flat-black-adjust inline-block w-[21px] h-[21px] text-center leading-[21px]">{ranking[1]?.tie_breaker_points}</p>
              )}
            </div>
          </Link>
        </div>
        <div className="relative z-[4]  order-2 transform -translate-y-4">
          <Link to={`/dashboard/${ranking[0]?.user_id}`} className="relative z-[20] group flex flex-col items-center">
            <img className="absolute fade-in delay-500 -top-20 w-20" src={crown} alt=""/>
            <img className="absolute fade-in delay-150 z-[1] -top-2 -left-4 w-20" src={purpleFlower} alt=""/>
            <div
              className="w-40 h-40 relative z-[2] rounded-full bg-white mb-2 border-yellow-medium border-2">
              <img className="absolute fade-in delay-700 z-[3] top-1 left-2 w-8" src={blackStar} alt=""/>
              <div className="overflow-hidden fade-in flex items-center rounded-full justify-center w-full h-full">
                <img className="z-[2]"
                     src={ranking[0]?.img ? `${apiUrl}/uploads/users/${ranking[0].user_id}/${ranking[0].img}` : defaultUserImage}
                     alt={ranking[0]?.username}/>
              </div>
              <img className="absolute fade-in delay-300 z-[3] bottom-0 right-1.5 w-8" src={yellowStar} alt=""/>
            </div>
            <div className="relative w-full">
              <p translate="no"
                 className="font-black w-full fade-in text-center relative mx-auto text-xl2">
                <span translate="no" className="relative z-[3]">{ranking[0]?.username}</span>
                <span
                  translate="no"
                  className="absolute left-0 top-0 right-0 text-purple-soft z-[2] translate-x-0.5 translate-y-0.5">{ranking[0]?.username}</span>
                <span
                  translate="no"
                  className="absolute left-0 top-0 right-0 text-green-soft z-[1] translate-x-1 translate-y-1">{ranking[0]?.username}</span>
              </p>
              <p translate="no"
                 className="flex flex-row relative z-[3] justify-center items-center font-rubik font-bold text-stroke-black-2 leading-[35px] text-xl5">{ranking[0]?.points}</p>
              {ranking[0]?.mode === 'history' && rankingType !== 'week' && (
                <p translate="no"
                   className="font-rubik absolute z-[2] right-6 -bottom-4 font-bold text-white bg-black rounded-full text-[12px] inline-block w-[23px] h-[23px] text-center leading-[23px]">+ {ranking[0]?.tie_breaker_points}</p>
              )}
              {ranking[0]?.mode === 'legit' && rankingType !== 'week' && (
                <p translate="no"
                   className="font-rubik absolute z-[2] right-6 -bottom-4 font-bold text-white bg-black rounded-full text-[12px] inline-block w-[23px] h-[23px] text-center leading-[23px]">{ranking[0]?.tie_breaker_points}</p>
              )}
            </div>
          </Link>
        </div>
        <div className="relative z-[2] order-3 -ml-6">
          <Link to={`/dashboard/${ranking[2]?.user_id}`} className="relative fade-in z-[20] group flex flex-col items-center">
            <p
              translate="no"
              className="absolute -top-4 rounded-full bg-blue-medium w-9 h-9 text-center font-rubik font-black text-white text-xl2 leading-8">3</p>
            <div
              className="w-28 h-28 flex items-center justify-center rounded-full overflow-hidden bg-white mb-2 border-blue-medium border-2">
              <img
                src={ranking[2]?.img ? `${apiUrl}/uploads/users/${ranking[2].user_id}/${ranking[2].img}` : defaultUserImage}
                alt={ranking[2]?.username}/>
            </div>
            <div className="relative w-full">
              <p translate="no" className="font-bold text-center">{ranking[2]?.username}</p>
              <p translate="no"
                 className="flex flex-row relative z-[3] justify-center items-center font-rubik font-medium leading-[30px] text-xl2">{ranking[2]?.points}</p>
              {ranking[2]?.mode === 'history' && rankingType !== 'week' && (
                <p translate="no"
                   className="font-rubik absolute z-[2] right-4 -bottom-2 font-bold text-black rounded-full text-[10px] border border-black shadow-flat-black-adjust inline-block w-[21px] h-[21px] text-center leading-[21px]">+ {ranking[2]?.tie_breaker_points}</p>
              )}
              {ranking[2]?.mode === 'legit' && rankingType !== 'week' && (
                <p translate="no"
                   className="font-rubik absolute z-[2] right-4 -bottom-2 font-bold text-black rounded-full text-[10px] border border-black shadow-flat-black-adjust inline-block w-[21px] h-[21px] text-center leading-[21px]">{ranking[2]?.tie_breaker_points}</p>
              )}
            </div>
          </Link>
        </div>
      </div>

      <div
        className="relative z-[30] bg-white w-full mb-0 before:content-[''] before:absolute before:inset-0 before:bg-black before:z-[1] before:rounded-md before:translate-y-0.5 before:translate-x-0.5">
        <div
          className="relative z-[2] bg-white rounded-md p-1 flex flex-row justify-center w-full h-full border border-black">
          <button
            translate="no"
            onClick={() => handleFilterChange('week')}
            className={`w-1/3 fade-in delay-150 transition-colors duration-300 ease-in-out rounded-md font-roboto text-xs uppercase py-1 underline font-medium ${rankingType === 'week' ? 'bg-green-medium' : ''}`}
          >
            semaine
          </button>
          <div className="w-px h-auto mx-1 border-l border-black border-dotted"></div>
          <button
            translate="no"
            onClick={() => handleFilterChange('month')}
            className={`w-1/3 fade-in delay-300 transition-colors duration-300 ease-in-out rounded-md font-roboto text-xs uppercase py-1 underline font-medium ${rankingType === 'month' ? 'bg-green-medium' : ''}`}
          >
            mois
          </button>
          <div className="w-px h-auto mx-1 border-l border-black border-dotted"></div>
          <button
            translate="no"
            onClick={() => handleFilterChange('season')}
            className={`w-1/3 fade-in delay-700 transition-colors duration-300 ease-in-out rounded-md font-roboto text-xs uppercase py-1 underline font-medium ${rankingType === 'season' ? 'bg-green-medium' : ''}`}
          >
            saison
          </button>
        </div>
      </div>

      <div className="relative z-[15] mb-4">
        <p className="text-xs italic">{getTieBreakerExplanation()}</p>
      </div>

      <div className="relative z-[20] flex flex-col justify-start">
        <ul className="px-4">
          {ranking.slice(3).map((user, index) => (
            <li
              style={{animationDelay: `${index * 0.05}s`}}
              className="relative fade-in rounded-xl mt-2 mb-4 border-2 border-black bg-white h-fit shadow-flat-black"
              key={index}>
              <div
                className="absolute z-[25] bg-white -top-3 -left-4 border-2 border-black w-[30px] text-center h-[30px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust">
                <p
                  translate="no"
                  className="font-rubik w-full font-black text-stroke-black-2 text-white text-[100%] inline-block leading-[35px]">{index + 4}</p>
              </div>
              <Link to={`/dashboard/${user.user_id}`}
                    className="relative z-[20] group flex flex-row overflow-hidden rounded-xl justify-between">
                <div className="h-[60px] w-[70px] bg-grey-light rounded-r-md">
                  <img className="object-center w-full h-full object-cover"
                       src={user.img ? `${apiUrl}/uploads/users/${user.user_id}/${user.img}` : defaultUserImage}
                       alt={user.username}/>
                </div>
                <p translate="no" className="font-title text-black text-xl font-bold h-fit my-auto w-3/5 pl-6 pr-2">
                  <span translate="no" className="inline-block mr-2">{user.username}</span>
                </p>
                <div className="w-px h-auto mx-1 border-l-2 border-black border-dotted"></div>
                <p translate="no"
                   className="font-title text-black text-right uppercase text-l font-bold leading-4 w-1/5 pr-4 my-auto">
                  <span translate="no" className="inline-block text-black p-2">{user.points}</span>
                  {user.mode === 'history' && rankingType !== 'week' && <span translate="no" className="font-rubik absolute z-[2] right-1 bottom-1 font-bold text-black rounded-full text-[10px] border border-black shadow-flat-black-adjust inline-block w-[21px] h-[21px] text-center leading-[21px]">+{user.tie_breaker_points}</span>}
                  {user.mode === 'legit' && rankingType !== 'week' && <span translate="no" className="font-rubik absolute z-[2] right-1 bottom-1 font-bold text-black rounded-full text-[10px] border border-black shadow-flat-black-adjust inline-block w-[21px] h-[21px] text-center leading-[21px]">{user.tie_breaker_points}</span>}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default UserRanking;