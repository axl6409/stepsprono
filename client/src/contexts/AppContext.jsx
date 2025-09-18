import React, {createContext, useState, useEffect, useContext, useRef} from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
import {UserContext} from "./UserContext.jsx";
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

  useEffect(() => {
    if (!fetchedRef.current && isAuthenticated && user) {
      fetchAvailableCompetitions();
      fetchCurrentSeason();
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
      console.log(response.data)
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

  return (
    <AppContext.Provider
      value={{
        fetchAPICalls,
        apiCalls,
        isDebuggerActive,
        toggleDebugger,
        isDebuggerOpen,
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
        setIsLoading
      }}>
      {children}
    </AppContext.Provider>
  );
};
