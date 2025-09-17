import React, {useContext, useEffect, useState} from 'react';
import {useCookies} from "react-cookie";
import {UserContext} from "../../contexts/UserContext.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFlagCheckered} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import moment from "moment";
import {AppContext} from "../../contexts/AppContext.jsx";
import AlertModal from "../../components/modals/AlertModal.jsx";
import WeekMatchesToggle from "../../components/admin/WeekMatchesToggle.jsx";
import SimpleTitle from "../../components/partials/SimpleTitle.jsx";
import BackButton from "../../components/nav/BackButton.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AdminMatchs = () => {
  const { user } = useContext(UserContext)
  const { fetchMatchsCronJobs } = useContext(AppContext)
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const [matchs, setMatchs] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    fetchMatchs()
  }, [user, token]);

  const fetchMatchs = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/matchs/no-checked`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const uncheckedMatchs = response.data.data;
      const sortedMatchs = uncheckedMatchs.sort((a, b) => new Date(a.utc_date) - new Date(b.utc_date));
      setMatchs(sortedMatchs);
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs :', error);
    }
  };

  const handleUpdateMatch = async (matchId) => {
    try {
      const response = await axios.patch(`${apiUrl}/api/admin/matchs/update/results/${matchId}`, null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        await fetchMatchs()
        handleSuccess('Résultats mis à jour !', 1500)
      } else {
        handleError('Erreur lors de la mise à jour des resultats', 1500)
      }
    } catch (error) {
      handleError(error, 1500)
    }
  };

  const handleProgramMatchsTasks = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/matchs/program-tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        await fetchMatchs()
        handleSuccess('Tâches programmées récupérées !', 1500)
      } else {
        handleError('Erreur lors de la récupération des tâches programmées', 1500)
      }
    } catch (error) {
      handleError(error, 1500)
    }
  }

  const handleUpdateRequireDetails = async () => {
    try {
      const response = await axios.post(`${apiUrl}/api/admin/matchs/update-require-details`, null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        handleSuccess('Détails requis mis à jour !', 1500);
        fetchMatchs();
      } else {
        handleError('Erreur lors de la mise à jour des détails requis', 1500);
      }
    } catch (error) {
      handleError(error.message, 1500);
    }
  };

  const handleSuccess = (message, timeout) => {
    setAlertMessage(message);
    setAlertType('success');
    setTimeout(() => {
      setAlertMessage('')
    }, timeout);
  };

  const handleError = (message) => {
    setAlertMessage(message);
    setAlertType('error');
    setTimeout(() => {
      setAlertMessage('')
    }, 2000);
  };

  return (
    <div className="inline-block relative z-20 w-full h-auto py-20 px-4">
      <AlertModal message={alertMessage} type={alertType}/>
      <BackButton />
      <SimpleTitle title={"Données des matchs"} stickyStatus={false} uppercase={true} fontSize={'2rem'} />

      <button
        translate="no"
        onClick={handleProgramMatchsTasks}
        className="w-fit fade-in block relative my-4 mr-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
      >
        <span className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto px-3 py-1 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1 group-hover:-translate-y-0">Tâches auto matchs update</span>
      </button>
      <button
        translate="no"
        onClick={handleUpdateRequireDetails}
        className="w-fit fade-in block relative my-4 mr-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
      >
        <span className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto px-3 py-1 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1 group-hover:-translate-y-0">Tâches auto matchs update</span>
      </button>

      <div className="py-4 px-2 border border-black rounded-xl bg-white shadow-flat-black">
        <div>
          <h1 className="font-rubik text-center text-black uppercase text-sm mb-8 font-bold">Gestion des matchs de la semaine</h1>
          <WeekMatchesToggle token={token}/>
        </div>
        <div className="py-3.5 px-3 mt-8 bg-black relative rounded-xl">
          <p
            className="bg-white text-black font-sans font-medium text-xs w-fit absolute leading-5 -top-3.5 left-2.5 py-0.5 px-1.5 rounded-full border-2 border-black shadow-flat-black-middle">Matchs
            non commencés</p>
          <ul className="flex flex-col justify-start">
            {matchs.length ? (
              matchs.map(match => {
                const utcDate = moment(match.utc_date)
                return (
                  <li
                    className="relative flex flex-col justify-between border border-black bg-white rounded-xl py-1 px-4 pt-4 h-fit my-4 shadow-flat-lime-adjust"
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
                    <div className="flex flex-row justify-between my-2">
                      <div className="flex flex-row justify-between">
                        <img className="inline-block h-12 w-auto my-auto"
                             src={apiUrl + "/uploads/teams/" + match.HomeTeam.id + "/" + match.HomeTeam.logo_url}
                             alt={match.HomeTeam.name}/>
                        <span className="font-sans font-bold text-center block my-auto"> - </span>
                        <img className="inline-block h-12 w-auto my-auto"
                             src={apiUrl + "/uploads/teams/" + match.AwayTeam.id + "/" + match.AwayTeam.logo_url}
                             alt={match.AwayTeam.name}/>
                      </div>
                      <button
                        onClick={() => handleUpdateMatch(match.id)}
                        className="relative m-2 block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                      >
                    <span
                      className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
                      <FontAwesomeIcon icon={faFlagCheckered}/>
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
                  <p className="name font-sans text-sm font-bold text-center">Tous les matchs sont à jour</p>
                </li>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminMatchs;