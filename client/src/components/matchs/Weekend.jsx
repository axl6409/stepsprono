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
  faPen,
  faReceipt,
  faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons";
import Pronostic from "../partials/Pronostic.jsx";
import {EffectCube, Navigation, Pagination} from 'swiper/modules';
import moment from "moment";

const Weekend = ({token, user}) => {
  const [matchs, setMatchs] = useState([])
  const [bets, setBets] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [lastMatch, setLastMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const now = moment();
  const simulatedNow = moment().day(7).hour(10).minute(0).second(0);
  const nextFridayAtNoon = moment().day(5).hour(12).minute(0).second(0);
  const nextSaturdayAtMidnight = moment().day(6).hour(23).minute(59).second(59);
  const isBeforeNextFriday = now.isBefore(nextFridayAtNoon);

  useEffect(() => {
    const fetchMatchs = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:3001/api/matchs/next-weekend', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const sortedMatchs = response.data.data.sort((a, b) => {
          return new Date(a.utcDate) - new Date(b.utcDate);
        })
        setMatchs(sortedMatchs)
        setLastMatch(sortedMatchs[sortedMatchs.length - 1])
        setLoading(false)
        fetchBets(sortedMatchs)
      } catch (error) {
        console.error('Erreur lors de la récupération des matchs :', error);
        setError(error);
        setLoading(false);
      }
    }
    fetchMatchs()
  }, [token])

  const fetchBets = async (sortedMatchs) => {
    const matchIds = sortedMatchs.map(match => match.id);
    try {
      const response = await axios.post(`http://127.0.0.1:3001/api/bets/user/${user.id}`, {
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
      setLoading(false);
    }
  }

  const isBetPlaced = (matchId) => {
    return bets.some(bet => bet.matchId === matchId);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    fetchBets(matchs)
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error.message}</p>;

  return (
    <div className="relative pt-12 border-2 border-black py-8 px-2 bg-flat-yellow shadow-flat-black">
      <div>
        <Swiper
          effect={'cube'}
          grabCursor={true}
          cubeEffect={{
            shadow: true,
            slideShadows: true,
            shadowOffset: 20,
            shadowScale: 0.94,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          modules={[EffectCube, Pagination, Navigation]}
          className="mySwiper flex flex-col justify-start"
        >
          {matchs.map(match => {
            const matchDate = moment(match.utcDate)
            const isMatchInFuture = matchDate.isAfter(now);

            return (
              <SwiperSlide className="flex flex-row flex-wrap relative p-1.5 my-2 border-2 border-black bg-white shadow-flat-black min-h-[300px]" key={match.id}>
                {isBetPlaced(match.id) ? (
                  <FontAwesomeIcon icon={faCircleCheck} className="ml-2 mt-1 absolute right-2 top-2 text-xl3 text-green-lime-deep rotate-12 block rounded-full shadow-flat-black-adjust-50"/>
                ) : (
                  <FontAwesomeIcon icon={faTriangleExclamation} className="ml-2 mt-1 absolute right-2 top-2 text-xl3 text-flat-red rotate-12 block"/>
                )}
                <div className="w-full text-center flex flex-col justify-center px-6 py-2">
                  <p className="name font-sans text-base font-bold capitalize">{matchDate.format('DD MMMM')}
                    <span className="flex flex-row justify-center">
                    <span className="inline-block bg-white shadow-flat-black text-black px-2 pb-1.5 font-title leading-6 font-medium text-xl mx-0.5 border-2 border-black">{matchDate.format('HH')}</span>
                    <span className="inline-block bg-white shadow-flat-black text-black px-2 pb-1.5 font-title leading-6 font-medium text-xl mx-0.5 border-2 border-black">{matchDate.format('mm')}</span>
                    <span className="inline-block bg-white shadow-flat-black text-black px-2 pb-1.5 font-title leading-6 font-medium text-xl mx-0.5 border-2 border-black">{matchDate.format('ss')}</span>
                  </span>
                  </p>
                </div>
                <div className="w-2/4 flex flex-col justify-center">
                  <img src={match.HomeTeam.logoUrl} alt={`${match.HomeTeam.name} Logo`} className="team-logo h-[90px] mx-auto"/>
                  <p>{match.HomeTeam.name}</p>
                </div>
                <div className="w-2/4 flex flex-col justify-center">
                  <img src={match.AwayTeam.logoUrl} alt={`${match.AwayTeam.name} Logo`} className="team-logo h-[90px] mx-auto"/>
                  <p>{match.AwayTeam.name}</p>
                </div>
                {!isBetPlaced(match.id) && isMatchInFuture && isBeforeNextFriday ? (
                  <button
                    className="relative mt-8 mx-auto block h-fit before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-md before:bg-green-lime before:border-black before:border-2 group"
                    onClick={() => { setIsModalOpen(true); setSelectedMatch(match); }}
                  >
                <span className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-md text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0">
                  Faire un prono
                  <FontAwesomeIcon icon={faReceipt} className="inline-block ml-2 mt-1" />
                </span>
                  </button>
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
}

export default Weekend