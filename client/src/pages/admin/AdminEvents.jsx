import React, {useState} from 'react';
import {useCookies} from "react-cookie";
import axios from "axios";
import paperplane from "../../assets/icons/paper-plane-solid.svg";
import Loader from "../../components/partials/Loader.jsx";
import AlertModal from "../../components/partials/modals/AlertModal.jsx";
import SimpleTitle from "../../components/partials/SimpleTitle.jsx";
import BackButton from "../../components/nav/BackButton.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AdminEvents = () => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [error, setError] = useState(null);
  const [buttonActive, setButtonActive] = useState(false);

  const triggerNotification = async (notificationType) => {
    try {
      const response = await axios.post(`${apiUrl}/api/notifications/bets-close`, {
        notificationType: notificationType
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        setUpdateStatus(true);
        setUpdateMessage('Notification déclenchée avec succès !');
        setIsModalOpen(true);
        setTimeout(closeModal, 1500);
      } else {
        setUpdateStatus(false);
        setUpdateMessage('Erreur lors du déclenchement : ' + response.data.message);
        setIsModalOpen(true);
        setTimeout(closeModal, 2500);
      }
    } catch (error) {
      setUpdateStatus(false);
      console.log(error);
      setUpdateMessage('Erreur lors du déclenchement : ' + error.response.data.message);
      setIsModalOpen(true);
      setTimeout(closeModal, 2500);
    } finally {
      setButtonActive(true);
      setTimeout(() => {
        setButtonActive(false);
      }, 200);
    }
  };

  const triggerTestNotification = async () => {
    try {
      const response = await axios.post(`${apiUrl}/api/notifications/test`, null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        setUpdateStatus(true);
        setUpdateMessage('Notification déclenchée avec succès !');
        setIsModalOpen(true);
        setTimeout(closeModal, 1500);
      } else {
        setUpdateStatus(false);
        setUpdateMessage('Erreur lors du déclenchement : ' + response.data.message);
        setIsModalOpen(true);
        setTimeout(closeModal, 2500);
      }
    } catch (error) {
      setUpdateStatus(false);
      console.log(error);
      setUpdateMessage('Erreur lors du déclenchement : ' + error.response.data.message);
      setIsModalOpen(true);
      setTimeout(closeModal, 2500);
    } finally {
      setButtonActive(true);
      setTimeout(() => {
        setButtonActive(false);
      }, 200);
    }
  };

  const triggerTestFonction = async () => {
    try {
      const response = await axios.post(`${apiUrl}/api/admin/events/test`, null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        setUpdateStatus(true);
        setUpdateMessage('Notification déclenchée avec succès !');
        setIsModalOpen(true);
        setTimeout(closeModal, 1500);
      } else {
        setUpdateStatus(false);
        setUpdateMessage('Erreur lors du déclenchement : ' + response.data.message);
        setIsModalOpen(true);
        setTimeout(closeModal, 2500);
      }
    } catch (error) {
      setUpdateStatus(false);
      console.log(error);
      setUpdateMessage('Erreur lors du déclenchement : ' + error.response.data.message);
      setIsModalOpen(true);
      setTimeout(closeModal, 2500);
    } finally {
      setButtonActive(true);
      setTimeout(() => {
        setButtonActive(false);
      }, 200);
    }
  };

  const closeModal = () => {
    setUpdateStatus(false);
    setUpdateMessage('');
    setIsModalOpen(false);
  };

  if (error) return <p>Erreur : {error.message}</p>;

  if (isLoading) {
    return (
      <div className="text-center flex flex-col justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="inline-block relative w-full h-auto py-20">
      {isModalOpen && (
        <AlertModal message={updateMessage} type={updateStatus ? 'success' : 'error'}/>
      )}
      <BackButton />
      <SimpleTitle title={"Gestion des évènements"} />
      <div className="flex flex-col justify-start items-center px-4">
        <div className="flex flex-row justify-between items-center w-full my-4">
          <p className="btn btn-primary w-4/5 font-roboto font-medium text-xs flex flex-row justify-start items-center">
            <img className="w-auto h-[15px] mr-4" src={paperplane} alt="Icone modifier"/>
            <span>Pronos fermés demain</span>
          </p>
          <div>
            <button
              className={`w-14 h-7 flex items-center rounded-full border-2 border-black mx-3 px-1 shadow-flat-black-adjust transition-all duration-200 ease-out group focus:outline-none bg-gray-400 ${buttonActive ? 'bg-green-lime-deep' : ''}`}
              onClick={() => triggerNotification('dayBefore')}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full border-2 border-black shadow-md transform transition-all duration-200 ease-out ${buttonActive ? 'translate-x-6' : ''}`}></div>
            </button>
          </div>
        </div>

        <div className="flex flex-row justify-between items-center w-full my-4">
          <p className="btn btn-primary w-4/5 font-roboto font-medium text-xs flex flex-row justify-start items-center">
            <img className="w-auto h-[15px] mr-4" src={paperplane} alt="Icone modifier"/>
            <span>Pronos fermés dans 3h</span>
          </p>
          <div>
            <button
              className={`w-14 h-7 flex items-center rounded-full border-2 border-black mx-3 px-1 shadow-flat-black-adjust transition-all duration-200 ease-out group focus:outline-none bg-gray-400 ${buttonActive ? 'bg-green-lime-deep' : ''}`}
              onClick={() => triggerNotification('matchDay')}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full border-2 border-black shadow-md transform transition-all duration-200 ease-out ${buttonActive ? 'translate-x-6' : ''}`}></div>
            </button>
          </div>
        </div>

        <div className="flex flex-row justify-between items-center w-full my-4">
          <p className="btn btn-primary w-4/5 font-roboto font-medium text-xs flex flex-row justify-start items-center">
            <img className="w-auto h-[15px] mr-4" src={paperplane} alt="Icone modifier"/>
            <span>Notif test</span>
          </p>
          <div>
            <button
              className={`w-14 h-7 flex items-center rounded-full border-2 border-black mx-3 px-1 shadow-flat-black-adjust transition-all duration-200 ease-out group focus:outline-none bg-gray-400 ${buttonActive ? 'bg-green-lime-deep' : ''}`}
              onClick={() => triggerTestNotification()}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full border-2 border-black shadow-md transform transition-all duration-200 ease-out ${buttonActive ? 'translate-x-6' : ''}`}></div>
            </button>
          </div>
        </div>

        <div className="flex flex-row justify-between items-center w-full my-4">
          <p className="btn btn-primary w-4/5 font-roboto font-medium text-xs flex flex-row justify-start items-center">
            <img className="w-auto h-[15px] mr-4" src={paperplane} alt="Icone modifier"/>
            <span>Test Fonction</span>
          </p>
          <div>
            <button
              className={`w-14 h-7 flex items-center rounded-full border-2 border-black mx-3 px-1 shadow-flat-black-adjust transition-all duration-200 ease-out group focus:outline-none bg-gray-400 ${buttonActive ? 'bg-green-lime-deep' : ''}`}
              onClick={() => triggerTestFonction()}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full border-2 border-black shadow-md transform transition-all duration-200 ease-out ${buttonActive ? 'translate-x-6' : ''}`}></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;
