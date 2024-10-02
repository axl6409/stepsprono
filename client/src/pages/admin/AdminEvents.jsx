import React, {useState} from 'react';
import {useCookies} from "react-cookie";
import axios from "axios";
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

  const triggerEvent = async (eventName) => {
    try {
      const response = await axios.post(`${apiUrl}/api/admin/events/${eventName}`, null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        setUpdateStatus(true);
        setUpdateMessage('Évènement déclanché !');
        setIsModalOpen(true)
        setTimeout(function () {
          closeModal()
        }, 1500)
      } else {
        setUpdateStatus(false);
        setUpdateMessage('Erreur lors du déclenchement de l\'évènement : ' + response.data.message);
        setIsModalOpen(true)
        setTimeout(function () {
          closeModal()
        }, 2500)
      }
    } catch (error) {
      setUpdateStatus(false);
      console.log(error)
      setUpdateMessage('Erreur lors du déclenchement de l\'évènement : ' + error.response.data.message);
      setIsModalOpen(true)
      setTimeout(function () {
        closeModal()
      }, 2500)
    } finally {
      setButtonActive(true);
      setTimeout(() => {
        setButtonActive(false);
      }, 200);
    }
  };

  const triggerNotification = async () => {
    try {
      const response = await axios.post(`${apiUrl}/api/notifications/send`, null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        setUpdateStatus(true);
        setUpdateMessage('Évènement déclanché !');
        setIsModalOpen(true)
        setTimeout(function () {
          closeModal()
        }, 1500)
      } else {
        setUpdateStatus(false);
        setUpdateMessage('Erreur lors du déclenchement de l\'évènement : ' + response.data.message);
        setIsModalOpen(true)
        setTimeout(function () {
          closeModal()
        }, 2500)
      }
    } catch (error) {
      setUpdateStatus(false);
      console.log(error)
      setUpdateMessage('Erreur lors du déclenchement de l\'évènement : ' + error.response.data.message);
      setIsModalOpen(true)
      setTimeout(function () {
        closeModal()
      }, 2500)
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
      <div className="flex flex-col justify-start items-center">
        <div className="flex flex-row justify-between items-center">
          <p className="btn btn-primary w-4/5">
            Déclancher l'évènement <strong>testEvent</strong>
          </p>
          <div>
            <button
              className={`w-14 h-7 flex items-center rounded-full border-2 border-black mx-3 px-1 shadow-flat-black-adjust transition-all duration-200 ease-out group focus:outline-none bg-gray-400 ${buttonActive ? 'bg-green-lime-deep' : ''}`}
              onClick={() => triggerEvent('testEvent')}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full border-2 border-black shadow-md transform transition-all duration-200 ease-out ${buttonActive ? 'translate-x-6' : ''}`}></div>
            </button>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center">
          <p className="btn btn-primary w-4/5">
            Déclancher une notification
          </p>
          <div>
            <button
              className={`w-14 h-7 flex items-center rounded-full border-2 border-black mx-3 px-1 shadow-flat-black-adjust transition-all duration-200 ease-out group focus:outline-none bg-gray-400 ${buttonActive ? 'bg-green-lime-deep' : ''}`}
              onClick={() => triggerNotification()}
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
