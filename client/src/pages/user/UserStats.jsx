import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {useParams} from "react-router-dom";
import {useCookies} from "react-cookie";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const UserStats = () => {
  const [cookies, setCookie] = useCookies(["user"]);
  const token = localStorage.getItem('token') || cookies.token;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userId } = useParams();

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${userId}/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des statistiques.');
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [userId, token]);

  if (loading) return <p>Chargement des statistiques...</p>;
  if (error) return <p>{error}</p>;

  const weeklySuccessRateData = {
    labels: stats.weeklySuccessRate.map(item => `Semaine ${item.week}`),
    datasets: [
      {
        label: 'Taux de Réussite (%)',
        data: stats.weeklySuccessRate.map(item => item.successRate * 100),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
      },
    ],
  };

  const homeAwayData = {
    labels: ['Domicile', 'Extérieur'],
    datasets: [
      {
        data: [stats.homePerformance, stats.awayPerformance],
        backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // const scorerStatsData = {
  //   labels: stats.scorerStats.map(item => item.name),
  //   datasets: [
  //     {
  //       label: 'Taux de Réussite (%)',
  //       data: stats.scorerStats.map(item => item.successRate * 100),
  //       backgroundColor: 'rgba(153, 102, 255, 0.2)',
  //       borderColor: 'rgba(153, 102, 255, 1)',
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  return (
    <div className="stats-page">
      <h1 className="text-2xl font-bold">Statistiques de l'utilisateur</h1>

      {/* Total des pronostics corrects */}
      <div className="stat-item">
        <h2>Total des Pronostics Corrects</h2>
        <p>{stats.correctPredictions}</p>
      </div>

      {/* Taux de réussite par semaine */}
      <div className="chart-container">
        <h2>Taux de Réussite par Semaine</h2>
        <Line data={weeklySuccessRateData} />
      </div>

      {/* Performances à domicile vs extérieur */}
      <div className="chart-container">
        <h2>Performances : Domicile vs Extérieur</h2>
        <Doughnut data={homeAwayData} />
      </div>

      {/* Joueurs les plus souvent pronostiqués */}
      {/*<div className="chart-container">*/}
      {/*  <h2>Joueurs les Plus Souvent Pronostiqués</h2>*/}
      {/*  <Bar data={scorerStatsData} options={{ indexAxis: 'y' }} />*/}
      {/*</div>*/}
    </div>
  );
};

export default UserStats;
