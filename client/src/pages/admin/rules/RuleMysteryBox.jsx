import React, { useState } from "react";
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
  spinDuration: 0.6,
};

const RuleMysteryBox = ({ users, matchdays, formValues, setFormValues }) => {
  // pool des joueurs restants à attribuer
  const [pool, setPool] = useState(users);
  const [assigned, setAssigned] = useState(formValues.selection || []);

  // state pour tirage joueur
  const [spinningUser, setSpinningUser] = useState(false);
  const [userIndex, setUserIndex] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // state pour tirage item
  const [spinningItem, setSpinningItem] = useState(false);
  const [itemIndex, setItemIndex] = useState(null);

  const items = formValues.items || [];

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

  // lancer roue item
  const startItemSpin = () => {
    if (!items.length || spinningItem || !selectedUser) return;
    const i = Math.floor(Math.random() * items.length);
    setItemIndex(i);
    setSpinningItem(true);
  };

  const stopItemSpin = () => {
    setSpinningItem(false);
    if (itemIndex !== null && items[itemIndex] && selectedUser) {
      const chosen = { user: selectedUser, item: items[itemIndex] };
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

  const resetAssignments = () => {
    setAssigned([]);
    setFormValues((prev) => ({ ...prev, selection: [] }));
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
      {pool.length > 0 && !selectedUser && (
        <div className="flex flex-col justify-center items-center">
          <h3 className="font-bold mb-2 font-rubik text-black text-base text-center uppercase">Sélection d’un joueur</h3>
          <Wheel
            mustStartSpinning={spinningUser}
            prizeNumber={userIndex ?? 0}
            data={pool.map((u) => ({ option: u.username }))}
            onStopSpinning={stopUserSpin}
            {...wheelStyleProps}
          />
          <button
            onClick={startUserSpin}
            disabled={spinningUser}
            className={`mt-4 px-4 py-2 ${spinningUser ? "bg-purple-light" : "bg-green-deep"}  text-black font-roboto font-medium uppercase shadow-flat-black rounded-full border border-black`}
          >
            {spinningUser ? "La roue tourne..." : "Lancer la roue joueur"}
          </button>
        </div>
      )}

      {/* Roue item */}
      {selectedUser && (
        <div className="flex flex-col justify-center items-center">
          <h3 className="font-bold mb-2 font-rubik text-black text-base text-center uppercase">
            Sélection d’un lot pour <span className="text-green-deep stroke-black text-xl font-black block">{selectedUser.username}</span>
          </h3>
          <Wheel
            mustStartSpinning={spinningItem}
            prizeNumber={itemIndex ?? 0}
            data={items.map((it) => ({ option: formatKey(it.key) }))}
            onStopSpinning={stopItemSpin}
            {...wheelStyleProps}
          />
          <button
            onClick={startItemSpin}
            disabled={spinningItem}
            className={`mt-4 px-4 py-2 ${spinningUser ? "bg-purple-light" : "bg-green-deep"}  text-black font-roboto font-medium uppercase shadow-flat-black rounded-full border border-black`}
          >
            {spinningItem ? "La roue tourne..." : "Lancer la roue des lot"}
          </button>
        </div>
      )}

      {/* Récap */}
      <div className="border border-black p-4 rounded-xl shadow-flat-black bg-white">
        <h4 className="font-bold text-black font-rubik text-base uppercase mb-2">Lots attribués :</h4>
        {assigned.length === 0 ? (
          <p className="text-gray-800">Aucun lot attribué</p>
        ) : (
          <ul className="list-disc space-y-1">
            {assigned.map((a, idx) => (
              <li key={idx} className="flex flex-row flex-wrap justify-between gap-2 items-center border border-black p-2 rounded-md shadow-flat-black-adjust">
                <span className="flex flex-row justify-start items-center gap-2">
                  <span className="w-10 h-10 border border-black shadow-flat-black-adjust overflow-hidden rounded-full">
                    <img className="w-full h-full object-cover object-center" src={a.user.img ? `${apiUrl}/uploads/users/${a.user.id}/${a.user.img}` : defaultUserImage} alt=""/>
                  </span>
                  <span className="font-rubik text-black text-sm font-medium uppercase">{a.user.username}</span>
                </span>
                <span className="font-rubik text-black text-base font-black"> → </span>
                <span className="flex flex-row justify-start items-center gap-4">
                  <span className="font-rubik text-black text-sm font-medium uppercase">{formatKey(a.item.key)}</span>
                </span>
                <p className="font-rubik text-black text-sm font-regular leading-4 text-pretty">
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
