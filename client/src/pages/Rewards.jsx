import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import hiddenTrophy from "../assets/components/icons/hidden-trophy.webp";
import { UserContext } from "../contexts/UserContext.jsx";
import { useCookies } from "react-cookie";
import { useParams } from "react-router-dom";
import {useViewedProfile} from "../contexts/ViewedProfileContext.jsx";

import BackButton from "../components/nav/BackButton.jsx";
import RewardPopup from "../components/modals/RewardPopup.jsx";
import AnimatedTitle from "../components/partials/AnimatedTitle.jsx";

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import SwiperArrow from "../assets/icons/swiper-arrow.svg";
import ProfilePic from "../components/user/ProfilePic.jsx";
import Loader from "../components/partials/Loader.jsx";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const rankOrder = ["bronze", "silver", "gold", "legendary"];
const rankLabels = {
  legendary: "Légendaires",
  gold: "Or",
  silver: "Argent",
  bronze: "Bronze",
};
const normalizeRank = (r) => (r === "sliver" ? "silver" : r);

// ---- Milestones: tous les paliers de points (quel que soit le rank)
const isMilestoneAny = (r) => typeof r.slug === "string" && r.slug.startsWith("milestone_");
const milestoneValue = (r) => {
  const fromSlug = parseInt((r.slug || "").split("_")[1], 10);
  if (!Number.isNaN(fromSlug)) return fromSlug;
  const m = (r.name || "").match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
};

