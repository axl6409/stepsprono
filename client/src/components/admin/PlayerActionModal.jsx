// src/components/admin/PlayerActionModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import AlertModal from "../modals/AlertModal.jsx";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const PlayerActionModal = ({ isOpen, onClose, player, teams, token, onUpdated }) => {
  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [photo, setPhoto] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState(null);
  const positions = [
    { value: "", label: "Aucun poste" },
    { value: "Goalkeeper", label: "Gardien" },
    { value: "Defender", label: "Défenseur" },
    { value: "Midfielder", label: "Milieu" },
    { value: "Attacker", label: "Attaquant" },
  ];

  useEffect(() => {
    if (player) {
      setName(player.Player.name || "");
      setFirstname(player.Player.firstname || "");
      setLastname(player.Player.lastname || "");
      setPhoto(player.Player.photo || "");
      if (player.Team) {
        setSelectedTeam(player.Team.id);
      } else {
        setSelectedTeam("");
      }
      if (player.competition_id) {
        setSelectedCompetition(player.competition_id);
      }
      if (player.position) {
        setSelectedPosition(player.position);
      } else {
        setSelectedPosition("");
      }
      if (player.number) {
        setPlayerNumber(player.number);
      } else {
        setPlayerNumber("");
      }
    }
  }, [player]);

  if (!isOpen || !player) return null;

  const handleUpdatePlayer = async () => {
    try {
      await axios.patch(`${apiUrl}/api/admin/player/${player.Player.id}`, {
        name, firstname, lastname, photo, teamId: selectedTeam, position: selectedPosition, number: playerNumber,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setAlertMessage("Joueur mis à jour avec succès !");
      setAlertType("success");

      setTimeout(() => {
        setAlertMessage('');
        onUpdated();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Erreur update joueur", err);
      setAlertMessage("Impossible de mettre à jour le joueur");
      setAlertType("error");
      setTimeout(() => setAlertMessage(''), 2000);
    }
  };

  const handleUpdateTeam = async () => {
    try {
      await axios.patch(`${apiUrl}/api/admin/player/${player.Player.id}/team`, {
        teamId: selectedTeam || null,
        competitionId: selectedCompetition || null
      }, { headers: { Authorization: `Bearer ${token}` } });

      setAlertMessage("Équipe mise à jour avec succès !");
      setAlertType("success");

      setTimeout(() => {
        setAlertMessage('');
        onUpdated();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Erreur update team", err);
      setAlertMessage("Impossible de mettre à jour l'équipe");
      setAlertType("error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="relative bg-white border border-black rounded-xl p-6 w-11/12 shadow-xl -mt-8">
        <AlertModal message={alertMessage} type={alertType} />
        <h2 className="font-rubik font-regular text-black text-base mb-4">
          Gestion du joueur <span className="font-bold text-sm">#{player.Player.id}</span>
        </h2>

        <div className="mb-4">
          <label className="font-rubik font-regular text-black block text-sm">Nom affiché</label>
          <input
            type="text"
            name="name"
            className="font-rubik font-regular border border-black shadow-flat-black-adjust px-2 py-1 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-4 flex gap-2">
          <div className="w-1/2">
            <label className="block text-sm font-rubik font-regular text-black">Prénom</label>
            <input
              type="text"
              name="firstname"
              className="font-rubik font-regular border border-black shadow-flat-black-adjust px-2 py-1 w-full"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-rubik font-regular text-black">Nom</label>
            <input
              type="text"
              name="lastname"
              className="font-rubik font-regular border border-black shadow-flat-black-adjust px-2 py-1 w-full"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-rubik font-regular text-black">Photo URL</label>
          <input
            type="text"
            name="photo"
            className="font-rubik font-regular border border-black shadow-flat-black-adjust px-2 py-1 w-full"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
          />
        </div>

        <div className="mb-4 flex gap-2">
          <div className="w-2/3">
            <label className="block text-sm font-rubik font-regular text-black">Poste</label>
            <select
              name="position"
              className="border border-black shadow-flat-black-adjust px-2 py-1.5 w-full font-rubik font-regular"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
            >
              {positions.map(pos => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-1/3">
            <label className="block text-sm font-rubik font-regular text-black">Numéro</label>
            <input
              type="number"
              name="number"
              className="font-rubik font-regular border border-black shadow-flat-black-adjust px-2 py-1 w-full"
              value={playerNumber}
              onChange={(e) => setPlayerNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <div className="w-1/2">
            <label className="block text-sm font-rubik font-regular text-black">Équipe</label>
            <select
              name="team"
              className="border border-black shadow-flat-black-adjust px-2 py-1.5 w-full font-rubik font-regular"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="">Aucune équipe</option>
              {teams.map(t => (
                <option key={t.Team.id} value={t.Team.id}>{t.Team.name}</option>
              ))}
            </select>
          </div>

          <div className="w-1/2">
            <label className="block text-sm font-rubik font-regular">Compétition</label>
            <input
              type="number"
              name="competition"
              className="font-rubik font-regular border border-black shadow-flat-black-adjust px-2 py-1 w-full"
              value={selectedCompetition}
              onChange={(e) => setSelectedCompetition(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="w-4/5 fade-in block relative mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
            onClick={handleUpdatePlayer}
          >
            <span className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto leading-4 px-3 py-2 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1 group-hover:-translate-y-0">Sauvegarder infos</span>
          </button>
          <button
            className="w-4/5 fade-in block relative mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
            onClick={handleUpdateTeam}
          >
            <span className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto leading-4 px-3 py-2 rounded-full text-center shadow-md bg-green-light transition -translate-y-1 group-hover:-translate-y-0">Mettre à jour équipe</span>
          </button>
          <button
            className="absolute top-0.5 right-1 bg-gray-300 border font-rubik border-black rounded-xl px-2 py-1 flex-1 shadow-flat-black-adjust"
            onClick={onClose}
          >
            <span>Annuler</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerActionModal;
