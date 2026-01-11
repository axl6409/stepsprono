import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from "react-router-dom";
import axios from 'axios';
import StepsShopModal from './mystery-box/StepsShopModal.jsx';
import GoldenTicketModal from './mystery-box/GoldenTicketModal.jsx';
import BallePerduModal from './mystery-box/BallePerduModal.jsx';
import DoubleDoseModal from './mystery-box/DoubleDoseModal.jsx';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

// Mapping des items vers leurs couleurs
const itemColors = {
  golden_ticket: { bg: 'bg-yellow-400', border: 'border-yellow-600', text: 'text-yellow-800' },
  steps_shop: { bg: 'bg-blue-400', border: 'border-blue-600', text: 'text-blue-800' },
  double_buteur: { bg: 'bg-green-400', border: 'border-green-600', text: 'text-green-800' },
  buteur_or: { bg: 'bg-amber-400', border: 'border-amber-600', text: 'text-amber-800' },
  double_dose: { bg: 'bg-cyan-400', border: 'border-cyan-600', text: 'text-cyan-800' },
  balle_perdue: { bg: 'bg-red-400', border: 'border-red-600', text: 'text-red-800' },
  communisme: { bg: 'bg-rose-400', border: 'border-rose-600', text: 'text-rose-800' },
  mal_au_coeur: { bg: 'bg-purple-400', border: 'border-purple-600', text: 'text-purple-800' },
};

// Mapping des items vers leurs icônes/emojis (temporaire, à remplacer par des images)
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

