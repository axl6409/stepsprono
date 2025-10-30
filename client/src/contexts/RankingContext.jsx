import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext.jsx';
import { AppContext } from './AppContext.jsx';
import { useCookies } from "react-cookie";

export const RankingContext = createContext();

const RankingProvider = ({ children }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const { user } = useContext(UserContext);
  const { currentMatchday } = useContext(AppContext);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

  const [rankingType, setRankingType] = useState('season');
  const [isLoading, setIsLoading] = useState(true);
  const [rankingMode, setRankingMode] = useState(null);

  const [rankingCache, setRankingCache] = useState({
    season: { data: [], lastFetched: null },
    month: { data: [], lastFetched: null },
    week: { data: [], lastFetched: null },
    duo: { data: [], lastFetched: null, isDuoRanking: false }
  });

  useEffect(() => {
    if (user) {
      // Invalider le cache 'week' si currentMatchday a changé
      if (currentMatchday) {
        setRankingCache((prevCache) => ({
          ...prevCache,
          week: { data: [], lastFetched: null }
        }));
      }
      fetchRanking(rankingType);
      fetchRankingMode();
    }
  }, [user, rankingType, currentMatchday]);

  const CACHE_DURATION = 5 * 1000; // 5 secondes pour faciliter les tests (normalement 10 * 60 * 1000)

  const fetchRankingMode = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/app/settings/rankingMode`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRankingMode(response.data.active_option);
    } catch (error) {
      console.error("Erreur lors de la récupération du rankingMode", error);
    }
  };

  const fetchRanking = async (type) => {
    setIsLoading(true);

    // Si type === 'week' sans currentMatchday, ne rien charger
    if (type === 'week' && !currentMatchday) {
      setRankingCache((prevCache) => ({
        ...prevCache,
        week: { data: [], lastFetched: new Date().getTime() }
      }));
      setIsLoading(false);
      return;
    }

    const cachedRanking = rankingCache[type];
    const now = new Date().getTime();
    if (cachedRanking.data.length > 0 && cachedRanking.lastFetched && (now - cachedRanking.lastFetched) < CACHE_DURATION) {
      setIsLoading(false);
      return;
    }

    try {
      let endpoint;
      // Pour le type 'week', utiliser l'endpoint matchday
      if (type === 'week') {
        endpoint = `${apiUrl}/api/users/bets/ranking/${currentMatchday}`;
      } else {
        endpoint = `${apiUrl}/api/bets/${type}-ranking`;
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Handle duo ranking differently
      if (type === 'duo') {
        const duoData = response.data.ranking || {};
        setRankingCache((prevCache) => ({
          ...prevCache,
          [type]: {
            data: duoData.ranking || [],
            lastFetched: now,
            isDuoRanking: duoData.isDuoRanking || false,
            rules: duoData.rules || [],
            message: duoData.message
          }
        }));
      } else if (type === 'week') {
        // Ranking spécifique à une journée (endpoint matchday)
        const rankingData = response.data.ranking || [];
        setRankingCache((prevCache) => ({
          ...prevCache,
          [type]: {
            data: rankingData,
            lastFetched: now
          }
        }));
      } else {
        const sortedRanking = (response.data.ranking.ranking || []).sort((a, b) => {
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
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération du classement ${type}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRanking = async (type) => {
    setIsLoading(true);

    // Si type === 'week' sans currentMatchday, ne rien charger
    if (type === 'week' && !currentMatchday) {
      setRankingCache((prevCache) => ({
        ...prevCache,
        week: { data: [], lastFetched: new Date().getTime() }
      }));
      setIsLoading(false);
      return;
    }

    try {
      let endpoint;
      // Pour le type 'week', utiliser l'endpoint matchday
      if (type === 'week') {
        endpoint = `${apiUrl}/api/users/bets/ranking/${currentMatchday}`;
      } else {
        endpoint = `${apiUrl}/api/bets/${type}-ranking`;
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (type === 'duo') {
        const duoData = response.data.ranking || {};
        setRankingCache((prevCache) => ({
          ...prevCache,
          [type]: {
            data: duoData.ranking || [],
            lastFetched: new Date().getTime(),
            isDuoRanking: duoData.isDuoRanking || false,
            rules: duoData.rules || [],
            message: duoData.message
          }
        }));
      } else if (type === 'week') {
        // Ranking spécifique à une journée (endpoint matchday)
        const rankingData = response.data.ranking || [];
        setRankingCache((prevCache) => ({
          ...prevCache,
          [type]: {
            data: rankingData,
            lastFetched: new Date().getTime()
          }
        }));
      } else {
        setRankingCache((prevCache) => ({
          ...prevCache,
          [type]: {
            data: response.data.ranking,
            lastFetched: new Date().getTime()
          }
        }));
      }
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
      fetchRanking,
      changeRankingType,
      refreshRanking,
      isLoading,
      rankingMode,
      isDuoRanking: rankingCache[rankingType].isDuoRanking || false,
      duoRules: rankingCache[rankingType].rules || [],
      duoMessage: rankingCache[rankingType].message,
      weekRanking: rankingCache.week.data
    }}>
      {children}
    </RankingContext.Provider>
  );
};

export default RankingProvider;
