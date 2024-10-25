import React, { useEffect, useState } from 'react';
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
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const UserRanking = ({ users, token }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [updatedUsers, setUpdatedUsers] = useState([]);
  const [filter, setFilter] = useState('season');

  useEffect(() => {
    const fetchUserPoints = async (userId) => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${userId}/bets/${filter}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data.points;
      } catch (error) {
        console.error(`Erreur lors de la récupération des points pour l'utilisateur ${userId}`, error);
        return 0;
      }
    };

    const fetchUsersWithPoints = async () => {
      const usersWithPoints = await Promise.all(users.map(async (user) => {
        const points = await fetchUserPoints(user.id);
        return { ...user, points };
      }));
      usersWithPoints.sort((a, b) => {
        if (b.points === a.points) {
          return b.points - a.points;
        }
        return b.points - a.points;
      });
      setUpdatedUsers(usersWithPoints);
      setIsLoading(false);
    };

    if (users.length > 0) {
      fetchUsersWithPoints();
    }
  }, [users, token, filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
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
          <Link to={`/dashboard/${updatedUsers[1]?.id}`} className="relative fade-in z-[20] group flex flex-col items-center">
            <p translate="no"
               className="absolute -top-4 rounded-full bg-blue-medium w-9 h-9 text-center font-rubik font-black text-white text-xl2 leading-8">2</p>
            <div
              className="w-28 h-28 flex items-center justify-center rounded-full overflow-hidden bg-white mb-2 border-blue-medium border-2">
              <img
                src={updatedUsers[1]?.img ? `${apiUrl}/uploads/users/${updatedUsers[1].id}/${updatedUsers[1].img}` : defaultUserImage}
                alt={updatedUsers[1]?.username}/>
            </div>
            <div className="relative">
              <p translate="no" className="font-bold">{updatedUsers[1]?.username}</p>
              <p translate="no"
                 className="flex flex-row justify-center items-center font-rubik font-bold">{updatedUsers[1]?.points}</p>
              {/*<p translate="no"*/}
              {/*   className="font-rubik absolute -right-4 -bottom-4 font-black text-stroke-black-2 text-white text-[15px] inline-block leading-[35px]">+ {updatedUsers[1]?.lastMatchdayPoints}</p>*/}
            </div>
          </Link>
        </div>
        <div className="relative z-[4]  order-2 transform -translate-y-4">
          <Link to={`/dashboard/${updatedUsers[0]?.id}`} className="relative z-[20] group flex flex-col items-center">
            <img className="absolute fade-in delay-500 -top-20 w-20" src={crown} alt=""/>
            <img className="absolute fade-in delay-150 z-[1] -top-2 -left-4 w-20" src={purpleFlower} alt=""/>
            <div
              className="w-40 h-40 relative z-[2] rounded-full bg-white mb-2 border-yellow-medium border-2">
              <img className="absolute fade-in delay-700 z-[3] top-1 left-2 w-8" src={blackStar} alt=""/>
              <div className="overflow-hidden fade-in flex items-center rounded-full justify-center w-full h-full">
                <img className="z-[2]"
                     src={updatedUsers[0]?.img ? `${apiUrl}/uploads/users/${updatedUsers[0].id}/${updatedUsers[0].img}` : defaultUserImage}
                     alt={updatedUsers[0]?.username}/>
              </div>
              <img className="absolute fade-in delay-300 z-[3] bottom-0 right-1.5 w-8" src={yellowStar} alt=""/>
            </div>
            <div className="relative">
              <p translate="no" className="font-bold">{updatedUsers[0]?.username}</p>
              <p translate="no" className="flex flex-row justify-center items-center font-rubik font-bold">{updatedUsers[0]?.points}</p>
              {/*<p translate="no"*/}
              {/*  className="font-rubik absolute -right-4 -bottom-4 font-black text-stroke-black-2 text-white text-[15px] inline-block leading-[35px]">+ {updatedUsers[0]?.lastMatchdayPoints}</p>*/}
            </div>
          </Link>
        </div>
        <div className="relative z-[2] order-3 -ml-6">
          <Link to={`/dashboard/${updatedUsers[2]?.id}`} className="relative fade-in z-[20] group flex flex-col items-center">
            <p
              translate="no"
              className="absolute -top-4 rounded-full bg-blue-medium w-9 h-9 text-center font-rubik font-black text-white text-xl2 leading-8">3</p>
            <div
              className="w-28 h-28 flex items-center justify-center rounded-full overflow-hidden bg-white mb-2 border-blue-medium border-2">
              <img
                src={updatedUsers[2]?.img ? `${apiUrl}/uploads/users/${updatedUsers[2].id}/${updatedUsers[2].img}` : defaultUserImage}
                alt={updatedUsers[2]?.username}/>
            </div>
            <div className="relative">
              <p translate="no" className="font-bold">{updatedUsers[2]?.username}</p>
              <p translate="no"
                 className="flex flex-row justify-center items-center font-rubik font-bold">{updatedUsers[2]?.points}</p>
              {/*<p translate="no"*/}
              {/*   className="font-rubik absolute -right-4 -bottom-4 font-black text-stroke-black-2 text-white text-[15px] inline-block leading-[35px]">+ {updatedUsers[2]?.lastMatchdayPoints}</p>*/}
            </div>
          </Link>
        </div>
      </div>

      <div
        className="relative z-[30] bg-white w-full mb-4 before:content-[''] before:absolute before:inset-0 before:bg-black before:z-[1] before:rounded-md before:translate-y-0.5 before:translate-x-0.5">
        <div
          className="relative z-[2] bg-white rounded-md p-1 flex flex-row justify-center w-full h-full border border-black">
          <button
            translate="no"
            onClick={() => handleFilterChange('week')}
            className={`w-1/3 fade-in delay-150 transition-colors duration-300 ease-in-out rounded-md font-roboto text-xs uppercase py-1 underline font-medium ${filter === 'week' ? 'bg-green-medium' : ''}`}
          >
            semaine
          </button>
          <div className="w-px h-auto mx-1 border-l border-black border-dotted"></div>
          <button
            translate="no"
            onClick={() => handleFilterChange('month')}
            className={`w-1/3 fade-in delay-300 transition-colors duration-300 ease-in-out rounded-md font-roboto text-xs uppercase py-1 underline font-medium ${filter === 'month' ? 'bg-green-medium' : ''}`}
          >
            mois
          </button>
          <div className="w-px h-auto mx-1 border-l border-black border-dotted"></div>
          <button
            translate="no"
            onClick={() => handleFilterChange('season')}
            className={`w-1/3 fade-in delay-700 transition-colors duration-300 ease-in-out rounded-md font-roboto text-xs uppercase py-1 underline font-medium ${filter === 'season' ? 'bg-green-medium' : ''}`}
          >
            saison
          </button>
        </div>
      </div>

      <div className="relative z-[20] flex flex-col justify-start">
        <ul className="px-4">
          {updatedUsers.slice(3).map((user, index) => (
            <li
              style={{animationDelay: `${index * 0.05}s`}}
              className="relative fade-in rounded-xl mt-2 mb-4 border-2 border-black bg-white h-fit shadow-flat-black"
              key={user.id}>
              <div
                className="absolute z-[25] bg-white -top-3 -left-4 border-2 border-black w-[30px] text-center h-[30px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust">
                <p
                  translate="no"
                  className="font-rubik w-full font-black text-stroke-black-2 text-white text-[100%] inline-block leading-[35px]">{index + 4}</p>
              </div>
              <Link to={`/dashboard/${user.id}`}
                    className="relative z-[20] group flex flex-row overflow-hidden rounded-xl justify-between">
                <div className="h-[60px] w-[70px] bg-grey-light rounded-r-md">
                  <img className="object-center w-full h-full object-cover"
                       src={user.img ? `${apiUrl}/uploads/users/${user.id}/${user.img}` : defaultUserImage}
                       alt={user.username}/>
                </div>
                <p translate="no" className="font-title text-black text-xl font-bold h-fit my-auto w-3/5 pl-6 pr-2">
                  <span translate="no" className="inline-block mr-2">{user.username}</span>
                </p>
                <div className="w-px h-auto mx-1 border-l-2 border-black border-dotted"></div>
                <p translate="no"
                   className="font-title text-black text-right uppercase text-l font-bold leading-4 w-1/5 pr-4 my-auto">
                  <span translate="no" className="inline-block text-black p-2">{user.points}</span>
                  {/*<span translate="no" className="font-rubik font-black text-stroke-black-2 text-white text-[15px] inline-block">+{user.lastMatchdayPoints}</span>*/}
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