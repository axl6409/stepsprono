import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import defaultUserImage from "../../../assets/components/user/default-user-profile.png";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const ContributionForm = ({ onSubmit, onClose }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [users, setUsers] = useState([]);
  const [matchdays, setMatchdays] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedMatchday, setSelectedMatchday] = useState("");

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

    const fetchMatchdays = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/matchs/days/passed`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setMatchdays(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des matchdays:", error);
      }
    };

    fetchUsers();
    fetchMatchdays();
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
    onSubmit({ userId: selectedUsers, matchday: selectedMatchday });
  };

  return (
    <form
      className="rounded-[18px] mb-6 relative overflow-hidden p-2"
      onSubmit={handleSubmit}>
      <h2 className="font-rubik uppercase font-bold text-l text-pretty leading-6 mb-8">Ajouter une <br/>contribution</h2>

      <div className="form-group mb-6 flex flex-row justify-between">
        <label className="w-1/3 font-rubik font-medium text-sm text-pretty" htmlFor="user">Utilisateur(s)</label>
        <div className="relative w-2/3">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          </div>
          <div className="w-full border border-black rounded-md shadow-flat-black-adjust">
            {users.length > 0 ? (
              <ul className="w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-auto">
                {users.map(user => (
                  <li
                    key={user.id}
                    onClick={() => toggleUserSelection(user.id)}
                    className={`cursor-pointer p-2 flex items-center ${selectedUsers.includes(user.id) ? 'bg-blue-medium' : ''}`}
                  >
                    <img
                      src={user.img ? `${apiUrl}/uploads/users/${user.id}/${user.img}` : defaultUserImage}
                      alt={user.username}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <span className={`${selectedUsers.includes(user.id) ? 'text-white' : ''}`}>{user.username}</span>
                    {selectedUsers.includes(user.id) && (
                      <span className="ml-auto text-white font-bold">✔</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4">Chargement des utilisateurs...</div>
            )}
          </div>
        </div>
      </div>

      <div className="form-group mb-6 flex flex-row justify-between">
        <label className="w-1/3 font-rubik font-medium text-sm text-pretty" htmlFor="matchday">Matchday</label>
        <select
          id="matchday"
          className="relative w-2/3 border border-black rounded-md shadow-flat-black-adjust py-1"
          value={selectedMatchday}
          onChange={(e) => setSelectedMatchday(e.target.value)}
          required
        >
          <option value="">Quelle journée ?</option>
          {matchdays.map((matchday) => (
            <option key={matchday} value={matchday}>
              Journée {matchday}
            </option>
          ))}
        </select>
      </div>

      <div className="form-actions">
        <button
          className="form-submit-btn relative mt-16 mx-auto block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
          type="submit">
          <span translate="no"
                className={`relative z-[2] w-full flex flex-row justify-center border border-black text-black px-8 py-1 rounded-full text-center font-roboto text-base uppercase font-bold shadow-md bg-green-soft transition -translate-y-1 -translate-x-0 group-hover:-translate-y-0 group-hover:-translate-x-0`}>
              Ajouter
            </span>
        </button>
      </div>
    </form>
  );
};

export default ContributionForm;
