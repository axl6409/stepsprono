import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const TeamPlayers = () => {
  const { teamId } = useParams();
  const [players, setPlayers] = useState([]);
  const token = localStorage.getItem('token') || cookies.token
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/teams/${teamId}/players`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setPlayers(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des joueurs :", error);
      }
    };

    fetchPlayers();
  }, [teamId]);

  return (
    <div>
      <h1 translate="no" className="text-3xl font-black mt-8 uppercase relative w-fit mx-auto">Liste des joueurs
        <span
          translate="no"
          className="absolute left-0 bottom-0 text-flat-purple z-[-1] transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">Liste des joueurs</span>
        <span
          translate="no"
          className="absolute left-0 bottom-0 text-green-lime z-[-2] transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">Liste des joueurs</span>
      </h1>
      <div className="relative border-t-2 border-b-2 border-black overflow-hidden py-8 pr-2 bg-flat-yellow">
        <ul className="w-10/12 mx-auto">
          {players.map(player => (
            <li key={player.playerId}>
              <p><span translate="no" className="font-bold">{player.Player.firstname}</span> <span>{player.Player.lastname}</span></p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TeamPlayers;
