import React, {useEffect, useState, useRef, useCallback, useContext} from "react";
import {Swiper, SwiperSlide, useSwiper} from "swiper/react";
import "swiper/css";
import 'swiper/css/effect-cube';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import axios from "axios";
import Pronostic from "./Pronostic.jsx";
import {EffectCards, Navigation, Pagination} from 'swiper/modules';
import 'swiper/css/effect-cards';
import moment from "moment-timezone";
import Loader from "../partials/Loader.jsx";
import arrowIcon from "../../assets/icons/arrow-left.svg";
import checkedIcon from "../../assets/icons/checked-green.svg";
import AlertModal from "../modals/AlertModal.jsx";
import useUserData from "../../hooks/useUserData.jsx";
import {AppContext} from "../../contexts/AppContext.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Week = ({token, user}) => {
  const {
    matchs,
    currentMatchday,
    lastMatch,
    activePeriod,
    hasMultiplePeriods,
    clock,
  } = useContext(AppContext);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState(null);
  const swiperRef = useRef(null);
  const formRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [bets, setBets] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const swiperInstance = swiperRef.current?.swiper

  // IMPORTANT: Utiliser clock.now du backend pour supporter la simulation de dates
  const now = clock?.now || moment();

  useEffect(() => {
    const fetchBets = async (sortedMatchs) => {
      const matchIds = sortedMatchs.map(match => match.id);
      console.log('[WEEK] Fetching bets for match IDs:', matchIds);
      console.log('[WEEK] Matchdays:', sortedMatchs.map(m => m.matchday));
      try {
        const response = await axios.post(`${apiUrl}/api/bets/user/${user.id}`, {
          matchIds: matchIds
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        console.log('[WEEK] Bets received:', response.data.data.length);
        const betsByMatchId = response.data.data.reduce((acc, bet) => {
          acc[bet.match_id] = bet
          return acc
        }, {})
        console.log('[WEEK] Bets by match ID:', betsByMatchId);
        setBets(betsByMatchId)
        setIsLoading(false)
      } catch (error) {
        console.error('Erreur lors de la récupération des matchs :', error);
        setError(error);
        setIsLoading(false);
      }
    }

    fetchBets(matchs)
  }, [token, matchs])

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
  }, [activeIndex, bets, matchs, clock, activePeriod, hasMultiplePeriods]);

  // Calculer la deadline pour un matchday spécifique
  // Deadline = 12h00 le jour du premier match de ce matchday (en heure locale)
  const getMatchdayDeadline = (matchday) => {
    // Trouver tous les matchs de ce matchday
    const matchdayMatches = matchs.filter(m => m.matchday === matchday);
    if (matchdayMatches.length === 0) return null;

    // Trouver le premier match de ce matchday (le plus tôt)
    const firstMatch = matchdayMatches.reduce((earliest, current) => {
      return moment(current.utc_date).isBefore(moment(earliest.utc_date)) ? current : earliest;
    });

    // Convertir la date UTC du match en timezone locale
    const firstMatchDate = moment(firstMatch.utc_date);
    const localFirstMatchDate = firstMatchDate.clone().tz(clock?.tz || 'Europe/Paris');

    // La deadline est 12h00 le jour du premier match (en heure locale)
    const deadline = localFirstMatchDate.clone().startOf('day').hour(12).minute(0).second(0).millisecond(0);

    return deadline;
  };

  const canSubmitBet = (match) => {
    if (!match) return false;

    // Calculer la deadline spécifique à ce matchday
    let matchdayDeadline;

    // Si mode multi-périodes, utiliser la deadline de la période active
    if (hasMultiplePeriods && activePeriod && activePeriod.deadline) {
      matchdayDeadline = moment(activePeriod.deadline);
    } else {
      // Sinon, utiliser 12h00 le jour du premier match de ce matchday
      matchdayDeadline = getMatchdayDeadline(match.matchday);
      if (!matchdayDeadline) return false;
    }

    // Vérifier que le match est dans le futur ET qu'on est avant la deadline
    const matchDate = moment(match.utc_date);
    return matchDate.isAfter(now) && now.isBefore(matchdayDeadline);
  };

  const isMatchEditable = (match) => {
    if (!match) return false;
    return canSubmitBet(match) && isBetPlaced(match.id);
  };

  const handleGlobalSubmit = async () => {
    const currentIndex = swiperRef.current?.swiper.activeIndex;
    if (currentIndex !== undefined) {
      const currentMatch = matchs[currentIndex];
      const currentFormComponent = formRefs.current[currentIndex];
      if (currentFormComponent && currentMatch && (isMatchEditable(currentMatch) || !isBetPlaced(currentMatch.id))) {
        try {
          await currentFormComponent.triggerSubmit();
          handleSuccess('Prono enregistré', 3000)
          swiperInstance.slideNext()
        } catch (e) {
          handleError('Prono refusé');
        }
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

    // Utiliser canSubmitBet qui calcule la deadline spécifique au matchday
    const canSubmit = canSubmitBet(currentMatch);
    const hasBet = isBetPlaced(currentMatch.id);
    const isFutureMatch = moment(currentMatch.utc_date).isAfter(now);

    if (canSubmit && isFutureMatch) {
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
            if (!match.HomeTeam || !match.AwayTeam) {
              return null;
            }

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
          <div className="relative z-[2] w-full flex flex-row justify-center text-black px-8 py-1 mt-8 text-center">
            <img src={checkedIcon} alt=""/>
          </div>
        ) : (
          <button
            className="form-submit-btn relative mt-16 mx-auto block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
            type="button"
            onClick={handleGlobalSubmit}
            disabled={disabled}
          >
            <span translate="no" className={`relative z-[2] w-full flex flex-row justify-center border border-black text-black px-8 py-1 rounded-full text-center font-roboto text-base uppercase font-bold shadow-md ${className} transition -translate-y-1 -translate-x-0 group-hover:-translate-y-0 group-hover:-translate-x-0`}>
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