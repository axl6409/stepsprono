import React, { useState } from "react";
import UserWheel from "../../../components/admin/UserWheel.jsx";
import MatchdaySelect from "../../../components/admin/MatchdaySelect.jsx";

const RuleSwapPredictions = ({ users, matchdays, formValues, setFormValues }) => {
  const [pool, setPool] = useState(users); // joueurs restants
  const [pairs, setPairs] = useState(formValues.selection || []); // [[u1,u2], [u3,u4]...]
  const [currentPick, setCurrentPick] = useState([]); // joueur(s) en cours de sélection

  const handleSelect = (user) => {
    if (currentPick.length === 0) {
      // premier joueur
      setCurrentPick([user]);
      setPool((prev) => prev.filter((u) => u.id !== user.id));
    } else if (currentPick.length === 1) {
      // deuxième joueur → former une paire
      const newPair = [currentPick[0], user];
      const updatedPairs = [...pairs, newPair];
      setPairs(updatedPairs);
      setFormValues((prev) => ({ ...prev, selection: updatedPairs }));

      // reset picks
      setCurrentPick([]);
      setPool((prev) => prev.filter((u) => u.id !== user.id));
    }
  };

  const resetPairs = () => {
    setPairs([]);
    setPool(users);
    setCurrentPick([]);
    setFormValues((prev) => ({ ...prev, selection: [] }));
  };

  return (
    <div className="space-y-6">
      {/* Roue pour sélectionner les joueurs */}
      {pool.length > 0 ? (
        <div>
          <h3 className="font-bold mb-2">
            {currentPick.length === 0
              ? "Sélection du premier joueur"
              : "Sélection du deuxième joueur"}
          </h3>
          <UserWheel users={pool} onSelect={handleSelect} />
        </div>
      ) : (
        <p className="text-green-700 font-semibold">
          Toutes les paires ont été constituées 🎉
        </p>
      )}

      {/* Récap des paires */}
      <div>
        <h4 className="font-semibold mb-2">Paires formées :</h4>
        {pairs.length === 0 ? (
          <p className="text-gray-500">Aucune paire pour l’instant</p>
        ) : (
          <ul className="list-disc ml-6 space-y-1">
            {pairs.map((g, idx) => (
              <li key={idx}>
                {g[0]?.username} ↔ {g[1]?.username}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={resetPairs}
        className="px-3 py-1 bg-red-500 text-white rounded"
      >
        Réinitialiser les paires
      </button>

      {/* Choix de la journée sportive */}
      <MatchdaySelect
        matchdays={matchdays}
        value={formValues.matchday}
        onChange={(val) => setFormValues({ ...formValues, matchday: val })}
      />
    </div>
  );
};

export default RuleSwapPredictions;
