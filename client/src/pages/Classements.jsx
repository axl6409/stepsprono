import React, {useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft, faCircleXmark, faPen} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import {useCookies} from "react-cookie";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const Classements = () => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const fetchUserBets = async (userId) => {
    try {
      const response = await axios.get(`${apiUrl}/api/user/${userId}/bets/last`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data.reduce((sum, bet) => sum + (bet.points || 0), 0)
    } catch (error) {
      console.error(`Erreur lors de la sélection des paris pour l'utilisateur ${userId}`, error);
      return null
    }
  }

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
        setIsLoading(false);
        for (const user of users) {
          const points = await fetchUserBets(user.id);
          user.weekPoints = points;
          setUsers(users.map(u => u.id === user.id ? user : u));
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
      }
    }
    fetchUsers(['user', 'manager', 'treasurer', 'admin'])
  }, []);

  console.log(users)

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
      <div className="relative border-t-2 border-b-2 border-black overflow-hidden py-8 px-2 pt-0 bg-flat-yellow">
        <div className="section-head relative">
          <ul className={`overflow-hidden bg-white w-fit min-w-[200px] py-1.5 pb-0 relative -top-1.5 border-2 border-black rounded-br-md rounded-bl-md shadow-flat-black transition duration-300`}>
            <li>
              <p>Cette semaine</p>
            </li>
          </ul>
        </div>
        <div className="flex flex-col justify-start">
          <ul>
            {users.map(user => {
              return (
                <li className="flex flex-row justify-between" key={user.id}>
                  <p
                    className="username relative font-title font-bold text-xl leading-6 my-auto border-2 border-black bg-white py-1 px-4 h-fit shadow-flat-black">
                    {user.username}
                  </p>
                  <p>
                    Points de la semaine: {user.weekPoints}
                  </p>
                </li>
              )
              }
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Classements;
