import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

// Créer un Contexte
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cookies, removeCookie, clearCookie] = useCookies(['token']);

  useEffect(() => {
    const loadToken = async () => {
      const token = cookies.token || localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.post(`${apiUrl}/api/verifyToken`, { token });
          if (response.data.isAuthenticated) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Error verifying token', error);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false)
    };
    loadToken()
  }, [cookies]);

  const logout = () => {
    localStorage.removeItem('token')
    clearCookie('token')
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    // Afficher une indication de chargement si le chargement n'est pas encore terminé
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated, logout }}>
      {children}
    </UserContext.Provider>
  );
};
