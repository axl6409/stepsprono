import React, {useContext, useEffect, useState} from 'react';
import {useCookies} from "react-cookie";
import {UserContext} from "../../contexts/UserContext.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faCloudArrowDown,
  faDatabase,
  faRankingStar
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import {AppContext} from "../../contexts/AppContext.jsx";
import AlertModal from "../../components/partials/modals/AlertModal.jsx";
import SimpleTitle from "../../components/partials/SimpleTitle.jsx";
import BackButton from "../../components/nav/BackButton.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AdminBets = () => {
  const { user } = useContext(UserContext)
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const [bets, setBets] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const { fetchAPICalls } = useContext(AppContext);

  useEffect(() => {
    fetchBetsUnchecked()
  }, [user, token]);

  const fetchBetsUnchecked = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/bets/unchecked`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setBets(response.data.bets);
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs :', error);
    }
  };

  const handleUpdateSingleBet = async (betId) => {
    try {
      const response = await axios.patch(`${apiUrl}/api/admin/bets/checkup/${betId}`, null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        fetchBetsUnchecked()
        handleSuccess('Pronostic vérifié !', 1500)
      } else {
        handleError('Erreur lors de la vérification du pronostic !', 1500)
      }
    } catch (error) {
      handleError(error.response.data.message)
    }
  };

  const handleUpdateAll = async () => {
    try {
      const response = await axios.patch(`${apiUrl}/api/admin/bets/update/all`, null,{
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        fetchBetsUnchecked()
        handleSuccess('Pronostics vérifiés !', 1500)
      } else {
        handleError('Erreur lors de la vérification des pronostics !', 1500)
      }
    } catch (error) {
      handleError('Erreur lors de la vérification des pronostics !' + error, 1500)
    }
  };

  const handleCheckAll = async () => {
    try {
      const betIds = bets.map(bet => bet.id);
      const response = await axios.patch(`${apiUrl}/api/admin/bets/checkup/all`, betIds, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        fetchBetsUnchecked()
        handleSuccess('Pronostics vérifiés !', 1500)
      } else {
        handleError('Erreur lors de la vérification des pronostics !', 1500)
      }
    } catch (error) {
      handleError('Erreur lors de la vérification des pronostics !' + error, 1500)
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
    }, 10000);
  };

  return (
    <div className="inline-block w-full h-auto py-20">
      <AlertModal message={alertMessage} type={alertType} />
      <BackButton />
      <SimpleTitle title={"Données des pronostics"} />
      <div className="pb-3.5 pt-6 px-2 bg-black relative">
        <p className="bg-white text-black font-sans font-medium text-xs w-fit absolute leading-5 -top-3.5 left-2.5 py-0.5 px-1.5 rounded-full border-2 border-black shadow-flat-black-middle">Pronostics non-vérifiés</p>
        <div className="w-fit absolute -top-5 right-2.5 rounded-full flex flex-row">
          <button
            onClick={() => handleCheckAll()}
            className="relative m-2 block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
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
          {bets.length ? (
            bets.map(bet => {
              return (
                <li
                  className="relative flex flex-col justify-between border-2 border-black bg-white rounded-xl py-2 px-4 h-fit shadow-flat-black my-2 shadow-flat-purple"
                  key={bet.id}>
                  <div className="flex flex-row justify-between">
                    <div className="flex flex-col w-1/2">
                      <p
                        className="inline-block text-center font-sans text-sm font-bold leading-5 my-auto">{bet.id}</p>
                    </div>
                    <div className="flex flex-row w-1/2">
                      <div>
                        <span className="text-xxxs font-sans font-bold leading-[12px] inline-block text-center">check bet</span>
                        <button
                          onClick={() => handleUpdateSingleBet(bet.id)}
                          className="relative my-2 mx-auto block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
                        >
                          <span
                            className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-2 py-1.5 rounded-full text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-0.5 group-hover:-translate-y-0 group-hover:-translate-x-0">
                          <FontAwesomeIcon icon={faDatabase} />
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
                <p className="name font-sans text-sm font-bold text-center">Tous les pronostics sont vérifiés</p>
              </li>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}

export default AdminBets;