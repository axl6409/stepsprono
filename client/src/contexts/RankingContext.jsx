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
    week: { data: [], lastFetched: null },
    duo: { data: [], lastFetched: null, isDuoRanking: false }
  });

  useEffect(() => {
    if (user) {
      fetchRanking(rankingType);
      fetchRankingMode();
    }
  }, [user, rankingType]);

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
    try {
      const endpoint = `${apiUrl}/api/bets/${type}-ranking`;
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
