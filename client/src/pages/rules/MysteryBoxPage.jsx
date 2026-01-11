import React, { useState, useEffect, useContext } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import BackButton from '../../components/nav/BackButton.jsx';
import SimpleTitle from '../../components/partials/SimpleTitle.jsx';
import { UserContext } from '../../contexts/UserContext.jsx';
import defaultUserImage from '../../assets/components/user/default-user-profile.png';
import Loader from "../../components/partials/Loader.jsx";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

// Mapping des items vers leurs couleurs
const itemColors = {
  golden_ticket: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-800' },
  steps_shop: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800' },
  double_buteur: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800' },
  buteur_or: { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-800' },
  double_dose: { bg: 'bg-cyan-100', border: 'border-cyan-500', text: 'text-cyan-800' },
  balle_perdue: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800' },
  communisme: { bg: 'bg-rose-100', border: 'border-rose-500', text: 'text-rose-800' },
  mal_au_coeur: { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-800' },
};

// Mapping des items vers leurs icônes
const itemIcons = {
  golden_ticket: '🎫',
  steps_shop: '🛒',
  double_buteur: '⚽⚽',
  buteur_or: '🥇',
  double_dose: '🎯',
  balle_perdue: '💥',
  communisme: '🤝',
  mal_au_coeur: '💔',
};

const formatKey = (key) => {
  if (!key) return "";
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const MysteryBoxPage = () => {
  const { user } = useContext(UserContext);
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/api/mystery-box/selections`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.status === 200) {
          setAllItems(response.data);
        }
      } catch (err) {
        console.error('Erreur récupération des lots Mystery Box:', err);
        setError('Impossible de charger les lots');
      } finally {
        setLoading(false);
      }
    };

    fetchAllItems();
  }, [token]);

  // Séparer bonus et malus
  const bonusItems = allItems.filter(item => item.item?.type === 'bonus');
  const malusItems = allItems.filter(item => item.item?.type === 'malus');

  const renderItemCard = (userItem) => {
    const item = userItem.item;
    const colors = itemColors[item?.key] || { bg: 'bg-gray-100', border: 'border-gray-500', text: 'text-gray-800' };
    const icon = itemIcons[item?.key] || '📦';
    const isUsed = userItem.usage?.used;
    const isOwnItem = userItem.user?.id === user?.id;

    return (
      <div
        key={userItem.id}
        className={`relative p-3 rounded-xl border-2 ${colors.border} ${colors.bg} ${isOwnItem ? 'ring-2 ring-black ring-offset-2' : ''}`}
      >
        {/* Badge utilisé */}
        {isUsed && (
          <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold uppercase border border-black bg-gray-600 text-white">
            Utilisé
          </span>
        )}

        <div className="flex flex-row items-center gap-3">
          {/* Avatar utilisateur */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden shadow-flat-black-adjust">
              <img
                src={userItem.user?.img ? `${apiUrl}/uploads/users/${userItem.user.id}/${userItem.user.img}` : defaultUserImage}
                alt={userItem.user?.username}
                className="w-full h-full object-cover"
              />
            </div>
            <span className={`font-rubik text-xs font-bold ${isOwnItem ? 'text-black' : 'text-gray-700'}`}>
              {userItem.user?.username}
            </span>
          </div>

          {/* Icône item */}
          <div className="w-10 h-10 flex items-center justify-center rounded-full border border-black bg-white text-xl text-nowrap">
            {icon}
          </div>

          {/* Infos item */}
          <div className="flex-1">
            <h4 className={`font-rubik font-bold text-sm uppercase ${colors.text}`}>
              {formatKey(item?.key)}
            </h4>
            <p className="font-roboto text-xs text-gray-700 leading-tight mt-0.5">
              {item?.label}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <div className="min-h-screen relative z-20 px-4 py-8 pb-24">
      <BackButton />

      <SimpleTitle
        title="Mystery Box"
        stickyStatus={false}
        uppercase
        fontSize="2rem"
      />

      <p className="font-roboto text-center text-gray-700 mb-6">
        Découvrez tous les lots attribués aux joueurs
      </p>

      {error && (
        <div className="p-4 bg-red-100 border border-red-500 rounded-xl text-center mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {allItems.length === 0 && !error && (
        <div className="p-4 bg-gray-100 border border-gray-500 rounded-xl text-center">
          <p className="text-gray-700">Aucun lot n'a encore été attribué</p>
        </div>
      )}

      {/* Section Bonus */}
      {bonusItems.length > 0 && (
        <div className="mb-6">
          <h3 className="font-rubik text-lg font-bold uppercase mb-3 text-green-700 flex items-center gap-2">
            <span className="px-3 py-1 bg-green-deep border border-black rounded-full text-black text-sm">Bonus</span>
            <span className="text-sm font-normal text-gray-600">({bonusItems.length})</span>
          </h3>
          <div className="space-y-3">
            {bonusItems.map(renderItemCard)}
          </div>
        </div>
      )}

      {/* Section Malus */}
      {malusItems.length > 0 && (
        <div className="mb-6">
          <h3 className="font-rubik text-lg font-bold uppercase mb-3 text-red-700 flex items-center gap-2">
            <span className="px-3 py-1 bg-red-medium border border-black rounded-full text-white text-sm">Malus</span>
            <span className="text-sm font-normal text-gray-600">({malusItems.length})</span>
          </h3>
          <div className="space-y-3">
            {malusItems.map(renderItemCard)}
          </div>
        </div>
      )}
    </div>
  );
};

export default MysteryBoxPage;
