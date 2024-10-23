import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import UserRanking from "../components/user/UserRanking.jsx";
import arrowIcon from "../assets/icons/arrow-left.svg";
import SimpleTitle from "../components/partials/SimpleTitle.jsx";
import DashboardButton from "../components/nav/DashboardButton.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Classements = () => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async (roles) => {
      try {
        let url = `${apiUrl}/api/users/all`;
        if (roles && roles.length > 0) {
          const rolesQuery = roles.map(role => `roles[]=${encodeURIComponent(role)}`).join('&');
          url += `?${rolesQuery}`;
        }
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers(['user', 'manager', 'treasurer', 'admin']);
  }, [token]);

  return (
    <div className="inline-block relative w-full h-auto py-20">
      <DashboardButton />
      <SimpleTitle title={"Classement Steps"} stickyStatus={false}/>
      <div className="relative mt-28">
        <UserRanking users={Array.isArray(users) ? users : []} token={token} />
      </div>
    </div>
  );
}

export default Classements;
