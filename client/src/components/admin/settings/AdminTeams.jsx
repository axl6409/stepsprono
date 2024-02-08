import React, {useContext, useEffect, useState} from 'react';
import {useCookies} from "react-cookie";
import {UserContext} from "../../../contexts/UserContext.jsx";
import {Link, Navigate, useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faCaretLeft,
  faCloudArrowDown,
  faDatabase,
  faPen,
  faPersonRunning,
  faRankingStar
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import moment from "moment";
import ConfirmationModal from "../../partials/modals/ConfirmationModal.jsx";
import StatusModal from "../../partials/modals/StatusModal.jsx";
import {AppContext} from "../../../contexts/AppContext.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AdminTeams = () => {
  const { user } = useContext(UserContext)
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const [teams, setTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const { fetchAPICalls } = useContext(AppContext);

  if (!user || user.role !== 'admin' && user.role !== 'manager') {
    return <Navigate to={'/'} replace />
  }

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setTeams(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs :', error);
    }
  };
  useEffect(() => {
    fetchTeams()
  }, []);

  const handleUpdateTeam = async (teamId) => {
    try {
      const response = await axios.patch(`${apiUrl}/api/admin/teams/update-ranking/${teamId}`, null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        await fetchTeams()
        setUpdateStatus(true);
        setUpdateMessage('Équipe mise à jour !');
        setIsModalOpen(true)
        fetchAPICalls()
        setTimeout(function () {
          closeModal()
        }, 1500)
      } else {
        setUpdateStatus(false);
        setUpdateMessage('Erreur lors de la mise à jour de l\'équipe : ' + response.data.message);
        setIsModalOpen(true)
        fetchAPICalls()
      }
    } catch (error) {
      setUpdateStatus(false);
      console.log(error)
      setUpdateMessage('Erreur lors de la mise à jour de l\'équipe : ' + error.response.data.message);
      setIsModalOpen(true)
    }
  };

  const handleUpdateTeamPlayers = async (teamId) => {
    try {
      const response = await axios.patch(`${apiUrl}/api/admin/teams/update-players/${teamId}`, null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        await fetchTeams()
        setUpdateStatus(true);
        setUpdateMessage('Équipe mise à jour !');
        setIsModalOpen(true)
        setTimeout(function () {
          closeModal()
        }, 1500)
      } else {
        setUpdateStatus(false);
        setUpdateMessage('Erreur lors de la mise à jour des joueurs de l\'équipe : ' + response.data.message);
        setIsModalOpen(true)
        fetchAPICalls()
      }
    } catch (error) {
      setUpdateStatus(false);
      console.log(error)
      setUpdateMessage('Erreur lors de la mise à jour des joueurs de l\'équipe : ' + error.response.data.message);
      setIsModalOpen(true)
    }
  };

  const handleUpdateAll = async () => {
    try {
      const response = await axios.patch(`${apiUrl}/api/admin/teams/update-ranking/all`, null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        await fetchTeams()
        setUpdateStatus(true);
        setUpdateMessage('Équipes mises à jour !');
        setIsModalOpen(true)
        fetchAPICalls()
        setTimeout(function () {
          closeModal()
        }, 1500)
      } else {
        setUpdateStatus(false);
        setUpdateMessage('Erreur lors de la mise à jour des équipes : ' + response.data.message);
        setIsModalOpen(true)
        fetchAPICalls()
      }
    } catch (error) {
      setUpdateStatus(false);
      console.log(error)
      setUpdateMessage('Erreur lors de la mise à jour des équipes : ' + error.response.data.message);
      setIsModalOpen(true)
    }
  };

  const updateTeamsDatas = async () => {
    try {
      const response = await axios.patch(`${apiUrl}/api/admin/teams/update-datas/`, null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        await fetchTeams()
        setUpdateStatus(true);
        setUpdateMessage('Données des équipes mises à jour !');
        setIsModalOpen(true)
        fetchAPICalls()
        setTimeout(function () {
          closeModal()
        }, 1500)
      } else {
        setUpdateStatus(false);
        setUpdateMessage('Erreur lors de la mise à jour des données des équipes : ' + response.data.message);
        setIsModalOpen(true)
        fetchAPICalls()
      }
    } catch (error) {
      setUpdateStatus(false);
      console.log(error)
      setUpdateMessage('Erreur lors de la mise à jour des données des équipes : ' + error.response.data.message);
      setIsModalOpen(true)
    }
  }

  const updateTeamDatas = async (teamId) => {
    try {
      const response = await axios.patch(`${apiUrl}/api/admin/teams/update-datas/${teamId}`, null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        await fetchTeams()
        setUpdateStatus(true);
        setUpdateMessage('Données de l\'équipe mises à jour !');
        setIsModalOpen(true)
        fetchAPICalls()
        setTimeout(function () {
          closeModal()
        }, 1500)
      } else {
        setUpdateStatus(false);
        setUpdateMessage('Erreur lors de la mise à jour des données de l\'équipe : ' + response.data.message);
        setIsModalOpen(true)
        fetchAPICalls()
      }
    } catch (error) {
      setUpdateStatus(false);
      console.log(error)
      setUpdateMessage('Erreur lors de la mise à jour des données de l\'équipe : ' + error.response.data.message);
      setIsModalOpen(true)
    }
  }

  const closeModal = () => {
    setUpdateStatus(false);
    setUpdateMessage('');
    setIsModalOpen(false);
  };

  return (
    <div className="inline-block w-full h-auto">
      {isModalOpen && (
        <StatusModal message={updateMessage} status={updateStatus} closeModal={closeModal}/>
      )}
      <Link
        to="/admin"
        className="w-fit block relative my-4 ml-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:bg-green-lime before:border-black before:border-2 group"
      >
        <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-1 text-center shadow-md bg-white transition -translate-y-1 translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0">
          <FontAwesomeIcon icon={faCaretLeft} />
        </span>
      </Link>
      <h1 className="text-3xl font-black my-8 uppercase relative mx-auto text-center w-fit">Données des équipes
        <span className="absolute left-0 bottom-0 text-flat-purple z-[-1] text-center transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">Données des équipes</span>
        <span className="absolute left-0 bottom-0 text-green-lime z-[-2] text-center transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">Données des équipes</span>
      </h1>
      <div className="pb-3.5 pt-6 px-2 bg-black relative">
        <p className="bg-white text-black font-sans font-medium text-xs w-fit absolute leading-5 -top-3.5 left-2.5 py-0.5 px-1.5 rounded-full border-2 border-black shadow-flat-black-middle">Équipes à mettre à jour</p>
        <div className="w-fit absolute -top-5 right-2.5 rounded-full flex flex-row">
          <button
            onClick={() => updateTeamsDatas()}
            className="relative hidden m-2 block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
          >
            <span
              className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
              <FontAwesomeIcon icon={faCloudArrowDown} className="mx-1"/>
              <FontAwesomeIcon icon={faDatabase} />
            </span>
          </button>
          <button
            onClick={() => handleUpdateAll()}
            className="relative m-2 block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
          >
            <span
              className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
              <FontAwesomeIcon icon={faCloudArrowDown} className="mx-1"/>
              <FontAwesomeIcon icon={faRankingStar} className="mx-1"/>
            </span>
          </button>
        </div>

        <ul className="flex flex-col justify-start">
          {teams.length ? (
            teams.map(team => {
              return (
                <li
                  className="relative flex flex-col justify-between border-2 border-black bg-white rounded-xl py-2 px-4 h-fit shadow-flat-black my-2 shadow-flat-purple"
                  key={team.id}>
                  <div className="flex flex-row justify-between">
                    <div className="flex flex-col w-1/2">
                      <img className="block h-8 w-8 mx-auto" src={team.logoUrl} alt={team.name}/>
                      <p
                        className="inline-block text-center font-sans text-sm font-bold leading-5 my-auto">{team.name}</p>
                    </div>
                    <div className="flex flex-row w-1/2">
                      <div>
                        <span className="text-xxxs font-sans font-bold leading-[12px] inline-block text-center">update team datas</span>
                        <button
                          onClick={() => updateTeamDatas(team.id)}
                          className="relative my-2 mx-auto block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                        >
                          <span
                            className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
                          <FontAwesomeIcon icon={faDatabase} />
                        </span>
                        </button>
                      </div>
                      <div>
                        <span className="text-xxxs font-sans font-bold leading-[12px] inline-block text-center">update team ranking</span>
                        <button
                          onClick={() => handleUpdateTeam(team.id)}
                          className="relative my-2 mx-auto block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                        >
                          <span
                            className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
                          <FontAwesomeIcon icon={faRankingStar} className="mx-1"/>
                        </span>
                        </button>
                      </div>
                      <div>
                        <span className="text-xxxs font-sans font-bold leading-[12px] inline-block text-center">update team players</span>
                        <button
                          onClick={() => handleUpdateTeamPlayers(team.id)}
                          className="relative my-2 mx-auto block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                        >
                          <span
                            className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
                          <FontAwesomeIcon icon={faPersonRunning} className="mx-1"/>
                        </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })
          ) : (
            <div className="py-3.5 px-2 bg-black">
              <li
                className="relative flex flex-col justify-between border-2 border-black bg-white rounded-xl py-4 px-4 h-fit shadow-flat-black my-4 shadow-flat-purple">
                <p className="name font-sans text-sm font-bold text-center">Toutes les équipes sont à jour</p>
              </li>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}

export default AdminTeams;