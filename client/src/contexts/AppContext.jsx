import React, {createContext, useState, useEffect, useContext, useRef} from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
import {UserContext} from "./UserContext.jsx";
import moment from 'moment-timezone';
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

// Créer un Contexte
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useContext(UserContext);
  const fetchedRef = useRef(false);
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const [apiCalls, setApiCalls] = useState({ current: 0, limit_day: 0, error: false, error_message: '' });
  const [isDebuggerActive, setIsDebuggerActive] = useState(cookies.debug || false);
  const [isDebuggerOpen, setIsDebuggerOpen] = useState(false);
  const [isCountDownPopupOpen, setIsCountDownPopupOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRequests, setUserRequests] = useState([]);
  const [matchsCronTasks, setMatchsCronTasks] = useState([]);
  const [availableCompetitions, setAvailableCompetitions] = useState([]);
  const [currentSeason, setCurrentSeason] = useState([]);
  const [canDisplayBets, setCanDisplayBets] = useState(false);
  const [currentMatchday, setCurrentMatchday] = useState(null);
  const [matchs, setMatchs] = useState([]);
  const [lastMatch, setLastMatch] = useState(null);
  const [noMatches, setNoMatches] = useState(false);
  const [bettingPeriods, setBettingPeriods] = useState([]);
  const [activePeriod, setActivePeriod] = useState(null);
  const [hasMultiplePeriods, setHasMultiplePeriods] = useState(false);
  const [clock, setClock] = useState({
    now: moment(),
    simulated: false,
    tz: "Europe/Paris"
  });
  const [logs, setLogs] = useState({ warning: "", combined: "", error: "" });

  useEffect(() => {
    if (!fetchedRef.current && isAuthenticated && user) {
      // IMPORTANT: fetchClock() doit être appelé EN PREMIER pour avoir l'heure simulée
      const initializeApp = async () => {
        await fetchClock(); // Charger l'heure simulée d'abord
        await fetchAvailableCompetitions();
        await fetchCurrentSeason();
        await fetchMatchs();
        if (isDebuggerActive) {
          await fectchLogs();
        }
        fetchedRef.current = true; // Marquer comme chargé
      };
      initializeApp();
    }
    if (isAuthenticated && user && user.role === 'admin') {
      fetchAPICalls();
      fetchUsersRequests()
      fetchMatchsCronJobs();
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    setCookie('debug', isDebuggerActive, { path: '/' });
  }, [isDebuggerActive, setCookie]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const fetchAPICalls = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/app/calls`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (response.data && response.data.calls && response.data.calls.response && response.data.calls.response.requests) {
        setApiCalls({
          current: response.data.calls.response.requests.current,
          limit_day: response.data.calls.response.requests.limit_day,
          error: false,
          error_message: '',
        });
      } else {
        setApiCalls({
          error: true,
          error_message: response.data.calls.errors.rateLimit,
        });
      }
    } catch (error) {
      setApiCalls({
        error: true,
        error_message: error,
      })
    }
  }
  const fetchUsersRequests = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/users/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      setUserRequests(response.data)
    } catch (error) {
      console.error(error)
    }
  }
  const refreshUserRequests = async () => {
    await fetchUsersRequests();
  };
  const toggleDebugger = () => {
    setIsDebuggerActive(!isDebuggerActive);
  };
  const toggleDebuggerModal = () => {
    setIsDebuggerOpen(!isDebuggerOpen);
  };
  const toggleCountDownModal = () => {
    setIsCountDownPopupOpen(!isCountDownPopupOpen)
  }
  const fetchMatchsCronJobs = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/matchs/cron-tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMatchsCronTasks(response.data.tasks);
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches cron', error);
    }
  }
  const fetchAvailableCompetitions = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/competitions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAvailableCompetitions(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des compétitions disponibles', error);
    }
  }
  const fetchCurrentSeason = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/seasons/current/datas/61`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setCurrentSeason(response.data.currentSeason)
    } catch (error) {
      console.log('Erreur lors de la récupération de la saison actuelle', error);
    }
  }
  const fetchMatchs = async () => {
    const response = await axios.get(`${apiUrl}/api/matchs/current-week`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const allMatchs = response.data.data || [];

    // Récupérer les données de périodes
    const bettingPeriodsData = response.data.bettingPeriods || [];
    const activePeriodData = response.data.activePeriod || null;
    const hasMultiplePeriodsData = response.data.hasMultiplePeriods || false;

    setBettingPeriods(bettingPeriodsData);
    setActivePeriod(activePeriodData);
    setHasMultiplePeriods(hasMultiplePeriodsData);

    // Déterminer le matchday à afficher basé sur TOUS les matchs (terminés inclus)
    let displayMatchday;
    if (hasMultiplePeriodsData && activePeriodData) {
      // Si plusieurs périodes, utiliser la période active
      displayMatchday = activePeriodData.matchday;
    } else if (allMatchs.length > 0) {
      // Sinon, utiliser le matchday du premier match de la semaine
      displayMatchday = allMatchs[0].matchday;
    } else {
      displayMatchday = null;
    }

    setCurrentMatchday(displayMatchday);

    const sortedMatchs = allMatchs
      .filter(m => m.status !== "FT") // 👈 filtre
      .sort((a, b) => new Date(a.utc_date) - new Date(b.utc_date));

    // Pas de matchs du tout dans la semaine
    if (allMatchs.length === 0) {
      setNoMatches(true);
      return;
    }

    // Tous les matchs de la semaine sont terminés
    if (sortedMatchs.length === 0) {
      setNoMatches(false); // Il y a des matchs, juste tous terminés
      setMatchs([]);
      setLastMatch(null);
    } else {
      setNoMatches(false);
      setMatchs(sortedMatchs);
      setLastMatch(sortedMatchs[sortedMatchs.length - 1]);
    }

    // Déterminer le matchday à vérifier
    // Si plusieurs périodes: utiliser le matchday de la période active
    // Si une seule période: utiliser le currentMatchday global
    let matchdayToCheck;
    if (hasMultiplePeriodsData && activePeriodData) {
      matchdayToCheck = activePeriodData.matchday;
    } else {
      matchdayToCheck = response.data.currentMatchday;
    }

    const currentMatchdayMatches = allMatchs.filter(m => m.matchday === matchdayToCheck);

    if (currentMatchdayMatches.length === 0) {
      setCanDisplayBets(true);
      return;
    }

    // Déterminer si on peut afficher les pronostics
    // Pour les semaines avec plusieurs périodes, vérifier si la période active est ouverte
    let shouldDisplayBets = false;

    if (hasMultiplePeriodsData && activePeriodData) {
      // Semaine avec plusieurs périodes
      if (activePeriodData.isActive) {
        // La période est ouverte : on peut faire des pronos
        shouldDisplayBets = false;
      } else if (activePeriodData.reopenTime) {
        // Période avec réouverture (pas la dernière période)
        const reopenTime = moment(activePeriodData.reopenTime);
        const deadline = moment(activePeriodData.deadline);
        const now = clock.now;

        if (now.isBefore(reopenTime)) {
          // On est entre deux périodes → afficher "Voir tous les pronos"
          shouldDisplayBets = true;
        } else if (now.isAfter(deadline)) {
          // Après la deadline de cette période → afficher "Voir tous les pronos"
          shouldDisplayBets = true;
        } else {
          // Après l'heure de réouverture mais avant la deadline → on peut parier
          shouldDisplayBets = false;
        }
      } else {
        // Période fermée sans réouverture (dernière période) → afficher "Voir tous les pronos"
        const deadline = moment(activePeriodData.deadline);
        const now = clock.now;

        if (now.isAfter(deadline)) {
          shouldDisplayBets = true;
        }
      }
    } else {
      // Semaine normale: vérifier les deadlines par matchday
      // Extraire tous les matchdays uniques de la semaine
      const uniqueMatchdays = [...new Set(allMatchs.map(m => m.matchday))];

      // Pour chaque matchday, calculer sa deadline (12h00 le jour du premier match)
      const allDeadlinesPassed = uniqueMatchdays.every(matchday => {
        // Trouver tous les matchs de ce matchday
        const matchdayMatches = allMatchs.filter(m => m.matchday === matchday);
        if (matchdayMatches.length === 0) return true;

        // Trouver le premier match de ce matchday
        const firstMatch = matchdayMatches.reduce((earliest, current) => {
          return moment(current.utc_date).isBefore(moment(earliest.utc_date)) ? current : earliest;
        });

        // Calculer la deadline : 12h00 le jour du premier match (en heure locale)
        const firstMatchDate = moment(firstMatch.utc_date);
        const localFirstMatchDate = firstMatchDate.clone().tz(clock.tz || 'Europe/Paris');
        const deadline = localFirstMatchDate.clone().startOf('day').hour(12).minute(0).second(0).millisecond(0);

        const now = clock.now;

        // Retourner true si la deadline est passée
        return now.isAfter(deadline);
      });

      // Si toutes les deadlines sont passées, afficher "Voir tous les pronos"
      shouldDisplayBets = allDeadlinesPassed;
    }

    setCanDisplayBets(shouldDisplayBets);

  };
  const fetchClock = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/app/clock/now`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data && response.data.clockInfo) {
        const { nowLocal, simulated, tz } = response.data.clockInfo;
        setClock({
          now: moment.tz(nowLocal, tz),
          simulated,
          tz
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'horloge :", error);
      setClock({
        now: moment(),
        simulated: false,
        tz: "Europe/Paris"
      });
    }
  };
  const fectchLogs = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/app/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setLogs(response.data.logs);
    } catch (error) {
      console.error("Erreur lors de la récupération des logs :", error);
    }
  }

  return (
    <AppContext.Provider
      value={{
        fetchAPICalls,
        apiCalls,
        isDebuggerActive,
        toggleDebugger,
        isDebuggerOpen,
        setIsDebuggerActive,
        toggleDebuggerModal,
        userRequests,
        availableCompetitions,
        currentSeason,
        refreshUserRequests,
        isCountDownPopupOpen,
        toggleCountDownModal,
        menuOpen,
        setMenuOpen,
        matchsCronTasks,
        fetchMatchsCronJobs,
        isLoading,
        setIsLoading,
        noMatches,
        matchs,
        canDisplayBets,
        currentMatchday,
        lastMatch,
        fetchMatchs,
        clock,
        fetchClock,
        logs,
        bettingPeriods,
        activePeriod,
        hasMultiplePeriods
      }}>
      {children}
    </AppContext.Provider>
  );
};
