import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useCookies} from "react-cookie";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleXmark, faPen} from "@fortawesome/free-solid-svg-icons";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3001/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
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
    <div className="py-3.5 px-6 bg-flat-yellow mx-2.5 border-2 border-black shadow-flat-black">
      <ul className="flex flex-col justify-start">
        {users.map(user => (
          <li className="flex flex-row" key={user.id}>
            <p className="username">{user.username}</p>
            <p className="role">{user.Roles && user.Roles[0] ? user.Roles[0].name : 'Aucun rôle'}</p>
            <button onClick={() => handleEditUser(user.id)}><FontAwesomeIcon icon={faPen} /></button>
            <button onClick={() => handleDeleteUser(user.id)}><FontAwesomeIcon icon={faCircleXmark} /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminUsers;
