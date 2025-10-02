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
  const [clock, setClock] = useState({
    now: moment(),
    simulated: false,
    tz: "Europe/Paris"
  });
  const [logs, setLogs] = useState({ warning: "", combined: "", error: "" });

  useEffect(() => {
    if (!fetchedRef.current && isAuthenticated && user) {
      fetchAvailableCompetitions();
      fetchCurrentSeason();
      fetchMatchs();
      fetchClock();
      if (isDebuggerActive) {
        fectchLogs();
      }
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

    const sortedMatchs = allMatchs
      .filter(m => m.status !== "FT") // 👈 filtre
      .sort((a, b) => new Date(a.utc_date) - new Date(b.utc_date));

    setCurrentMatchday(response.data.currentMatchday);

    if (sortedMatchs.length === 0) {
      setNoMatches(true);
      return;
    }

    setMatchs(sortedMatchs);
    setLastMatch(sortedMatchs[sortedMatchs.length - 1]);

    const currentMatchdayMatches = allMatchs.filter(m => m.matchday === currentMatchday);

    if (currentMatchdayMatches.length === 0) {
      setCanDisplayBets(true);
      return;
    }

    const firstMatchDate = moment(allMatchs[0].utc_date);
    const sundayEndOfWeek = firstMatchDate.clone().endOf('week').set({ hour: 23, minute: 59, second: 59 });

    let closingTime;
    if (firstMatchDate.day() === 6) {
      // Si samedi => closingTime = vendredi 12h
      closingTime = firstMatchDate.clone().subtract(1, 'day').set({ hour: 12, minute: 0, second: 0 });
    } else {
      // Sinon => closingTime = jour du premier match à 12h
      closingTime = firstMatchDate.clone().set({ hour: 12, minute: 0, second: 0 });
    }

    const now = clock.now;

    if (now.isBefore(closingTime)) {
      setCanDisplayBets(false);
      const interval = setInterval(() => {
        const currentTime = moment();
        if (currentTime.isAfter(closingTime)) {
          clearInterval(interval);
          setCanDisplayBets(true);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else if (now.isBetween(closingTime, sundayEndOfWeek)) {
      setCanDisplayBets(true);
    }

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
        logs
      }}>
      {children}
    </AppContext.Provider>
  );
};
