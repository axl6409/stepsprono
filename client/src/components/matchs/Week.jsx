import React, {useEffect, useState} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import 'swiper/css/effect-cube';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import axios from "axios";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faCaretLeft,
  faCaretRight,
  faCircleCheck,
  faReceipt,
  faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons";
import Pronostic from "../partials/Pronostic.jsx";
import {EffectCards, Navigation, Pagination} from 'swiper/modules';
import 'swiper/css/effect-cards';
import moment from "moment";
import Loader from "../partials/Loader.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Week = ({token, user}) => {
  const [matchs, setMatchs] = useState([])
  const [bets, setBets] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [lastMatch, setLastMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const now = moment();
  const simulatedNow = moment().day(1).hour(10).minute(0).second(0);
  const nextFridayAtNoon = moment().day(5).hour(12).minute(0).second(0);
  const nextSaturdayAtMidnight = moment().day(6).hour(23).minute(59).second(59);
  const isBeforeNextFriday = simulatedNow.isBefore(nextFridayAtNoon);
  const isVisitor = user.role === 'visitor';

  useEffect(() => {
    const fetchMatchs = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`${apiUrl}/api/matchs/current-week`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const sortedMatchs = response.data.data.sort((a, b) => {
          return new Date(a.utcDate) - new Date(b.utcDate);
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
      setBets(response.data.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs :', error);
      setError(error);
      setIsLoading(false);
    }
  }

  const submitBet = async (data, matchId) => {
    try {
      const payload = {...data, userId: user.id, matchId}
      const response = await axios.post(`${apiUrl}/api/bet/add`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      console.log(response.data)
    } catch (error) {
      console.error('Erreur lors de l\'envoi du prono :', error);
    }
  }

  const isBetPlaced = (matchId) => {
    return bets.some(bet => bet.matchId === matchId);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    fetchBets(matchs)
  };

  if (error) return <p>Erreur : {error.message}</p>;

  return (
    isLoading ? (
      <Loader />
    ) : (
    <div className="relative pt-12 py-8 px-2">
      <div>
        <Swiper
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
          className="mySwiper flex flex-col justify-start"
        >
          {matchs.map(match => {
            const matchDate = moment(match.utcDate)
            const isMatchInFuture = matchDate.isAfter(simulatedNow);
            const hasBet = isBetPlaced(match.id)
            const isAfterFridayNoon = simulatedNow.isAfter(nextFridayAtNoon)

            return (
              <SwiperSlide className="flex flex-row flex-wrap relative p-1.5 my-2 border border-black bg-white rounded-2xl shadow-flat-black min-h-[300px]" key={match.id} data-match-id={match.id}>
                {!hasBet && (isMatchInFuture || isBeforeNextFriday) && !isAfterFridayNoon ? (
                  match ? <Pronostic match={match} utcDate={matchDate} userId={user.id} lastMatch={lastMatch} token={token} /> : <div>Loading...</div>
                  ) : !hasBet && isAfterFridayNoon ? (
                    <div
                      className="relative mt-8 mx-auto block h-fit"
                    >
                      <span className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-white px-2 py-1.5 shadow-flat-black text-center font-sans uppercase font-bold bg-deep-red">
                        Trop tard !
                      </span>
                    </div>
                    ) : (
                    <div
                      className="relative mt-8 mx-auto block h-fit"
                      >
                      <span className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-white px-2 py-1.5 shadow-flat-black text-center font-sans uppercase font-bold bg-green-lime-deep">
                        Prono reçu
                      </span>
                    </div>
                  )}
              </SwiperSlide>
            );
          })}
          <div className="swiper-button-prev w-[50px] h-[50px] bg-white top-4 left-0 shadow-flat-black border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none">
            <FontAwesomeIcon icon={faCaretLeft} className="text-black" />
          </div>
          <div className="swiper-button-next w-[50px] h-[50px] bg-white top-4 right-0 shadow-flat-black border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none">
            <FontAwesomeIcon icon={faCaretRight} className="text-black" />
          </div>
        </Swiper>
      </div>

      <Pronostic match={selectedMatch} userId={user.id} lastMatch={lastMatch} closeModal={closeModal} isModalOpen={isModalOpen} token={token} />

    </div>
    )
  )
}

export default Week