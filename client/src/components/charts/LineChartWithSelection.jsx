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

const LineChartWithSelection = ({ data, userId }) => {
  // Obtenir les labels uniques des journées
  const labels = Array.from(new Set(data.map(item => `D ${item.matchday}`)));

  // Créer une liste unique d'utilisateurs
  const uniqueUsers = Array.from(
    data.reduce((acc, item) => acc.set(item.user_id, item.user_name), new Map())
  ).map(([id, name]) => ({ value: id, label: name }));

  // Pré-sélectionner uniquement l'utilisateur connecté
  const initialSelectedUser = uniqueUsers.find(user => user.value === parseInt(userId, 10));
  const [selectedUsers, setSelectedUsers] = useState(initialSelectedUser ? [initialSelectedUser] : []);

  useEffect(() => {
    // Corriger les doublons ou sélectionner l'utilisateur connecté si absent
    if (!selectedUsers.length && initialSelectedUser) {
      setSelectedUsers([initialSelectedUser]);
    }
  }, [initialSelectedUser, selectedUsers]);

  const handleSelectionChange = (selectedOptions) => {
    setSelectedUsers(selectedOptions || []);
  };

  // Filtrer et construire les datasets
  const chartData = {
    labels,
    datasets: selectedUsers.map((selectedUser) => {
      const userData = data.filter(item => item.user_id === selectedUser.value);
      const points = Array(labels.length).fill(0);

      userData.forEach(item => {
        const index = labels.indexOf(`D ${item.matchday}`);
        if (index !== -1) points[index] = item.totalPoints || 0;
      });

      return {
        label: selectedUser.label,
        data: points,
        borderColor: selectedUser.value === parseInt(userId, 10)
          ? 'rgba(255, 0, 0, 1)'
          : `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        tension: 0.3,
      };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          maxTicksLimit: 10,
        },
        title: {
          display: true,
          text: 'Points',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Journées',
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
      <label style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'block' }}>
        Sélectionnez les utilisateurs :
      </label>
      <Select
        options={uniqueUsers}
        isMulti
        value={selectedUsers}
        onChange={handleSelectionChange}
        placeholder="Choisissez les utilisateurs"
        className="basic-multi-select"
        classNamePrefix="select"
        styles={{
          control: (base) => ({
            ...base,
            fontSize: '0.9rem',
            padding: '5px',
          }),
        }}
      />
      <div style={{ marginTop: '20px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineChartWithSelection;
