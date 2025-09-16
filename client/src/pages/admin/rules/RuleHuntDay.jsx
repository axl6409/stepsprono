import React, {useEffect, useState} from "react";
import UserWheel from "../../../components/admin/UserWheel.jsx";
import MatchdaySelect from "../../../components/admin/MatchdaySelect.jsx";
import SimpleTitle from "../../../components/partials/SimpleTitle.jsx";

const RuleHuntDay = ({ rule, users, matchdays, formValues, setFormValues }) => {
  const [selectedUser, setSelectedUser] = useState(formValues.selected_user || null );
  const user = users.find((u) => u.id === formValues.selected_user);


  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setFormValues((prev) => ({ ...prev, selected_user: user }));
  };

  return (
    <div className="space-y-6">
      <div>
        <UserWheel users={users} onSelect={handleUserSelect} initialUser={rule.config.selected_user}/>
      </div>

      <div className="border border-black rounded-xl bg-white py-4 my-12 block shadow-flat-black">
        {selectedUser && (
          <>
            <p className="font-rubik text-xl uppercase text-red-medium text-center font-semibold">
              Joueur sélectionné :
            </p>

            <SimpleTitle title={selectedUser.username || user.username} stickyStatus={false}/>
          </>
        )}
      </div>

      <div className="border border-black rounded-xl bg-white py-4 my-12 block shadow-flat-black">
        <div className="flex flex-row justify-evenly gap-8">
          <div className="w-1/3">
            <label htmlFor="points_bonus" className="block text-xs text-center font-semibold uppercase font-rubik">Points bonus</label>
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

          <div className="w-1/3">
            <label htmlFor="points_malus" className="block text-xs text-center font-semibold uppercase font-rubik">Points malus</label>
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
      </div>

      <div className="border border-black rounded-xl bg-white py-4 px-4 my-12 block shadow-flat-black">
        <MatchdaySelect
          matchdays={matchdays}
          value={formValues.matchday}
          onChange={(val) => setFormValues({ ...formValues, matchday: val })}
        />
      </div>
    </div>
  );
};

export default RuleHuntDay;
