import React, {useState, useEffect, useContext} from 'react'
import axios from 'axios'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {
  faAngleLeft, faAngleRight, faAnglesLeft, faAnglesRight,
  faCaretDown,
  faCaretUp,
  faCirclePlus,
  faCircleXmark,
  faPen
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
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const token = localStorage.getItem('token') || cookies.token
  const navigate = useNavigate()

  useEffect(() => {

    const fetchTeams = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3001/api/teams', {
          params: { page: currentPage, limit: itemsPerPage },
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


  return (
    <div className="inline-block w-full h-auto">
      <h1 className="text-3xl font-black my-8 uppercase relative w-fit mx-auto">Équipes
        <span className="absolute left-0 bottom-0 text-flat-purple z-[-1] transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">Équipes</span>
        <span className="absolute left-0 bottom-0 text-green-lime z-[-2] transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">Équipes</span>
      </h1>
      <div className="relative border-t-2 border-b-2 border-black overflow-hidden py-8 px-2 pt-0 bg-flat-yellow">
        <ul className="flex flex-col justify-start">
          {teams.map(team => (
            <li className="flex flex-row p-1.5 my-2 border-2 border-black rounded-l bg-white shadow-flat-black" key={team.id}>
              <div className="w-1/5 flex flex-col justify-center">
                <img src={team.logoUrl} alt={`${team.shortName} Logo`} className="team-logo w-1/2 mx-auto"/>
              </div>
              <div className="w-3/5 text-center flex flex-col justify-center px-6 py-2">
                <p className="name font-sans text-base font-medium">{team.shortName}</p>
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
