import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import SimpleTitle from '../../components/partials/SimpleTitle.jsx';
import StatItem from '../../components/stats/StatItem.jsx';
import LoadingMessage from '../../components/feedback/LoadingMessage.jsx';
import ErrorMessage from '../../components/feedback/ErrorMessage.jsx';
import LineChartWithSelection from '../../components/charts/LineChartWithSelection.jsx';
import RadarChart from '../../components/charts/RadarChart.jsx';
import HeatmapChart from '../../components/charts/HeatmapChart.jsx';
import BackButton from "../../components/nav/BackButton.jsx";
import {UserContext} from "../../contexts/UserContext.jsx";
import DoughnutChart from "../../components/charts/DoughnutChart.jsx";
import BarChart from "../../components/charts/BarChart.jsx";
import moment from "moment";

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const UserStats = () => {
  const { user } = useContext(UserContext);
  const [cookies] = useCookies(['user']);
  const token = localStorage.getItem('token') || cookies.token;
  const [positionsByMatchdayForAllUsers, setPositionsByMatchdayForAllUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("season");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [error, setError] = useState(null);

  const { userId } = useParams();

  const fetchPositions = async () => {
    try {
      const params = { period };
      if (period === "month" && selectedMonth) {
        params.month = selectedMonth;
      }
      const res = await axios.get(`${apiUrl}/api/user/${userId}/rankings/season`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setPositionsByMatchdayForAllUsers(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des positions:', err);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/user/${userId}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erreur lors de la récupération des statistiques.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMonths = async () => {
      try {
        // 👉 récupère la saison courante
        const res = await axios.get(`${apiUrl}/api/seasons/current/datas/61`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const season = res.data.currentSeason;
        const start = moment(season.start_date).startOf("month");
        const now = moment().startOf("month");

        const months = [];
        let current = start.clone();

        while (current.isSameOrBefore(now)) {
          months.push({
            value: current.format("YYYY-MM"),
            label: current.format("MMMM")
          });
          current.add(1, "month");
        }
        setAvailableMonths(months);
      } catch (err) {
        console.error("Erreur lors de la récupération des mois :", err);
      }
    };

    fetchMonths();
  }, [token]);

  useEffect(() => {
    fetchUserStats();
    fetchPositions();
  }, [userId, token, period, selectedMonth]);

  useEffect(() => {
    if (period === "month" && !selectedMonth) {
      const current = new Date();
      const month = current.toISOString().slice(0, 7);
      setSelectedMonth(month);
    }
  }, [period, selectedMonth]);

  if (loading) return <LoadingMessage message="Chargement des statistiques..." />;
  if (error) return <ErrorMessage message={error} />;

  const totalPredictions = stats.correctPredictions + stats.incorrectPredictions;
  const correctPredictionPercentage = totalPredictions > 0
    ? ((stats.correctPredictions / totalPredictions) * 100).toFixed(1)
    : 0;
  const incorrectPredictionPercentage = totalPredictions > 0
    ? ((stats.incorrectPredictions / totalPredictions) * 100).toFixed(1)
    : 0;

  return (
    <div className="inline-block relative z-20 w-full h-auto py-20 bg-grid-background bg-grid-70 bg-white overflow-x-hidden">
      <div className="absolute inset-0 bg-black z-[1] mix-blend-difference"></div>
      <div className="relative z-[2]">
        <BackButton/>
        <SimpleTitle title="Statistiques" stickyStatus={false} backgroundColor="bg-transparent" darkMode={false}/>

        {/* Line Chart avec sélection dynamique */}
        <div className="chart-container py-4 my-4">
          <h2 translate="no" className={`relative fade-in mb-12 w-fit mx-auto`}>
          <span
            translate="no"
            className="absolute inset-0 py-4 w-full h-full bg-purple-soft z-[2] translate-x-1 translate-y-0.5"></span>
            <span
              translate="no"
              className="absolute inset-0 py-4 w-full h-full bg-green-soft z-[1] translate-x-2 translate-y-1.5"></span>
            <span
              translate="no"
              className="relative no-correct bg-white left-0 top-0 right-0 font-rubik font-black text-xl2 border border-black text-black px-4 leading-6 z-[3] translate-x-1 translate-y-1">Points par journées</span>
          </h2>
          <LineChartWithSelection
            data={stats.pointsByMatchdayForAllUsers}
            userId={parseInt(userId, 10)}
            currentUserId={user.id}
          />
        </div>

        <div className="chart-container py-4 my-4">
          <h2 translate="no" className={`relative h-16 text-center fade-in mb-12 w-11/12 mx-auto`}>
          <span
            translate="no"
            className="absolute inset-0 py-4 w-full h-full bg-purple-soft z-[2] translate-x-1 translate-y-0.5"></span>
            <span
              translate="no"
              className="absolute inset-0 py-4 w-full h-full bg-green-soft z-[1] translate-x-2 translate-y-1.5"></span>
            <span
              translate="no"
              className="absolute inset-0 py-4 w-full h-full bg-white border border-black z-[3] -translate-x-0.5 -translate-y-0.5"></span>
            <span
              translate="no"
              className="absolute no-correct left-0 top-0 right-0 font-rubik font-black text-xl text-black leading-6 z-[3] p-2">
            Position au classement par journées
          </span>
          </h2>
          <div className="flex justify-center gap-4 my-4">
            <select id="rankingPeriod" className="px-4 py-2 border border-black rounded-md bg-white font-rubik text-sm text-black" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="season">Saison</option>
              <option value="month">Mois</option>
            </select>

            {period === "month" && (
              <select id="rankingPeriodMonth" value={selectedMonth || ""} className="px-4 py-2 border border-black rounded-md bg-white font-rubik text-sm text-black" onChange={(e) => setSelectedMonth(e.target.value)}>
                {availableMonths.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <LineChartWithSelection
            data={[
              ...(positionsByMatchdayForAllUsers?.userPositions || []).map(pos => ({
                user_id: positionsByMatchdayForAllUsers.userId,
                user_name: user.username,
                matchday: pos.matchday,
                position: pos.position
              })),
              ...Object.entries(positionsByMatchdayForAllUsers?.othersPositions || {}).flatMap(([otherUserId, userData]) =>
                userData.positions.map(pos => ({
                  user_id: parseInt(otherUserId, 10),
                  user_name: userData.username || `User ${otherUserId}`,
                  matchday: pos.matchday,
                  position: pos.position
                }))
              )
            ]}
            userId={parseInt(userId, 10)}
            currentUserId={user.id}
            isRankingChart={true}
          />
        </div>

        <div className="chart-container py-4">
          <h2 translate="no" className={`relative fade-in mb-12 w-fit mx-auto`}>
          <span
            translate="no"
            className="absolute inset-0 py-4 w-full h-full bg-purple-soft z-[2] translate-x-1 translate-y-0.5"></span>
            <span
              translate="no"
              className="absolute inset-0 py-4 w-full h-full bg-green-soft z-[1] translate-x-2 translate-y-1.5"></span>
            <span
              translate="no"
              className="relative no-correct bg-white left-0 top-0 right-0 font-rubik font-black text-xl border border-black text-black px-4 leading-6 z-[3] translate-x-1 translate-y-1">Performances Globales</span>
          </h2>
          <div>
            <DoughnutChart
              correctResult={stats.correctPredictions}
              incorrectResult={stats.incorrectPredictions}
              correctScore={stats.correctScorePredictions}
              incorrectScore={stats.incorrectScorePredictions}
              correctScorer={stats.correctScorerPredictions}
              incorrectScorer={stats.incorrectScorerPredictions}
            />
          </div>
        </div>

        {/* Statistique Totale */}
        <div className="relative z-[11] flex flex-row flex-wrap justify-center items-center py-4">
          <StatItem title="Pronostics Corrects" value={`${correctPredictionPercentage}%`} status={true}/>
          <StatItem title="Pronostics Incorrects" value={`${incorrectPredictionPercentage}%`} status={false}/>
          <StatItem title="Bons Scores" value={`${stats.correctScorePredictions} X`} status={true}/>
          <StatItem title="Mauvais Scores" value={`${stats.incorrectScorePredictions} X`} status={false}/>
          <StatItem title="Bons Buteur" value={`${stats.correctScorerPredictions} X`} status={true}/>
          <StatItem title="Mauvais Buteur" value={`${stats.incorrectScorerPredictions} X`} status={false}/>
        </div>

        <div className="chart-container py-4 my-4">
          <h2 translate="no" className={`relative fade-in mb-12 w-fit mx-auto`}>
          <span
            translate="no"
            className="absolute inset-0 py-4 w-full h-full bg-purple-soft z-[2] translate-x-1 translate-y-0.5"></span>
            <span
              translate="no"
              className="absolute inset-0 py-4 w-full h-full bg-green-soft z-[1] translate-x-2 translate-y-1.5"></span>
            <span
              translate="no"
              className="relative no-correct bg-white left-0 top-0 right-0 font-rubik font-black text-xl border border-black text-black px-4 leading-6 z-[3] translate-x-1 translate-y-1">Comparaison Pronostics</span>
          </h2>
          <BarChart
            userCorrectPredictions={correctPredictionPercentage}
            averageCorrectPredictions={stats.formattedAverageCorrectPredictions}
          />
        </div>

        {/* Radar Chart*/}
        {/*<div className="chart-container" style={{ height: '600px' }}>*/}
        {/*  <h2>Vue Circulaire des Performances</h2>*/}
        {/*  <RadarChart data={stats.pointsByMatchdayForAllUsers} userId={parseInt(userId, 10)} />*/}
        {/*</div>*/}

        {/* Bar Chart Groupé */}
        {/*<div className="chart-container" style={{ height: '600px' }}>*/}
        {/*  <h2>Évolution des Points en Barres Groupées</h2>*/}
        {/*  <BarChartGrouped data={stats.pointsByMatchdayForAllUsers} userId={parseInt(userId, 10)} />*/}
        {/*</div>*/}

        {/* Heatmap */}
        {/*<div className="chart-container" style={{ height: '600px' }}>*/}
        {/*  <h2>Tableau Comparatif des Points (Heatmap)</h2>*/}
        {/*  <HeatmapChart data={stats.pointsByMatchdayForAllUsers} />*/}
        {/*</div>*/}
      </div>
    </div>
  );
};

export default UserStats;
