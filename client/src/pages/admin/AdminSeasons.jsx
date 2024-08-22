import React, { useState } from 'react';
import { useCookies } from "react-cookie";
import axios from "axios";
import StatusModal from "../../components/partials/modals/StatusModal.jsx";
import arrowIcon from "../../assets/icons/arrow-left.svg";
import {Link} from "react-router-dom";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AdminSeasons = () => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCheckAndAddSeason = async (competitionId) => {
    try {
      const response = await axios.post(`${apiUrl}/api/admin/seasons/check-and-add/${competitionId}`, null,{
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUpdateStatus(true);
      setUpdateMessage(response.data.newSeason.message);
      setIsModalOpen(true);
    } catch (error) {
      setUpdateStatus(false);
      setUpdateMessage('Erreur lors de la vérification et de l\'ajout de la saison : ' + error.message);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setUpdateStatus(false);
    setUpdateMessage('');
    setIsModalOpen(false);
  };

  return (
      <div className="inline-block w-full h-auto py-20">
        <Link
            to="/admin"
            className="swiper-button-prev w-[30px] h-[30px] rounded-full bg-white top-7 left-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
        >
          <img src={arrowIcon} alt="Icône flèche"/>
        </Link>
        {isModalOpen && (
            <StatusModal message={updateMessage} status={updateStatus} closeModal={closeModal}/>
        )}
        <h1
            className={`font-black mb-12 text-center relative w-fit mx-auto text-xl4 leading-[50px]`}>Gestion des saisons
          <span
              className="absolute left-0 top-0 right-0 text-purple-soft z-[-1] translate-x-0.5 translate-y-0.5">Gestion des saisons</span>
          <span
              className="absolute left-0 top-0 right-0 text-green-soft z-[-2] translate-x-1 translate-y-1">Gestion des saisons</span>
        </h1>
        <div className="flex flex-col justify-start items-center">
          <div className="flex flex-row justify-between items-center">
            <p className="btn btn-primary w-4/5">
              Vérifier et ajouter la saison suivante
            </p>
            <div>
              <button
                  className={`w-14 h-7 flex items-center rounded-full border-2 border-black mx-3 px-1 shadow-flat-black-adjust focus:outline-none focus:bg-green-lime-deep bg-gray-400'}`}
                  onClick={() => handleCheckAndAddSeason(61)}
              >
                <div
                    className={`bg-white w-5 h-5 rounded-full border-2 border-black shadow-md transform focus:translate-x-6`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AdminSeasons;