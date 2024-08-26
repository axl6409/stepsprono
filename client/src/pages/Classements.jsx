import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import UserRanking from "../components/user/UserRanking.jsx";
import arrowIcon from "../assets/icons/arrow-left.svg";
import SimpleTitle from "../components/partials/SimpleTitle.jsx";
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
        className="swiper-button-prev fade-in w-[30px] h-[30px] rounded-full bg-white top-7 left-2 shadow-flat-black-adjust border-2 border-black transition-all duration-300 hover:shadow-none focus:shadow-none"
      >
        <img src={arrowIcon} alt="Icône flèche" />
      </Link>
      <div className="mb-32">
        <SimpleTitle title={"Classement Steps"} />
      </div>
      <UserRanking users={Array.isArray(users) ? users : []} token={token} />
    </div>
  );
}

export default Classements;
