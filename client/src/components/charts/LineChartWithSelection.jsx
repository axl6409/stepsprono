// LineChartWithSelection.jsx
import React, { useState, useMemo } from 'react';
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

const PRIMARY_COLOR   = 'rgb(0,166,53)';
const SECONDARY_COLOR = 'rgb(124, 58, 237)';
const GREY_BORDER     = 'rgba(156,163,175,1)';
const GREY_BG         = 'rgba(156,163,175,0.25)';

// nombre max de journées
const MAX_MATCHDAYS = 34;
const PX_PER_DAY = 25;
const minWidthPx = Math.max(600, MAX_MATCHDAYS * 52);

const LineChartWithSelection = ({ data, userId, currentUserId, isRankingChart = false }) => {
  const labels = useMemo(
    () => Array.from({ length: MAX_MATCHDAYS }, (_, i) => `D ${i + 1}`),
    []
  );

  const currentMatchday = useMemo(
    () => Math.max(0, ...data.map(it => Number(it.matchday) || 0)),
    [data]
  );

  const uniqueUsers = useMemo(() => {
    const map = new Map();
    data.forEach(item => {
      if (!map.has(item.user_id)) {
        map.set(item.user_id, { value: item.user_id, label: item.user_name });
      }
    });
    return Array.from(map.values());
  }, [data]);

  const currentUser = useMemo(
    () => uniqueUsers.find(u => u.value === currentUserId) || null,
    [uniqueUsers, currentUserId]
  );
  const visitedUser = useMemo(
    () => uniqueUsers.find(u => u.value === userId) || null,
    [uniqueUsers, userId]
  );

  const [selectedUsers, setSelectedUsers] = useState(() => {
    if (!currentUser) return [];
    if (visitedUser && visitedUser.value !== currentUserId) {
      return [currentUser, visitedUser];
    }
    return [currentUser];
  });

  const handleSelectionChange = (selectedOptions) => {
    setSelectedUsers(selectedOptions || []);
  };

  const buildDataset = (userOption) => {
    const isMe = userOption.value === currentUserId;
    const isVisited = userOption.value === userId && userId !== currentUserId;

    const color =
      isMe ? PRIMARY_COLOR :
        isVisited ? SECONDARY_COLOR :
          GREY_BORDER;

    const userData = data.filter(item => item.user_id === userOption.value);

    const points = Array(MAX_MATCHDAYS).fill(null);

    userData.forEach(item => {
      const md = Number(item.matchday) || 0;
      if (md >= 1 && md <= currentMatchday) {
        const idx = md - 1;
        points[idx] = isRankingChart ? item.position : (item.totalPoints || 0);
      }
    });

    return {
      label: isMe ? `${userOption.label} (moi)` : userOption.label,
      data: points.map((y, i) => ({ x: labels[i], y })),
      borderColor: color,
      backgroundColor: (isMe || isVisited) ? color : GREY_BG,
      tension: 0.3,
      fill: true,
      borderWidth: (isMe || isVisited) ? 2 : 1.25,
      pointStyle: 'circle',
      pointRadius: (isMe || isVisited) ? 2 : 1.5,
      pointHoverRadius: (isMe || isVisited) ? 5 : 4,
      spanGaps: false,
    };
  };

  const datasets = useMemo(() => {
    return (selectedUsers || []).map(buildDataset);
  }, [selectedUsers, data, labels, currentUserId, userId, isRankingChart, currentMatchday]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { right: 5 } },
    scales: {
      y: {
        beginAtZero: !isRankingChart,
        reverse: isRankingChart,
        ticks: {
          stepSize: 1,
          font: {
            size: 12,
            family: 'Roboto Mono',
            weight: 'bold',
            style: 'normal',
          },
          color: '#02D302',
        },
        title: {
          display: true,
          text: isRankingChart ? 'Position' : 'Points',
          font: {
            size: 12,
            family: 'Roboto Mono',
            weight: 'bold',
            style: 'normal',
          },
          color: '#d1d5db',
        },
        grid: {
          color: '#4b5563',
          borderColor: '#d1d5db',
        }
      },
      x: {
        offset: false,
        ticks: {
          font: {
            size: 10,
            family: 'Roboto Mono',
            weight: 'bold',
            style: 'normal',
          },
          color: '#7DF9FF',
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
        },
        title: {
          display: true,
          text: 'Journées',
          font: {
            size: 12,
            family: 'Roboto Mono',
            weight: 'light',
            style: 'normal',
          },
          color: '#d1d5db',
        },
        grid: {
          color: '#4b5563',
          borderColor: '#d1d5db',
          offset: false,
          drawTicks: true
        }
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'center',
        title: {
          display: true,
          text: '',
        },
        labels: {
          font: {
            family: 'Rubik',
            size: 16,
            weight: 'regular',
          },
          color: '#d1d5db',
          padding: 5,
        },
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#f3f4f6',
        bodyColor: '#f3f4f6',
        callbacks: {
          title: (items) => items?.[0]?.label || '',
          label: (ctx) => {
            const val = ctx.parsed?.y ?? null;
            if (val === null) return '—';
            return isRankingChart ? `Position : ${val}` : `Points : ${val}`;
          }
        }
      }
    },
  }), [isRankingChart]);

  const chartData = useMemo(() => ({
    labels,
    datasets,
  }), [labels, datasets]);

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
        formatOptionLabel={(opt) => {
          const isMe = opt.value === currentUserId;
          const isVisited = opt.value === userId && userId !== currentUserId;
          return (
            <span>
              {opt.label}
              {isMe ? ' (moi)' : isVisited ? ' (profil visité)' : ''}
            </span>
          );
        }}
      />

      <div
        className="border border-black relative shadow-flat-black-adjust bg-black w-full mx-auto overflow-x-scroll custom-x-scrollbar"
        style={{
          marginTop: '20px',
          whiteSpace: 'nowrap',
          touchAction: 'auto',
          WebkitOverflowScrolling: 'auto',
          overflowY: 'hidden',
        }}
      >
        <div className="h-40vh w-[600px]" style={{ width: `${Math.max(600, MAX_MATCHDAYS * PX_PER_DAY)}px` }}>
          <Line translate="no" data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default LineChartWithSelection;
