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
    const fetchLeagues = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3001/api/leagues', {
          headers: {
            'Authorization': `Bearer ${token}`, // remplacez `${token}` par le jeton JWT réel
          }
        });
        setLeagues(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des leagues :', error);
      }
    }
    fetchLeagues()

    const fetchTeams = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3001/api/teams', {
          params: { page: currentPage, limit: itemsPerPage },
          headers: {
            'Authorization': `Bearer ${token}`, // remplacez `${token}` par le jeton JWT réel
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

  const handleDeleteTeam = (teamId) => {
    setTeamToDelete(teamId);
    setIsModalOpen(true);
  };
  const confirmDeletion = async () => {
    try {
      await axios.delete(`http://127.0.0.1:3001/api/admin/teams/delete/${teamToDelete}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTeams(teams.filter((team) => team.id !== teamToDelete));
    } catch (error) {
      console.error('Error while deleting the team', error);
    }
    setIsModalOpen(false);
  };
  const cancelDeletion = () => {
    setTeamToDelete(null);
    setIsModalOpen(false);
  };
  const handleEditTeam = (team) => {
    navigate(`/admin/teams/edit/${team.id}`, { state: { mode: 'edit', team } });
  };
  const handleSelectLeague = (leagueId) => {
    const league = leagues.find(l => l.id === leagueId);
    if (league) {
      setSelectedLeague({name: league.name, id: leagueId})
      toggleList()
    }
  };
  const toggleList = () => {
    setIsListOpen(!isListOpen)
  };

  return (
    <div className="inline-block w-full h-auto">
      {isModalOpen && (
        <ConfirmationModal
          message="Êtes-vous sûr de vouloir supprimer cette équipe ?"
          onConfirm={confirmDeletion}
          onCancel={cancelDeletion}
        />
      )}
      <h1 className="text-center font-title uppercase font-black text-xxl my-4">Liste des équipes</h1>
      <div className="relative border-t-2 border-b-2 border-black overflow-hidden py-8 px-2 pt-0 bg-flat-yellow">
        <div className="section-head relative">
          <ul className={`overflow-hidden bg-white w-fit min-w-[200px] py-1.5 pb-0 relative -top-1.5 border-2 border-black rounded-br-md rounded-bl-md shadow-flat-black transition duration-300 ${isListOpen ? 'max-h-42' : 'max-h-9'}`}>
            <li className="pb-1">
              <button onClick={toggleList} className="focus:outline-none px-1.5 w-full">
                <span className="mr-1">{selectedLeague ? selectedLeague.name : 'Sélectionner une ligue'}</span>
                <FontAwesomeIcon icon={faCaretDown} className={`float-right mt-0.5 ${isListOpen ? 'hidden' : 'inline-block'}`} />
                <FontAwesomeIcon icon={faCaretUp} className={`float-right mt-0.5 ${isListOpen ? 'inline-block' : 'hidden'}`} />
              </button>
            </li>
            {leagues.map(league => (
              <li key={league.id} className="py-1 border-t-2 border-b-2 border-black -my-0.5 hover:bg-electric-blue focus:bg-electric-blue">
                <button
                  className="focus:outline-none px-1.5 w-full"
                  onClick={() => handleSelectLeague(league.id)}>
                  <span>{league.name}</span>
                </button>
              </li>
            ))}
          </ul>
          {user && user.role === 'admin' && (
            <button
              className="group w-fit px-2.5 py-0.5 bg-white shadow-flat-black-adjust absolute -top-2 pt-2 right-2 z-[5] border-r-2 border-l-2 border-b-2 border-black rounded-br-xl rounded-bl-xl font-title text-l uppercase font-bold"
              onClick={() => navigate('/admin/teams/edit', { state: { mode: 'add' } })}>
              <FontAwesomeIcon icon={faCirclePlus} className="inline-block align-[-2px]" />
            </button>
          )}
        </div>
        <ul className="flex flex-col justify-start">
          {teams.filter(team => !selectedLeague || !selectedLeague.id || team.leagueId === selectedLeague.id).map(team => (
            <li className="flex flex-row p-1.5 my-2 border-2 border-black rounded-l bg-white shadow-flat-black" key={team.id}>
              <div className="w-1/5 flex flex-col justify-center">
                <img src={team.logoUrl} alt={`${team.name} Logo`} className="team-logo w-1/2 mx-auto"/>
              </div>
              <div className="w-3/5 text-center flex flex-col justify-center px-6 py-2">
                <p className="name font-sans text-base font-medium">{team.name}</p>
              </div>
              <div className="w-1/5 flex flex-col justify-evenly">
                {user && user.role === 'admin' && (
                  <>
                    <button
                      className="w-fit h-[30px] block relative mx-auto my-1 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-x-0 before:inset-y-px before:bg-green-lime before:border-black before:border-2 group"
                      onClick={() => handleEditTeam(team)}>
                      <FontAwesomeIcon icon={faPen} className="relative z-[2] w-fit block border-2 border-black text-black px-3 py-1 text-center shadow-md bg-white transition -translate-y-1 translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0" />
                    </button>
                    <button
                      className="w-fit h-[30px] block relative mx-auto my-1 before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-x-0 before:inset-y-px before:bg-flat-red before:border-black before:border-2 group"
                      onClick={() => handleDeleteTeam(team.id)}>
                      <FontAwesomeIcon icon={faCircleXmark} className="relative z-[2] w-fit block border-2 border-black text-black px-3 py-1 text-center shadow-md bg-white transition -translate-y-1 translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0" />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="pagination-buttons flex flex-row justify-center mt-4">
          <button
            className="group mx-4 w-[35px] h-[35px] flex flex-col justify-center text-center relative z-[5] cursor-pointer before:content-[''] before:absolute before:z-[2] before:bg-electric-blue before:inset-0 before:border-2 before:border-black"
            onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
            <span className="w-full h-full p-1 bg-white relative z-[3] translate-x-1 -translate-y-1 border-2 border-black transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-focus:translate-x-0 group-focus:translate-y-0">
              <FontAwesomeIcon icon={faAnglesLeft} className="mx-auto h-[25px] block" />
            </span>
          </button>
          <button
            className="group mx-4 w-[35px] h-[35px] flex flex-col justify-center text-center relative z-[5] cursor-pointer before:content-[''] before:absolute before:z-[2] before:bg-electric-blue before:inset-0 before:border-2 before:border-black"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            <span className="w-full h-full p-1 bg-white relative z-[3] translate-x-1 -translate-y-1 border-2 border-black transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-focus:translate-x-0 group-focus:translate-y-0">
              <FontAwesomeIcon icon={faAngleLeft} className="mx-auto h-[25px] block" />
            </span>
          </button>
          <button
            className="group mx-4 w-[35px] h-[35px] flex flex-col justify-center text-center relative z-[5] cursor-pointer before:content-[''] before:absolute before:z-[2] before:bg-electric-blue before:inset-0 before:border-2 before:border-black"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            <span className="w-full h-full p-1 bg-white relative z-[3] -translate-x-1 -translate-y-1 border-2 border-black transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-focus:translate-x-0 group-focus:translate-y-0">
              <FontAwesomeIcon icon={faAngleRight} className="mx-auto h-[25px] block" />
            </span>
          </button>
          <button
            className="group mx-4 w-[35px] h-[35px] flex flex-col justify-center text-center relative z-[5] cursor-pointer before:content-[''] before:absolute before:z-[2] before:bg-electric-blue before:inset-0 before:border-2 before:border-black"
            onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
            <span className="w-full h-full p-1 bg-white relative z-[3] -translate-x-1 -translate-y-1 border-2 border-black transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-focus:translate-x-0 group-focus:translate-y-0">
              <FontAwesomeIcon icon={faAnglesRight} className="mx-auto h-[25px] block" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Teams;
