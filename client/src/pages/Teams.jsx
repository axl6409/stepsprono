import React, {useState, useEffect, useContext} from 'react'
import axios from 'axios'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {
  faAngleLeft, faAngleRight, faAnglesLeft, faAnglesRight,
  faCaretDown, faCaretLeft,
  faCaretUp, faCircleCheck,
  faCirclePlus,
  faCircleXmark, faMinusCircle,
  faPen, faTimesCircle
} from "@fortawesome/free-solid-svg-icons"
import {UserContext} from "../contexts/UserContext.jsx"
import {Link, useNavigate} from "react-router-dom"
import ConfirmationModal from "../components/partials/ConfirmationModal.jsx"
import Pagination from "../components/partials/Pagination.jsx";

const Teams = () => {
  const { user, setUser } = useContext(UserContext)
  const [teams, setTeams] = useState([])
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState(null)
  const [isListOpen, setIsListOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [totalPages, setTotalPages] = useState(0)
  const token = localStorage.getItem('token') || cookies.token
  const navigate = useNavigate()

  useEffect(() => {

    const fetchTeams = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3001/api/teams', {
          params: { page: currentPage, limit: itemsPerPage, sortBy: 'position', order: 'asc' },
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setTeams(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Erreur lors de la récupération des équipes :', error);
      }
    }
    fetchTeams()
  }, [currentPage, itemsPerPage]);

  const getResultIcon = (result) => {
    switch (result) {
      case 'W': return <FontAwesomeIcon icon={faCircleCheck} className="text-green-lime-deep block rounded-full shadow-flat-black-adjust" />
      case 'L': return <FontAwesomeIcon icon={faTimesCircle} className="text-flat-red block rounded-full shadow-flat-black-adjust" />
      case 'D': return <FontAwesomeIcon icon={faMinusCircle} className="text-slate-600 block rounded-full shadow-flat-black-adjust" />
      default: return null;
    }
  };

  return (
    <div className="inline-block w-full h-auto">
      <Link
        to="/dashboard"
        className="w-fit block relative my-4 ml-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:bg-green-lime before:border-black before:border-2 group"
      >
        <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-1 text-center shadow-md bg-white transition -translate-y-1 translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0">
          <FontAwesomeIcon icon={faCaretLeft} />
        </span>
      </Link>
      <h1 className="text-3xl font-black mt-8 uppercase relative w-fit mx-auto">Équipes
        <span className="absolute left-0 bottom-0 text-flat-purple z-[-1] transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">Équipes</span>
        <span className="absolute left-0 bottom-0 text-green-lime z-[-2] transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">Équipes</span>
      </h1>
      <p className="text-3xl font-black mb-8 uppercase relative w-fit mx-auto">Classement
        <span className="absolute left-0 bottom-0 text-flat-purple z-[-1] transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">Classement</span>
        <span className="absolute left-0 bottom-0 text-green-lime z-[-2] transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">Classement</span>
      </p>
      <div className="relative border-t-2 border-b-2 border-black overflow-hidden py-8 pr-2 pt-0 bg-flat-yellow">
        <ul className="flex flex-col justify-start">
          {teams.map(team => (
            <li className="flex flex-row justify-between" key={team.id}>
              <p className="w-[8%] flex flex-col justify-center">
                <span className="font-title font-bold text-xl w-full inline-block leading-4 text-center pb-2 pt-1 bg-white border-black border-t-2 border-r-2 border-b-2 shadow-flat-black-adjust rounded-tr-md rounded-br-md -ml-1">{team.position}</span>
              </p>
              <div className="flex flex-col p-1.5 my-2 border-2 border-black rounded-l bg-white shadow-flat-black w-[90%]">
                <div className="flex flex-row">
                  <div className="w-1/5 flex flex-col justify-center">
                    <img src={team.logoUrl} alt={`${team.shortName} Logo`} className="team-logo w-1/2 mx-auto"/>
                  </div>
                  <div className="w-3/5 text-center flex flex-col justify-center px-6 py-2">
                    <p className="name font-sans text-base font-medium">{team.shortName}</p>
                  </div>
                </div>
                <ul className="flex flex-row justify-center px-4 h-[50px]">
                  <li className="w-[12%] h-full text-center border border-black mx-0.5 shadow-flat-black-adjust">
                    <p className="text-xs h-1/2 font-bold leading-5 bg-black text-white font-sans border-white border">MJ</p>
                    <p className="font-title h-1/2 text-base leading-5 font-bold">{team.playedGames}</p>
                  </li>
                  <li className="w-[12%] h-full text-center border border-black mx-0.5 shadow-flat-black-adjust">
                    <p className="text-xs h-1/2 font-bold leading-5 bg-black text-white font-sans border-white border">G</p>
                    <p className="font-title h-1/2 text-base leading-5 font-bold">{team.won}</p>
                  </li>
                  <li className="w-[12%] h-full text-center border border-black mx-0.5 shadow-flat-black-adjust">
                    <p className="text-xs h-1/2 font-bold leading-5 bg-black text-white font-sans border-white border">N</p>
                    <p className="font-title h-1/2 text-base leading-5 font-bold">{team.draw}</p>
                  </li>
                  <li className="w-[12%] h-full text-center border border-black mx-0.5 shadow-flat-black-adjust">
                    <p className="text-xs h-1/2 font-bold leading-5 bg-black text-white font-sans border-white border">L</p>
                    <p className="font-title h-1/2 text-base leading-5 font-bold">{team.lost}</p>
                  </li>
                  <li className="w-[12%] h-full text-center border border-black mx-0.5 shadow-flat-black-adjust">
                    <p className="text-xs h-1/2 font-bold leading-5 bg-black text-white font-sans border-white border">Pts</p>
                    <p className="font-title h-1/2 text-base leading-5 font-bold">{team.points}</p>
                  </li>
                  <li className="w-[12%] h-full text-center border border-black mx-0.5 shadow-flat-black-adjust">
                    <p className="text-xs h-1/2 font-bold leading-5 bg-black text-white font-sans border-white border">BP</p>
                    <p className="font-title h-1/2 text-base leading-5 font-bold">{team.goalsFor}</p>
                  </li>
                  <li className="w-[12%] h-full text-center border border-black mx-0.5 shadow-flat-black-adjust">
                    <p className="text-xs h-1/2 font-bold leading-5 bg-black text-white font-sans border-white border">BC</p>
                    <p className="font-title h-1/2 text-base leading-5 font-bold">{team.goalsAgainst}</p>
                  </li>
                  <li className="w-[12%] h-full text-center border border-black mx-0.5 shadow-flat-black-adjust">
                    <p className="text-xs h-1/2 font-bold leading-5 bg-black text-white font-sans border-white border">BD</p>
                    <p className="font-title h-1/2 text-base leading-5 font-bold">{team.goalDifference}</p>
                  </li>
                </ul>
                <div className="my-4">
                  <p className="font-sans text-xs font-bold text-center uppercase mb-2">5 derniers matchs</p>
                  <ul className="flex flex-row justify-center">
                    {team.form.split(',').map((result, index) => (
                      <li className="mx-2 text-lg rounded-full bg-black h-fit" key={index}>{getResultIcon(result)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default Teams;
