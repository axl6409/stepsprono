import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import Loader from "../../components/partials/Loader.jsx";
import BackButton from "../../components/nav/BackButton.jsx";
import SimpleTitle from "../../components/partials/SimpleTitle.jsx";
import { AppContext } from "../../contexts/AppContext.jsx";

import RuleHuntDay from "./rules/RuleHuntDay";
import MatchdaySelect from "../../components/admin/MatchdaySelect.jsx";
import RuleAllianceDay from "./rules/RuleAllianceDay.jsx";
import RuleSwapPredictions from "./rules/RuleSwapPredictions.jsx";
import RuleMysteryBox from "./rules/RuleMysteryBox.jsx";

const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

function SpecialRuleConfig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cookies] = useCookies(["token"]);
  const token = localStorage.getItem("token") || cookies.token;

  const { currentSeason } = useContext(AppContext);

  const [rules, setRules] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [videoFile, setVideoFile] = useState(null);

  const [users, setUsers] = useState([]);
  const [matchdays, setMatchdays] = useState([]);
  const [loading, setLoading] = useState(true);

  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  useEffect(() => {
    (async () => {
      try {
        // 1) Règle
        const resRule = await axios.get(
          `${apiUrl}/api/special-rule/datas/${id}`,
          authHeaders
        );
        setRules(resRule.data);
        setFormValues(resRule.data?.config || {});

        // 2) Users (saison courante uniquement)
        const resUsers = await axios.get(`${apiUrl}/api/users/all`, authHeaders);
        const filtered = (resUsers.data || []).filter((u) =>
          u.user_seasons?.some(
            (s) => s.season_id === currentSeason.id && s.is_active
          )
        );
        const sorted = [...filtered].sort((a, b) =>
          a.username.localeCompare(b.username)
        );
        setUsers(sorted);

        // 3) Matchdays
        const resMatch = await axios.get(
          `${apiUrl}/api/matchs/matchdays/all?season_id=${currentSeason.id}`,
          authHeaders
        );
        setMatchdays(resMatch.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    try {
      console.log(formValues)
      await axios.patch(
        `${apiUrl}/api/admin/special-rule/datas/${id}`,
        { config: formValues },
        authHeaders
      );
      // navigate("/admin/rules");
    } catch (err) {
      console.error(err);
    }
  };

  const renderByRule = () => {
    if (!rules) return null;

    switch (rules.rule_key) {
      // Règle 1 — composant dédié
      case "hunt_day":
        return (
          <RuleHuntDay
            rule={rules}
            users={users}
            matchdays={matchdays}
            formValues={formValues}
            setFormValues={setFormValues}
          />
        );

      // En attendant les autres composants, on affiche juste la sélection de journée
      case "hidden_predictions":
      case "half_penalty_day":
      case "goal_day":
      case "high_penalty_day":
      case "massacre_day":
      case "alliance_day":
        return (
          <RuleAllianceDay
            users={users}
            matchdays={matchdays}
            formValues={formValues}
            setFormValues={setFormValues}
          />
        );
      case "swap_predictions":
        return (
          <RuleSwapPredictions
            users={users}
            matchdays={matchdays}
            formValues={formValues}
            setFormValues={setFormValues}
          />
        );
      case "mystery_box":
        return (
          <RuleMysteryBox
            users={users}
            matchdays={matchdays}
            formValues={formValues}
            setFormValues={setFormValues}
          />
        );
      default:
        return (
          <>
            <p className="mb-4 text-sm text-gray-600">
              (UI spécifique à cette règle à venir)
            </p>
            <MatchdaySelect
              matchdays={matchdays}
              value={formValues.matchday}
              onChange={(val) =>
                setFormValues((prev) => ({ ...prev, matchday: val }))
              }
            />
          </>
        );
    }
  };

  if (loading) return <Loader />;
  if (!rules) return <p className="p-6">Règle introuvable.</p>;

  return (
    <div className="inline-block relative z-20 w-full h-auto py-20 px-4">
      <BackButton />
      <SimpleTitle title={rules.name} stickyStatus={false} />

      <div className="bg-white border border-black shadow-flat-black rounded-xl p-6 mb-8">
        {formValues.description && (
          <p className="font-rubik text-lg mb-6 text-black">{formValues.description}</p>
        )}
      </div>

      <h2 className="font-roboto text-xl4 uppercase text-white font-black text-center my-4 text-stroke-black-2">
        Configuration
      </h2>

      {renderByRule()}

      {/* Upload vidéo (commun) */}
      <div className="mb-6 mt-8">
        <label className="block font-semibold">Vidéo de présentation</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files[0])}
          className="mt-1"
        />
        {formValues.video && (
          <video src={formValues.video} controls className="mt-2 w-full" />
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

export default SpecialRuleConfig;
