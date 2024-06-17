import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import UserRanking from "../components/partials/rankings/UserRanking.jsx";
import arrowIcon from "../assets/icons/arrow-left.svg";
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
    <div className="inline-block w-full h-auto py-20">
      <Link
        to="/dashboard"
        className="swiper-button-prev w-[30px] h-[30px] rounded-full bg-white top-7 left-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
      >
        <img src={arrowIcon} alt="Icône flèche" />
      </Link>
      <h1
        className={`font-black mb-32 text-center relative w-fit mx-auto text-xl5 leading-[50px]`}>Classement Steps
        <span
          className="absolute left-0 top-0 right-0 text-purple-soft z-[-1] translate-x-0.5 translate-y-0.5">Classement Steps</span>
        <span
          className="absolute left-0 top-0 right-0 text-green-soft z-[-2] translate-x-1 translate-y-1">Classement Steps</span>
      </h1>

      <UserRanking users={Array.isArray(users) ? users : []} token={token} />
    </div>
  );
}

export default Classements;
