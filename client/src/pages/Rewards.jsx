import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import rewardDefault from "/img/futbol-solid.svg";
import hiddenTrophy from "../assets/components/icons/hidden-trophy.webp";
import {UserContext} from "../contexts/UserContext.jsx";
import {useCookies} from "react-cookie";
import BackButton from "../components/nav/BackButton.jsx";
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
      } catch (error) {
        console.error('Erreur lors de la sélection des recompenses', error);
      }
    }

    const fetchUserRewards = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/rewards/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const fetchedUserRewards = response.data;
        if (fetchedUserRewards.length === undefined || fetchedUserRewards.length === 0) {
          return;
        }
        setUserRewards(fetchedUserRewards)
      } catch (error) {
        console.error('Erreur lors de la sélection des recompenses', error);
      }
    };
    if (user) {
      fetchRewards()
      fetchUserRewards()
    }
  }, [user, token]);

  return (
    <div className="text-center relative py-10 flex flex-col justify-center">
      <BackButton />
      <h1 className={`font-black mb-8 text-center relative w-fit mx-auto text-xl5 leading-[50px]`}>Trophées
        <span
          className="absolute left-0 top-0 right-0 text-purple-soft z-[-1] translate-x-0.5 translate-y-0.5">Trophées</span>
        <span
          className="absolute left-0 top-0 right-0 text-green-soft z-[-2] translate-x-1 translate-y-1">Trophées</span>
      </h1>
      <div className="flex flex-row flex-wrap justify-around px-4">
        {rewards.map((reward) => {
          const userHasReward = userRewards.some(userReward => userReward.reward_id === reward.id);
          const imageUrl = userHasReward ? `${apiUrl}/uploads/trophies/${reward.image}` : hiddenTrophy;
          return (
              <div
                  key={reward.id}
                  className="w-[150px] flex flex-col items-center my-4"
              >
                <img
                    src={imageUrl}
                    alt={reward.name}
                    className="w-full h-[150px] object-cover rounded-lg"
                />
                {userHasReward && (
                    <h2 className="text-base font-roboto font-bold mt-2">{reward.name}</h2>
                )}
              </div>
          );
        })}
      </div>
    </div>
  );
}

export default Rewards