import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

export default function useUserData(user, token, apiUrl) {
  const [weekPoints, setWeekPoints] = useState(0);
  const [monthPoints, setMonthPoints] = useState(0);
  const [seasonPoints, setSeasonPoints] = useState(0);
  const [bets, setBets] = useState([]);
  const [betColors, setBetColors] = useState({});
  const [noMatches, setNoMatches] = useState(false);
  const [matchs, setMatchs] = useState([]);
  const [lastMatch, setLastMatch] = useState(null);
  const [canDisplayBets, setCanDisplayBets] = useState(false);
  const [currentMatchday, setCurrentMatchday] = useState(null);
  const colors = ['#6666FF', '#CC99FF', '#00CC99', '#F7B009', '#F41731'];

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

    const fetchPoints = async (type, setter) => {
      const response = await axios.get(`${apiUrl}/api/user/${user.id}/bets/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.points) {
        setter(response.data.points);
      }
    };

    const fetchMatchs = async () => {
      const response = await axios.get(`${apiUrl}/api/matchs/current-week`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const allMatchs = response.data.data || [];

      const sortedMatchs = allMatchs
        .filter(m => m.status !== "FT") // 👈 filtre
        .sort((a, b) => new Date(a.utc_date) - new Date(b.utc_date));

      setCurrentMatchday(response.data.currentMatchday);

      if (sortedMatchs.length === 0) {
        setNoMatches(true);
        return;
      }

      setMatchs(sortedMatchs);
      setLastMatch(sortedMatchs[sortedMatchs.length - 1]);

      const currentMatchdayMatches = allMatchs.filter(m => m.matchday === currentMatchday);

      if (currentMatchdayMatches.length === 0) {
        setCanDisplayBets(true);
        return;
      }

      const firstMatchDate = moment(allMatchs[0].utc_date);
      const sundayEndOfWeek = firstMatchDate.clone().endOf('week').set({ hour: 23, minute: 59, second: 59 });

      let closingTime;
      if (firstMatchDate.day() === 6) {
        // Si samedi => closingTime = vendredi 12h
        closingTime = firstMatchDate.clone().subtract(1, 'day').set({ hour: 12, minute: 0, second: 0 });
      } else {
        // Sinon => closingTime = jour du premier match à 12h
        closingTime = firstMatchDate.clone().set({ hour: 12, minute: 0, second: 0 });
      }

      const now = moment();

      if (now.isBefore(closingTime)) {
        setCanDisplayBets(false);
        const interval = setInterval(() => {
          const currentTime = moment();
          if (currentTime.isAfter(closingTime)) {
            clearInterval(interval);
            setCanDisplayBets(false);
          }
        }, 1000);
        return () => clearInterval(interval);
      } else if (now.isBetween(closingTime, sundayEndOfWeek)) {
        setCanDisplayBets(false);
      }

    };

    fetchMatchs();
    fetchLastBets();
    fetchPoints('week', setWeekPoints);
    fetchPoints('month', setMonthPoints);
    fetchPoints('season', setSeasonPoints);

  }, [user, token, apiUrl]);

  return {
    weekPoints,
    monthPoints,
    seasonPoints,
    bets,
    betColors,
    noMatches,
    matchs,
    canDisplayBets,
    currentMatchday,
    lastMatch
  };
}
