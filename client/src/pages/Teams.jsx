import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleXmark, faPen} from "@fortawesome/free-solid-svg-icons";
import {UserContext} from "../contexts/UserContext.jsx";
import {Link, useNavigate} from "react-router-dom";
import ConfirmationModal from "../components/partials/ConfirmationModal.jsx";

const Teams = () => {
  const { user } = useContext(UserContext)
  const [teams, setTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const token = localStorage.getItem('token') || cookies.token
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3001/api/admin/teams', {
          headers: {
            'Authorization': `Bearer ${token}`, // remplacez `${token}` par le jeton JWT réel
          }
        });
        setTeams(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
      }
    };

    fetchTeams();
  }, []);

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

  return (
    <div className="inline-block w-full h-auto">
      {isModalOpen && (
        <ConfirmationModal
          message="Êtes-vous sûr de vouloir supprimer cette équipe ?"
          onConfirm={confirmDeletion}
          onCancel={cancelDeletion}
        />
      )}
      <h1 className="text-center font-title uppercase font-black text-xxl my-4">Équipes de football françaises</h1>
      {user && user.role === 'admin' && (
        <button onClick={() => navigate('/admin/teams/edit', { state: { mode: 'add' } })}>Ajouter une équipe</button>
      )}
      <ul className="flex flex-col justify-start bg-black">
        {teams.map(team => (
          <li className="flex flex-row p-1.5 border-2 border-black rounded-sm bg-white" key={team.id}>
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
    </div>
  );
}

export default Teams;
