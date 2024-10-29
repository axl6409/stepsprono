import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext.jsx';
import { useCookies } from "react-cookie";

export const RankingContext = createContext();

const RankingProvider = ({ children }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const { user } = useContext(UserContext);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

  const [rankingType, setRankingType] = useState('season');
  const [isLoading, setIsLoading] = useState(true);
  const [rankingMode, setRankingMode] = useState(null);

  const [rankingCache, setRankingCache] = useState({
    season: { data: [], lastFetched: null },
    month: { data: [], lastFetched: null },
    week: { data: [], lastFetched: null }
  });

  useEffect(() => {
    if (user) {
      fetchRanking(rankingType);
      fetchRankingMode();
    }
  }, [user, rankingType]);

  const CACHE_DURATION = 10 * 60 * 1000;

  const fetchRankingMode = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/app/settings/rankingMode`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Mode de classement chargé depuis l'API", response.data.active_option);
      setRankingMode(response.data.active_option);
    } catch (error) {
      console.error("Erreur lors de la récupération du rankingMode", error);
    }
  };

  const fetchRanking = async (type) => {
    setIsLoading(true);

    const cachedRanking = rankingCache[type];
    const now = new Date().getTime();
    if (cachedRanking.data.length > 0 && cachedRanking.lastFetched && (now - cachedRanking.lastFetched) < CACHE_DURATION) {
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = `${apiUrl}/api/bets/${type}-ranking`;
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Classement ${type} chargé depuis l'API`, response.data.ranking);
      const sortedRanking = (response.data.ranking || []).sort((a, b) => {
        if (b.points === a.points) {
          return b.tie_breaker_points - a.tie_breaker_points;
        }
        return b.points - a.points;
      });
      setRankingCache((prevCache) => ({
        ...prevCache,
        [type]: {
          data: sortedRanking,
          lastFetched: now
        }
      }));
    } catch (error) {
      console.error(`Erreur lors de la récupération du classement ${type}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRanking = async (type) => {
    setIsLoading(true);
    try {
      const endpoint = `${apiUrl}/api/bets/${type}-ranking`;
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRankingCache((prevCache) => ({
        ...prevCache,
        [type]: {
          data: response.data.ranking,
          lastFetched: new Date().getTime()
        }
      }));
    } catch (error) {
      console.error(`Erreur lors du rafraîchissement du classement ${type}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeRankingType = (type) => {
    setRankingType(type);
  };

  return (
    <RankingContext.Provider value={{
      ranking: rankingCache[rankingType].data,
      rankingType,
      changeRankingType,
      refreshRanking,
      isLoading,
      rankingMode
    }}>
      {children}
    </RankingContext.Provider>
  );
};

export default RankingProvider;
