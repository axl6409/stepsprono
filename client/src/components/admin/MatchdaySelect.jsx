import React, {useContext} from "react";
import {AppContext} from "../../contexts/AppContext.jsx";

const MatchdaySelect = ({ matchdays, value, onChange }) => {
  const { currentSeason } = useContext(AppContext);
  const safeMatchdays = Array.isArray(matchdays) ? matchdays : [];

  const futureMatchdays = safeMatchdays.filter(
    (m) => m.matchday > currentSeason?.current_matchday
  );

  return (
    <div className="mb-4">
      <label className="block font-rubik text-center font-bold uppercase mb-1">Activer sur la journée :</label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-black text-center font-rubik uppercase shadow-flat-black-adjust px-3 py-2"
      >
        <option value="" disabled>— Sélectionner une journée —</option>
        {futureMatchdays .map((m, idx) => (
          <option key={idx} value={m.matchday}>
            {`Journée #${m.matchday}`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MatchdaySelect;
