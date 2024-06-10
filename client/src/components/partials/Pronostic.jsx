import React, {useEffect, useState, forwardRef, useRef, useImperativeHandle} from "react";
import { useForm } from 'react-hook-form';
import axios from "axios";
import moment from "moment";
import vsIcon from "../../assets/components/matchs/vs-icon.png";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Pronostic = forwardRef(({ match, utcDate, userId, lastMatch, token, disabled, betDetails, refreshBets, handleSuccess, handleError }, ref) => {
  const { handleSubmit, register, setValue } = useForm();
  const formRef = useRef();
  const [formData, setFormData] = useState({
    userId: '',
    matchId: '',
    winnerId: '',
    homeScore: '',
    awayScore: '',
    playerGoal: ''
  })
  const [selectedTeam, setSelectedTeam] = useState();
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [players, setPlayers] = useState([]);
  const [scorer, setScorer] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const colors = ['#6666FF', '#CC99FF', '#00CC99', '#F7B009', '#F41731'];
  const [homeTeamColor, setHomeTeamColor] = useState('');
  const [awayTeamColor, setAwayTeamColor] = useState('');

  const getRandomColor = (exclude) => {
    const filteredColors = colors.filter(color => color !== exclude);
    return filteredColors[Math.floor(Math.random() * filteredColors.length)];
  };

  useEffect(() => {
    if (betDetails) {
      setSelectedTeam(betDetails.winnerId)
      setHomeScore(betDetails.homeScore)
      setAwayScore(betDetails.awayScore)
      setScorer(betDetails.playerGoal);
      setValue('homeScore', betDetails.homeScore)
      setValue('awayScore', betDetails.awayScore)
      setValue('playerGoal', betDetails.playerGoal)
      setValue('scorer', betDetails.playerGoal);
    }
  }, [betDetails]);

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

  useEffect(() => {
    const initialHomeColor = colors[Math.floor(Math.random() * colors.length)];
    setHomeTeamColor(initialHomeColor);
    setAwayTeamColor(getRandomColor(initialHomeColor));
  }, []);

  useImperativeHandle(ref, () => ({
    triggerSubmit: () => {
      handleSubmit(onSubmit)();
    }
  }));

  const onSubmit = async (data, event) => {
    if (event) {
      event.preventDefault();
    }
    const isNewBet = !betDetails || !betDetails.id;
    const endpoint = isNewBet ? '/api/bet/add' : `/api/bet/update/${betDetails.id}`;
    const method = isNewBet ? 'post' : 'patch'
    const playerGoal = data.scorer === "null" ? null : data.scorer;
    const payload = {
      ...data,
      userId: userId,
      seasonId: seasonId,
      competitionId: match.league,
      matchday: match.matchday,
      matchId: match.id,
      winnerId: selectedTeam,
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      playerGoal: playerGoal
    };
    try {
      if (match.id === lastMatch.id) {
        if (!data.homeScore || !data.awayScore) {
          handleError('Score obligatoire');
          return
        }
      }
      const response = await axios({
        method: method,
        url: `${apiUrl}${endpoint}`,
        data: payload,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        handleSuccess('Prono enregistré avec succès');
        refreshBets();
      } else {
        handleError(response.data.error || 'Erreur lors de l\'enregistrement du prono');
      }
    } catch (error) {
      handleError(error.response.data.error || 'Erreur lors de l\'envoi du prono');
    }
  };

  return (
    <div className={`modal z-[40] p-1.5 bg-white w-full`}>
      <div className="modal-content my-auto block w-full mx-auto bg-white">
        <div className="pt-1.5 pb-3 mx-auto w-full">
          {match && (
            <form
              ref={ref}
              className="prono-form flex flex-col justify-center w-full h-auto"
              onSubmit={handleSubmit(onSubmit)}>
              <div className="relative h-[200px] flex flex-row justify-evenly">
                <div className="w-3/5 h-full flex flex-col justify-start pt-4 clip-path-diagonal-left rounded-l-xl"
                     style={{backgroundColor: homeTeamColor}}>
                  <img className="mx-auto object-contain block max-h-[120px] max-w-[150px]" src={match.HomeTeam.logoUrl + ".svg"}
                       alt={`${match.HomeTeam.name} Logo`}/>
                </div>
                <img className="absolute z-[10] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" src={vsIcon}
                     alt=""/>
                <div className="w-3/5 h-full flex flex-col justify-end pb-4 clip-path-diagonal-right rounded-r-xl"
                     style={{backgroundColor: awayTeamColor}}>
                  <img className="mx-auto object-contain max-h-[120px] max-w-[150px]" src={match.AwayTeam.logoUrl + ".svg"}
                       alt={`${match.AwayTeam.name} Logo`}/>
                </div>
              </div>
              <div className="w-full text-center flex flex-col justify-center px-6 py-4">
                <p className="date-hour capitalize font-medium">
                  <span className="inline-block font-roboto text-sm mr-2.5">{utcDate.format('DD/MM/YY')}</span>
                  <span className="inline-block font-roboto text-sm">{utcDate.format('HH:mm:ss')}</span>
                </p>
              </div>
              <div className="flex flex-row justify-evenly items-center mb-4">
                <label
                  className={`label-element w-2/5 h-auto flex flex-col justify-center relative px-2 cursor-pointer ${selectedTeam === match.HomeTeam.id ? 'checked' : ''}`}
                  style={{ '--team-color': homeTeamColor }}
                >
                  <input
                    type="radio"
                    value={match.HomeTeam.id}
                    className="hidden"
                    {...register("team")}
                    onChange={() => setSelectedTeam(match.HomeTeam.id)}
                  />
                  <div
                    className="border border-black relative rounded-lg z-[2] bg-white h-full py-2.5 px-1 px-auto transition-all duration-300 ease-in-out">
                    <p className="font-roboto text-center leading-4 font-bold text-xs">{match.HomeTeam.name}</p>
                  </div>
                </label>
                <label
                  className={`label-element w-1/5 h-auto flex flex-col justify-center relative px-2 cursor-pointer ${selectedTeam === null ? 'checked' : ''}`}>
                  <input
                    type="radio"
                    value=""
                    className="hidden"
                    {...register("team")}
                    onChange={() => setSelectedTeam(null)}
                  />
                  <div
                    className="py-1.5 h-[45px] w-[45px] mx-auto rounded-full bg-white border border-black transition-all duration-300 ease-in-out">
                    <p className="font-roboto text-center leading-8 font-medium text-sm">nul</p>
                  </div>
                </label>
                <label
                  className={`label-element w-2/5 h-auto flex flex-col justify-center relative px-2 cursor-pointer ${selectedTeam === match.AwayTeam.id ? 'checked' : ''}`}
                  style={{ '--team-color': awayTeamColor }}
                >
                  <input
                    type="radio"
                    value={match.AwayTeam.id}
                    className="hidden"
                    {...register("team")}
                    onChange={() => setSelectedTeam(match.AwayTeam.id)}
                  />
                  <div
                    className="border border-black relative rounded-lg z-[2] bg-white h-full py-2.5 px-1 px-auto transition-all duration-300 ease-in-out">
                    <p className="font-roboto text-center leading-4 font-bold text-xs">{match.AwayTeam.name}</p>
                  </div>
                </label>
              </div>
              {match && match.id === lastMatch.id && (
                <>
                  <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row justify-evenly items-center my-2 w-1/2">
                      <p className="font-roboto text-sm font-regular">Score</p>
                      <label className="flex flex-col w-fit max-w-[35px]">
                        <input
                          className="border border-black text-rubik font-black text-base text-center rounded-xl"
                          type="number"
                          {...register("homeScore")}
                          onChange={(e) => setHomeScore(e.target.value)}
                        />
                      </label>
                      <label className="flex flex-col w-fit max-w-[35px]">
                        <input
                          className="border border-black text-rubik font-black text-base text-center rounded-xl"
                          type="number"
                          {...register("awayScore")}
                          onChange={(e) => setAwayScore(e.target.value)}
                        />
                      </label>
                    </div>
                    <div className="flex flex-row justify-evenly my-2 w-1/2">
                      {((homeScore > 0 || awayScore > 0) && players.length > 0) && (
                        <label className="flex flex-col w-11/12 ml-auto text-center">
                          <select
                            className="border border-black rounded-lg p-1 font-roboto text-sans font-regular text-sm text-center"
                            {...register("scorer")}
                            onChange={(e) => setScorer(e.target.value)}
                          >
                            <option value={"null"}>Aucun butteur</option>
                            {players.map((player, index) => {
                              return (
                                <option key={`${player.playerId}-${index}`} value={player.playerId}>{player.Player.name}</option>
                              );
                            })}
                          </select>
                        </label>
                      )}
                    </div>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
});

export default Pronostic