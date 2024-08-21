import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import arrowIcon from "../../assets/icons/arrow-left.svg";
import penIcon from "../../assets/icons/pencil.svg";
import navClose from "../../assets/icons/nav-cross.svg";
import userAdd from "../../assets/icons/user-add.svg";
import StatusModal from "../../components/partials/modals/StatusModal.jsx";
import UserSelectionModal from '../../components/admin/UserSelectionModal.jsx';
import RewardForm from '../../components/admin/RewardForm';
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
  const [selectedRewardForUser, setSelectedRewardForUser] = useState(null);
  const [isUserSelectionModalOpen, setIsUserSelectionModalOpen] = useState(false);

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
      const sortedRewards = response.data.sort((a, b) => a.name.localeCompare(b.name));
      setRewards(sortedRewards);
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

  const toggleActive = async (reward) => {
    try {
      await axios.put(`${apiUrl}/api/rewards/${reward.id}/activate`, { active: !reward.active }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      fetchRewards();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du trophée:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openUserSelectionModal = (reward) => {
    setSelectedRewardForUser(reward);
    setIsUserSelectionModalOpen(true);
  };

  const closeUserSelectionModal = () => {
    setIsUserSelectionModalOpen(false);
    setSelectedRewardForUser(null);
  };

  return (
      <div className="inline-block w-full h-auto py-20">
        <Link
            to="/admin"
            className="swiper-button-prev w-[30px] h-[30px] rounded-full bg-white top-7 left-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
        >
          <img src={arrowIcon} alt="Icône flèche" />
        </Link>
        <h1
          className={`font-black mb-12 text-center relative w-fit mx-auto text-xl4 leading-[50px]`}>Gestion des trophées
          <span
            className="absolute left-0 top-0 right-0 text-purple-soft z-[-1] translate-x-0.5 translate-y-0.5">Gestion des trophées</span>
          <span
            className="absolute left-0 top-0 right-0 text-green-soft z-[-2] translate-x-1 translate-y-1">Gestion des trophées</span>
        </h1>
        <button
          onClick={() => {
            setSelectedReward(null);
            setShowForm(true);
          }}
          className="w-4/5 block relative my-8 mx-auto before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
        >
          <span
            className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-green-medium transition -translate-y-1.5 group-hover:-translate-y-0">
            Ajouter un Trophée
          </span>
        </button>
        <ul className="px-4">
          {rewards.map((reward) => (
            <li key={reward.id} className="flex flex-row flex-wrap justify-between items-center space-x-4">
              <p>{reward.id}</p>
              <p className="w-full text-left font-sans font-medium">{reward.name}</p>
              <div className="flex flex-col max-w-[50%]">
                <img src={`${apiUrl}/uploads/trophies/${reward.image}`} alt={reward.name} className="w-auto h-[135px]"/>
              </div>
              <div className="flex flex-row justify-end max-w-[50%]">
                <button onClick={() => handleEdit(reward)} className="bg-yellow-500 text-white px-2 py-1 rounded">
                  <img className="w-auto h-[20px]" src={penIcon} alt="Icone modifier"/>
                </button>
                <button onClick={() => handleDelete(reward.id)}
                        className="bg-red-500 text-white px-2 py-1 mx-2 rounded">
                  <img className="w-auto h-[20px]" src={navClose} alt="Icone modifier"/>
                </button>
                <button onClick={() => openUserSelectionModal(reward)}
                        className="bg-green-500 text-white px-2 py-1 rounded">
                  <img className="w-auto h-[20px]" src={userAdd} alt="Icone modifier"/>
                </button>
                <button
                  className={`w-[70px] h-[27px] flex items-center rounded-full ml-2 border-2 border-black px-1 shadow-flat-black-adjust focus:outline-none ${reward.active ? 'bg-green-lime-deep' : 'bg-gray-400'}`}
                  onClick={() => toggleActive(reward.id)}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full border-2 border-black shadow-md transition-transform duration-200 ease-out transform ${reward.active ? 'translate-x-6' : ''}`}
                  ></div>
                </button>
              </div>
            </li>
          ))}
        </ul>
        {isUserSelectionModalOpen && (
          <UserSelectionModal reward={selectedRewardForUser} onClose={closeUserSelectionModal} />
        )}
        {showForm && (
          <div className="fixed z-[10] inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded shadow-lg">
              <RewardForm reward={selectedReward} onClose={() => {
                setShowForm(false);
                fetchRewards();
              }}/>
            </div>
          </div>
        )}
        {isModalOpen && (
          <StatusModal message={statusMessage} status={status} closeModal={closeModal}/>
        )}
      </div>
  );
};

export default AdminRewards;
