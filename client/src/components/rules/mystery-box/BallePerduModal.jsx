import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const BallePerduModal = ({ isOpen, onClose, onSuccess, currentUserId }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${apiUrl}/api/users/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Filtrer l'utilisateur courant
      const allowedStatus = ['approved', 'ruled'];
      const otherUsers = (response.data || []).filter(
        u => u.id !== currentUserId && allowedStatus.includes(u.status)
      );
      setUsers(otherUsers);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleUse = async () => {
    if (!selectedUser) {
      setError('Sélectionne un utilisateur');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `${apiUrl}/api/mystery-box/use`,
        {
          itemKey: 'balle_perdue',
          data: { target_user_id: selectedUser.id }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onSuccess && onSuccess(selectedUser);
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
      <div className="bg-white rounded-xl border-2 border-red-500 shadow-flat-black p-6 mx-4 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-rubik font-bold text-xl uppercase text-red-700 flex items-center gap-2">
            <span className="text-2xl">💥</span> Balle Perdue
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-black bg-gray-100 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        <p className="font-roboto text-sm text-gray-600 mb-4">
          Choisis un joueur pour lui retirer <span className="font-bold text-red-600">1 point</span> de son classement !
          <br />
          <span className="text-red-600 font-medium">Attention : tu ne peux l'utiliser qu'une seule fois.</span>
        </p>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-300">
            <p className="text-gray-700 font-medium">Aucun autre joueur trouvé</p>
          </div>
        ) : (
          <>
            {/* Liste des utilisateurs */}
            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    selectedUser?.id === user.id
                      ? 'border-red-500 bg-red-50 shadow-md'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  {user.img ? (
                    <img
                      src={`${apiUrl}/uploads/users/${user.id}/${user.img}`}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover border border-gray-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                      <span className="text-gray-500 text-sm font-bold">
                        {user.username?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="font-rubik font-bold text-base text-black">
                    {user.username}
                  </span>
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
          {users.length > 0 && (
            <button
              onClick={handleUse}
              disabled={!selectedUser || submitting}
              className={`flex-1 py-2 px-4 rounded-full border border-black font-roboto font-medium transition-all ${
                selectedUser && !submitting
                  ? 'bg-red-400 text-black hover:bg-red-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Envoi...' : 'Tirer !'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BallePerduModal;
