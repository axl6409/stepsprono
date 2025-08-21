import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { UserContext } from './UserContext.jsx';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

export const ViewedProfileContext = createContext(null);

export const ViewedProfileProvider = ({ children }) => {
  const { user: loggedUser } = useContext(UserContext);
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;

  const [viewedUser, setViewedUser] = useState(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(null);

  const fetchUserById = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${apiUrl}/api/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setViewedUser(res.data);
    } catch (e) {
      setError(e);
      // fallback : on repasse sur soi si erreur
      if (loggedUser) setViewedUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const setByUserId = async (id) => {
    if (!id || (loggedUser && Number(id) === Number(loggedUser.id))) {
      setViewedUser(loggedUser);
      setIsLoading(false);
      setError(null);
      return;
    }
    await fetchUserById(id);
  };

  // au boot : par défaut, on regarde soi-même
  useEffect(() => {
    if (loggedUser && !viewedUser) {
      setViewedUser(loggedUser);
      setIsLoading(false);
    }
  }, [loggedUser]); // eslint-disable-line

  const isOwnProfile = !!(loggedUser && viewedUser && viewedUser.id === loggedUser.id);
  const refresh = () => viewedUser && setByUserId(viewedUser.id);

  return (
    <ViewedProfileContext.Provider value={{ viewedUser, isOwnProfile, isLoading, error, setByUserId, refresh }}>
      {children}
    </ViewedProfileContext.Provider>
  );
};

// petit hook pratique
export const useViewedProfile = () => useContext(ViewedProfileContext);
