import React, {useEffect, useState, useRef, useCallback} from "react";
import {Swiper, SwiperSlide, useSwiper} from "swiper/react";
import "swiper/css";
import 'swiper/css/effect-cube';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import axios from "axios";
import Pronostic from "../partials/Pronostic.jsx";
import {EffectCards, Navigation, Pagination} from 'swiper/modules';
import 'swiper/css/effect-cards';
import moment from "moment";
import Loader from "../partials/Loader.jsx";
import arrowIcon from "../../assets/icons/arrow-left.svg";
import checkedIcon from "../../assets/icons/checked-green.svg";
import AlertModal from "../partials/modals/AlertModal.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Week = ({token, user}) => {
  const [matchs, setMatchs] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const swiperRef = useRef(null);
  const formRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [bets, setBets] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [lastMatch, setLastMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const now = moment();
  const swiperInstance = swiperRef.current?.swiper
  const now = moment().set({ 'year': 2024, 'month': 4, 'date': 13 }); // Simulated date
  const simulatedNow = now.day(1).hour(10).minute(0).second(0);
  const nextFridayAtNoon = moment().day(5).hour(12).minute(0).second(0);
  const nextSaturdayAtMidnight = moment().day(6).hour(23).minute(59).second(59);
  const isBeforeNextFriday = now.isBefore(nextFridayAtNoon);

  useEffect(() => {
    const fetchBets = async (sortedMatchs) => {
      const matchIds = sortedMatchs.map(match => match.id);
      try {
        const response = await axios.post(`${apiUrl}/api/bets/user/${user.id}`, {
          matchIds: matchIds
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const betsByMatchId = response.data.data.reduce((acc, bet) => {
          acc[bet.match_id] = bet
          return acc
        }, {})
        setBets(betsByMatchId)
      } catch (error) {
        console.error('Erreur lors de la récupération des matchs :', error);
        setError(error);
        setIsLoading(false);
      }
    }

    const fetchMatchs = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`${apiUrl}/api/matchs/current-week`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const sortedMatchs = response.data.data.sort((a, b) => {
          return new Date(a.utc_date) - new Date(b.utc_date);
        })
        setMatchs(sortedMatchs)
        setLastMatch(sortedMatchs[sortedMatchs.length - 1])
        setIsLoading(false)
        fetchBets(sortedMatchs)
      } catch (error) {
        console.error('Erreur lors de la récupération des matchs :', error);
        setError(error);
        setIsLoading(false);
      }
    }
    fetchMatchs()
  }, [token])

  useEffect(() => {
    const swiperInstance = swiperRef.current?.swiper
    if (swiperInstance) {
      const updateActiveIndex = () => {
        setActiveIndex(swiperInstance.activeIndex);
      };

      swiperInstance.on('slideChange', updateActiveIndex)
      updateActiveIndex()

      return () => {
        swiperInstance.off('slideChange', updateActiveIndex)
      }
    }
  }, [matchs, swiperRef.current])

  useEffect(() => {
    const { disabled, text, icon } = buttonState();
    setButtonDisabled(disabled);
  }, [activeIndex, bets, matchs]);

  const canSubmitBet = (match) => {
    if (!match) return false;
    const matchDate = moment(match.utc_date);
    const isMatchInFuture = matchDate.isAfter(now);
    const hasBet = isBetPlaced(match.id);
    return isMatchInFuture && simulatedNow.isBefore(nextFridayAtNoon);
  };

  const isMatchEditable = (match) => {
    if (!match) return false;
    return canSubmitBet(match) && isBetPlaced(match.id);
  };

  const handleGlobalSubmit = () => {
    const currentIndex = swiperRef.current?.swiper.activeIndex;
    if (currentIndex !== undefined) {
      const currentMatch = matchs[currentIndex];
      const currentFormComponent = formRefs.current[currentIndex];
      if (currentFormComponent && currentMatch && (isMatchEditable(currentMatch) || !isBetPlaced(currentMatch.id))) {
        currentFormComponent.triggerSubmit();
        handleError('Prono enregistré', 3000)
      } else {
        handleError('Prono refusé', 3000)
      }
    }
  };

  const handleSuccess = (message, timeout) => {
    setAlertMessage(message);
    setAlertType('success');
    setTimeout(() => {
      setAlertMessage('')
      swiperInstance.slideNext()
    }, timeout);
  };

  const handleError = (message) => {
    setAlertMessage(message);
    setAlertType('error');
    setTimeout(() => {
      setAlertMessage('')
    }, 2000);
  };

  const buttonState = () => {
    if (!swiperRef.current || !swiperRef.current.swiper) return { disabled: true, text: 'Loading...' };

    const activeIndex = swiperRef.current.swiper.activeIndex;
    const currentMatch = matchs[activeIndex];
    if (!currentMatch) return { disabled: true, text: 'Invalid Match' };

    const isOpen = now.isBefore(nextFridayAtNoon);
    const hasBet = isBetPlaced(currentMatch.id);
    const isFutureMatch = moment(currentMatch.utc_date).isAfter(now);
    // return { disabled: true, text: 'Trop tard !', className: 'bg-white' };
    if (isOpen && isFutureMatch) {
      if (!hasBet) {
        return { disabled: false, text: 'Valider', className: 'bg-green-medium' };
      } else {
        return { disabled: false, text: 'Modifier', className: 'bg-beige-light' };
      }
    } else {
      if (hasBet) {
        return { disabled: true, icon: 'check', className: '' };
      } else {
        return { disabled: true, text: 'Trop tard !', className: 'bg-white' };
      }
    }
  };

  const isBetPlaced = (matchId) => {
    return !!bets[matchId];
  };

  const refreshBets = async () => {
    // Re-fetch bets logic here
    const matchIds = matchs.map(match => match.id);
    try {
      const response = await axios.post(`${apiUrl}/api/bets/user/${user.id}`, {
        matchIds: matchIds
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const betsByMatchId = response.data.data.reduce((acc, bet) => {
        acc[bet.match_id] = bet
        return acc
      }, {})
      setBets(betsByMatchId)
    } catch (error) {
      console.error('Erreur lors de la récupération des paris :', error);
    }
  };

  const { disabled, text, icon, className } = buttonState();

  if (error) return <p>Erreur : {error.message}</p>;

  return (
    isLoading ? (
      <Loader />
    ) : (
    <div className="relative pt-6 px-2">
      <AlertModal message={alertMessage} type={alertType} />
      <div>
        <Swiper
          ref={swiperRef}
          effect={'cards'}
          grabCursor={true}
          pagination={{
            clickable: true,
          }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          modules={[EffectCards, Pagination, Navigation]}
          className="mySwiper relative flex flex-col justify-start"
        >
          {matchs.length > 0 && matchs.map((match, index) => {
            const matchDate = moment(match.utc_date)
            const enableSubmit = canSubmitBet(match);

            return (
              <SwiperSlide
                className="flex flex-row flex-wrap relative h-auto m-0 border border-black bg-white rounded-2xl shadow-flat-black min-h-[300px]"
                key={match.id} data-match-id={match.id}>
                <Pronostic
                  ref={(el) => (formRefs.current[index] = el)}
                  match={match}
                  utcDate={matchDate}
                  userId={user.id}
                  lastMatch={lastMatch}
                  token={token}
                  betDetails={bets[match.id]}
                  handleSuccess={handleSuccess}
                  handleError={handleError}
                  disabled={!enableSubmit}
                  refreshBets={refreshBets} />
              </SwiperSlide>
            );
          })}
          <div
            className="swiper-button-prev w-[40px] h-[40px] rounded-full bg-white top-7 left-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none">
            <img src={arrowIcon} alt="Icône flèche"/>
          </div>
          <div
            className="swiper-button-next w-[40px] h-[40px] rounded-full bg-white top-7 right-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none">
            <img className="rotate-180" src={arrowIcon} alt="Icône flèche"/>
          </div>
        </Swiper>
        {icon ? (
          <div className="relative z-[2] w-full flex flex-row justify-center text-black px-8 py-1 text-center">
            <img src={checkedIcon} alt=""/>
          </div>
        ) : (
          <button
            className="form-submit-btn relative mt-16 mx-auto block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
            type="button"
            onClick={handleGlobalSubmit}
            disabled={disabled}
          >
            <span className={`relative z-[2] w-full flex flex-row justify-center border border-black text-black px-8 py-1 rounded-full text-center font-roboto text-base uppercase font-bold shadow-md ${className} transition -translate-y-1 -translate-x-0 group-hover:-translate-y-0 group-hover:-translate-x-0`}>
              {text}
            </span>
          </button>
        )}
      </div>
    </div>
    )
  )
}

export default Week