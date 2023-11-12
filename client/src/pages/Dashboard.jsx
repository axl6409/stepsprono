import React, {useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import Settings from "../components/user/Settings.jsx";
import axios from "axios";

const Dashboard = () => {
  const token = localStorage.getItem('token') || cookies.token
  const [matchs, setMatchs] = useState([])

  useEffect(() => {
  })

  return (
    <div className="text-center p-10 h-70vh flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-4"><span>⚽️</span><span>Bienvenue sur StepsProno</span><span>⚽️</span></h1>
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
    </div>
  );
}

export default Dashboard;
