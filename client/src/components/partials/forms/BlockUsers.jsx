import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import defaultUserImage from "../../../assets/components/user/default-user-profile.png";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const BlockUsers = ({ onSubmit, onClose, blocked }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentSeason, setCurrentSeason] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/users/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      }
    };

    const fetchCurrentSeason = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/seasons/current/61`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCurrentSeason(response.data.currentSeason);
      } catch (error) {
        console.error("Erreur lors de la récupération de la saison actuelle:", error);
      }
    };

    fetchCurrentSeason();
    fetchUsers();
  }, [token]);

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      // Si l'utilisateur est déjà sélectionné, on le retire du tableau
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      // Sinon, on l'ajoute
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ userId: selectedUsers });
  };

  return (
    <form
      className="rounded-[18px] mb-6 relative overflow-hidden p-2"
      onSubmit={handleSubmit}>
      <h2 translate="no" className="font-rubik uppercase font-bold text-l text-pretty leading-6 mb-8">{!blocked ? "Débloquer des utilisateurs" : "Bloquer des utilisateurs" }</h2>

      <div className="form-group mb-6 flex flex-col justify-between">
        <label translate="no" className="w-full font-rubik font-medium text-sm text-pretty" htmlFor="user">Utilisateur(s)</label>
        <div className={`relative w-full`}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          </div>
          {users.length > 0 ? (
          <div className="w-full border border-black rounded-md shadow-flat-black-adjust">
            <ul className="w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-auto">
              {users
                .filter(user =>
                  user.user_seasons &&
                  user.Roles.some(role => role.name !== 'admin') &&
                  user.user_seasons.some(season =>
                    season.season_id === currentSeason && season.is_active
                  )
                  &&
                  (blocked ? user.status === 'approved' : user.status === 'blocked')
                )
                .map(user => (
                <li
                  key={user.id}
                  onClick={() => toggleUserSelection(user.id)}
                  className={`cursor-pointer p-2 flex items-center ${selectedUsers.includes(user.id) ? 'bg-blue-medium' : ''}`}
                >
                  <img
                    src={user.img ? `${apiUrl}/uploads/users/${user.id}/${user.img}` : defaultUserImage}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover object-centermr-3"
                  />
                  <span translate="no" className={`${selectedUsers.includes(user.id) ? 'text-white' : ''}`}>{user.username}</span>
                  {selectedUsers.includes(user.id) && (
                    <span translate="no" className="ml-auto text-white font-bold">✔</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          ) : (
            <div translate="no" className="p-4">Chargement des utilisateurs...</div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button
          translate="no"
          className="form-submit-btn relative mt-16 mx-auto block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
          type="submit">
          <span translate="no"
              className={`relative z-[2] w-full flex flex-row justify-center border border-black  px-8 py-1 rounded-full text-center font-roboto text-base uppercase font-bold shadow-md ${blocked === true ? 'bg-red-medium text-white' : 'bg-green-medium text-black'} transition -translate-y-1 -translate-x-0 group-hover:-translate-y-0 group-hover:-translate-x-0`}>
            {blocked === true ? 'Bloquer' : 'Débloquer'}
          </span>
        </button>
      </div>
    </form>
  );
};

export default BlockUsers;
