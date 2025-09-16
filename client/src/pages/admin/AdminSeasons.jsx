import React, { useState } from 'react';
import { useCookies } from "react-cookie";
import axios from "axios";
import StatusModal from "../../components/modals/StatusModal.jsx";
import SimpleTitle from "../../components/partials/SimpleTitle.jsx";
import BackButton from "../../components/nav/BackButton.jsx";
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
        <BackButton />
        {isModalOpen && (
            <StatusModal message={updateMessage} status={updateStatus} closeModal={closeModal}/>
        )}
        <SimpleTitle title={"Données des saisons"} stickyStatus={false} uppercase={true} fontSize={'2rem'} />
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