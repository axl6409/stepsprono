import React, {createContext, useState, useEffect, useContext} from 'react';
import axios from 'axios';
import { UserContext } from './UserContext.jsx';
import {useCookies} from "react-cookie";

export const RankingContext = createContext();

const RankingProvider = ({ children }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [ranking, setRanking] = useState([]);
  const [rankingType, setRankingType] = useState('season');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(UserContext);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

  useEffect(() => {
    if (user) fetchRanking();
  }, [user, rankingType]);

  const fetchRanking = async () => {
    setIsLoading(true);
    try {
      const endpoint = `${apiUrl}/api/bets/${rankingType}-ranking`;
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response)
      setRanking(response.data.ranking);
    } catch (error) {
      console.error(`Erreur lors de la récupération du classement ${rankingType}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeRankingType = (type) => {
    setRankingType(type);
  };

  return (
    <RankingContext.Provider value={{ ranking, rankingType, changeRankingType, isLoading }}>
      {children}
    </RankingContext.Provider>
  );
};

export default RankingProvider;