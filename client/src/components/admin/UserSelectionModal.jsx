import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from "react-cookie";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const UserSelectionModal = ({ reward, onClose }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    // Récupérez la liste des utilisateurs
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
      }
    };

    fetchUsers();
  }, [token]);

  const handleAssignReward = async () => {
    try {
      await axios.post(`${apiUrl}/api/admin/reward/attribute`, {
        user_id: selectedUserId,
        reward_id: reward.id,
        count: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'attribution du trophée:', error);
    }
  };

  return (
    <div className="fixed z-[10] inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded shadow-lg">
        <h2 className="text-lg font-bold mb-4">Attribuer {reward.name} à un utilisateur</h2>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
        >
          <option value="">Sélectionner un utilisateur</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
        <div className="flex justify-between">
          <button onClick={handleAssignReward} className="bg-green-500 text-white px-4 py-2 rounded">
            Attribuer
          </button>
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSelectionModal;
