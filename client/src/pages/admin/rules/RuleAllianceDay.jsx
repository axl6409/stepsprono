import React, {useEffect, useState} from "react";
import UserWheel from "../../../components/admin/UserWheel.jsx";
import MatchdaySelect from "../../../components/admin/MatchdaySelect.jsx";
import defaultUserImage from "../../../assets/components/user/default-user-profile.png";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const RuleAllianceDay = ({ users, matchdays, formValues, setFormValues }) => {
  const [pool, setPool] = useState(users); // joueurs restants
  const [groups, setGroups] = useState(formValues.selected_users || []); // [[u1,u2], [u3,u4]...]
  const [currentPick, setCurrentPick] = useState([]); // joueur(s) en cours de sélection

  useEffect(() => {
    const isComplete = pool.length === 0 && currentPick.length === 0;
    setFormValues(prev => ({ ...prev, isComplete }));
  }, [pool, currentPick, setFormValues]);

  const handleSelect = (user) => {
    if (pool.length === 2 && currentPick.length === 0) {
      const newGroup = [pool[0], pool[1]];
      const updatedGroups = [...groups, newGroup];
      setGroups(updatedGroups);
      setFormValues((prev) => ({ ...prev, selected_users: updatedGroups }));

      setPool([]);
      setCurrentPick([]);
      return;
    }

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
      {pool.length > 0 ? (
        <div className="flex flex-col justify-center items-center">
          <h3 translate="no" className="font-bold mb-2 font-rubik text-black text-base text-center uppercase">
            {currentPick.length === 0
              ? "Sélection du premier joueur"
              : "Sélection du deuxième joueur"}
          </h3>
          {currentPick.length !== 0 && (
            <div>
              <p translate="no" className="font-rubik text-black text-center text-base font-bold">Premier séléctionné : <span className="text-green-deep stroke-black text-xl font-black block">{currentPick[0]?.username}</span></p>
            </div>
          )}
          <UserWheel users={pool} onSelect={handleSelect} />
        </div>
      ) : (
        <p translate="no" className="text-black font-rubik text-sm font-semibold text-center">
          Tous les groupes ont été constitués 🎉
        </p>
      )}

      {/* Récap des groupes */}
      <div className="border border-black p-4 rounded-xl shadow-flat-black bg-white">
        <h4 translate="no" className="font-bold text-black font-rubik text-base uppercase mb-2">Groupes formés :</h4>
        {groups.length === 0 ? (
          <p translate="no" className="text-gray-800">Aucun groupe pour l’instant</p>
        ) : (
          <ul className="list-disc space-y-1">
            {groups.map((g, idx) => (
              <li key={idx} className="flex flex-row justify-between gap-2 items-center border border-black p-2 rounded-md shadow-flat-black-adjust">
                <span className="w-3/6 flex flex-row justify-start items-center gap-2">
                  <span className="w-10 h-10 border border-black shadow-flat-black-adjust overflow-hidden rounded-full">
                    <img className="w-full h-full object-cover object-center" src={g[0]?.img ? `${apiUrl}/uploads/users/${g[0]?.id}/${g[0]?.img}` : defaultUserImage} alt=""/>
                  </span>
                  <span translate="no" className="font-rubik text-black text-sm font-medium uppercase">{g[0]?.username}</span>
                </span>
                <span className="w-1/6 font-rubik text-black text-base font-black text-center">&</span>
                <span className="w-3/6 flex flex-row-reverse justify-start items-center gap-2">
                  <span className="w-10 h-10 border border-black shadow-flat-black-adjust overflow-hidden rounded-full">
                    <img className="w-full h-full object-cover object-center" src={g[1]?.img ? `${apiUrl}/uploads/users/${g[1]?.id}/${g[1]?.img}` : defaultUserImage} alt=""/>
                  </span>
                  <span translate="no" className="font-rubik text-black text-sm font-medium uppercase">{g[1]?.username}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        translate="no"
        onClick={resetGroups}
        className="px-4 py-2 bg-red-medium font-rubik text-base shadow-flat-black mx-auto block text-white rounded-full"
      >
        Réinitialiser les groupes
      </button>

      <MatchdaySelect
        matchdays={matchdays}
        value={formValues.matchday}
        onChange={(val) => setFormValues({ ...formValues, matchday: val })}
      />
    </div>
  );
};

export default RuleAllianceDay;
