import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import SimpleTitle from '../../components/partials/SimpleTitle.jsx';
import DashboardButton from '../../components/nav/DashboardButton.jsx';
import StatItem from '../../components/stats/StatItem.jsx';
import LoadingMessage from '../../components/feedback/LoadingMessage.jsx';
import ErrorMessage from '../../components/feedback/ErrorMessage.jsx';

import LineChartWithSelection from '../../components/charts/LineChartWithSelection.jsx';
import RadarChart from '../../components/charts/RadarChart.jsx';
import BarChartGrouped from '../../components/charts/BarChartGrouped.jsx';
import HeatmapChart from '../../components/charts/HeatmapChart.jsx';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const UserStats = () => {
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

  return (
    <div className="inline-block relative w-full h-auto py-20">
      <DashboardButton />
      <SimpleTitle title="Classement Steps" stickyStatus={false} />

      {/* Statistique Totale */}
      <StatItem title="Pronostics Corrects" value={stats.correctPredictions} />

      {/* Line Chart avec sélection dynamique */}
      <div className="chart-container" style={{ height: '600px' }}>
        <h2>Comparaison des Points par Journée</h2>
        <LineChartWithSelection data={stats.pointsByMatchdayForAllUsers} userId={parseInt(userId, 10)} />
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
