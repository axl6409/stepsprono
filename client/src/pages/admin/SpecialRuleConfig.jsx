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
import RuleSimple from "./rules/RuleSimple.jsx";
import AlertModal from "../../components/modals/AlertModal.jsx";

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

  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState(null);

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
      const res = await axios.patch(
        `${apiUrl}/api/admin/special-rule/datas/${id}`,
        { config: formValues },
        authHeaders
      );
      if (res.status === 200) {
        setAlertMessage("Configuration mise à jour avec succès.");
        setAlertType('success');

        setTimeout(() => {
          navigate('/admin/rules', { replace: true });
        }, 1500);
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err);
      setAlertMessage("Impossible d'enregistrer la configuration");
      setAlertType('error');
      setTimeout(() => setAlertMessage(''), 2000);
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
      case "massacre_day":
      case "high_penalty_day":
        return (
          <RuleSimple
            matchdays={matchdays}
            formValues={formValues}
            setFormValues={setFormValues}
          />
        );
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
            <p translate="no" className="mb-4 text-sm text-gray-600">
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
  if (!rules) return <p className="p-6" translate="no">Règles introuvables.</p>;

  return (
    <div className="inline-block relative z-20 w-full h-auto py-20 px-4 overflow-x-hidden">
      <AlertModal message={alertMessage} type={alertType} />
      <BackButton />
      <SimpleTitle title={rules.name} stickyStatus={false} marginBottom={'2rem'} />

      <div className="bg-white border border-black shadow-flat-black rounded-xl p-6 mb-8">
        {formValues.description && (
          <p translate="no" className="font-rubik text-lg text-black">{formValues.description}</p>
        )}
      </div>

      <h2 translate="no" className="font-roboto text-xl4 uppercase text-black font-black text-center my-4 text-stroke-black-2">
        Configuration
      </h2>

      {renderByRule()}

      <div className="flex justify-center mt-8">
        <button
          translate="no"
          onClick={handleSave}
          disabled={!formValues.isComplete}
          className={`px-8 py-2 font-rubik text-sm uppercase font-medium rounded-full border border-black shadow-flat-black 
            ${formValues.isComplete
            ? "bg-green-deep text-black cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

export default SpecialRuleConfig;
