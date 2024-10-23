import React, {createContext, useState, useEffect, useContext} from 'react';
import axios from 'axios';
import { UserContext } from './UserContext.jsx';
import {useCookies} from "react-cookie";

export const RankingContext = createContext();

const RankingProvider = ({ children }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [ranking, setRanking] = useState([]);
  const { user } = useContext(UserContext);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/bets/season-ranking`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRanking(response.data.ranking);
      } catch (error) {
        console.error("Erreur lors de la récupération du classement", error);
      }
    };
    fetchRanking();
  }, [user]);

  return (
    <RankingContext.Provider value={{ ranking }}>
      {children}
    </RankingContext.Provider>
  );
};

export default RankingProvider;