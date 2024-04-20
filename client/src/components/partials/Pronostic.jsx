import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft, faCheck, faPaperPlane, faReceipt, faXmark} from "@fortawesome/free-solid-svg-icons";
import { useForm } from 'react-hook-form';
import axios from "axios";
import moment from "moment";
import vsIcon from "../../assets/components/matchs/vs-icon.png";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Pronostic = ({ match, utcDate, userId, lastMatch, token }) => {
  const { handleSubmit, register, setValue } = useForm();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    userId: '',
    matchId: '',
    winnerId: '',
    homeScore: '',
    awayScore: '',
    playerGoal: ''
  })
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [players, setPlayers] = useState([]);
  const [scorer, setScorer] = useState('');
  const [seasonId, setSeasonId] = useState('');

  useEffect(() => {
    const fetchSeasonId = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/seasons/current/${match.league}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setSeasonId(response.data.currentSeason);
      } catch (error) {
        console.error('Erreur lors de la création de la saison :', error);
      }
    };
    if (match) {
      fetchSeasonId();
    }
  }, [match]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        let url = `${apiUrl}/api/players`;
        if (selectedTeam === null) {
          url += `?teamId1=${match.HomeTeam.id}&teamId2=${match.AwayTeam.id}`;
        } else if (selectedTeam) {
          url += `?teamId1=${selectedTeam}`;
        } else {
          return;
        }
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setPlayers(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des joueurs :', error);
      }
    }
    if (match) {
      fetchPlayers();
    }
  }, [match, selectedTeam, token])

  const onSubmit = async (data) => {
    try {
      if (match.id === lastMatch.id) {
        if (!data.homeScore || !data.awayScore) {
          setErrorMessage('Score obligatoire');
          return
        }
      }
      const playerGoal = data.scorer === "null" ? null : data.scorer;
      console.log(playerGoal)

      const payload = {
        ...data,
        userId: userId,
        seasonId: seasonId,
        matchId: match.id,
        competitionId: match.league,
        matchday: match.matchday,
        winnerId: selectedTeam,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        playerGoal: playerGoal
      };

      const response = await axios.post(`${apiUrl}/api/bet/add`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        setSuccessMessage('Prono enregistré avec succès:');
        setTimeout(function () {
          setSuccessMessage('')
          setErrorMessage('')
          setSelectedTeam('')
          setSelectedTeam(null)
        }, 1000)
      } else {
        setErrorMessage(response.error || 'Erreur lors de l\'enregistrement du prono');
        setSuccessMessage('')
      }
    } catch (error) {
      setErrorMessage(error.response.data.error || 'Erreur lors de l\'envoi du prono');
      setSuccessMessage('')
    }
  };

  return (
    <div className={`modal z-[40] w-full pb-8`}>
      {errorMessage && (
        <div className="modal-error relative w-[80%] mr-auto ml-4 py-2 px-4 mb-4 border-2 border-black shadow-flat-black bg-deep-red text-white">
          <p className="font-sans uppercase font-bold text-xxs">{errorMessage}</p>
        </div>
      )}
      {successMessage && (
        <div className="modal-error relative w-[80%] mr-auto ml-4 py-2 px-4 mb-4 border-2 border-black shadow-flat-black bg-green-lime-deep text-white">
          <p className="font-sans uppercase font-bold text-xxs">{successMessage}</p>
        </div>
      )}
      <div className="modal-content my-auto block w-[95%] mx-auto bg-white">
        <div className="py-4 px-2 mx-auto border-2 border-black w-full shadow-flat-black">
          <p className="text-sans uppercase text-black font-bold text-md mb-4">Sélectionner une équipe</p>
          {match && (
            <form
              className="prono-form flex flex-col justify-center w-full h-auto"
              onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-row justify-evenly mb-4">
                <label
                  className={`label-element relative w-[80px] h-[80px] cursor-pointer ${selectedTeam === match.HomeTeam.id ? 'checked' : ''}`}>
                  <input
                    type="radio"
                    value={match.HomeTeam.id}
                    className="hidden"
                    {...register("team")}
                    onChange={() => setSelectedTeam(match.HomeTeam.id)}
                  />
                  <div className="border-2 border-black relative z-[2] bg-white h-full p-2.5 px-auto">
                    <img className="mx-auto h-full" src={match.HomeTeam.logoUrl} alt={`${match.HomeTeam.name} Logo`}/>
                  </div>
                </label>
                <label
                  className={`label-element relative w-[80px] h-[80px] cursor-pointer ${selectedTeam === null ? 'checked' : ''}`}>
                  <input
                    type="radio"
                    value=""
                    className="hidden"
                    {...register("team")}
                    onChange={() => setSelectedTeam(null)}
                  />
                  <div
                    className="w-full h-full flex flex-col justify-center border-2 border-black bg-white relative z-[2]">
                    <p className="font-sans uppercase text-black font-medium text-sm">nul</p>
                  </div>
                </label>
                <label
                  className={`label-element relative w-[80px] h-[80px] cursor-pointer ${selectedTeam === match.AwayTeam.id ? 'checked' : ''}`}>
                  <input
                    type="radio"
                    value={match.AwayTeam.id}
                    className="hidden"
                    {...register("team")}
                    onChange={() => setSelectedTeam(match.AwayTeam.id)}
                  />
                  <div className="border-2 border-black relative z-[2] bg-white h-full p-2.5 px-auto">
                    <img className="mx-auto h-full" src={match.AwayTeam.logoUrl} alt={`${match.AwayTeam.name} Logo`}/>
                  </div>
                </label>
              </div>
              <div className="w-full text-center flex flex-col justify-center px-6 py-2">
                <p className="name font-sans text-base font-bold capitalize">{utcDate.format('DD MMMM')}
                  <span className="flex flex-row justify-center">
                    <span
                      className="inline-block bg-white shadow-flat-black text-black px-2 pb-1.5 font-title leading-6 font-medium text-xl mx-0.5 border-2 border-black">{utcDate.format('HH')}</span>
                    <span
                      className="inline-block bg-white shadow-flat-black text-black px-2 pb-1.5 font-title leading-6 font-medium text-xl mx-0.5 border-2 border-black">{utcDate.format('mm')}</span>
                    <span
                      className="inline-block bg-white shadow-flat-black text-black px-2 pb-1.5 font-title leading-6 font-medium text-xl mx-0.5 border-2 border-black">{utcDate.format('ss')}</span>
                  </span>
                </p>
              </div>
              {match && match.id === lastMatch.id && (
                <>
                  <div className="flex flex-row justify-evenly my-4">
                    <label className="flex flex-col w-2/5">
                      <span className="font-sans uppercase text-black font-medium text-sm">Score</span>
                      <span className="font-sans text-black font-medium text-sm">{match.HomeTeam.shortName}</span>
                      <input
                        className="border-2 border-black text-sans font-medium text-base text-center shadow-flat-black"
                        type="number"
                        {...register("homeScore")}
                        onChange={(e) => setHomeScore(e.target.value)}
                      />
                    </label>
                    <label className="flex flex-col w-2/5">
                      <span className="font-sans uppercase text-black font-medium text-sm">Score</span>
                      <span className="font-sans text-black font-medium text-sm">{match.AwayTeam.shortName}</span>
                      <input
                        className="border-2 border-black text-sans font-medium text-base text-center shadow-flat-black"
                        type="number"
                        {...register("awayScore")}
                        onChange={(e) => setAwayScore(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="flex flex-row justify-evenly my-4">
                    {((homeScore > 0 || awayScore > 0) && players.length > 0) && (
                      <label className="flex flex-col w-4/5 mx-auto text-center">
                        <span className="font-sans uppercase text-black font-medium text-sm">Buteur:</span>
                        <select
                          className="border-2 border-black text-sans font-medium text-base text-center shadow-flat-black"
                          {...register("scorer")}
                          onChange={(e) => setScorer(e.target.value)}
                        >
                          <option value={"null"}>Aucun butteur</option>
                          {players.map(player => {
                            return (
                              <option key={player.playerId} value={player.playerId}>{player.Player.name}</option>
                            );
                          })}
                        </select>
                      </label>
                    )}
                  </div>
                </>
              )}
              <button
                className="relative mt-8 mx-auto block h-fit before:content-[''] before:inline-block before:absolute before:z-[1] before:inset-0 before:rounded-md before:bg-green-lime before:border-black before:border-2 group"
                type="submit"
              >
                <span
                  className="relative z-[2] w-full flex flex-row justify-center border-2 border-black text-black px-4 py-1.5 rounded-md text-center font-sans uppercase font-bold shadow-md bg-white transition -translate-y-1 -translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0">
                  Envoyer
                  <FontAwesomeIcon icon={faPaperPlane} className="ml-4"/>
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pronostic