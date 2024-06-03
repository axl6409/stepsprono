import React, {useState, useEffect, useContext} from 'react'
import axios from 'axios'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {
  faCircleCheck,
  faMinusCircle,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons"
import {UserContext} from "../contexts/UserContext.jsx"
import {Link, useNavigate} from "react-router-dom"
import arrowIcon from "../assets/icons/arrow-left.svg";

const Teams = () => {
  const { user, setUser } = useContext(UserContext)
  const [teams, setTeams] = useState([])
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState(null)
  const [isListOpen, setIsListOpen] = useState(false)
  const token = localStorage.getItem('token') || cookies.token
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
  const [teamColors, setTeamColors] = useState({});
  const colors = ['#6666FF', '#CC99FF', '#00CC99', '#F7B009', '#F41731'];
  const [cardColor, setCardColor] = useState('');

  useEffect(() => {

    const fetchTeams = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/teams`, {
          params: { sortBy: 'position', order: 'asc' },
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setTeams(response.data.data);
        const newTeamColors = {};
        response.data.data.forEach((team, index) => {
          newTeamColors[team.teamId] = colors[index % colors.length];
        });
        setTeamColors(newTeamColors);
      } catch (error) {
        console.error('Erreur lors de la récupération des équipes :', error);
      }
    }
    fetchTeams()
  }, [token]);
  const getResultIcon = (result) => {
    switch (result) {
      case 'W': return <FontAwesomeIcon icon={faCircleCheck} className="text-green-lime-deep block rounded-full shadow-flat-black-adjust" />
      case 'L': return <FontAwesomeIcon icon={faTimesCircle} className="text-flat-red block rounded-full shadow-flat-black-adjust" />
      case 'D': return <FontAwesomeIcon icon={faMinusCircle} className="text-slate-200 block rounded-full shadow-flat-black-adjust" />
      default: return null;
    }
  };

  return (
    <div className="inline-block w-full h-auto pt-20">
      <Link
        to="/dashboard"
        className="swiper-button-prev w-[30px] h-[30px] rounded-full bg-white top-7 left-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
      >
        <img src={arrowIcon} alt="Icône flèche"/>
      </Link>
      <h1
        className={`font-black mb-12 text-center relative w-fit mx-auto text-xl5 leading-[50px]`}>Classement Ligue 1
        <span
          className="absolute left-0 top-0 right-0 text-purple-soft z-[-1] translate-x-0.5 translate-y-0.5">Classement Ligue 1</span>
        <span
          className="absolute left-0 top-0 right-0 text-green-soft z-[-2] translate-x-1 translate-y-1">Classement Ligue 1</span>
      </h1>
      <div className="relative py-8 px-2 pt-0">
        <ul className="flex flex-col justify-start">
          {teams.map(team => (
            <li className="flex flex-row justify-between" key={team.teamId}>
              <div className="my-6 flex flex-col relative border-2 border-black rounded-xl bg-white shadow-flat-black w-full">
                <div className="absolute z-[10] -top-5 left-2 border-2 border-black w-[40px] text-center h-[40px] rounded-full flex flex-row justify-center items-center shadow-flat-black-adjust" style={{backgroundColor: teamColors[team.teamId]}}>
                  <p
                    className="font-rubik font-black text-stroke-black-2 text-white text-[1.5em] inline-block leading-[35px]">{team.position}</p>
                </div>
                <div className="flex flex-row justify-center items-center relative rounded-t-xl overflow-hidden z-[5] border-b border-black py-2" style={{backgroundColor: teamColors[team.teamId] + "60"}}>
                  <p className="name font-sans text-base font-bold">{team.Team.name}</p>
                </div>
                <div className="flex flex-row justify-between">
                  <div className="w-1/3 px-2 py-4">
                    <p className="text-center text-xs font-rubik uppercase font-regular">Matchs <span className="font-black">{team.playedTotal}</span></p>
                    <ul className="flex flex-row justify-center items-center mt-2">
                      <li className="w-auto min-w-[30px] border border-black rounded p-0.5 text-center mx-1">
                        <p className="font-rubik text-xs h-1/2 font-medium leading-5">MG</p>
                        <p className="font-rubik h-1/2 text-sm leading-5 font-black">{team.winTotal}</p>
                      </li>
                      <li className="w-auto min-w-[30px] border border-black rounded p-0.5 text-center mx-1">
                        <p className="font-rubik text-xs h-1/2 font-medium leading-5">MN</p>
                        <p className="font-rubik h-1/2 text-sm leading-5 font-black">{team.drawTotal}</p>
                      </li>
                      <li className="w-auto min-w-[30px] border border-black rounded p-0.5 text-center mx-1">
                        <p className="font-rubik text-xs h-1/2 font-medium leading-5">MN</p>
                        <p className="font-rubik h-1/2 text-sm leading-5 font-black">{team.losesTotal}</p>
                      </li>
                    </ul>
                  </div>
                  <div className="w-1/3 px-2 py-4 border-l border-r border-black border-dotted">
                    <p className="text-center text-xs font-rubik uppercase font-regular">Buts</p>
                    <ul className="flex flex-row justify-center items-center mt-2">
                      <li className="w-auto min-w-[30px] border border-black rounded p-0.5 text-center mx-1">
                        <p className="font-rubik text-xs h-1/2 font-medium leading-5">BP</p>
                        <p className="font-rubik h-1/2 text-[90%] leading-5 font-black">{team.goalsFor}</p>
                      </li>
                      <li className="w-auto min-w-[30px] border border-black rounded p-0.5 text-center mx-1">
                        <p className="font-rubik text-xs h-1/2 font-medium leading-5">BC</p>
                        <p className="font-rubik h-1/2 text-[90%] leading-5 font-black">{team.goalsAgainst}</p>
                      </li>
                      <li className="w-auto min-w-[30px] border border-black rounded p-0.5 text-center mx-1">
                        <p className="font-rubik text-xs h-1/2 font-medium leading-5">BD</p>
                        <p className="font-rubik h-1/2 text-[90%] leading-5 font-black">{team.goalDifference}</p>
                      </li>
                    </ul>
                  </div>
                  <div className="w-1/3 px-2 py-4">
                    <p className="text-center text-xs font-rubik uppercase font-regular">Points</p>
                    <p className="text-center text-xl3 font-rubik uppercase font-black">{team.points}</p>
                  </div>
                </div>
                <div className="py-2 border-t border-black">
                  <ul className="flex flex-row justify-center">
                    {team.form.slice(-5).split('').map((result, index) => (
                      <li className="mx-2 text-lg rounded-full bg-black h-fit border border-black"
                          key={index}>{getResultIcon(result)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Teams;
