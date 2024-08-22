import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import rewardDefault from "/img/futbol-solid.svg";
import hiddenTrophy from "../assets/components/icons/hidden-trophy.webp";
import { UserContext } from "../contexts/UserContext.jsx";
import { useCookies } from "react-cookie";
import {Link, useParams} from "react-router-dom";
import BackButton from "../components/nav/BackButton.jsx";
import RewardPopup from "../components/partials/modals/RewardPopup.jsx";
import arrowIcon from "../assets/icons/arrow-left.svg";
import AnimatedTitle from "../components/partials/AnimatedTitle.jsx";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Rewards = () => {
  const { user, isAuthenticated } = useContext(UserContext);
  const [cookies, setCookie] = useCookies(["user"]);
  const token = localStorage.getItem('token') || cookies.token;
  const [rewards, setRewards] = useState([]);
  const [userRewards, setUserRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);

  const { userId } = useParams();

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
        setRewards(fetchedRewards);
      } catch (error) {
        console.error('Erreur lors de la sélection des recompenses', error);
      }
    };

    const fetchUserRewards = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/rewards/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const fetchedUserRewards = response.data;
        if (fetchedUserRewards.length === undefined || fetchedUserRewards.length === 0) {
          return;
        }
        setUserRewards(fetchedUserRewards);
      } catch (error) {
        console.error('Erreur lors de la sélection des recompenses', error);
      }
    };

    if (user) {
      fetchRewards();
      fetchUserRewards();
    }
  }, [user, userId, token]);

  const sortedRewards = rewards.sort((a, b) => {
    const aUserHasReward = userRewards.some(userReward => userReward.reward_id === a.id);
    const bUserHasReward = userRewards.some(userReward => userReward.reward_id === b.id);
    return bUserHasReward - aUserHasReward;
  });

  const handleRewardClick = (reward) => {
    const userHasReward = userRewards.some(userReward => userReward.reward_id === reward.id);
    if (userHasReward) {
      setSelectedReward(reward);
    }
  };

  return (
      <div className="text-center relative py-10 flex flex-col justify-center">
        <Link
          to="/dashboard"
          className="swiper-button-prev w-[30px] h-[30px] rounded-full bg-white top-7 left-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
        >
          <img src={arrowIcon} alt="Icône flèche"/>
        </Link>
        <AnimatedTitle title={"Trophées"} animate={false}/>
        <div className="flex flex-row flex-wrap justify-around px-4">
          {sortedRewards.map((reward) => {
            const userReward = userRewards.find(userReward => userReward.reward_id === reward.id);
            const userHasReward = !!userReward;
            const imageUrl = userHasReward ? `${apiUrl}/uploads/trophies/${reward.image}` : hiddenTrophy;
            const rewardCount = userHasReward ? userReward.count : " ";
            return (
              <div
                key={reward.id}
                className="w-[150px] flex flex-col items-center my-4 cursor-pointer"
                onClick={() => handleRewardClick(reward)}
              >
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={reward.name}
                    className="w-full h-[150px] object-cover rounded-lg"
                  />
                  {userHasReward && (
                    <div
                      className="absolute bg-black z-[10] -top-0 left-2 border-2 border-black w-[30px] text-center h-[30px] rounded-full flex flex-row justify-center items-center">
                      <p
                        className="font-rubik w-full font-black text-stroke-black-2 text-white text-[100%] inline-block leading-[35px]">{rewardCount}x</p>
                    </div>
                  )}
                </div>
                {userHasReward && (
                  <h2 className="text-base font-roboto font-bold mt-2">{reward.name}</h2>
                )}
              </div>
            );
          })}
        </div>
        {selectedReward && (
          <RewardPopup
            reward={selectedReward}
            apiUrl={apiUrl}
            onClose={() => setSelectedReward(null)}
          />
        )}
      </div>
  );
};

export default Rewards;
