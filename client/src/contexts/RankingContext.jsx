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
  const [selectedMonth, setSelectedMonth] = useState(null); // Format YYYY-MM

  const [rankingCache, setRankingCache] = useState({
    season: { data: [], lastFetched: null, rules: [] },
    month: { data: [], lastFetched: null, selectedMonth: null, rules: [] },
    week: { data: [], lastFetched: null, rules: [] },
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
  }, [user, rankingType, currentMatchday, selectedMonth]);

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

    // Pour le type 'month', vérifier aussi si le mois sélectionné a changé
    if (type === 'month' && cachedRanking.selectedMonth !== selectedMonth) {
      // Invalider le cache si le mois a changé
      setRankingCache((prevCache) => ({
        ...prevCache,
        month: { data: [], lastFetched: null, selectedMonth: null }
      }));
    } else if (cachedRanking.data.length > 0 && cachedRanking.lastFetched && (now - cachedRanking.lastFetched) < CACHE_DURATION) {
      setIsLoading(false);
      return;
    }

    try {
      let endpoint;
      let params = {};

      // Pour le type 'week', utiliser l'endpoint matchday
      if (type === 'week') {
        endpoint = `${apiUrl}/api/users/bets/ranking/${currentMatchday}`;
      } else {
        endpoint = `${apiUrl}/api/bets/${type}-ranking`;
        // Ajouter le paramètre month si type === 'month' et selectedMonth existe
        if (type === 'month' && selectedMonth) {
          params.month = selectedMonth;
        }
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params
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
        const rules = response.data.ranking.rules || [];
        setRankingCache((prevCache) => ({
          ...prevCache,
          [type]: {
            data: sortedRanking,
            lastFetched: now,
            rules: rules,
            ...(type === 'month' && { selectedMonth })
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
      let params = {};

      // Pour le type 'week', utiliser l'endpoint matchday
      if (type === 'week') {
        endpoint = `${apiUrl}/api/users/bets/ranking/${currentMatchday}`;
      } else {
        endpoint = `${apiUrl}/api/bets/${type}-ranking`;
        // Ajouter le paramètre month si type === 'month' et selectedMonth existe
        if (type === 'month' && selectedMonth) {
          params.month = selectedMonth;
        }
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params
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
        const rules = response.data.ranking.rules || [];
        setRankingCache((prevCache) => ({
          ...prevCache,
          [type]: {
            data: response.data.ranking.ranking || response.data.ranking,
            lastFetched: new Date().getTime(),
            rules: rules,
            ...(type === 'month' && { selectedMonth })
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

  // Extraire les cibles de balle_perdue des rules
  const getBallePerduTargets = () => {
    const rules = rankingCache[rankingType].rules || [];
    const ballePerduRule = rules.find(r => r.type === 'balle_perdue');
    if (ballePerduRule?.penalties) {
      return ballePerduRule.penalties.map(p => ({
        targetId: p.target_id,
        targetUsername: p.target_username,
        shooterId: p.shooter_id,
        shooterUsername: p.shooter_username
      }));
    }
    return [];
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
      weekRanking: rankingCache.week.data,
      selectedMonth,
      setSelectedMonth,
      rankingRules: rankingCache[rankingType].rules || [],
      ballePerduTargets: getBallePerduTargets()
    }}>
      {children}
    </RankingContext.Provider>
  );
};

export default RankingProvider;
