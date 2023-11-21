import React, {useEffect, useState} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import 'swiper/css/effect-cube';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import axios from "axios";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft, faCaretRight, faCircleCheck, faPen, faReceipt} from "@fortawesome/free-solid-svg-icons";
import Pronostic from "../partials/Pronostic.jsx";
import {EffectCube, Navigation, Pagination} from 'swiper/modules';
import moment from "moment";

const Passed = ({token, user}) => {
  const [matchs, setMatchs] = useState([]);
  const [matchdays, setMatchdays] = useState([]);
  const [selectedMatchday, setSelectedMatchday] = useState('');

  useEffect(() => {
    const fetchMatchdays = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:3001/api/matchs/days/passed`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const days = response.data;
        setMatchdays(days);
        if (days.length > 0) {
          setSelectedMatchday(days[0])
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des équipes :', error);
      }
    };

    fetchMatchdays();
  }, [token]);

  useEffect(() => {
    if (selectedMatchday) {
      const fetchMatchs = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:3001/api/matchs/day/${selectedMatchday}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          setMatchs(response.data.data);
        } catch (error) {
          console.error('Erreur lors de la récupération des équipes :', error);
        }
      }
      fetchMatchs()
    }
  }, [selectedMatchday]);

  const handleMatchdayChange = (event) => {
    setSelectedMatchday(event.target.value);
  };
  return (
    <div className="relative pt-12 border-2 border-black py-8 px-2 bg-flat-yellow shadow-flat-black">
      <form className=" absolute top-[-4px] right-2 mt-0 z-[5]">
        <select onChange={handleMatchdayChange} value={selectedMatchday} className="border-2 border-black rounded-br-md rounded-bl-md px-2 py-1 shadow-flat-black-adjust font-bold">
          {matchdays.map((day) => (
            <option key={day} value={day} className="font-sans font-bold">Journée {day}</option>
          ))}
        </select>
      </form>
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
            return (
              <SwiperSlide className="flex flex-col justify-center relative p-1.5 my-2 border-2 border-black bg-white shadow-flat-black min-h-[300px]" key={match.id}>
                <div className="w-full text-center flex flex-col justify-center px-6 py-2 h-fit">
                  <p className="name font-sans text-base font-bold capitalize">{matchDate.format('DD MMMM')}</p>
                </div>
                <div className="flex flex-row justify-between">
                  <div className="w-2/4 flex flex-col justify-center">
                    <img src={match.HomeTeam.logoUrl} alt={`${match.HomeTeam.name} Logo`} className="team-logo h-[90px] mx-auto"/>
                    <p className="font-sans font-bold text-sm">{match.HomeTeam.name}</p>
                    <p className="font-title font-black text-xl border-2 mt-4 border-black shadow-flat-black mx-auto w-[30px] h-[30px] leading-5">{match.scoreFullTimeHome}</p>
                  </div>
                  <div className="w-2/4 flex flex-col justify-center">
                    <img src={match.AwayTeam.logoUrl} alt={`${match.AwayTeam.name} Logo`} className="team-logo h-[90px] mx-auto"/>
                    <p className="font-sans font-bold text-sm">{match.AwayTeam.name}</p>
                    <p className="font-title font-black text-xl border-2 mt-4 border-black shadow-flat-black mx-auto w-[30px] h-[30px] leading-5">{match.scoreFullTimeAway}</p>
                  </div>
                </div>
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
    </div>
  )
}

export default Passed