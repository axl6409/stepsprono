import React, { useContext, useState } from 'react';
import { useCookies } from "react-cookie";
import axios from "axios";
import { UserContext } from "../../../contexts/UserContext.jsx";
import StatusModal from "../../partials/modals/StatusModal.jsx";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AdminSeasons = () => {
  const { user } = useContext(UserContext);
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCheckAndAddSeason = async (competitionId) => {
    try {
      const response = await axios.get(`${apiUrl}/api/seasons/check-and-add/${competitionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUpdateStatus(true);
      setUpdateMessage(response.data.message);
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

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return <div>Accès non autorisé</div>;
  }

  return (
    <div className="admin-seasons">
      {isModalOpen && (
        <StatusModal message={updateMessage} status={updateStatus} closeModal={closeModal} />
      )}
      <h1 className="text-3xl font-black my-8 uppercase">Gestion des Saisons</h1>
      <button onClick={() => handleCheckAndAddSeason(1)} className="btn btn-primary">
        Vérifier et Ajouter la Saison Suivante
      </button>
    </div>
  );
};

export default AdminSeasons;