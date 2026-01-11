import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import UserWheel from "../../../components/admin/UserWheel.jsx";
import MatchdaySelect from "../../../components/admin/MatchdaySelect.jsx";
import { Wheel } from "react-custom-roulette";
import defaultUserImage from "../../../assets/components/user/default-user-profile.png";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const wheelStyleProps = {
  backgroundColors: ["#F2FFCC", "#CCFFCC", "#FFCCFF", "#F3F5B2", "#FFB5BE", "#CCCCFF"],
  textColors: ["#000000"],
  fontSize: 20,
  fontFamily: "Roboto Mono",
  outerBorderColor: "#000000",
  outerBorderWidth: 6,
  innerBorderColor: "#0ea5e9",
  innerBorderWidth: 4,
  radiusLineColor: "#000000",
  radiusLineWidth: 2,
  perpendicularText: false,
  spinDuration: 0.2,
};

const RuleMysteryBox = ({ users, matchdays, formValues, setFormValues }) => {
  const [cookies] = useCookies(["token"]);
  const token = localStorage.getItem("token") || cookies.token;

  // pool des joueurs restants à attribuer
  const [pool, setPool] = useState(users);
  const [assigned, setAssigned] = useState(formValues.selection || []);

  // State pour les choix Steps Shop
  const [shopSelections, setShopSelections] = useState([]);

  // state pour tirage joueur
  const [spinningUser, setSpinningUser] = useState(false);
  const [userIndex, setUserIndex] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // state pour tirage item
  const [spinningItem, setSpinningItem] = useState(false);
  const [itemIndex, setItemIndex] = useState(null);

  // state pour tirage partenaire Communisme
  const [communismeMode, setCommunismeMode] = useState(false);
  const [communismeUserA, setCommunismeUserA] = useState(null);
  const [spinningPartner, setSpinningPartner] = useState(false);
  const [partnerIndex, setPartnerIndex] = useState(null);

  const items = formValues.items || [];

  // Calculer le nombre d'attributions par item
  const getItemCount = (itemKey) => {
    return assigned.filter(a => a.item?.key === itemKey).length;
  };

  // Items disponibles (non épuisés selon max_count)
  const availableItems = useMemo(() => {
    return items.filter(item => {
      const currentCount = getItemCount(item.key);
      return currentCount < item.max_count;
    });
  }, [items, assigned]);

  // Mettre à jour isComplete quand tous les utilisateurs sont attribués
  useEffect(() => {
    const allAssigned = pool.length === 0 && assigned.length > 0;
    const hasMatchday = !!formValues.matchday;
    setFormValues(prev => ({
      ...prev,
      isComplete: allAssigned && hasMatchday
    }));
  }, [pool.length, assigned.length, formValues.matchday]);

  // Charger les choix Steps Shop
  useEffect(() => {
    const fetchShopSelections = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/api/admin/mystery-box/shop-selections`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setShopSelections(response.data || []);
      } catch (error) {
        console.error("Erreur chargement shop selections:", error);
      }
    };
    fetchShopSelections();
  }, [token]);

  // lancer roue joueur
  const startUserSpin = () => {
    if (!pool.length || spinningUser || spinningItem) return;
    const i = Math.floor(Math.random() * pool.length);
    setUserIndex(i);
    setSpinningUser(true);
  };

  const stopUserSpin = () => {
    setSpinningUser(false);
    if (userIndex !== null && pool[userIndex]) {
      setSelectedUser(pool[userIndex]);
    }
  };

  // lancer roue item (utilise availableItems au lieu de items)
  const startItemSpin = () => {
    if (!availableItems.length || spinningItem || !selectedUser) return;
    const i = Math.floor(Math.random() * availableItems.length);
    setItemIndex(i);
    setSpinningItem(true);
  };

  const stopItemSpin = () => {
    setSpinningItem(false);
    if (itemIndex !== null && availableItems[itemIndex] && selectedUser) {
      const chosenItem = availableItems[itemIndex];

      // Cas spécial: Communisme - on doit d'abord sélectionner un partenaire
      if (chosenItem.key === 'communisme') {
        setCommunismeMode(true);
        setCommunismeUserA(selectedUser);
        // Retirer User A du pool pour la roue partenaire
        setPool((prev) => prev.filter((u) => u.id !== selectedUser.id));
        setSelectedUser(null);
        setItemIndex(null);
        return;
      }

      const chosen = { user: selectedUser, item: chosenItem };
      const updated = [...assigned, chosen];
      setAssigned(updated);
      setFormValues((prev) => ({ ...prev, selection: updated }));

      // retirer joueur du pool
      setPool((prev) => prev.filter((u) => u.id !== selectedUser.id));

      // reset pour prochain tour
      setSelectedUser(null);
      setUserIndex(null);
      setItemIndex(null);
    }
  };

  // Lancer roue partenaire Communisme
  const startPartnerSpin = () => {
    if (!pool.length || spinningPartner || !communismeMode) return;
    const i = Math.floor(Math.random() * pool.length);
    setPartnerIndex(i);
    setSpinningPartner(true);
  };

  const stopPartnerSpin = () => {
    setSpinningPartner(false);
    if (partnerIndex !== null && pool[partnerIndex] && communismeUserA) {
      const partnerUser = pool[partnerIndex];

      // Créer l'item communisme avec le partner_id pour User A
      const communismeItem = items.find(it => it.key === 'communisme');
      const itemWithPartner = {
        ...communismeItem,
        data: { partner_id: partnerUser.id }
      };

      // Créer l'entrée pour le binôme (User B) - il partage le malus
      const partnerItemEntry = {
        ...communismeItem,
        data: { partner_id: communismeUserA.id },
        isPartner: true // flag pour l'affichage
      };

      const chosenA = { user: communismeUserA, item: itemWithPartner };
      const chosenB = { user: partnerUser, item: partnerItemEntry };
      const updated = [...assigned, chosenA, chosenB];
      setAssigned(updated);
      setFormValues((prev) => ({ ...prev, selection: updated }));

      // Retirer le partenaire du pool (il ne reçoit pas d'autre item)
      setPool((prev) => prev.filter((u) => u.id !== partnerUser.id));

      // Reset mode communisme
      setCommunismeMode(false);
      setCommunismeUserA(null);
      setPartnerIndex(null);
      setUserIndex(null);
    }
  };

  const resetAssignments = () => {
    setAssigned([]);
    setFormValues((prev) => ({ ...prev, selection: [], isComplete: false }));
    setPool(users);
    setSelectedUser(null);
  };

  const formatKey = (key) => {
    if (!key) return "";
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Roue joueur */}
      {pool.length > 0 && !selectedUser && !communismeMode && (
        <div className="flex flex-col justify-center items-center">
          <h3 translate="no" className="font-bold mb-2 pb-8 font-rubik text-black text-base text-center uppercase">Sélection d’un joueur</h3>
          <Wheel
            mustStartSpinning={spinningUser}
            prizeNumber={userIndex ?? 0}
            data={pool.map((u) => ({ option: u.username }))}
            onStopSpinning={stopUserSpin}
            {...wheelStyleProps}
          />
          <button
            translate="no"
            onClick={startUserSpin}
            disabled={spinningUser}
            className={`mt-4 px-4 py-2 ${spinningUser ? "bg-purple-light" : "bg-green-deep"}  text-black font-roboto font-medium uppercase shadow-flat-black rounded-full border border-black`}
          >
            {spinningUser ? "La roue tourne..." : "Lancer la roue joueur"}
          </button>
        </div>
      )}

      {/* Roue item */}
      {selectedUser && availableItems.length > 0 && (
        <div className="flex flex-col justify-center items-center">
          <h3 translate="no" className="font-bold relative mb-2 pb-8 font-rubik text-black text-base text-center uppercase">
            Sélection d'un lot pour <span className="text-green-deep stroke-black text-xl font-black block absolute bottom-0 left-1/2 -translate-x-1/2">{selectedUser.username}</span>
          </h3>
          <Wheel
            mustStartSpinning={spinningItem}
            prizeNumber={itemIndex ?? 0}
            data={availableItems.map((it) => ({ option: formatKey(it.key) }))}
            onStopSpinning={stopItemSpin}
            {...wheelStyleProps}
          />
          <button
            translate="no"
            onClick={startItemSpin}
            disabled={spinningItem}
            className={`mt-4 px-4 py-2 ${spinningItem ? "bg-purple-light" : "bg-green-deep"}  text-black font-roboto font-medium uppercase shadow-flat-black rounded-full border border-black`}
          >
            {spinningItem ? "La roue tourne..." : "Lancer la roue des lots"}
          </button>
        </div>
      )}

      {/* Message si plus d'items disponibles */}
      {selectedUser && availableItems.length === 0 && (
        <div className="text-center p-4 bg-red-100 border border-red-500 rounded-xl">
          <p className="font-rubik text-red-700 font-medium">
            Plus d'items disponibles ! Tous les items ont atteint leur limite.
          </p>
        </div>
      )}

      {/* Roue partenaire Communisme */}
      {communismeMode && pool.length > 0 && (
        <div className="flex flex-col justify-center items-center">
          <div className="mb-4 p-3 bg-rose-100 border-2 border-rose-500 rounded-xl text-center">
            <p className="font-rubik text-rose-700 font-bold text-sm uppercase">
              🤝 Mode Communisme
            </p>
            <p className="font-roboto text-rose-600 text-sm mt-1">
              <span className="font-bold">{communismeUserA?.username}</span> a reçu le malus Communisme !
            </p>
            <p className="font-roboto text-rose-600 text-sm">
              Sélectionne son binôme...
            </p>
          </div>
          <h3 translate="no" className="font-bold mb-2 font-rubik text-black text-base text-center uppercase">
            Sélection du partenaire
          </h3>
          <Wheel
            mustStartSpinning={spinningPartner}
            prizeNumber={partnerIndex ?? 0}
            data={pool.map((u) => ({ option: u.username }))}
            onStopSpinning={stopPartnerSpin}
            {...wheelStyleProps}
            backgroundColors={["#FFE4E6", "#FECDD3", "#FDA4AF", "#FB7185", "#F43F5E", "#E11D48"]}
          />
          <button
            translate="no"
            onClick={startPartnerSpin}
            disabled={spinningPartner}
            className={`mt-4 px-4 py-2 ${spinningPartner ? "bg-purple-light" : "bg-rose-500"} text-white font-roboto font-medium uppercase shadow-flat-black rounded-full border border-black`}
          >
            {spinningPartner ? "La roue tourne..." : "Lancer la roue partenaire"}
          </button>
        </div>
      )}

      {/* Récap */}
      <div className="border border-black p-4 rounded-xl shadow-flat-black bg-white">
        <h4 translate="no" className="font-bold text-black font-rubik text-base uppercase mb-2">Lots attribués :</h4>
        {assigned.length === 0 ? (
          <p translate="no" className="text-gray-800">Aucun lot attribué</p>
        ) : (
          <ul className="list-disc space-y-1">
            {assigned.map((a, idx) => (
              <li key={idx} className="flex flex-row flex-wrap justify-between gap-2 items-center border border-black p-2 rounded-md shadow-flat-black-adjust">
                <span className="flex flex-row justify-start items-center gap-2">
                  <span className="w-10 h-10 border border-black shadow-flat-black-adjust overflow-hidden rounded-full">
                    <img className="w-full h-full object-cover object-center" src={a.user.img ? `${apiUrl}/uploads/users/${a.user.id}/${a.user.img}` : defaultUserImage} alt=""/>
                  </span>
                  <span translate="no" className="font-rubik text-black text-sm font-medium uppercase">{a.user.username}</span>
                </span>
                <span className="font-rubik text-black text-base font-black"> → </span>
                <span className="flex flex-row justify-start items-center gap-4">
                  <span translate="no" className="font-rubik text-black text-sm font-medium uppercase">
                    {formatKey(a.item.key)}
                    {a.item.isPartner && <span className="text-rose-600 text-xs ml-1">(binôme)</span>}
                  </span>
                </span>
                <p translate="no" className="font-rubik text-black text-sm font-regular leading-4 text-pretty">
                  {a.item.label}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={resetAssignments}
        className="px-4 py-2 bg-red-medium font-rubik text-base shadow-flat-black mx-auto block text-white rounded-full"
      >
        Réinitialiser les lots
      </button>

      {/* Compteur des items */}
      <div className="border border-black p-4 rounded-xl shadow-flat-black bg-gray-50">
        <h4 translate="no" className="font-bold text-black font-rubik text-base uppercase mb-3">Stock des items :</h4>
        <div className="grid grid-cols-2 gap-2">
          {items.map((item) => {
            const count = getItemCount(item.key);
            const remaining = item.max_count - count;
            const isExhausted = remaining <= 0;
            return (
              <div
                key={item.key}
                className={`flex flex-row justify-between items-center p-2 rounded-md border ${
                  isExhausted ? "bg-gray-200 border-gray-400" : item.type === "bonus" ? "bg-green-100 border-green-500" : "bg-red-100 border-red-500"
                }`}
              >
                <span className={`font-rubik text-xs font-medium ${isExhausted ? "text-gray-500 line-through" : "text-black"}`}>
                  {formatKey(item.key)}
                </span>
                <span className={`font-rubik text-xs font-bold ${
                  isExhausted ? "text-gray-500" : remaining === 1 ? "text-orange-600" : "text-black"
                }`}>
                  {count}/{item.max_count}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-gray-600 font-roboto">
          Joueurs restants : <span className="font-bold">{pool.length}</span> / {users.length}
        </p>
      </div>

      {/* Récap des choix Steps Shop */}
      {shopSelections.length > 0 && (
        <div className="border border-black p-4 rounded-xl shadow-flat-black bg-blue-50">
          <h4 translate="no" className="font-bold text-black font-rubik text-base uppercase mb-3 flex items-center gap-2">
            <span>🛒</span> Choix Steps Shop
          </h4>
          <div className="space-y-2">
            {shopSelections.map((selection, idx) => (
              <div
                key={idx}
                className={`flex flex-row justify-between items-center p-3 rounded-lg border ${
                  selection.used
                    ? "bg-green-100 border-green-500"
                    : "bg-gray-100 border-gray-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 border border-black shadow-flat-black-adjust overflow-hidden rounded-full">
                    <img
                      className="w-full h-full object-cover object-center"
                      src={selection.user?.img ? `${apiUrl}/uploads/users/${selection.user.id}/${selection.user.img}` : defaultUserImage}
                      alt=""
                    />
                  </span>
                  <span className="font-rubik text-black text-sm font-medium">
                    {selection.user?.username}
                  </span>
                </div>
                <div className="text-right">
                  {selection.used ? (
                    <span className="font-rubik text-green-700 text-sm font-bold">
                      {selection.selectedItemName || selection.selectedItem}
                    </span>
                  ) : (
                    <span className="font-rubik text-gray-500 text-xs italic">
                      Pas encore choisi
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Choix journée sportive */}
      <MatchdaySelect
        matchdays={matchdays}
        value={formValues.matchday}
        onChange={(val) => setFormValues({ ...formValues, matchday: val })}
      />
    </div>
  );
};

export default RuleMysteryBox;
