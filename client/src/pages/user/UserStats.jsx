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

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const UserStats = () => {
  const { user } = useContext(UserContext);
  const [cookies] = useCookies(['user']);
  const token = localStorage.getItem('token') || cookies.token;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userId } = useParams();

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${userId}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data)
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des statistiques.');
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [userId, token]);

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
    <div className="inline-block relative w-full h-auto py-20 bg-grid-background bg-grid-70 bg-white">
      <BackButton/>
      <SimpleTitle title="Statistiques" stickyStatus={false} backgroundColor="bg-transparent"/>

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
            className="relative no-correct bg-white left-0 top-0 right-0 font-rubik font-black text-xl2 border border-black text-black px-4 leading-6 z-[3] translate-x-1 translate-y-1">Performances Globales</span>
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
      <div className="flex flex-row flex-wrap justify-center items-center py-4">
        <StatItem title="Pronostics Corrects" value={`${correctPredictionPercentage}%`} status={true}/>
        <StatItem title="Pronostics Incorrects" value={`${incorrectPredictionPercentage}%`} status={false}/>
        <StatItem title="Bons Scores" value={stats.correctScorePredictions} status={true}/>
        <StatItem title="Mauvais Scores" value={stats.incorrectScorePredictions} status={false}/>
        <StatItem title="Bons Buteur" value={stats.correctScorerPredictions} status={true}/>
        <StatItem title="Mauvais Buteur" value={stats.incorrectScorerPredictions} status={false}/>
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
          currentUserId={user.id} // Passe l'ID de l'utilisateur connecté
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
  );
};

export default UserStats;
