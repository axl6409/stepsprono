import React, {useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft, faCircleXmark, faPen} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import {useCookies} from "react-cookie";
import WeekRanking from "../components/partials/rankings/WeekRanking.jsx";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Classements = () => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async (roles) => {
      try {
        let url = `${apiUrl}/api/admin/users`;
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
    fetchUsers(['user', 'manager', 'treasurer', 'admin'])
  }, [token]);

  return (
    <div className="text-center flex flex-col justify-center">
      <Link
        to="/dashboard"
        className="w-fit block relative my-4 ml-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:bg-green-lime before:border-black before:border-2 group"
      >
        <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-1 text-center shadow-md bg-white transition -translate-y-1 translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0">
          <FontAwesomeIcon icon={faCaretLeft} />
        </span>
      </Link>
      <h1 className="text-3xl font-black my-8 uppercase relative w-fit mx-auto">Classements
        <span className="absolute left-0 bottom-0 text-flat-purple z-[-1] transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">Classements</span>
        <span className="absolute left-0 bottom-0 text-green-lime z-[-2] transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">Classements</span>
      </h1>

      <WeekRanking users={Array.isArray(users) ? users : []} token={token}/>
    </div>
  );
}

export default Classements;
