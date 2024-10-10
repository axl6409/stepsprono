import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from "react-cookie";
import { Link } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/admin/tasks/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response)
        setTasks(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des tâches :', error);
      }
    };

    fetchTasks();
  }, [token]);

  const handleDeleteTask = async (jobId) => {
    try {
      await axios.delete(`${apiUrl}/api/tasks/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(tasks.filter(task => task.job_id !== jobId));
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche :', error);
    }
  };

  return (
    <div className="admin-tasks">
      <h2>Liste des tâches programmées</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.job_id}>
            <span>{task.type} - Programmée pour : {new Date(task.scheduled_at).toLocaleString()}</span>
            <button onClick={() => handleDeleteTask(task.job_id)}>Supprimer</button>
          </li>
        ))}
      </ul>
      <Link to="/admin">Retour à l'admin</Link>
    </div>
  );
};

export default AdminTasks;
