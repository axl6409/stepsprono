import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import 'swiper/css/navigation';
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faThumbsDown, faCheck } from "@fortawesome/free-solid-svg-icons";
import { Navigation } from 'swiper/modules';
import SwiperArrow from "../../assets/icons/swiper-arrow.svg";
import nullSymbol from "../../assets/icons/null-symbol.svg";
import correctIcon from "../../assets/icons/correct-icon.svg";
import incorrectIcon from "../../assets/icons/incorrect-icon.svg";
import moment from "moment";
import Loader from "../partials/Loader.jsx";
import {useNavigate} from "react-router-dom";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Passed = ({ token, user }) => {
  const navigate = useNavigate()
  const [matchs, setMatchs] = useState([]);
  const [matchdays, setMatchdays] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedMatchday, setSelectedMatchday] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bets, setBets] = useState([]);
  const swiperRef = useRef(null);
  const isVisitor = user.role === 'visitor';

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

        setSelectedSeason(currentSeason);
      } catch (error) {
        console.error('Erreur lors de la récupération des saisons :', error);
        setError(error);
      }
    };
    fetchSeasons();
  }, [token]);

  useEffect(() => {
    if (selectedSeason) {
      const fetchMatchdays = async () => {
        try {
          const response = await axios.get(`${apiUrl}/api/matchs/days/passed?seasonId=${selectedSeason.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          const days = response.data;
          setMatchdays(days);
          setIsLoading(false);
          const storedMatchdayIndex = localStorage.getItem('selectedMatchdayIndex');
          const initialMatchdayIndex = storedMatchdayIndex ? parseInt(storedMatchdayIndex, 10) : 0;

          if (days.length > 0) {
            setSelectedMatchday(days[initialMatchdayIndex]);
            if (swiperRef.current) {
              swiperRef.current.swiper.slideTo(initialMatchdayIndex, 0);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des journées :', error);
          setError(error);
          setIsLoading(false);
        }
      };
      fetchMatchdays();
    }
  }, [selectedSeason, token]);

  useEffect(() => {
    if (selectedMatchday && selectedSeason) {
      const fetchMatchs = async () => {
        try {
          const response = await axios.get(`${apiUrl}/api/matchs/day/${selectedMatchday}?seasonId=${selectedSeason.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          const sortedMatchs = response.data.data.sort((a, b) => new Date(a.utc_date) - new Date(b.utc_date));
          setMatchs(sortedMatchs);
          setIsLoading(false);
        } catch (error) {
          console.error('Erreur lors de la récupération des matchs :', error);
          setError(error);
          setIsLoading(false);
        }
      }
      fetchMatchs();
    }
  }, [selectedMatchday, selectedSeason, token]);

  useEffect(() => {
    if (matchs.length > 0) {
      const fetchBets = async () => {
        const matchIds = matchs.map(match => match.id);
        try {
          const response = await axios.post(`${apiUrl}/api/bets/user/${user.id}?seasonId=${selectedSeason.id}`, { matchIds }, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          setBets(response.data.data);
          setIsLoading(false);
        } catch (error) {
          console.error('Erreur lors de la récupération des pronostics :', error);
          setError(error);
          setIsLoading(false);
        }
      }
      fetchBets();
    }
  }, [matchs, selectedSeason, token, user]);

  const handleSeasonChange = (event) => {
    const selectedSeasonId = event.target.value;
    const season = seasons.find(season => season.id === parseInt(selectedSeasonId, 10));
    setSelectedSeason(season);
    localStorage.setItem('selectedSeasonId', selectedSeasonId);
  };

  const handleMatchdayChange = (day) => {
    setSelectedMatchday(day);
    localStorage.setItem('selectedMatchdayIndex', day);
  };

  const isBetPlaced = (matchId) => {
    return bets.some(bet => bet.match_id === matchId);
  };

  const isBetWin = (matchId) => {
    const match = matchs.find(match => match.id === matchId);
    if (!match || match.winner_id === undefined) {
      return false;
    }
    const bet = bets.find(b => b.match_id === matchId);
    return bet && bet.winner_id === match.winner_id;
  };

  const getBetForMatch = (matchId) => {
    return bets.find(bet => bet.match_id === matchId);
  };

  const updateSlideClasses = () => {
    if (swiperRef.current) {
      const swiper = swiperRef.current.swiper;
      swiper.slides.forEach((slide, index) => {
        slide.classList.remove('swiper-slide-active', 'swiper-slide-prev', 'swiper-slide-next');
        if (index === swiper.activeIndex) {
          slide.classList.add('swiper-slide-active');
        } else if (index === swiper.activeIndex - 1) {
          slide.classList.add('swiper-slide-prev');
        } else if (index === swiper.activeIndex + 1) {
          slide.classList.add('swiper-slide-next');
        }
      });
    }
  };

  const handleSlideChange = (swiper) => {
    const day = matchdays[swiper.activeIndex];
    if (selectedMatchday !== day) {
      handleMatchdayChange(day);
      localStorage.setItem('selectedMatchdayIndex', swiper.activeIndex);
      updateSlideClasses();
    }
  };

  const handleSlideClick = (day, index) => {
    handleMatchdayChange(day);
    if (swiperRef.current) {
      const swiper = swiperRef.current.swiper;
      swiper.slideTo(index);
      localStorage.setItem('selectedMatchdayIndex', index);
      updateSlideClasses();
    }
  };

  const handleMatchClick = (matchId) => {
    navigate(`/matchs/history/${matchId}`);
  };

  if (error) return <p>Erreur : {error.message}</p>;

  return (
    isLoading ? (
      <Loader />
    ) : (
      <div className="relative pt-12 pb-20">
        <Swiper
          slidesPerView={5}
          spaceBetween={10}
          centeredSlides={true}
          grabCursor={false}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          onSlideChange={handleSlideChange}
          onInit={updateSlideClasses}
          modules={[Navigation]}
          className="historySwiper flex flex-col justify-start px-8 relative mb-12 before:content-[''] before:block before:absolute before:w-auto before:mx-8 before:inset-0 before:bg-transparent before:border before:border-black before:rounded-xl after:content-[''] after:absolute"
          ref={swiperRef}
        >
          {matchdays.map((day, index) => (
            <SwiperSlide
              key={day}
              onClick={() => handleSlideClick(day, index)}
              className={`transition-all duration-300 ease-in ${selectedMatchday === day ? 'swiper-slide-active' : ''}`}
            >
              <div className="text-center font-roboto py-4 cursor-pointer">
                <span className="block text-xl">{day}</span>
              </div>
            </SwiperSlide>
          ))}
          <div
            className="swiper-button-prev overflow-visible mt-0 absolute shadow-md h-full w-8 left-0 top-0 bottom-0 flex flex-col justify-center items-center bg-white">
            <img src={SwiperArrow} alt=""/>
          </div>
          <div
            className="swiper-button-next overflow-visible mt-0 absolute shadow-md h-full w-8 right-0 top-0 bottom-0 flex flex-col justify-center items-center bg-white focus:scla">
            <img className="rotate-180" src={SwiperArrow} alt=""/>
          </div>
        </Swiper>
        <div className="mt-4">
          <div className="flex fade-in flex-row justify-end border-t border-b border-black">
            <div className="flex justify-end">
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
            <div className="w-2/3 px-4">
              <p translate="no" className="font-roboto no-correct text-sm uppercase text-black text-right">Match</p>
            </div>
            <div className="w-1/3 px-2 border-l border-dashed border-black">
              <p translate="no" className="font-roboto no-correct text-sm uppercase text-black">Mon Prono</p>
            </div>
          </div>
          <div className="px-4">
            {matchs.map((match, index) => {
              const bet = getBetForMatch(match.id);
              return (
                <div
                  style={{animationDelay: `${index * 0.15}s`}}
                  className="flex cursor-pointer fade-in flex-row justify-start relative my-4 border border-black bg-white rounded-xl shadow-flat-black"
                  key={match.id}
                  data-match-id={match.id}
                  onClick={() => handleMatchClick(match.id)}
                >
                  <div className="flex flex-col justify-evenly items-center w-[68%] px-2 py-2">
                    <div className="w-full flex flex-row justify-center">
                      <p
                        translate="no"
                        className="w-2/3 no-correct font-regular text-left font-rubik text-sm leading-5 my-1 uppercase">{match.HomeTeam.name}</p>
                      <p translate="no"
                         className="w-1/3  font-title font-black text-xl leading-5">{match.goals_home}</p>
                    </div>
                    <div className="w-full flex flex-row justify-center">
                      <p
                        translate="no"
                        className="w-2/3 no-correct font-regular text-left font-rubik text-sm leading-5 my-1 uppercase">{match.AwayTeam.name}</p>
                      <p translate="no"
                         className="w-1/3 no-correct font-title font-black text-xl leading-5">{match.goals_away}</p>
                    </div>
                  </div>
                  {bet ? (
                    <div className="pronostic-info w-[32%] border-l border-dashed border-black px-2 py-2">
                      {bet.home_score !== null && bet.away_score !== null ? (
                        <div className="h-full flex flex-col justify-center">
                          <div className="w-full my-1 flex flex-col justify-center">
                            <p
                              translate="no"
                              className="font-title no-correct font-black text-xl mx-auto leading-5">{bet.home_score}</p>
                          </div>
                          <div className="w-full my-1 flex flex-col justify-center">
                            <p
                              translate="no"
                              className="font-title no-correct font-black text-xl mx-auto leading-5">{bet.away_score}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-center h-full">
                          {bet.winner_id === match.HomeTeam.id ? (
                            <img className="max-w-[50px] max-h-[50px] block mx-auto"
                                 src={apiUrl + "/uploads/teams/" + match.HomeTeam.id + "/" + match.HomeTeam.logo_url}
                                 alt={match.HomeTeam.name}/>
                          ) : bet.winner_id === null ? (
                            <img className="max-w-[50px] max-h-[50px] block mx-auto" src={nullSymbol} alt=""/>
                          ) : bet.winner_id === match.AwayTeam.id && (
                            <img className="max-w-[50px] max-h-[50px] block mx-auto"
                                 src={apiUrl + "/uploads/teams/" + match.AwayTeam.id + "/" + match.AwayTeam.logo_url}
                                 alt={match.AwayTeam.name}/>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="pronostic-info flex flex-col justify-center w-[32%] border-l border-dashed border-black px-2 py-2">
                      <p translate="no" className="name no-correct font-sans text-base font-bold capitalize">???</p>
                    </div>
                  )}
                  {!isVisitor && (
                    isBetPlaced(match.id) ? (
                      isBetWin(match.id) ? (
                        <img className="absolute -right-6 -bottom-4 w-12" src={correctIcon} alt=""/>
                      ) : (
                        <img className="absolute -right-6 -bottom-4 w-12 rotate-180" src={incorrectIcon} alt=""/>
                      )
                    ) : null
                  )}
                </div>
              );
            })}
          </div>
          <div className="px-4">
          {/* Users ranking */}
          </div>
        </div>
      </div>
    )
  );
};

export default Passed;