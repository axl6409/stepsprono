import React, { useState } from "react";
import UserWheel from "../../../components/admin/UserWheel.jsx";
import MatchdaySelect from "../../../components/admin/MatchdaySelect.jsx";
import SimpleTitle from "../../../components/partials/SimpleTitle.jsx";

const RuleHuntDay = ({ users, matchdays, formValues, setFormValues }) => {
  const [selectedUser, setSelectedUser] = useState(formValues.selected_user || null);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setFormValues((prev) => ({ ...prev, selected_user: user }));
  };

  return (
    <div className="space-y-6">
      {/* Roue de sélection */}
      <div>
        <UserWheel users={users} onSelect={handleUserSelect} />
        {selectedUser && (
          <>
            <p className="mt-8 font-rubik text-xl uppercase text-red-medium text-center font-semibold">
              Joueur sélectionné :
            </p>
            <SimpleTitle title={selectedUser.username} stickyStatus={false}/>
          </>
        )}
      </div>

      {/* Points bonus */}
      <div className="flex flex-row justify-evenly gap-8">
        <div className="w-1/3">
          <label htmlFor="points_bonus" className="block font-semibold uppercase font-rubik">Points bonus</label>
          <input
            id="points_bonus"
            name="points_bonus"
            type="number"
            value={formValues.points_bonus ?? ""}
            onChange={(e) =>
              setFormValues({ ...formValues, points_bonus: Number(e.target.value) })
            }
            className="w-full text-center font-rubik font-black text-xl text-green-deep stroke-black border border-black shadow-flat-black-adjust px-2 py-1"
          />
        </div>

        {/* Points malus */}
        <div className="w-1/3">
          <label htmlFor="points_malus" className="block font-semibold uppercase font-rubik">Points malus</label>
          <input
            id="points_malus"
            name="points_malus"
            type="number"
            value={formValues.points_malus ?? ""}
            onChange={(e) =>
              setFormValues({ ...formValues, points_malus: Number(e.target.value) })
            }
            className="w-full text-center font-rubik font-black text-xl text-red-medium stroke-black border border-black shadow-flat-black-adjust px-2 py-1"
          />
        </div>
      </div>

      {/* Sélection journée sportive */}
      <MatchdaySelect
        matchdays={matchdays}
        value={formValues.matchday}
        onChange={(val) => setFormValues({ ...formValues, matchday: val })}
      />
    </div>
  );
};

export default RuleHuntDay;
