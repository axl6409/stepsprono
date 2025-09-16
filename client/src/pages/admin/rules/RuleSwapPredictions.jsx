import React, { useState } from "react";
import UserWheel from "../../../components/admin/UserWheel.jsx";
import MatchdaySelect from "../../../components/admin/MatchdaySelect.jsx";
import defaultUserImage from "../../../assets/components/user/default-user-profile.png";

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
        <div className="flex flex-col justify-center items-center">
          <h3 className="font-bold mb-2 font-rubik text-black text-base text-center uppercase">
            {currentPick.length === 0
              ? "Sélection du premier joueur"
              : "Sélection du deuxième joueur"}
          </h3>
          {currentPick.length !== 0 && (
            <div>
              <p className="font-rubik text-black text-center text-base font-bold">Premier séléctionné : <span className="text-green-deep stroke-black text-xl font-black block">{currentPick[0]?.username}</span></p>
            </div>
          )}
          <UserWheel users={pool} onSelect={handleSelect} />
        </div>
      ) : (
        <p className="text-green-700 font-semibold">
          Toutes les paires ont été constituées 🎉
        </p>
      )}

      {/* Récap des paires */}
      <div className="border border-black p-4 rounded-xl shadow-flat-black bg-white">
        <h4 className="font-bold text-black font-rubik text-base uppercase mb-2">Paires formées :</h4>
        {pairs.length === 0 ? (
          <p className="text-gray-800">Aucune paire pour l’instant</p>
        ) : (
          <ul className="list-disc space-y-1">
            {pairs.map((g, idx) => (
              <li key={idx} className="flex flex-row justify-between gap-2 items-center border border-black p-2 rounded-md shadow-flat-black-adjust">
                <span className="flex flex-row justify-start items-center gap-2">
                  <span className="w-10 h-10 border border-black shadow-flat-black-adjust overflow-hidden rounded-full">
                    <img className="w-full h-full object-cover object-center" src={g[0]?.img ? `${apiUrl}/uploads/users/${g[0]?.id}/${g[0]?.img}` : defaultUserImage} alt=""/>
                  </span>
                  <span className="font-rubik text-black text-sm font-medium uppercase">{g[0]?.username}</span>
                </span>
                <span className="font-rubik text-black text-base font-black">&</span>
                <span className="flex flex-row justify-start items-center gap-4">
                  <span className="w-10 h-10 border border-black shadow-flat-black-adjust overflow-hidden rounded-full">
                    <img className="w-full h-full object-cover object-center" src={g[1]?.img ? `${apiUrl}/uploads/users/${g[1]?.id}/${g[1]?.img}` : defaultUserImage} alt=""/>
                  </span>
                  <span className="font-rubik text-black text-sm font-medium uppercase">{g[1]?.username}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={resetPairs}
        className="px-4 py-2 bg-red-medium font-rubik text-base shadow-flat-black mx-auto block text-white rounded-full"
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