const Rewards = () => {
  const { user } = useContext(UserContext);
  const [cookies] = useCookies(["user"]);
  const token = localStorage.getItem('token') || cookies.token;

  const { viewedUser, isOwnProfile, isLoading: viewedLoading } = useViewedProfile();

  const [rewards, setRewards] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [userRewards, setUserRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // const { userId } = useParams();

  const fetchUserRewards = async (season = selectedSeason, userId = user.id) => {
    if (!season) return;
    try {
      const response = await axios.get(`${apiUrl}/api/rewards/user/${userId}?seasonId=${season.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedUserRewards = response.data;
      if (!Array.isArray(fetchedUserRewards) || fetchedUserRewards.length === 0) {
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
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const seasonsData = response.data;
        setSeasons(seasonsData);
        const storedSeasonId = localStorage.getItem('selectedSeasonId');
        const currentSeason = storedSeasonId
          ? seasonsData.find(season => season.id === parseInt(storedSeasonId, 10))
          : seasonsData.find(season => season.current) || seasonsData[0];
        if (currentSeason) {
          localStorage.setItem('selectedSeasonId', currentSeason.id);
          setSelectedSeason(currentSeason);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des saisons :', error);
      }
    };
    fetchSeasons();
  }, [token]);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/rewards`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fetchedRewards = response.data;
        if (!Array.isArray(fetchedRewards) || fetchedRewards.length === 0) return;
        setRewards(fetchedRewards);
      } catch (error) {
        console.error('Erreur lors de la sélection des recompenses', error);
      }
    };
    fetchRewards();
  }, [token]);

  useEffect(() => {
    if (!selectedSeason) return;
    const targetUserId = viewedUser?.id ?? user?.id;
    if (!targetUserId) return;
    fetchUserRewards(selectedSeason, targetUserId);
  }, [selectedSeason?.id, viewedUser?.id, user?.id, token]);

  // Tri global: possédés d'abord (pour l’intérieur des sections/carrousel)
  const sortedRewards = rewards
    .slice()
    .sort((a, b) => {
      const aHas = userRewards.some(ur => ur.reward_id === a.id);
      const bHas = userRewards.some(ur => ur.reward_id === b.id);
      return Number(bHas) - Number(aHas);
    });

  // ---- Carrousel des paliers (TOUS les milestones, quelque soit le rank)
  const milestoneAll = sortedRewards
    .filter(isMilestoneAny)
    .sort((a, b) => milestoneValue(a) - milestoneValue(b));

  // ---- Sections par rang, sans les milestones (pour éviter doublons)
  const sectionItemsByRank = (rankKey) =>
    sortedRewards.filter(r => normalizeRank(r.rank) === rankKey && !isMilestoneAny(r));

  const handleRewardClick = (reward) => {
    const userHasReward = userRewards.some(ur => ur.reward_id === reward.id);
    if (userHasReward) setSelectedReward(reward);
  };

  const handleAddReward = async (reward) => {
    const userId = viewedUser?.id ?? user?.id;
    try {
      await axios.post(`${apiUrl}/api/admin/rewards/attribute`, {
        user_id: userId,
        reward_id: reward.id,
        count: 1,
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (selectedSeason && userId) await fetchUserRewards(selectedSeason, userId);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du trophée', error);
    }
  };

  const handleRemoveReward = async (reward) => {
    const userId = viewedUser?.id ?? user?.id;
    try {
      await axios.post(`${apiUrl}/api/admin/rewards/remove`, {
        user_id: userId,
        reward_id: reward.id,
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (selectedSeason && userId) await fetchUserRewards(selectedSeason, userId);
    } catch (error) {
      console.error('Erreur lors du retrait du trophée', error);
    }
  };

  const handleSeasonChange = (event) => {
    const selectedSeasonId = event.target.value;
    const season = seasons.find(season => season.id === parseInt(selectedSeasonId, 10));
    setSelectedSeason(season);
    localStorage.setItem('selectedSeasonId', selectedSeasonId);
    const targetUserId = viewedUser?.id ?? user?.id;
    if (targetUserId) fetchUserRewards(season, targetUserId);
  };

  if (!selectedSeason || (!user && !viewedUser)) {
    return (
      <div className="text-center flex flex-col justify-center">
        <Loader />
      </div>
    );
  }

  const RewardCard = ({ milestones = false, reward, mainClasses = "", containerClasses = "w-[150px] h-[150px]"}) => {
    const userReward = userRewards.find(ur => ur.reward_id === reward.id);
    const userHasReward = !!userReward;
    const imageUrl = userHasReward ? `${apiUrl}/uploads/trophies/${reward.id}/${reward.image}` : hiddenTrophy;
    const rewardCount = userHasReward ? userReward.count : " ";

    return (
      <div
        key={reward.id}
        className={`${mainClasses} flex flex-col items-center mb-4 mt-2 cursor-pointer`}
        onClick={() => handleRewardClick(reward)}
      >
        <div className="relative">
          <div className={`relative trophy-container ${containerClasses} ${userHasReward ? 'trophy-active' : 'jello-anim'}`}>
            <div className="trophy-inner">
              <img
                src={imageUrl}
                alt={reward.name}
                className={`trophy-front w-full h-full object-cover object-center rounded-lg`}
              />
              <img
                src={hiddenTrophy}
                alt="Dos"
                className={`trophy-back w-full h-full object-cover object-center rounded-lg`}
              />
            </div>
          </div>
          {userHasReward && (
            <div className={`absolute z-[10] ${milestones ? user.role !== 'admin' ? 'hidden' : 'block top-0 right-0 w-[25px] h-[25px]' : 'top-0 right-0 w-[40px] h-[40px]'}  border-2 border-black text-center rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust bg-purple-soft`}>
              <p
                translate="no"
                className={`font-rubik w-full font-black text-stroke-black-2 text-white ${(milestones && user.role === 'admin') ? 'text-[100%]' : 'text-[150%]'}  inline-block leading-[35px]`}>{rewardCount}</p>
            </div>
          )}

          {userHasReward && user?.role === 'admin' && (
            <>
              <button
                className={`absolute z-[25] bg-white ${milestones ? 'bottom-1 right-2 w-[20px] h-[20px]' : 'bottom-1 right-2 w-[30px] h-[30px]'} border-2 border-black  text-center  rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust transition-shadow duration-300 ease-in-out hover:shadow-none`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddReward(reward);
                }}
              >
                <span className={`font-rubik w-full font-bold text-black ${milestones ? 'text-[100%]' : 'text-[150%]'} inline-block leading-[30px]`}>+</span>
              </button>
              <button
                className={`absolute z-[25] bg-white ${milestones ? 'bottom-1 left-2 w-[20px] h-[20px]' : 'bottom-1 left-2 w-[30px] h-[30px]'} border-2 border-black text-center rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust transition-shadow duration-300 ease-in-out hover:shadow-none`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveReward(reward);
                }}
              >
                <span className={`font-rubik w-full font-bold text-black ${milestones ? 'text-[100%]' : 'text-[150%]'} inline-block leading-[30px]`}>-</span>
              </button>
            </>
          )}
        </div>

        {userHasReward && (
          <h2 className="text-base hidden font-roboto font-bold mt-2 text-center">{reward.name}</h2>
        )}
      </div>
    );
  };

  return (
    <div className="text-center relative z-10 py-16 flex flex-col justify-center">
      <BackButton />
      <AnimatedTitle title={"Trophées"} stickyStatus={false} darkMode={true}/>
      <ProfilePic user={viewedUser ?? user} />

      {/* --- CHANGEMENT DE SAISON --- */}
      <div className={`
        absolute top-4 right-4 w-fit ml-auto flex flex-row flex-wrap rounded overflow-hidden justify-around px-4
        before:content-[''] before:block before:absolute before:z-[5] before:w-full before:h-full before:inset-0
        before:bg-grey-light before:bg-clip-padding before:backdrop-filter before:backdrop-blur-[10px] before:blur-[2px]
        before:opacity-60 before:border before:border-black
      `}>
        <div className="relative z-[11] w-full flex justify-end">
          <label htmlFor="season-select" translate="no" className="opacity-0 no-correct h-0 w-0">Saison :</label>
          <select
            translate="no"
            id="season-select"
            value={selectedSeason?.id || ''}
            onChange={handleSeasonChange}
            className="border-y-0 px-2 py-1 bg-transparent"
          >
            {seasons.map(season => (
              <option translate="no" key={season.id} value={season.id} className="no-correct bg-transparent w-full">
                {season.year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- CARROUSEL DES PALIERS --- */}
      {milestoneAll.length > 0 && (
        <section className="mt-8 px-4">
          <div className="flex items-center justify-center -mb-8">
            <h3 className="text-left text-xl6 font-rubik font-black text-purple-soft opacity-50 leading-tight">Points</h3>
          </div>

          {/* WRAPPER parent = relative, pas d'overflow hidden ici */}
          <div className="relative w-11/12 max-w-[310px] mx-auto">
            {/* Flèches EXTERNES au Swiper */}
            <button
              ref={prevRef}
              className="trophy-prev absolute -left-7 top-1/2 -translate-y-1/2 z-30 h-8 w-6 flex items-center justify-center"
              aria-label="Précédent"
            >
              <img src={SwiperArrow} alt="" />
            </button>
            <button
              ref={nextRef}
              className="trophy-next absolute -right-7 top-1/2 -translate-y-1/2 z-30 h-8 w-6 flex items-center justify-center"
              aria-label="Suivant"
            >
              <img className="rotate-180" src={SwiperArrow} alt="" />
            </button>

            <Swiper
              modules={[Pagination, Navigation, A11y]}
              spaceBetween={5}
              slidesPerView={3}
              // Navigation avec refs externes pour éviter les soucis d'init
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }}
              onSwiper={(swiper) => {
                // Sécurise l'init des refs (cas React)
                setTimeout(() => {
                  swiper.params.navigation.prevEl = prevRef.current;
                  swiper.params.navigation.nextEl = nextRef.current;
                  swiper.navigation.destroy();
                  swiper.navigation.init();
                  swiper.navigation.update();
                });
              }}
              navigation={{ enabled: true }}
              breakpoints={{
                480: { slidesPerView: 2.2, spaceBetween: 16 },
                768: { slidesPerView: 3.2, spaceBetween: 20 },
                1024: { slidesPerView: 4.2, spaceBetween: 24 },
              }}
              className={`trophySwiper relative z-[11] mb-12 rounded-xl overflow-hidden
              before:content-[''] before:block before:absolute before:z-[5] before:w-full before:h-full before:inset-0
              before:bg-grey-light before:bg-clip-padding before:backdrop-filter before:backdrop-blur-[10px] before:blur-[2px]
              before:opacity-60 before:border before:border-black before:rounded-xl`}
              >
              {milestoneAll.map((reward) => (
                <SwiperSlide key={reward.id}>
                  <div className="flex justify-center">
                    <RewardCard milestones={true} reward={reward} mainClasses="w-20 h-20" containerClasses="w-[90px] h-[90px]" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* --- SECTIONS PAR RANK (sans milestones) --- */}
      <div className="px-4">
        {rankOrder.map((rankKey) => {
          const items = sectionItemsByRank(rankKey);
          if (items.length === 0) return null;

          return (
            <section key={rankKey} className="mt-8">
              <div className={`flex items-center justify-center ${rankKey === 'legendary' ? '-mb-4' : '-mb-8'} `}>
                <h3 className={`text-left ${rankKey === 'legendary' ? 'text-xl5' : 'text-xl6'} font-rubik font-black ${rankKey === 'legendary' ? 'text-purple-soft' : rankKey === 'gold' ? 'text-yellow-medium' : rankKey === 'silver' ? 'text-blue-medium' : 'text-green-soft'} opacity-30 leading-tight`}>{rankLabels[rankKey]}</h3>
              </div>

              <div className={`relative z-[11] mb-12 py-4 rounded-xl overflow-hidden
              before:content-[''] before:block before:absolute before:z-[5] before:w-full before:h-full before:inset-0
              before:bg-grey-light before:bg-clip-padding before:backdrop-filter before:backdrop-blur-[10px] before:blur-[2px]
              before:opacity-60 before:border before:border-black before:rounded-xl`}>
                <div className="flex flex-row flex-wrap justify-around relative z-[12]">
                  {items.map((reward) => (
                    <RewardCard milestones={false} key={reward.id} reward={reward} />
                  ))}
                </div>
              </div>
            </section>
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
