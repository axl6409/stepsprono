import React, {useEffect, useState} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import 'swiper/css/effect-cube';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import axios from "axios";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft, faCaretRight, faPen, faReceipt} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

import {EffectCube, Navigation, Pagination} from 'swiper/modules';

const NextWeekend = ({token}) => {
  console.log(moment.locale())
  const [matchs, setMatchs] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setMatchs(sortedMatchs);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des matchs :', error);
        setError(error);
        setLoading(false);
      }
    }
    fetchMatchs()
  }, [token])

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error.message}</p>;

  return (
    <div className="relative pt-12 border-2 border-black overflow-hidden py-8 px-2 bg-flat-yellow shadow-flat-black">
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
          {matchs.map(match => (
            <SwiperSlide className="flex flex-row flex-wrap p-1.5 my-2 border-2 border-black rounded-l bg-white shadow-flat-black min-h-[250px]" key={match.id}>
              <div className="w-full text-center flex flex-col justify-center px-6 py-2">
                <p className="name font-sans text-base font-medium">{moment(match.utcDate).format('DD-MM')}</p>
              </div>
              <div className="w-2/4 flex flex-col justify-center">
                <img src={match.HomeTeam.logoUrl} alt={`${match.HomeTeam.name} Logo`} className="team-logo w-1/2 mx-auto"/>
                <p>{match.HomeTeam.shortName}</p>
              </div>
              <div className="w-2/4 flex flex-col justify-center">
                <img src={match.AwayTeam.logoUrl} alt={`${match.AwayTeam.name} Logo`} className="team-logo w-1/2 mx-auto"/>
                <p>{match.AwayTeam.shortName}</p>
              </div>
              <Link to={`/pronostic/${match.id}`}
                    className="relative mt-8 mx-auto block h-fit before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-md before:bg-green-lime before:border-black before:border-2 group">
                <span className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-md text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0">Faire un prono<FontAwesomeIcon icon={faReceipt} className="inline-block ml-2 mt-1" /></span>
              </Link>
            </SwiperSlide>
          ))}
          <div className="swiper-button-prev w-[50px] h-[50px] bg-white -top-4 left-0 shadow-flat-black border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none">
            <FontAwesomeIcon icon={faCaretLeft} className="text-black" />
          </div>
          <div className="swiper-button-next w-[50px] h-[50px] bg-white -top-4 right-0 shadow-flat-black border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none">
            <FontAwesomeIcon icon={faCaretRight} className="text-black" />
          </div>
        </Swiper>
      </div>
    </div>
  )
}

export default NextWeekend