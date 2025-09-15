import React from "react";

const MatchdaySelect = ({ matchdays, value, onChange }) => {
  const safeMatchdays = Array.isArray(matchdays) ? matchdays : [];

  return (
    <div className="mb-4">
      <label className="block font-semibold mb-1">Journée sportive</label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="" disabled>— Sélectionner —</option>
        {safeMatchdays.map((m, idx) => (
          <option key={idx} value={m.matchday}>
            {`Journée #${m.matchday}`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MatchdaySelect;
