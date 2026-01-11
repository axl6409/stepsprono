import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const GoldenTicketModal = ({ isOpen, onClose, onSuccess }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [contributions, setContributions] = useState([]);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchContributions();
    }
  }, [isOpen]);

  const fetchContributions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${apiUrl}/api/mystery-box/golden-ticket/contributions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContributions(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTicket = async () => {
    if (!selectedContribution) {
      setError('Sélectionne une contribution à annuler');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `${apiUrl}/api/mystery-box/golden-ticket/use`,
        { contributionId: selectedContribution.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'utilisation');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl border-2 border-yellow-500 shadow-flat-black p-6 mx-4 max-w-md w-full max-h-[70vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-rubik font-bold text-xl uppercase text-yellow-700 flex items-center gap-2">
            <span className="text-2xl">🎫</span> Golden Ticket
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-black bg-gray-100 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        <p className="font-roboto text-sm text-gray-600 mb-4">
          Utilise ton Golden Ticket pour annuler une de tes contributions en attente !
          <br />
          <span className="text-yellow-600 font-medium">Attention : tu ne peux l'utiliser qu'une seule fois.</span>
        </p>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : contributions.length === 0 ? (
          <div className="text-center py-8 bg-green-50 rounded-lg border border-green-300">
            <p className="text-green-700 font-medium">Tu n'as aucune contribution en attente !</p>
            <p className="text-green-600 text-sm mt-2">Garde ton Golden Ticket pour plus tard.</p>
          </div>
        ) : (
          <>
            {/* Liste des contributions */}
            <div className="space-y-3 mb-6">
              {contributions.map((contrib) => (
                <div
                  key={contrib.id}
                  onClick={() => setSelectedContribution(contrib)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedContribution?.id === contrib.id
                      ? 'border-yellow-500 bg-yellow-50 shadow-md'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-rubik font-bold text-base text-black">
                        Journée {contrib.matchday}
                      </p>
                      <p className="font-roboto text-sm text-gray-600">
                        Montant : {contrib.amount}€
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-orange-100 text-orange-700 border border-orange-300">
                      En attente
                    </span>
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
        <div className="flex flex-row gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-full border border-black font-roboto font-medium text-black bg-gray-100 hover:bg-gray-200"
          >
            Annuler
          </button>
          {contributions.length > 0 && (
            <button
              onClick={handleUseTicket}
              disabled={!selectedContribution || submitting}
              className={`flex-1 py-2 px-4 rounded-full border border-black font-roboto font-medium transition-all ${
                selectedContribution && !submitting
                  ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Envoi...' : 'Utiliser le ticket'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoldenTicketModal;
