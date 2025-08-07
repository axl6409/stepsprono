import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Select from 'react-select';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChartWithSelection = ({ data, userId, currentUserId, isRankingChart = false }) => {
  // Obtenir les labels uniques des journées
  const labels = Array.from(new Set(data.map(item => `D ${item.matchday}`)));

  // Créer une liste unique d'utilisateurs avec leur score total
  const userRanking = Array.from(
    data.reduce((acc, item) => {
      if (!acc.has(item.user_id)) {
        acc.set(item.user_id, { id: item.user_id, name: item.user_name, totalPoints: 0 });
      }
      acc.get(item.user_id).totalPoints += item.totalPoints || 0;
      return acc;
    }, new Map()).values()
  );

  // Trier les utilisateurs par score total décroissant (classement)
  userRanking.sort((a, b) => b.totalPoints - a.totalPoints);

  // Trouver l'utilisateur visité dans le classement
  const visitedUserIndex = userRanking.findIndex(user => user.id === userId);
  const previousUser = visitedUserIndex > 0 ? userRanking[visitedUserIndex - 1] : null;
  const nextUser = visitedUserIndex < userRanking.length - 1 ? userRanking[visitedUserIndex + 1] : null;

  // Construire la liste des utilisateurs pour le sélecteur
  const uniqueUsers = userRanking.map(user => ({ value: user.id, label: user.name }));

  // Utilisateur connecté
  const currentUser = uniqueUsers.find(user => user.value === currentUserId);
  const visitedUser = uniqueUsers.find(user => user.value === userId);
  const previousUserOption = previousUser ? uniqueUsers.find(user => user.value === previousUser.id) : null;
  const nextUserOption = nextUser ? uniqueUsers.find(user => user.value === nextUser.id) : null;

  // Initialiser les utilisateurs sélectionnés avec visitedUser + previousUser + nextUser
  const [selectedUsers, setSelectedUsers] = useState(() => {
    const initialUsers = [];
    if (visitedUser) initialUsers.push(visitedUser);
    if (previousUserOption) initialUsers.push(previousUserOption);
    if (nextUserOption) initialUsers.push(nextUserOption);
    return initialUsers;
  });

  const handleSelectionChange = (selectedOptions) => {
    setSelectedUsers(selectedOptions || []);
  };

  // Fonction pour construire un dataset
  const buildDataset = (user, color, isCurrentUser = false) => {
    const userData = data.filter(item => item.user_id === user.value);
    const points = Array(labels.length).fill(null);

    userData.forEach(item => {
      const index = labels.indexOf(`D ${item.matchday}`);
      if (index !== -1) points[index] = isRankingChart ? item.position : item.totalPoints || 0;
    });

    return {
      label: isCurrentUser ? `${user.label}` : user.label,
      data: points.map((point, i) => ({
        x: labels[i],
        y: point,
      })),
      borderColor: color,
      backgroundColor: color,
      tension: 0.3,
      borderWidth: isCurrentUser ? 2 : 1,
      pointStyle: 'circle',
      pointRadius: 4,
      pointHoverRadius: 8
    };
  };


  // Génère une couleur HSL du jaune au rouge selon la position
  const getColorForRank = (position, maxPosition) => {
    const percentage = (position - 1) / (maxPosition - 1); // de 0 à 1
    const hue = 60 - (percentage * 120); // de 60 (jaune) à -60 (rouge)
    return `hsl(${hue}, 100%, 50%)`;
  };

  const maxYValue = isRankingChart
    ? Math.max(...data.map(item => item.position || 0))
    : null;

  const chartData = {
    labels,
    datasets: [
      // Courbe pour l'utilisateur connecté
      currentUser ? buildDataset(currentUser, 'rgb(0,166,53)', true) : null,
      // Courbes pour les utilisateurs sélectionnés
      ...selectedUsers
        .filter(user => user.value !== currentUserId) // Exclure l'utilisateur connecté pour éviter les doublons
        .map(user =>
          buildDataset(
            user,
            `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`
          )
        ),
    ].filter(Boolean), // Exclut les null
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        beginAtZero: true,
        reverse: isRankingChart,
        ticks: {
          stepSize: 1,
          font: {
            size: 15,
            family: 'Roboto Mono',
            weight: 'bold',
            style: 'normal',
          },
        },
        title: {
          display: true,
          text: isRankingChart ? 'Position' : 'Points',
          font: {
            size: 16,
            family: 'Montserrat',
            weight: 'bold',
            style: 'normal',
          },
          color: '#000',
        },
      },
      x: {
        ticks: {
          font: {
            size: 13,
            family: 'roboto',
            weight: 'bold',
            style: 'normal',
          },
          color: '#000',
        },
        title: {
          display: true,
          text: 'Journées',
          font: {
            size: 16,
            family: 'Montserrat',
            weight: 'bold',
            style: 'normal',
          },
          color: '#000',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            family: 'Rubik',
            size: 16,
            weight: 'regular',
          },
          color: '#000',
        }
      },
    },
  };

  return (
    <div className="relative z-[12]">
      <label translate="no" className="font-rubik text-sm text-center block font-medium">
        Sélectionnez des steps ⬇️
      </label>
      <Select
        translate="no"
        options={uniqueUsers}
        isMulti
        value={selectedUsers}
        onChange={handleSelectionChange}
        placeholder="Choisissez les utilisateurs"
        className="basic-multi-select border border-black bg-white rounded-md w-4/5 mx-auto font-rubik"
        classNamePrefix="select"
      />

      {/* Conteneur scrollable */}
      <div
        className="border border-black shadow-flat-black-adjust bg-white w-full mx-auto overflow-x-auto custom-x-scrollbar"
        style={{
          marginTop: '20px',
          whiteSpace: 'nowrap',
          touchAction: 'auto',
          WebkitOverflowScrolling: 'touch',
          overflowY: 'hidden',
        }}
      >
        <div style={{ minWidth: '800px' }}>
          <Line translate="no" data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default LineChartWithSelection;
