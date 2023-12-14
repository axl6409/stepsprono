import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

// Créer un Contexte
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [cookies, removeCookie, clearCookie] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const [apiCalls, setApiCalls] = useState({});

  useEffect(() => {
    if (user.role === 'admin') {
      useEffect(() => {
        fetchAPICalls();
      }, [])
    }
  }, [cookies]);

  const fetchAPICalls = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/app/api/calls`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = await response;
      setApiCalls(data.data.calls.response.requests);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <AppContext.Provider value={{ fetchAPICalls }}>
      {children}
    </AppContext.Provider>
  );
};
