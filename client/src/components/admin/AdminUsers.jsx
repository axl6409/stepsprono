import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3001/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`, // remplacez `${token}` par le jeton JWT réel
          }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = (userId) => {
    // Implémentez la logique pour supprimer l'utilisateur.
  };

  const handleEditUser = (userId) => {
    // Implémentez la logique pour modifier l'utilisateur.
  };

  return (
    <div>
      <h2>Manage Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.username}
            <button onClick={() => handleEditUser(user.id)}>Modifier</button>
            <button onClick={() => handleDeleteUser(user.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminUsers;
