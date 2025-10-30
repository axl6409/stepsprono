import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import moment from 'moment';
import { AppContext } from '../contexts/AppContext';

export default function useUserData(user, token, apiUrl) {
  const [weekPoints, setWeekPoints] = useState(0);
  const [monthPoints, setMonthPoints] = useState(0);
  const [seasonPoints, setSeasonPoints] = useState(0);
  const [bets, setBets] = useState([]);
  const [betColors, setBetColors] = useState({});
  const colors = ['#6666FF', '#CC99FF', '#00CC99', '#F7B009', '#F41731'];
  const { currentMatchday } = useContext(AppContext);

  useEffect(() => {
    if (!user || !token) return;

    const fetchLastBets = async () => {
      const response = await axios.get(`${apiUrl}/api/user/${user.id}/bets/last`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const currentBets = response.data.bets;
      if (Array.isArray(currentBets) && currentBets.length > 0) {
        const sortedBets = currentBets.sort((a, b) => new Date(a.MatchId.utc_date) - new Date(b.MatchId.utc_date));
        setBets(sortedBets);
        const newBetColors = {};
        sortedBets.forEach((bet, index) => {
          newBetColors[bet.id] = colors[index % colors.length];
        });
        setBetColors(newBetColors);
      } else {
        setBets([]);
      }
    };

    const fetchPoints = async (type, setter, matchday = null) => {
      let url = `${apiUrl}/api/user/${user.id}/bets/${type}`;
      if (matchday) {
        url += `?matchday=${matchday}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.points !== undefined) {
        setter(response.data.points);
      }
    };

    fetchLastBets();
    // Utiliser 'matchday' au lieu de 'week' si currentMatchday existe
    if (currentMatchday) {
      fetchPoints('matchday', setWeekPoints, currentMatchday);
    } else {
      setWeekPoints(0);
    }
    fetchPoints('month', setMonthPoints);
    fetchPoints('season', setSeasonPoints);

  }, [user, token, apiUrl, currentMatchday]);

  return {
    weekPoints,
    monthPoints,
    seasonPoints,
    bets,
    betColors,
  };
}
