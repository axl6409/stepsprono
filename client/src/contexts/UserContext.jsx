import React, {createContext, useState, useEffect, useMemo} from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
import Loader from "../components/partials/Loader.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

// Créer un Contexte
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cookies, removeCookie, clearCookie] = useCookies(['token']);

  const isAdmin = ["admin"];
  const allowedTreasurer = ["admin", "treasurer",];
  const allowedManager = ["admin", "manager",];
  const allowedTwice = ["admin", "manager", "treasurer"];

  const { roles, hasTreasurerAccess, hasManagerAccess, hasTwiceAccess } = useMemo(() => {
    const roles = user?.Roles?.map(r => r.name) ?? [];
    return {
      roles,
      hasTreasurerAccess: roles.some(r => allowedTreasurer.includes(r)),
      hasManagerAccess:   roles.some(r => allowedManager.includes(r)),
      hasTwiceAccess:     roles.some(r => allowedTwice.includes(r)),
      isAdmin:            roles.some(r => isAdmin.includes(r)),
    };
  }, [user]);

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

  const updateUserStatus = (newStatus) => {
    setUser(current => ({ ...current, status: newStatus }));
  };

  const logout = () => {
    localStorage.removeItem('token')
    clearCookie('token')
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <UserContext.Provider
      value={{
        user,
        roles,
        isLoading,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        updateUserStatus,
        logout,
        hasTreasurerAccess,
        hasManagerAccess,
        hasTwiceAccess,
        isAdmin
      }}>
      {children}
    </UserContext.Provider>
  );
};
