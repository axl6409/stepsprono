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
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [error, setError] = useState(null);
  const [userRewards, setUserRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);

  const { userId } = useParams();

  const fetchUserRewards = async (season = selectedSeason) => {
    if (!season) return;
    try {
      const response = await axios.get(`${apiUrl}/api/rewards/user/${userId}?seasonId=${selectedSeason.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const fetchedUserRewards = response.data;
      if (fetchedUserRewards.length === undefined || fetchedUserRewards.length === 0) {
        setUserRewards([]);
        return;
      }
      setUserRewards(fetchedUserRewards);
    } catch (error) {
      console.error('Erreur lors de la sélection des recompenses', error);
    }
  };

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/seasons/61`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const seasonsData = response.data;
        setSeasons(seasonsData);
        const storedSeasonId = localStorage.getItem('selectedSeasonId');
        const currentSeason = storedSeasonId
          ? seasonsData.find(season => season.id === parseInt(storedSeasonId, 10))
          : seasonsData.find(season => season.current) || seasonsData[0];
        localStorage.setItem('selectedSeasonId', currentSeason.id);
        setSelectedSeason(currentSeason);
      } catch (error) {
        console.error('Erreur lors de la récupération des saisons :', error);
        setError(error);
      }
    };
    fetchSeasons();
  }, [token]);

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

    if (user) {
      fetchRewards();
    }
  }, [user, userId, token, rewards]);

  useEffect(() => {
    fetchUserRewards();
  }, [token, selectedSeason, userId]);

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

  const handleAddReward = async (reward) => {
    try {
      await axios.post(`${apiUrl}/api/admin/rewards/attribute`, {
        user_id: userId,
        reward_id: reward.id,
        count: 1,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await fetchUserRewards();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du trophée', error);
    }
  };

  const handleRemoveReward = async (reward) => {
    try {
      await axios.post(`${apiUrl}/api/admin/rewards/remove`, {
        user_id: userId,
        reward_id: reward.id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await fetchUserRewards();
    } catch (error) {
      console.error('Erreur lors du retrait du trophée', error);
    }
  };

  const handleSeasonChange = (event) => {
    const selectedSeasonId = event.target.value;
    const season = seasons.find(season => season.id === parseInt(selectedSeasonId, 10));
    setSelectedSeason(season);
    localStorage.setItem('selectedSeasonId', selectedSeasonId);
    fetchUserRewards(season);
  };

  return (
      <div className="text-center relative z-10 py-10 flex flex-col justify-center">
        <BackButton />
        <AnimatedTitle title={"Trophées"} stickyStatus={false}/>
        <div className="flex flex-row flex-wrap justify-around px-4">
          <div className="w-full flex justify-end">
            <label translate="no" className="opacity-0 no-correct h-0 w-0">Saison :</label>
            <select translate="no" value={selectedSeason?.id || ''} onChange={handleSeasonChange}
                    className="border-y-0 border-x border-black px-2 py-1">
              {seasons.map(season => (
                <option key={season.id} value={season.id} className="no-correct">
                  {season.year}
                </option>
              ))}
            </select>
          </div>
          {sortedRewards.map((reward) => {
            const userReward = userRewards.find(userReward => userReward.reward_id === reward.id);
            const userHasReward = !!userReward;
            const imageUrl = userHasReward ? `${apiUrl}/uploads/trophies/${reward.id}/${reward.image}` : hiddenTrophy;
            const rewardCount = userHasReward ? userReward.count : " ";
            return (
              <div
                key={reward.id}
                className="w-[150px] flex flex-col items-center my-4 cursor-pointer"
                onClick={() => handleRewardClick(reward)}
              >
                <div className="relative">
                  <div className={`relative trophy-container ${userHasReward ? 'trophy-active' : 'jello-anim'}`}>
                    <div className="trophy-inner">
                      <img
                        src={imageUrl}
                        alt="Front"
                        className="trophy-front w-full h-[150px] object-cover rounded-lg"
                        />
                      <img
                        src={hiddenTrophy}
                        alt="Back"
                        className="trophy-back w-full h-[150px] object-cover rounded-lg"
                        />
                    </div>
                  </div>
                  {userHasReward && (
                    <div
                      className="absolute bg-black z-[10] -top-0 left-2 border-2 border-black w-[30px] text-center h-[30px] rounded-full flex flex-row justify-center items-center">
                      <p
                        className="font-rubik w-full font-black text-stroke-black-2 text-white text-[100%] inline-block leading-[35px]">{rewardCount}x</p>
                    </div>
                  )}
                  {userHasReward && user.role === 'admin' && (
                    <>
                      <button
                      className="absolute z-[25] bg-white bottom-2 right-2 border-2 border-black w-[30px] text-center h-[30px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust transition-shadow duration-300 ease-in-out hover:shadow-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddReward(reward);
                      }}>
                      <span className="font-rubik w-full font-black text-stroke-black-2 text-white text-[100%] inline-block leading-[35px]">+</span>
                    </button>
                    <button
                      className="absolute z-[25] bg-white bottom-2 left-2 border-2 border-black w-[30px] text-center h-[30px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust transition-shadow duration-300 ease-in-out hover:shadow-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveReward(reward);
                      }}>
                          <span
                            className="font-rubik w-full font-black text-stroke-black-2 text-white text-[100%] inline-block leading-[35px]">-</span>
                    </button>
                  </>
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