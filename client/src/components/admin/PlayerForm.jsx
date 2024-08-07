import React, { useState } from 'react';
import axios from 'axios';

const PlayerForm = ({ player, onClose, token }) => {
    const [teamId, setTeamId] = useState(player.team_id);

    const updatePlayer = async () => {
        try {
            await axios.put(`/api/player/${player.Player.id}`, { teamId }, { headers: { Authorization: `Bearer ${token}` } });
            onClose();
        } catch (error) {
            console.error('Erreur lors de la mise à jour du joueur :', error);
        }
    };

    const deletePlayer = async () => {
        try {
            await axios.delete(`/api/player/${player.Player.id}`, { headers: { Authorization: `Bearer ${token}` } });
            onClose();
        } catch (error) {
            console.error('Erreur lors de la suppression du joueur :', error);
        }
    };

    return (
        <div className="player-form fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl mb-4">Modifier {player.Player.name}</h2>
                <label className="block mb-2">
                    Équipe :
                    <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="block w-full mt-2 border rounded">
                        {/* Remplacez avec les options d'équipe appropriées */}
                    </select>
                </label>
                <div className="flex justify-end mt-4">
                    <button onClick={updatePlayer} className="px-4 py-2 bg-green-500 text-white rounded mr-2">Mettre à jour</button>
                    <button onClick={deletePlayer} className="px-4 py-2 bg-red-500 text-white rounded mr-2">Supprimer</button>
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Fermer</button>
                </div>
            </div>
        </div>
    );
};

export default PlayerForm;
