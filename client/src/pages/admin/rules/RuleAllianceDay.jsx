import React, { useState } from "react";
import UserWheel from "../../../components/admin/UserWheel.jsx";
import MatchdaySelect from "../../../components/admin/MatchdaySelect.jsx";

const RuleAllianceDay = ({ users, matchdays, formValues, setFormValues }) => {
  const [pool, setPool] = useState(users); // joueurs restants
  const [groups, setGroups] = useState(formValues.selected_users || []); // [[u1,u2], [u3,u4]...]
  const [currentPick, setCurrentPick] = useState([]); // joueur(s) en cours de sélection

  const handleSelect = (user) => {
    // Si aucun pick encore → premier joueur
    if (currentPick.length === 0) {
      setCurrentPick([user]);
      setPool((prev) => prev.filter((u) => u.id !== user.id));
    } else if (currentPick.length === 1) {
      // Deuxième joueur → former un groupe
      const newGroup = [currentPick[0], user];
      const updatedGroups = [...groups, newGroup];
      setGroups(updatedGroups);
      setFormValues((prev) => ({ ...prev, selected_users: updatedGroups }));

      // Nettoyer pour prochain groupe
      setCurrentPick([]);
      setPool((prev) => prev.filter((u) => u.id !== user.id));
    }
  };

  const resetGroups = () => {
    setGroups([]);
    setPool(users);
    setCurrentPick([]);
    setFormValues((prev) => ({ ...prev, selected_users: [] }));
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
          Tous les groupes ont été constitués 🎉
        </p>
      )}

      {/* Récap des groupes */}
      <div>
        <h4 className="font-semibold mb-2">Groupes formés :</h4>
        {groups.length === 0 ? (
          <p className="text-gray-500">Aucun groupe pour l’instant</p>
        ) : (
          <ul className="list-disc ml-6 space-y-1">
            {groups.map((g, idx) => (
              <li key={idx}>
                {g[0]?.username} & {g[1]?.username}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={resetGroups}
        className="px-3 py-1 bg-red-500 text-white rounded"
      >
        Réinitialiser les groupes
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

export default RuleAllianceDay;
