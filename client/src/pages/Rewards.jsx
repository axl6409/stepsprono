import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import rewardDefault from "/img/futbol-solid.svg";
import {UserContext} from "../contexts/UserContext.jsx";
import {useCookies} from "react-cookie";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Rewards = () => {
  const { user, isAuthenticated } = useContext(UserContext);
  const [cookies, setCookie] = useCookies(["user"]);
  const token = localStorage.getItem('token') || cookies.token
  const [rewards, setRewards] = useState([]);
  const [userRewards, setUserRewards] = useState([]);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/rewards`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const fetchedRewards = response.data;
        if (fetchedRewards.length === undefined || fetchedRewards.length === 0) {
          return;
        }
        setRewards(fetchedRewards)
        console.log(fetchedRewards)
      } catch (error) {
        console.error('Erreur lors de la sélection des recompenses', error);
      }
    }
    const fetchUserRewards = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${user.id}/rewards`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const fetchedRewards = response.data;
        if (fetchedRewards.length === undefined || fetchedRewards.length === 0) {
          return;
        }
        setUserRewards(fetchedRewards)
      } catch (error) {
        console.error('Erreur lors de la sélection des recompenses', error);
      }
    };
    if (user) {
      fetchRewards()
    }
  }, [user, token]);

  return (
    <div className="text-center relative py-10 flex flex-col justify-center">
      <h1 className="text-3xl font-black my-8 mt-0 uppercase relative w-fit mx-auto">Rewards
        <span
          className="absolute left-0 bottom-0 text-flat-purple z-[-1] transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">Rewards</span>
        <span
          className="absolute left-0 bottom-0 text-green-lime z-[-2] transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">Rewards</span>
      </h1>
      <div className="flex flex-row flex-wrap justify-between px-4">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="w-1/2 md:w-1/3 lg:w-1/4 p-4 flex flex-col items-center"
          >
            <img
              src={reward.image || rewardDefault}
              alt={reward.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            <h2 className="text-xl font-bold mt-2">{reward.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Rewards