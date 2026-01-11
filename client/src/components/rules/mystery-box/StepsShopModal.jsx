import React, { useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';

// Import des images
import sacocheImg from '../../../assets/components/rules/mystery-box/sacoche_steps.jpg';
import bonnetImg from '../../../assets/components/rules/mystery-box/bonnet.jpg';
import casquetteImg from '../../../assets/components/rules/mystery-box/casquette.jpg';
import verreBiereImg from '../../../assets/components/rules/mystery-box/verre_biere.png';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

// Items placeholder - à modifier selon les vrais articles
const SHOP_ITEMS = [
  { id: 'sacoche_steps', name: 'Sacoche Steps', description: 'La sacoche officiel Steps Prono', img: sacocheImg },
  { id: 'bonnet', name: 'Bonnet Steps', description: 'Le bonnet exclusif Steps Prono', img: bonnetImg },
  { id: 'casquette', name: 'Casquette Steps', description: 'La fameuse casquette Steps Prono', img: casquetteImg },
  { id: 'verre_biere', name: 'Verre à bière', description: 'Le verre à bière officiel Steps Prono', img: verreBiereImg },
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
        { selectedItem: selectedItem.id, selectedItemName: selectedItem.name },
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
      <div className="bg-white rounded-xl border-2 border-black shadow-flat-black p-6 mx-4 max-w-md w-full max-h-[70vh] overflow-y-auto">
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
              className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedItem?.id === item.id
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              <img
                src={item.img}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg border border-black"
              />
              <div className="flex-1">
                <h3 className="font-rubik font-bold text-base text-black">{item.name}</h3>
                <p className="font-roboto text-sm text-gray-600">{item.description}</p>
              </div>
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
