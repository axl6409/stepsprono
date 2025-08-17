import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import defaultUserImage from "../../../assets/components/user/default-user-profile.png";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
import UserMultiSelect from "./fields/UserMultiSelect.jsx";

const ContributionForm = ({ onSubmit, onClose }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [users, setUsers] = useState([]);
  const [matchdays, setMatchdays] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedMatchday, setSelectedMatchday] = useState("");
  const [amount, setAmount] = useState(0);

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
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ userId: selectedUsers, matchday: selectedMatchday, amount: amount });
  };

  return (
    <form
      className="rounded-[18px] mb-6 relative overflow-hidden p-2"
      onSubmit={handleSubmit}>
      <h2 translate="no" className="font-rubik uppercase font-bold text-l text-pretty leading-6 mb-8">Ajouter une <br/>contribution</h2>

      <div className="form-group mb-6 flex flex-row justify-between">
        <label translate="no" className="w-1/3 font-rubik font-medium text-sm text-pretty" htmlFor="user">Utilisateur(s)</label>
        <UserMultiSelect
          items={users}
          value={selectedUsers}
          onChange={setSelectedUsers}
          getLabel={(u) => u.username}
          getAvatar={(u) => u.img ? `${apiUrl}/uploads/users/${u.id}/${u.img}` : defaultUserImage}
          placeholder="Choisir des utilisateurs…"
        />
      </div>

      <div className="form-group mb-6 flex flex-row justify-between">
        <label translate="no" className="w-1/3 font-rubik font-medium text-sm text-pretty" htmlFor="matchday">Matchday</label>
        <select
          translate="no"
          id="matchday"
          className="relative w-2/3 border border-black rounded-md shadow-flat-black-adjust py-1"
          value={selectedMatchday}
          onChange={(e) => setSelectedMatchday(e.target.value)}
          required
        >
          <option translate="no" value="">Quelle journée ?</option>
          <option translate="no" value="1">1</option>
          {matchdays.map((matchday) => (
            <option key={matchday} value={matchday}>
              Journée {matchday}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group mb-6 flex flex-row justify-between">
        <label translate="no" className="w-1/3 font-rubik font-medium text-sm text-pretty" htmlFor="matchday">Montant</label>
        <select
          translate="no"
          id="matchday"
          className="relative w-2/3 border border-black rounded-md shadow-flat-black-adjust py-1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        >
          <option translate="no" value="">Montant</option>
          <option translate="no" key="5" value="5">
            5€
          </option>
          <option translate="no" key="10" value="10">
            10€
          </option>
          <option translate="no" key="15" value="15">
            15€
          </option>
          <option translate="no" key="20" value="20">
            20€
          </option>
        </select>
      </div>

      <div className="form-actions">
        <button
          translate="no"
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
