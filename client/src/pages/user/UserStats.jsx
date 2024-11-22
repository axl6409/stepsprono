import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const UserStats = ({ userId, token }) => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/users/${userId}/stats`, {
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

  return (
    <div className="stats-page">
      <h1 className="text-2xl font-bold">Statistiques de l'utilisateur</h1>
      <div className="stats-container">
        {stats.length > 0 ? (
          stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <p><strong>Semaine:</strong> {stat.week}</p>
              <p><strong>Points:</strong> {stat.points}</p>
              <p><strong>Rang:</strong> {stat.rank}</p>
            </div>
          ))
        ) : (
          <p>Aucune statistique disponible pour cette saison.</p>
        )}
      </div>
    </div>
  );
};

export default UserStats;
