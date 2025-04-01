import React, {useEffect, useState, forwardRef, useImperativeHandle, useMemo} from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import axios from "axios";
import vsIcon from "../../assets/components/matchs/vs-icon.png";
const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

const Pronostic = forwardRef(
  (
    {
      match,
      utcDate,
      userId,
      lastMatch,
      token,
      disabled,
      betDetails,
      refreshBets,
      handleSuccess,
      handleError,
    },
    ref
  ) => {
    const { handleSubmit, register, setValue, reset } = useForm({
      defaultValues: {
        homeScore: "",
        awayScore: "",
        scorer: "",
      },
    });
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [homeScore, setHomeScore] = useState("");
    const [awayScore, setAwayScore] = useState("");
    const [scorer, setScorer] = useState("");
    const [players, setPlayers] = useState([]);
    const colors = ["#6666FF", "#CC99FF", "#00CC99", "#F7B009", "#F41731"];
    const [homeTeamColor, setHomeTeamColor] = useState("");
    const [awayTeamColor, setAwayTeamColor] = useState("");

    const getRandomColor = (exclude) => {
      const filteredColors = colors.filter((color) => color !== exclude);
      return filteredColors[Math.floor(Math.random() * filteredColors.length)];
    };

    // Charger les valeurs existantes du pronostic
    useEffect(() => {
      if (betDetails) {
        setSelectedTeam(betDetails.winner_id);
        setHomeScore(
          betDetails.home_score !== null && betDetails.home_score !== undefined
            ? betDetails.home_score.toString()
            : ""
        );
        setAwayScore(
          betDetails.away_score !== null && betDetails.away_score !== undefined
            ? betDetails.away_score.toString()
            : ""
        );
        setScorer(betDetails.player_goal || "");
        setValue(
          "homeScore",
          betDetails.home_score !== null && betDetails.home_score !== undefined
            ? betDetails.home_score.toString()
            : ""
        );
        setValue(
          "awayScore",
          betDetails.away_score !== null && betDetails.away_score !== undefined
            ? betDetails.away_score.toString()
            : ""
        );
        setValue("scorer", betDetails.player_goal || "");
      } else {
        reset();
        setSelectedTeam(null);
        setHomeScore("");
        setAwayScore("");
        setScorer("");
      }
    }, [betDetails, setValue, reset]);

    // Récupérer la liste des joueurs uniquement si require_details est activé
    useEffect(() => {
      if (!match || !match.require_details) return;
      const fetchPlayers = async () => {
        try {
          const params = new URLSearchParams();
          params.append("teamId1", match.HomeTeam.id);
          params.append("teamId2", match.AwayTeam.id);
          const url = `${apiUrl}/api/players?${params.toString()}`;
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const sortedPlayers = response.data.sort((a, b) =>
            a.Player.name.localeCompare(b.Player.name)
          );
          setPlayers(sortedPlayers);
        } catch (error) {
          console.error("Erreur lors de la récupération des joueurs :", error);
        }
      };
      fetchPlayers();
    }, [match, token]);

    // Définir des couleurs aléatoires pour chaque équipe
    useEffect(() => {
      const initialHomeColor = colors[Math.floor(Math.random() * colors.length)];
      setHomeTeamColor(initialHomeColor);
      setAwayTeamColor(getRandomColor(initialHomeColor));
    }, []);

    // Mise à jour automatique de l’équipe gagnante en fonction des scores
    useEffect(() => {
      if (match && match.require_details && homeScore !== "" && awayScore !== "") {
        const home = parseInt(homeScore, 10);
        const away = parseInt(awayScore, 10);
        if (!isNaN(home) && !isNaN(away)) {
          if (home > away) {
            setSelectedTeam(match.HomeTeam.id);
          } else if (home < away) {
            setSelectedTeam(match.AwayTeam.id);
          } else {
            setSelectedTeam(null);
          }
        }
      }
    }, [homeScore, awayScore, match]);

    // Filtrer la liste des joueurs en fonction des scores
    const eligiblePlayers = useMemo(() => {
      const homeNum = parseInt(homeScore, 10);
      const awayNum = parseInt(awayScore, 10);

      if (isNaN(homeNum) || isNaN(awayNum)) return [];

      if (homeNum === 0 && awayNum === 0) return [];

      if (homeNum > 0 && awayNum === 0) {
        return players.filter((p) => p.team_id === match.HomeTeam.id);
      }

      if (awayNum > 0 && homeNum === 0) {
        return players.filter((p) => p.team_id === match.AwayTeam.id);
      }

      return players;
    }, [homeScore, awayScore, players, match]);

    useImperativeHandle(ref, () => ({
      triggerSubmit: () => {
        handleSubmit(onSubmit)();
      },
    }));

    const onSubmit = async (data, event) => {
      if (event) {
        event.preventDefault();
      }
      const isNewBet = !betDetails || !betDetails.id;
      const endpoint = isNewBet ? "/api/bet/add" : `/api/bet/update/${betDetails.id}`;
      const method = isNewBet ? "post" : "patch";

      let payload = {
        userId: userId,
        competition_id: match.league,
        matchday: match.matchday,
        matchId: match.id,
        winnerId: selectedTeam,
        homeScore: null,
        awayScore: null,
        scorer: null,
      };

      // Si require_details est activé, valider et enregistrer le score et le buteur
      if (match.require_details) {
        if (data.homeScore === "" || data.awayScore === "") {
          handleError("Score obligatoire");
          return;
        }
        const home = parseInt(data.homeScore, 10);
        const away = parseInt(data.awayScore, 10);
        if (isNaN(home) || isNaN(away)) {
          handleError("Score invalide");
          return;
        }
        if (selectedTeam === match.AwayTeam.id && home > away) {
          handleError("Le score n'est pas cohérent avec l'équipe sélectionnée");
          return;
        }
        if (selectedTeam === match.HomeTeam.id && home < away) {
          handleError("Le score n'est pas cohérent avec l'équipe sélectionnée");
          return;
        }
        payload.homeScore = home;
        payload.awayScore = away;
        // Si un vainqueur est désigné, le buteur devient obligatoire
        if (selectedTeam !== null && !data.scorer) {
          handleError("Le buteur est obligatoire");
          return;
        }
        payload.scorer = data.scorer ? data.scorer : null;
      } else {
        // Si require_details est désactivé, on enregistre uniquement l’équipe gagnante
        payload.winnerId = selectedTeam;
      }

      try {
        const response = await axios({
          method: method,
          url: `${apiUrl}${endpoint}`,
          data: payload,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.status === 200) {
          handleSuccess("Prono enregistré avec succès", 1000);
          refreshBets();
        } else {
          handleError(response.data.error || "Erreur lors de l'enregistrement du prono");
        }
      } catch (error) {
        handleError(
          error.response?.data?.error || "Erreur lors de l'envoi du prono"
        );
      }
    };

    function decodeHtml(html) {
      const txt = document.createElement("textarea");
      txt.innerHTML = html;
      return txt.value;
    }

    const cleanPlayerName = (name) => {
      const parts = name.split(" ");
      if (parts.length === 2) {
        return `${parts[1]} .${parts[0][0]}`;
      }
      return name;
    };

    return (
      <div className="modal z-[40] p-1.5 bg-white w-full">
        <div className="modal-content my-auto block w-full mx-auto bg-white">
          <div className="pt-1.5 pb-3 mx-auto w-full">
            {match && (
              <form
                className="prono-form flex flex-col justify-center w-full h-auto"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="relative h-[200px] flex flex-row justify-evenly">
                  <div
                    className="w-3/5 h-full flex flex-col justify-start pt-4 clip-path-diagonal-left rounded-l-xl"
                    style={{ backgroundColor: homeTeamColor }}
                  >
                    <img
                      className="mx-auto object-contain block max-h-[120px] max-w-[150px]"
                      src={
                        apiUrl +
                        "/uploads/teams/" +
                        match.HomeTeam.id +
                        "/" +
                        match.HomeTeam.logo_url
                      }
                      alt={`${match.HomeTeam.name} Logo`}
                    />
                  </div>
                  <img
                    className="absolute z-[10] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    src={vsIcon}
                    alt=""
                  />
                  <div
                    className="w-3/5 h-full flex flex-col justify-end pb-4 clip-path-diagonal-right rounded-r-xl"
                    style={{ backgroundColor: awayTeamColor }}
                  >
                    <img
                      className="mx-auto object-contain max-h-[120px] max-w-[150px]"
                      src={
                        apiUrl +
                        "/uploads/teams/" +
                        match.AwayTeam.id +
                        "/" +
                        match.AwayTeam.logo_url
                      }
                      alt={`${match.AwayTeam.name} Logo`}
                    />
                  </div>
                </div>
                <div className="w-full text-center flex flex-col justify-center px-6 py-4">
                  <p translate="no" className="date-hour capitalize no-correct font-medium">
                    <span translate="no" className="inline-block no-correct font-roboto text-sm mr-4">
                      {utcDate.format("DD/MM/YY")}
                    </span>
                    <span translate="no" className="inline-block no-correct font-roboto text-sm ml-4">
                      {utcDate.format("HH:mm:ss")}
                    </span>
                  </p>
                </div>
                <div className="flex flex-row justify-evenly items-center mb-4">
                  <label
                    translate="no"
                    className={`label-element w-2/5 flex flex-col justify-center relative px-2 cursor-pointer ${
                      selectedTeam === match.HomeTeam.id ? "checked" : ""
                    }`}
                    style={{ "--team-color": homeTeamColor }}
                  >
                    <input
                      translate="no"
                      type="radio"
                      value={match.HomeTeam.id}
                      className="hidden"
                      {...register("team")}
                      onChange={() => setSelectedTeam(match.HomeTeam.id)}
                    />
                    <div className="border border-black rounded-lg z-[2] bg-white py-2.5 px-1 transition-all duration-300">
                      <p translate="no" className="font-roboto text-center leading-4 font-bold text-xs">
                        {match.HomeTeam.name}
                      </p>
                    </div>
                  </label>
                  <label
                    className={`label-element w-1/5 flex flex-col justify-center relative px-2 cursor-pointer ${
                      selectedTeam === null ? "checked" : ""
                    }`}
                  >
                    <input
                      translate="no"
                      type="radio"
                      value=""
                      className="hidden"
                      {...register("team")}
                      onChange={() => setSelectedTeam(null)}
                    />
                    <div className="py-1.5 h-[45px] w-[45px] mx-auto rounded-full bg-white border border-black transition-all duration-300">
                      <p translate="no" className="font-roboto text-center leading-8 font-medium text-sm">
                        nul
                      </p>
                    </div>
                  </label>
                  <label
                    className={`label-element w-2/5 flex flex-col justify-center relative px-2 cursor-pointer ${
                      selectedTeam === match.AwayTeam.id ? "checked" : ""
                    }`}
                    style={{ "--team-color": awayTeamColor }}
                  >
                    <input
                      translate="no"
                      type="radio"
                      value={match.AwayTeam.id}
                      className="hidden"
                      {...register("team")}
                      onChange={() => setSelectedTeam(match.AwayTeam.id)}
                    />
                    <div className="border border-black relative rounded-lg z-[2] bg-white h-full py-2.5 px-1 px-auto transition-all duration-300 ease-in-out">
                      <p translate="no" className="font-roboto text-center no-correct leading-4 font-bold text-xs">
                        {match.AwayTeam.name}
                      </p>
                    </div>
                  </label>
                </div>
                {(match.require_details || match.id === lastMatch.id) && (
                  <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row justify-evenly items-center my-2 w-1/2">
                      <p translate="no" className="font-roboto no-correct text-sm font-regular">Score</p>
                      <label translate="no" className="flex flex-col w-fit max-w-[40px]">
                        <input
                          translate="no"
                          className="border no-correct border-black text-rubik font-black text-base text-center rounded-xl"
                          type="number"
                          min="0"
                          value={homeScore}
                          {...register("homeScore")}
                          onChange={(e) => {
                            setHomeScore(e.target.value);
                            setValue("homeScore", e.target.value);
                          }}
                        />
                      </label>
                      <label translate="no" className="flex no-correct flex-col w-fit max-w-[40px]">
                        <input
                          translate="no"
                          className="border border-black text-rubik font-black text-base text-center rounded-xl"
                          type="number"
                          min="0"
                          value={awayScore}
                          {...register("awayScore")}
                          onChange={(e) => {
                            setAwayScore(e.target.value);
                            setValue("awayScore", e.target.value);
                          }}
                        />
                      </label>
                    </div>
                    {eligiblePlayers.length > 0 && (
                      <div className="flex flex-row justify-evenly my-2 w-1/2">
                        <label className="flex no-correct flex-col w-11/12 ml-auto text-center">
                          <select
                            translate="no"
                            className="border border-black rounded-lg p-1 font-roboto text-sans font-regular text-sm text-center"
                            value={scorer}
                            {...register("scorer")}
                            onChange={(e) => {
                              setScorer(e.target.value);
                              setValue("scorer", e.target.value);
                            }}
                          >
                            <option value="" className="no-correct">Aucun buteur</option>
                            {eligiblePlayers.map((player, index) => (
                              <option key={`${player.player_id}-${index}`} value={player.player_id} className="no-correct">
                                {cleanPlayerName(decodeHtml(player.Player.name))}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Pronostic.displayName = "Pronostic";
Pronostic.propTypes = {
  match: PropTypes.object.isRequired,
  utcDate: PropTypes.object.isRequired,
  userId: PropTypes.number.isRequired,
  lastMatch: PropTypes.object,
  token: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  betDetails: PropTypes.object,
  refreshBets: PropTypes.func.isRequired,
  handleSuccess: PropTypes.func.isRequired,
  handleError: PropTypes.func.isRequired,
};

export default Pronostic;