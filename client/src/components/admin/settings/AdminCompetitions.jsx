import React, {useContext, useEffect, useState} from 'react';
import {useCookies} from "react-cookie";
import {UserContext} from "../../../contexts/UserContext.jsx";
import {Link, Navigate, useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft, faCloudArrowDown, faPen} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import moment from "moment";
import ConfirmationModal from "../../partials/modals/ConfirmationModal.jsx";
import StatusModal from "../../partials/modals/StatusModal.jsx";
import {AppContext} from "../../../contexts/AppContext.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AdminCompetitions = () => {
  const { user } = useContext(UserContext)
  const { fetchMatchsCronJobs } = useContext(AppContext)
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const [matchs, setMatchs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  if (!user || user.role !== 'admin' && user.role !== 'manager') {
    return <Navigate to={'/'} replace />
  }

  const fetchMatchs = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/matchs/datas/to-update`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setMatchs(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs :', error);
    }
  };

  useEffect(() => {
    fetchMatchs()
  }, []);

  const handleUpdateMatch = async (matchId) => {
    try {
      const response = await axios.patch(`${apiUrl}/api/admin/matchs/datas/to-update/${matchId}`, null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        await fetchMatchs()
        setUpdateStatus(true);
        setUpdateMessage('Match mis à jour !');
        setIsModalOpen(true)
        setTimeout(function () {
          closeModal()
        }, 1500)
      } else {
        setUpdateStatus(false);
        setUpdateMessage('Erreur lors de la mise à jour du match : ' + response.data.message);
        setIsModalOpen(true)
      }
    } catch (error) {
      setUpdateStatus(false);
      console.log(error)
      setUpdateMessage('Erreur lors de la mise à jour du match : ' + error.response.data.message);
      setIsModalOpen(true)
    }
  };

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
        <span
          className="relative z-[2] w-full block border-2 border-black text-black px-3 py-1 text-center shadow-md bg-white transition -translate-y-1 translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0">
          <FontAwesomeIcon icon={faCaretLeft}/>
        </span>
      </Link>
      <h1 className="text-3xl font-black my-8 uppercase relative mx-auto text-center w-fit">Données des compétitions
        <span
          className="absolute left-0 bottom-0 text-flat-purple z-[-1] text-center transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">Données des compétitions</span>
        <span
          className="absolute left-0 bottom-0 text-green-lime z-[-2] text-center transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">Données des compétitions</span>
      </h1>
      <div className="py-3.5 px-2 mt-8 bg-black relative">
        <p
          className="bg-white text-black font-sans font-medium text-xs w-fit absolute leading-5 -top-3.5 left-2.5 py-0.5 px-1.5 rounded-full border-2 border-black shadow-flat-black-middle">Compétitions
          à mettre a jour</p>
        <ul className="flex flex-col justify-start">
          {matchs.length ? (
            matchs.map(match => {
              const utcDate = moment(match.utcDate)
              return (
                <li
                  className="relative flex flex-col justify-between border-2 border-black bg-white rounded-xl py-1 px-4 pt-4 h-fit shadow-flat-black my-4 shadow-flat-purple"
                  key={match.id}>
                  <p
                    className="username absolute font-title font-bold bg-deep-red text-white text-sm leading-5 -top-3.5 left-2.5 py-0.5 px-1.5 rounded-full border border-black shadow-flat-black">{match.id}</p>
                  <div className="flex flex-row justify-between">
                    <p className="name font-sans text-sm font-bold capitalize">{utcDate.format('DD MMMM YYYY')}</p>
                    <p className="name font-sans text-sm font-bold capitalize flex flex-row justify-center">
                      <span
                        className="inline-block bg-white shadow-flat-black text-black px-1 pb-0.5 font-title leading-4 font-medium text-sm mx-0.5 border-2 border-black">{utcDate.format('HH')}</span>
                      <span
                        className="inline-block bg-white shadow-flat-black text-black px-1 pb-0.5 font-title leading-4 font-medium text-sm mx-0.5 border-2 border-black">{utcDate.format('mm')}</span>
                      <span
                        className="inline-block bg-white shadow-flat-black text-black px-1 pb-0.5 font-title leading-4 font-medium text-sm mx-0.5 border-2 border-black">{utcDate.format('ss')}</span>
                    </p>
                  </div>
                  <div className="flex flex-row justify-between mt-2">
                    <div className="flex flex-row justify-between">
                      <img className="inline-block h-8 w-auto my-auto" src={match.HomeTeam.logoUrl}
                           alt={match.HomeTeam.name}/>
                      <span className="font-sans font-bold text-center block my-auto"> - </span>
                      <img className="inline-block h-8 w-auto my-auto" src={match.AwayTeam.logoUrl}
                           alt={match.AwayTeam.name}/>
                    </div>
                    <button
                      onClick={() => handleUpdateMatch(match.id)}
                      className="relative m-2 block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                    >
                    <span
                      className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
                      <FontAwesomeIcon icon={faCloudArrowDown}/>
                    </span>
                    </button>
                  </div>
                </li>
              )
            })
          ) : (
            <div className="py-3.5 px-2 bg-black">
              <li
                className="relative flex flex-col justify-between border-2 border-black bg-white rounded-xl py-4 px-4 h-fit shadow-flat-black my-4 shadow-flat-purple">
                <p className="name font-sans text-sm font-bold text-center">Aucune compétitions disponibles</p>
              </li>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}

export default AdminCompetitions;