import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const DoubleDoseModal = ({ isOpen, onClose, onSuccess }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchMatches();
    }
  }, [isOpen]);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      // Récupère les matchs de la journée en cours
      const response = await axios.get(
        `${apiUrl}/api/matchs/week`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Filtrer uniquement les matchs non commencés
      const now = new Date();
      const upcomingMatches = (response.data || []).filter(match => {
        const matchDate = new Date(match.utc_date);
        return matchDate > now;
      });
      setMatches(upcomingMatches);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des matchs');
    } finally {
      setLoading(false);
    }
  };

  const handleUse = async () => {
    if (!selectedMatch) {
      setError('Sélectionne un match');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `${apiUrl}/api/mystery-box/use`,
        {
          itemKey: 'double_dose',
          data: { match_id: selectedMatch.id }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onSuccess && onSuccess(selectedMatch);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'utilisation');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl border-2 border-cyan-500 shadow-flat-black p-6 mx-4 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-rubik font-bold text-xl uppercase text-cyan-700 flex items-center gap-2">
            <span className="text-2xl">🎯</span> Double Dose
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-black bg-gray-100 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        <p className="font-roboto text-sm text-gray-600 mb-4">
          Choisis un match sur lequel activer ta <span className="font-bold text-cyan-600">Double Dose</span> !
          <br />
          Tu pourras miser <span className="font-bold">"[Équipe] ou Nul"</span> au lieu d'un résultat unique.
          <br />
          <span className="text-cyan-600 font-medium">Attention : tu ne peux l'utiliser qu'une seule fois sur un seul match.</span>
        </p>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8 bg-orange-50 rounded-lg border border-orange-300">
            <p className="text-orange-700 font-medium">Aucun match disponible</p>
            <p className="text-orange-600 text-sm mt-2">Les matchs ont peut-être déjà commencé.</p>
          </div>
        ) : (
          <>
            {/* Liste des matchs */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {matches.map((match) => (
                <div
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMatch?.id === match.id
                      ? 'border-cyan-500 bg-cyan-50 shadow-md'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-rubik font-bold text-base text-black">
                        {match.HomeTeam?.name || 'Équipe 1'} - {match.AwayTeam?.name || 'Équipe 2'}
                      </p>
                      <p className="font-roboto text-xs text-gray-500 mt-1">
                        {formatDate(match.utc_date)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {match.HomeTeam?.logo && (
                        <img src={match.HomeTeam.logo} alt="" className="w-8 h-8 object-contain" />
                      )}
                      {match.AwayTeam?.logo && (
                        <img src={match.AwayTeam.logo} alt="" className="w-8 h-8 object-contain" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm font-roboto mb-4 text-center">{error}</p>
        )}

        {/* Actions */}
        <div className="flex flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-full border border-black font-roboto font-medium text-black bg-gray-100 hover:bg-gray-200"
          >
            Annuler
          </button>
          {matches.length > 0 && (
            <button
              onClick={handleUse}
              disabled={!selectedMatch || submitting}
              className={`flex-1 py-2 px-4 rounded-full border border-black font-roboto font-medium transition-all ${
                selectedMatch && !submitting
                  ? 'bg-cyan-400 text-black hover:bg-cyan-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Envoi...' : 'Activer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoubleDoseModal;
