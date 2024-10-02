import React, { useEffect, useState } from 'react';
import axios from 'axios';
import penIcon from "../../assets/icons/pencil.svg";
import navClose from "../../assets/icons/nav-cross.svg";
import paperplane from "../../assets/icons/paper-plane-solid.svg";
import userAdd from "../../assets/icons/user-add.svg";
import StatusModal from "../../components/partials/modals/StatusModal.jsx";
import UserSelectionModal from '../../components/admin/UserSelectionModal.jsx';
import RewardForm from '../../components/admin/RewardForm';
import { useCookies } from "react-cookie";
import SimpleTitle from "../../components/partials/SimpleTitle.jsx";
import BackButton from "../../components/nav/BackButton.jsx";

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
  const [buttonActive, setButtonActive] = useState(false);

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
      await axios.delete(`${apiUrl}/api/admin/rewards/${id}`, {
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
      await axios.put(`${apiUrl}/api/admin/rewards/${reward.id}/activate`, { active: !reward.active }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setStatusMessage('Trophée désactivée avec succès');
      setStatus(true);
      setIsModalOpen(true);
      fetchRewards();
    } catch (error) {
      setStatusMessage('Erreur lors de la désactivation du trophée');
      setStatus(false);
      setIsModalOpen(true);
      console.error('Erreur lors de la désactivation du trophée:', error);
    }
  };

  const triggerEvent = async (eventName) => {
    try {
      const response = await axios.post(`${apiUrl}/api/admin/rewards/events/${eventName}`, null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
        setStatus(true);
        setStatusMessage('Évènement déclenché avec succès !');
      } else {
        setStatus(false);
        setStatusMessage('Erreur lors du déclenchement de l\'événement : ' + response.data.message);
      }
    } catch (error) {
      setStatus(false);
      setStatusMessage('Erreur lors du déclenchement de l\'événement : ' + error.response?.data?.message || error.message);
    } finally {
      setIsModalOpen(true);
      setButtonActive(true);
      setTimeout(() => {
        setButtonActive(false);
        setIsModalOpen(false);
      }, 2000);
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
      <BackButton />
      <SimpleTitle title={"Gestion des trophées"} />
      <button
        onClick={() => {
          setSelectedReward(null);
          setShowForm(true);
        }}
        className="w-4/5 block relative my-8 mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
      >
          <span
            className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-l font-roboto px-3 py-2 rounded-full text-center shadow-md bg-green-medium transition -translate-y-1.5 group-hover:-translate-y-0">
            Ajouter un Trophée
          </span>
        </button>
        <ul className="px-4">
          {rewards.map((reward) => (
            <li key={reward.id} className="relative border-2 border-black shadow-flat-black rounded my-6 py-2 px-4 flex flex-row flex-wrap justify-between items-center space-x-4">
              <p className="absolute -top-3 -left-3 font-roboto text-center before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-green-lime before:translate-x-0.5 before:translate-y-0.5 before:border-black before:border group">
                <span className="relative block z-[2] text-white bg-black rounded-full font-[100%] w-[25px] h-[25px]">{reward.id}</span>
              </p>
              <p className="w-full font-roboto text-base text-center font-medium">{reward.name}</p>
              <div className="flex flex-col max-w-[50%]">
                <img src={`${apiUrl}/uploads/trophies/${reward.id}/${reward.image}`} alt={reward.name} className="w-auto h-[135px]"/>
              </div>
              <div className="flex flex-row justify-end max-w-[50%]">
                <button onClick={() => handleEdit(reward)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded shadow-flat-black-adjust transition-shadow duration-300 ease-out hover:shadow-none">
                  <img className="w-auto h-[20px]" src={penIcon} alt="Icone modifier"/>
                </button>
                {/*<button onClick={() => handleDelete(reward.id)}*/}
                {/*        className="bg-red-500 text-white px-2 py-1 mx-2 rounded shadow-flat-black-adjust transition-shadow duration-300 ease-out hover:shadow-none">*/}
                {/*  <img className="w-auto h-[20px]" src={navClose} alt="Icone modifier"/>*/}
                {/*</button>*/}
                <button
                  className="bg-blue-500 text-white px-2 py-1 ml-2 rounded shadow-flat-black-adjust transition-shadow duration-300 ease-out hover:shadow-none"
                  onClick={() => triggerEvent(reward.slug)}
                  disabled={buttonActive}
                >
                  <img className="w-auto h-[20px]" src={paperplane} alt="Icone modifier"/>
                </button>
                <button onClick={() => openUserSelectionModal(reward)}
                        className="bg-green-500 text-white px-2 py-1 ml-2 rounded shadow-flat-black-adjust transition-shadow duration-300 ease-out hover:shadow-none">
                  <img className="w-auto h-[20px]" src={userAdd} alt="Icone modifier"/>
                </button>
                <button
                  className={`w-[70px] h-[27px] flex items-center rounded-full ml-2 border-2 border-black px-1 shadow-flat-black-adjust focus:outline-none ${reward.active ? 'bg-green-lime-deep' : 'bg-gray-400'}`}
                  onClick={() => toggleActive(reward)}
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
        <UserSelectionModal reward={selectedRewardForUser} onClose={closeUserSelectionModal}/>
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
      {isUserSelectionModalOpen && (
        <UserSelectionModal reward={selectedRewardForUser} onClose={closeUserSelectionModal}/>
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