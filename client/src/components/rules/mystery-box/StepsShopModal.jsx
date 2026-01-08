import React, { useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

// Items placeholder - à modifier selon les vrais articles
const SHOP_ITEMS = [
  { id: 'mug_steps', name: 'Mug Steps', description: 'Un mug aux couleurs de Steps Prono' },
  { id: 'tshirt_steps', name: 'T-Shirt Steps', description: 'Un t-shirt exclusif Steps Prono' },
  { id: 'stickers_pack', name: 'Pack Stickers', description: 'Un pack de stickers Steps Prono' },
  { id: 'casquette_steps', name: 'Casquette Steps', description: 'Une casquette Steps Prono' },
];

const StepsShopModal = ({ isOpen, onClose, onSuccess }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelect = async () => {
    if (!selectedItem) {
      setError('Sélectionne un article');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${apiUrl}/api/mystery-box/steps-shop/select`,
        { selectedItem: selectedItem.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onSuccess && onSuccess(selectedItem);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sélection');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl border-2 border-black shadow-flat-black p-6 mx-4 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-rubik font-bold text-xl uppercase text-black">Steps Shop</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-black bg-gray-100 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        <p className="font-roboto text-sm text-gray-600 mb-4">
          Choisis ton article bonus ! Tu ne pourras faire ce choix qu'une seule fois.
        </p>

        {/* Liste des articles */}
        <div className="space-y-3 mb-6">
          {SHOP_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedItem?.id === item.id
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              <h3 className="font-rubik font-bold text-base text-black">{item.name}</h3>
              <p className="font-roboto text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>

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
          <button
            onClick={handleSelect}
            disabled={!selectedItem || loading}
            className={`flex-1 py-2 px-4 rounded-full border border-black font-roboto font-medium transition-all ${
              selectedItem && !loading
                ? 'bg-green-deep text-black hover:opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Envoi...' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepsShopModal;
