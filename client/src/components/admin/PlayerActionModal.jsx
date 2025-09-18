// src/components/admin/PlayerActionModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../../contexts/AppContext.jsx";
import AlertModal from "../modals/AlertModal.jsx";
import {number} from "prop-types";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const PlayerActionModal = ({ isOpen, onClose, player, teams, token, onUpdated }) => {
  const { availableCompetitions } = useContext(AppContext);
  const [playerId, setPlayerId] = useState(null);
  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [photo, setPhoto] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [pendingExistingPlayer, setPendingExistingPlayer] = useState(null);
  const [isUsingExistingPlayer, setIsUsingExistingPlayer] = useState(false);
  const [unassignedPlayers, setUnassignedPlayers] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMessage, setAlertMessage] = useState('');
  const [errors, setErrors] = useState({});
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
      if (player.Player?.id) {
        setPlayerId(player.Player.id);
      } else {
        setPlayerId(null);
      }
      if (player.Team) {
        setSelectedTeam(player.Team.id);
      } else if (teams.length > 0) {
        setSelectedTeam(teams[0].Team.id);
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

  const handleSavePlayer = async () => {
    const newErrors = {};

    if (!playerId) newErrors.playerId = true;
    if (!name) newErrors.name = true;
    if (!playerNumber) newErrors.playerNumber = true;
    if (!selectedPosition) newErrors.selectedPosition = true;
    if (!selectedTeam) newErrors.selectedTeam = true;
    if (!selectedCompetition) newErrors.selectedCompetition = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlertMessage("Merci de remplir tous les champs obligatoires");
      setAlertType("error");
      return;
    }

    setErrors({});

    try {
      await axios.post(`${apiUrl}/api/admin/player/save`, {
        id: playerId,
        name,
        firstname,
        lastname,
        photo,
        teamId: selectedTeam || null,
        competitionId: selectedCompetition || null,
        number: playerNumber || null,
        position: selectedPosition || null,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setAlertMessage("Données sauvegardées avec succès !");
      setAlertType("success");
      setTimeout(() => {
        setAlertMessage('');
        onUpdated();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Erreur sauvegarde joueur", err);
      setAlertMessage("Impossible de sauvegarder le joueur");
      setAlertType("error");
    }
  };

  const handleDeleteAssociation = async () => {
    try {
      await axios.delete(`${apiUrl}/api/admin/player/${player.Player.id}/team/${selectedTeam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlertMessage("Association supprimée avec succès !");
      setAlertType("success");

      setTimeout(() => {
        setAlertMessage('');
        onUpdated();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Erreur suppression association", err);
      setAlertMessage("Impossible de supprimer l’association");
      setAlertType("error");
    }
  };

  const handleCreatePlayer = async () => {
    try {
      const res =  await axios.post(`${apiUrl}/api/admin/player/add`, {
        id: playerId,
        name,
        firstname,
        lastname,
        photo,
        teamId: selectedTeam,
        competitionId: selectedCompetition,
        number: playerNumber,
        position: selectedPosition
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.exists) {
        setAlertMessage("Ce joueur existe déjà. Voulez-vous l’utiliser ?");
        setAlertType("warning");
        setPendingExistingPlayer(res.data.player);
        return;
      }

      setAlertMessage("Joueur créé avec succès !");
      setAlertType("success");

      setTimeout(() => {
        setAlertMessage('');
        onUpdated();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Erreur création joueur", err);
      setAlertMessage("Impossible de créer le joueur");
      setAlertType("error");
    }
  };

  const fetchUnassignedPlayers = async () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      return;
    }
    try {
      const res = await axios.get(`${apiUrl}/api/admin/players/unassigned`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnassignedPlayers(res.data || []);
      setIsSearchOpen(true);
    } catch (err) {
      console.error("Erreur chargement joueurs sans équipe", err);
    }
  };

  function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  const filteredPlayers = unassignedPlayers.filter(j =>
    decodeHtml(j.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (j.firstname && decodeHtml(j.firstname).toLowerCase().includes(searchTerm.toLowerCase())) ||
    (j.lastname && decodeHtml(j.lastname).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[510]">
      <div className="relative bg-white border border-black rounded-xl p-6 w-11/12 shadow-xl -mt-8">
        <AlertModal
          message={alertMessage}
          type={alertType}
          onConfirm={() => {
            if (pendingExistingPlayer) {
              setPlayerId(pendingExistingPlayer.id);
              setName(pendingExistingPlayer.name || "");
              setFirstname(pendingExistingPlayer.firstname || "");
              setLastname(pendingExistingPlayer.lastname || "");
              setPhoto(pendingExistingPlayer.photo || "");
              setIsUsingExistingPlayer(true);
            }
            setPendingExistingPlayer(null);
            setAlertMessage('');
            setAlertType(null);
            setIsSearchOpen(false);
          }}
          onCancel={() => {
            setPendingExistingPlayer(null);
            setAlertMessage('');
            setAlertType(null);
            setIsSearchOpen(false);
          }}
        />
        <h2 className="font-rubik font-regular text-black text-base mb-4">
          Gestion du joueur <span className="font-bold text-sm">#{player.Player.id}</span>
        </h2>

        {!player.Player.id && (
          <div className="mb-4">
            <label className="font-rubik font-regular text-black block text-sm">ID Joueur</label>
            <input
              type="number"
              name="id"
              required
              className={`font-rubik font-regular border shadow-flat-black-adjust px-2 py-1 w-full ${errors.id ? 'border-red-500' : 'border-black'}`}
              value={playerId ?? ""}
              onChange={(e) => setPlayerId(e.target.value ? parseInt(e.target.value, 10) : null)}
            />
          </div>
        )}

        <div className="mb-4">
          <label className="font-rubik font-regular text-black block text-sm">Nom affiché</label>
          <input
            type="text"
            name="name"
            required
            className={`font-rubik font-regular border shadow-flat-black-adjust px-2 py-1 w-full ${errors.name ? 'border-red-500 border-2' : 'border-black'}`}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value) {
                setErrors(prev => ({ ...prev, name: false }));
              }
            }}
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
              required
              className={`border shadow-flat-black-adjust px-2 py-1.5 w-full font-rubik font-regular ${errors.selectedPosition ? 'border-red-500 border-2' : 'border-black'}`}
              value={selectedPosition}
              onChange={(e) => {
                setSelectedPosition(e.target.value)
                if (e.target.value) {
                  setErrors(prev => ({ ...prev, position: false }));
                }
              }}
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
              required
              className={`font-rubik font-regular border shadow-flat-black-adjust px-2 py-1 w-full ${errors.number ? 'border-red-500 border-2' : 'border-black'}`}
              value={playerNumber}
              onChange={(e) => {
                setPlayerNumber(e.target.value)
                if (e.target.value) {
                  setErrors(prev => ({...prev, number: false}));
                }
              }}
            />
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <div className="w-1/2">
            <label className="block text-sm font-rubik font-regular text-black">Équipe</label>
            <select
              name="team"
              required
              className={`border shadow-flat-black-adjust px-2 py-1.5 w-full font-rubik font-regular ${errors.selectedTeam ? 'border-red-500 border-2' : 'border-black'}`}
              value={selectedTeam}
              onChange={(e) => {
                setSelectedTeam(e.target.value)
                if (e.target.value) {
                  setErrors(prev => ({...prev, team: false}));
                }
              }}
            >
              <option value="">Aucune équipe</option>
              {teams.map(t => (
                <option key={t.Team.id} value={t.Team.id}>{t.Team.name}</option>
              ))}
            </select>
          </div>

          <div className="w-1/2">
            <label className="block text-sm font-rubik font-regular">Compétition</label>
            <select
              name="competition"
              required
              className={`border shadow-flat-black-adjust px-2 py-1.5 w-full font-rubik font-regular ${errors.selectedCompetition ? 'border-red-500 border-2' : 'border-black'}`}
              value={selectedCompetition}
              onChange={(e) => {
                setSelectedCompetition(e.target.value)
                if (e.target.value) {
                  setErrors(prev => ({...prev, competition: false}));
                }
              }}
            >
              <option value="">Aucune compétition</option>
              {availableCompetitions.map(comp => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          {!player.Player.id && !isUsingExistingPlayer ? (
            // Création
            <button
              className="w-full fade-in block relative mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
              onClick={handleCreatePlayer}
            >
              <span className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto leading-4 px-3 py-2 rounded-full text-center shadow-md bg-green-light transition -translate-y-1 group-hover:-translate-y-0">
                Créer joueur
              </span>
            </button>
          ) : (
            <>
              <button
                className="w-4/5 fade-in block relative mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group"
                onClick={handleSavePlayer}
              >
                <span className="no-correct relative z-[2] w-full block border border-black text-black uppercase font-regular text-xs font-roboto leading-4 px-3 py-2 rounded-full text-center shadow-md bg-blue-light transition -translate-y-1 group-hover:-translate-y-0">
                  Sauvegarder
                </span>
              </button>
              <button
                className="absolute -top-4 right-24 bg-red-medium border font-rubik border-black rounded-xl px-2 py-1 flex-1 shadow-flat-black-adjust"
                onClick={handleDeleteAssociation}
              >
                <span>Supprimer</span>
              </button>
            </>
          )}
          <button
            className="absolute -top-4 right-2 bg-gray-300 border font-rubik border-black rounded-xl px-2 py-1 flex-1 shadow-flat-black-adjust"
            onClick={onClose}
          >
            <span>Annuler</span>
          </button>
          <button
            className="absolute -top-4 left-4 flex items-center gap-2 border border-black px-1.5 py-1 rounded-full bg-green-light shadow-flat-black-adjust"
            onClick={fetchUnassignedPlayers}
          >
            <span className="font-rubik text-sm font-regular text-black">🔍</span>
          </button>
        </div>
      </div>
      {isSearchOpen && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10/12 border border-black rounded-md p-2 bg-gray-50 max-h-[400px] overflow-y-auto shadow-flat-black">
          <h3 className="font-bold mb-2">Joueurs sans équipe</h3>
          <input
            type="text"
            placeholder="Rechercher un joueur..."
            className="mb-2 w-full border border-black px-2 py-1 rounded-md font-rubik"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {filteredPlayers.length === 0 ? (
            <p>Aucun joueur trouvé</p>
          ) : (
            filteredPlayers.map(j => (
              <div
                key={j.id}
                className="cursor-pointer p-2 hover:bg-gray-200 rounded-md"
                onClick={() => {
                  setPendingExistingPlayer(j);
                  setAlertMessage("Voulez-vous utiliser ce joueur ?");
                  setAlertType("warning");
                }}
              >
                <p className="font-rubik font-regular text-black">
                  {decodeHtml(j.name)} (#{j.id})
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerActionModal;
