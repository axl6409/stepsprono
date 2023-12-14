import React, {createContext, useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
import {UserContext} from "./UserContext.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

// Créer un Contexte
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useContext(UserContext);
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const [apiCalls, setApiCalls] = useState({});
  const [isDebuggerActive, setIsDebuggerActive] = useState(cookies.debug === 'true');
  const [isDebuggerOpen, setIsDebuggerOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin') {
      fetchAPICalls();
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    setCookie('debug', isDebuggerActive, { path: '/' });
  }, [isDebuggerActive, setCookie]);

  const fetchAPICalls = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/app/api/calls`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setApiCalls(response.data.calls.response.requests);
    } catch (error) {
      console.error(error);
    }
  }

  const toggleDebugger = () => {
    setIsDebuggerActive(!isDebuggerActive);
  };

  const toggleDebuggerModal = () => {
    setIsDebuggerOpen(!isDebuggerOpen);
  };

  return (
    <AppContext.Provider value={{ fetchAPICalls, apiCalls, isDebuggerActive, toggleDebugger, isDebuggerOpen, toggleDebuggerModal }}>
      {children}
    </AppContext.Provider>
  );
};
