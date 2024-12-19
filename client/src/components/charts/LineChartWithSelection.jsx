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

const LineChartWithSelection = ({ data, userId, currentUserId }) => {
  // Obtenir les labels uniques des journées
  const labels = Array.from(new Set(data.map(item => `D ${item.matchday}`)));

  // Créer une liste unique d'utilisateurs
  const uniqueUsers = Array.from(
    data.reduce((acc, item) => acc.set(item.user_id, item.user_name), new Map())
  ).map(([id, name]) => ({ value: id, label: name }));

  // Utilisateur connecté
  const currentUser = uniqueUsers.find(user => user.value === currentUserId);

  // Utilisateur visité
  const visitedUser = uniqueUsers.find(user => user.value === userId);

  // Initialiser les utilisateurs sélectionnés
  const [selectedUsers, setSelectedUsers] = useState(() => {
    const initialUsers = [];
    if (visitedUser) initialUsers.push(visitedUser);
    if (currentUser && currentUser.value !== userId) initialUsers.push(currentUser);
    return initialUsers;
  });

  const handleSelectionChange = (selectedOptions) => {
    setSelectedUsers(selectedOptions || []);
  };

  // Fonction pour construire un dataset
  const buildDataset = (user, color, isCurrentUser = false) => {
    const userData = data.filter(item => item.user_id === user.value);
    const points = Array(labels.length).fill(0);

    userData.forEach(item => {
      const index = labels.indexOf(`D ${item.matchday}`);
      if (index !== -1) points[index] = item.totalPoints || 0;
    });

    return {
      label: isCurrentUser ? `${user.label}` : user.label,
      data: points,
      borderColor: color,
      backgroundColor: 'rgba(0, 0, 0, 0)',
      tension: 0.3,
      borderWidth: isCurrentUser ? 2 : 1,
      pointStyle: 'circle',
      pointRadius: 3,
      pointHoverRadius: 10
    };
  };

  const chartData = {
    labels,
    datasets: [
      // Courbe pour l'utilisateur connecté
      currentUser ? buildDataset(currentUser, 'rgba(0, 204, 153, 1)', true) : null,
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
        ticks: {
          stepSize: 1,
          font: {
            size: 12, // Taille de la police
            family: 'Montserrat', // Police
            weight: 'regular', // Épaisseur de la police
            style: 'normal', // Style de la police (normal, italic, oblique)
          },
          color: '#414141', // Couleur des ticks
        },
        title: {
          display: true,
          text: 'Points', // Texte de l’axe des ordonnées
          font: {
            size: 12,
            family: 'Montserrat',
            weight: 'regular',
            style: 'normal',
          },
          color: '#414141', // Couleur du titre
        },
      },
      x: {
        ticks: {
          font: {
            size: 12,
            family: 'Montserrat',
            weight: 'bold',
            style: 'normal',
          },
          color: '#414141', // Couleur des ticks
        },
        title: {
          display: true,
          text: 'Journées', // Texte de l’axe des abscisses
          font: {
            size: 12,
            family: 'Montserrat',
            weight: 'regular',
            style: 'normal',
          },
          color: '#414141', // Couleur du titre
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  return (
    <div>
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
        className="basic-multi-select border border-black rounded-md w-4/5 mx-auto font-rubik"
        classNamePrefix="select"
      />
      <div
        className="border border-black shadow-flat-black-adjust rounded-xl bg-white w-11/12 mx-auto"
        style={{ marginTop: '20px' }}
      >
        <Line translate="no" data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineChartWithSelection;