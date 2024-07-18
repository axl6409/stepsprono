import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import arrowIcon from "../../assets/icons/arrow-left.svg";
import StatusModal from "../../components/partials/modals/StatusModal.jsx";
import RewardForm from '../../components/admin/RewardForm'; // Assurez-vous que le chemin est correct
import { useCookies } from "react-cookie";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AdminRewards = () => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/rewards`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setRewards(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des trophées:', error);
    }
  };

  const handleEdit = (reward) => {
    setSelectedReward(reward);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/rewards/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setStatusMessage('Trophée supprimé avec succès');
      setStatus(true);
      setIsModalOpen(true);
      fetchRewards();
    } catch (error) {
      setStatusMessage('Erreur lors de la suppression du trophée');
      setStatus(false);
      setIsModalOpen(true);
      console.error('Erreur lors de la suppression du trophée:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
      <div className="inline-block w-full h-auto py-20">
        <Link
            to="/dashboard"
            className="swiper-button-prev w-[30px] h-[30px] rounded-full bg-white top-7 left-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
        >
          <img src={arrowIcon} alt="Icône flèche" />
        </Link>
        <h1 className="text-2xl font-bold mb-4">Administration des Trophées</h1>
        <button
            onClick={() => { setSelectedReward(null); setShowForm(true); }}
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Ajouter un Trophée
        </button>
        <ul className="space-y-4">
          {rewards.map((reward) => (
              <li key={reward.id} className="flex items-center space-x-4">
                <img src={`${apiUrl}/uploads/trophies/${reward.image}`} alt={reward.name} className="w-12 h-12" />
                <p className="flex-1">{reward.name}</p>
                <button onClick={() => handleEdit(reward)} className="bg-yellow-500 text-white px-2 py-1 rounded">
                  Éditer
                </button>
                <button onClick={() => handleDelete(reward.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                  Supprimer
                </button>
                <input
                    type="checkbox"
                    checked={reward.active}
                    onChange={async () => {
                      try {
                        await axios.put(`${apiUrl}/rewards/${reward.id}`, { active: !reward.active });
                        fetchRewards();
                      } catch (error) {
                        console.error('Erreur lors de la mise à jour du trophée:', error);
                      }
                    }}
                    className="ml-2"
                />
              </li>
          ))}
        </ul>
        {showForm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-8 rounded shadow-lg">
                <RewardForm reward={selectedReward} onClose={() => { setShowForm(false); fetchRewards(); }} />
              </div>
            </div>
        )}
        {isModalOpen && (
            <StatusModal message={statusMessage} status={status} closeModal={closeModal} />
        )}
      </div>
  );
};

export default AdminRewards;
