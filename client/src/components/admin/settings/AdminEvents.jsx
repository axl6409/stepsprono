import React, {useEffect, useState} from 'react';
import {useCookies} from "react-cookie";
import {Link} from "react-router-dom";
import axios from "axios";
import arrowIcon from "../../../assets/icons/arrow-left.svg";
import downloadIcon from "../../../assets/icons/download-icon.svg";
import Loader from "../../partials/Loader.jsx";
import AlertModal from "../../partials/modals/AlertModal.jsx";
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
      }
    } catch (error) {
      setUpdateStatus(false);
      console.log(error)
      setUpdateMessage('Erreur lors du déclenchement de l\'évènement : ' + error.response.data.message);
      setIsModalOpen(true)
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
      <Link
        to="/admin"
        className="swiper-button-prev w-[30px] h-[30px] rounded-full bg-white top-7 left-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
      >
        <img src={arrowIcon} alt="Icône flèche"/>
      </Link>
      <h1 className={`font-black mb-12 text-center relative w-fit mx-auto text-xl4 leading-[50px]`}>
        Gestion des évènements
        <span
          className="absolute left-0 top-0 right-0 text-purple-soft z-[-1] translate-x-0.5 translate-y-0.5">Gestion des évènements</span>
        <span className="absolute left-0 top-0 right-0 text-green-soft z-[-2] translate-x-1 translate-y-1">Gestion des évènements</span>
      </h1>
      <div className="flex flex-col justify-start items-center">
        <div className="flex flex-row justify-between items-center">
          <p className="btn btn-primary w-4/5">
            Déclancher l'évènement <strong>weekEnded</strong>
          </p>
          <div>
            <button
              className={`w-14 h-7 flex items-center rounded-full border-2 border-black mx-3 px-1 shadow-flat-black-adjust transition-all duration-200 ease-out group focus:outline-none bg-gray-400 ${buttonActive ? 'bg-green-lime-deep' : ''}`}
              onClick={() => triggerEvent('weekEnded')}
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