const MysteryBox = ({ rule, user, viewedUser, isOwnProfile }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [userItem, setUserItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showGoldenTicketModal, setShowGoldenTicketModal] = useState(false);
  const [showBallePerduModal, setShowBallePerduModal] = useState(false);
  const [showDoubleDoseModal, setShowDoubleDoseModal] = useState(false);
  const [ballePerduTargetUser, setBallePerduTargetUser] = useState(null);

  const fetchUserItem = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/mystery-box/user/${viewedUser.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200 && response.data) {
        setUserItem(response.data);

        // Si balle_perdue utilisee, recuperer le nom de la cible
        if (response.data.item?.key === 'balle_perdue' && response.data.usage?.used && response.data.usage?.data?.target_user_id) {
          try {
            const targetResponse = await axios.get(
              `${apiUrl}/api/user/${response.data.usage.data.target_user_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (targetResponse.status === 200 && targetResponse.data) {
              setBallePerduTargetUser(targetResponse.data);
            }
          } catch (e) {
            console.error('Erreur récupération cible balle perdue:', e);
          }
        }
      }
    } catch (error) {
      console.error('Erreur récupération item Mystery Box:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewedUser?.id) {
      fetchUserItem();
    }
  }, [viewedUser?.id, token]);

  const handleShopSuccess = (selectedItem) => {
    // Rafraîchir les données après sélection
    fetchUserItem();
  };

  if (loading) return null;
  if (!userItem?.item) return null;

  const item = userItem.item;
  const colors = itemColors[item.key] || { bg: 'bg-gray-400', border: 'border-gray-600', text: 'text-gray-800' };
  const icon = itemIcons[item.key] || '📦';
  const isBonus = item.type === 'bonus';
  const isUsed = userItem.usage?.used;

  // Vérifier si c'est le steps_shop et non utilisé (pour afficher le bouton)
  const canUseStepsShop = isOwnProfile && item.key === 'steps_shop' && !isUsed;
  const shopSelectedItemName = userItem.usage?.data?.selected_item_name;

  // Vérifier si c'est le golden_ticket et non utilisé
  const canUseGoldenTicket = isOwnProfile && item.key === 'golden_ticket' && !isUsed;

  // Vérifier si c'est balle_perdue et non utilisé
  const canUseBallePerdue = isOwnProfile && item.key === 'balle_perdue' && !isUsed;
  const ballePerduTarget = userItem.usage?.data?.target_user_id;

  // Vérifier si c'est double_dose et non utilisé
  const canUseDoubleDose = isOwnProfile && item.key === 'double_dose' && !isUsed;
  const doubleDoseMatchId = userItem.usage?.data?.match_id;

  return (
    <div className="block relative z-20 flex flex-col justify-center items-center mb-4 px-4">
      {/* Bannière Mystery Box */}
      <div className={`w-full relative p-4 rounded-xl border-2 ${colors.border} ${colors.bg} shadow-flat-black`}>
        {/* Badge Bonus/Malus */}
        <span className={`absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase border border-black ${
          isBonus ? 'bg-green-deep text-black' : 'bg-red-medium text-white'
        }`}>
          {isBonus ? 'Bonus' : 'Malus'}
        </span>

        {/* Indicateur utilisé */}
        {isUsed && (
          <span className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase border border-black bg-gray-600 text-white">
            Utilisé
          </span>
        )}

        <div className="flex flex-row items-center gap-4 mt-2">
          {/* Icône */}
          <div className={`w-16 h-16 flex items-center justify-center rounded-full border-2 border-black bg-white text-3xl shadow-md`}>
            {icon}
          </div>

          {/* Infos */}
          <div className="flex-1">
            <h3 className={`font-rubik font-bold text-lg uppercase ${colors.text}`}>
              {formatKey(item.key)}
            </h3>
            <p className="font-roboto text-sm text-black leading-tight mt-1">
              {item.label}
            </p>
            {/* Afficher l'article sélectionné si steps_shop utilisé */}
            {item.key === 'steps_shop' && shopSelectedItemName && (
              <p className="font-roboto text-xs text-white mt-1 font-medium">
                Article choisi : <br/>{shopSelectedItemName}
              </p>
            )}
            {/* Afficher la cible si balle_perdue utilisé */}
            {item.key === 'balle_perdue' && isUsed && ballePerduTargetUser && (
              <p className="font-roboto text-xs text-white mt-1 font-medium">
                Cible touchee : <span className="font-bold">{ballePerduTargetUser.username}</span>
              </p>
            )}
          </div>
        </div>

        {/* Bouton Steps Shop */}
        {canUseStepsShop && (
          <button
            onClick={() => setShowShopModal(true)}
            className="mt-3 w-full py-2 px-4 rounded-full border-2 border-black font-roboto font-bold text-sm uppercase bg-white hover:bg-gray-100 transition-all shadow-flat-black-adjust"
          >
            Choisir mon article
          </button>
        )}

        {/* Bouton Golden Ticket */}
        {canUseGoldenTicket && (
          <button
            onClick={() => setShowGoldenTicketModal(true)}
            className="mt-3 w-full py-2 px-4 rounded-full border-2 border-black font-roboto font-bold text-sm uppercase bg-yellow-400 hover:bg-yellow-500 transition-all shadow-flat-black-adjust"
          >
            🎫 Utiliser mon Golden Ticket
          </button>
        )}

        {/* Bouton Balle Perdue */}
        {canUseBallePerdue && (
          <button
            onClick={() => setShowBallePerduModal(true)}
            className="mt-3 w-full py-2 px-4 rounded-full border-2 border-black font-roboto font-bold text-sm uppercase bg-red-400 hover:bg-red-500 transition-all shadow-flat-black-adjust"
          >
            💥 Tirer sur un joueur
          </button>
        )}

        {/* Bouton Double Dose */}
        {canUseDoubleDose && (
          <button
            onClick={() => setShowDoubleDoseModal(true)}
            className="mt-3 w-full py-2 px-4 rounded-full border-2 border-black font-roboto font-bold text-sm uppercase bg-cyan-400 hover:bg-cyan-500 transition-all shadow-flat-black-adjust"
          >
            🎯 Activer ma Double Dose
          </button>
        )}
      </div>

      {/* Bouton voir détails */}
      <Link
        to="/mystery-box"
        className="w-fit mt-3 fade-in block mx-auto before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-full before:bg-black before:border-black before:border group relative"
      >
        <span
          translate="no"
          className="relative z-[2] w-full block border border-black text-black uppercase font-regular text-sm font-roboto px-4 py-2 rounded-full text-center shadow-md bg-purple-light transition -translate-y-1 group-hover:-translate-y-0"
        >
          Voir tous les lots
        </span>
      </Link>

      {/* Modal Steps Shop */}
      <StepsShopModal
        isOpen={showShopModal}
        onClose={() => setShowShopModal(false)}
        onSuccess={handleShopSuccess}
      />

      {/* Modal Golden Ticket */}
      <GoldenTicketModal
        isOpen={showGoldenTicketModal}
        onClose={() => setShowGoldenTicketModal(false)}
        onSuccess={() => fetchUserItem()}
      />

      {/* Modal Balle Perdue */}
      <BallePerduModal
        isOpen={showBallePerduModal}
        onClose={() => setShowBallePerduModal(false)}
        onSuccess={() => fetchUserItem()}
        currentUserId={user?.id}
      />

      {/* Modal Double Dose */}
      <DoubleDoseModal
        isOpen={showDoubleDoseModal}
        onClose={() => setShowDoubleDoseModal(false)}
        onSuccess={() => fetchUserItem()}
      />
    </div>
  );
};

export default MysteryBox;
