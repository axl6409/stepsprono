import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Créer un Contexte
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté lors du chargement initial de l'application
    const token = localStorage.getItem('token');
    if (token) {
      // Si un token est trouvé, vérifiez-le auprès du serveur
      axios.post('http://localhost:3001/api/verifyToken', { token })
        .then(response => {
          if (response.data.isAuthenticated) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          }
        })
        .catch(error => {
          console.error('Error verifying token', error);
        });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};
