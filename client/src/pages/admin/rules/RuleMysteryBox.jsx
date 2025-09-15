import React, { useState } from "react";
import UserWheel from "../../../components/admin/UserWheel.jsx";
import MatchdaySelect from "../../../components/admin/MatchdaySelect.jsx";
import { Wheel } from "react-custom-roulette";

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

  return (
    <div className="space-y-6">
      {/* Roue joueur */}
      {pool.length > 0 && !selectedUser && (
        <div>
          <h3 className="font-bold mb-2">Sélection d’un joueur</h3>
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
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            {spinningUser ? "La roue tourne..." : "Lancer la roue joueur"}
          </button>
        </div>
      )}

      {/* Roue item */}
      {selectedUser && (
        <div>
          <h3 className="font-bold mb-2">
            Sélection d’un lot pour {selectedUser.username}
          </h3>
          <Wheel
            mustStartSpinning={spinningItem}
            prizeNumber={itemIndex ?? 0}
            data={items.map((it) => ({ option: it.label }))}
            onStopSpinning={stopItemSpin}
            {...wheelStyleProps}
          />
          <button
            onClick={startItemSpin}
            disabled={spinningItem}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
          >
            {spinningItem ? "La roue tourne..." : "Lancer la roue lot"}
          </button>
        </div>
      )}

      {/* Récap */}
      <div>
        <h4 className="font-semibold mb-2">Lots attribués :</h4>
        {assigned.length === 0 ? (
          <p className="text-gray-500">Aucun lot attribué</p>
        ) : (
          <ul className="list-disc ml-6 space-y-1">
            {assigned.map((a, idx) => (
              <li key={idx}>
                {a.user.username} → {a.item.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={resetAssignments}
        className="px-3 py-1 bg-red-500 text-white rounded"
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
