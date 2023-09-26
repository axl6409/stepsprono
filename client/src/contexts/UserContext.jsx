import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";

// Créer un Contexte
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cookies] = useCookies(['token']);

  useEffect(() => {
    const loadToken = async () => {
      const token = cookies.token || localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.post('http://localhost:3001/api/verifyToken', { token });
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
      setIsLoading(false); // Marquer le chargement comme terminé
    };
    loadToken(); // Appel de la fonction pour charger le token
  }, [cookies]);

  const logout = () => {
    localStorage.removeItem('token'); // supprimer le token de localStorage
    setUser(null); // réinitialiser l'état de l'utilisateur
    setIsAuthenticated(false); // réinitialiser l'état d'authentification
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
