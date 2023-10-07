import React, {useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import Settings from "../components/user/Settings.jsx";
import axios from "axios";

const Dashboard = () => {
  const token = localStorage.getItem('token') || cookies.token
  const [matchs, setMatchs] = useState([])

  useEffect(() => {
    const fetchMatchs = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3001/api/APIUpcomingMatches', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        console.log(response.data)
        setMatchs(response.data.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des matchs :', error);
      }
    }
    fetchMatchs()
  }, [])

  return (
    <div className="text-center p-10 h-70vh flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-4">⚽️ Bienvenue sur votre tableau de bord ⚽️</h1>
      <Link
        to="/matchs"
        className="w-full relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
      >
        <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Matchs</span>
      </Link>
      <Link
        to="/classement"
        className="w-full relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
      >
        <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Classement</span>
      </Link>
      <h2>Liste des matchs</h2>
      <div>
        <ul>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
