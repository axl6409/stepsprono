import React from 'react';
import {Link} from "react-router-dom";
import Settings from "../components/user/Settings.jsx";


const Dashboard = () => {
  return (
    <div className="text-center p-10 h-70vh flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-4">⚽️ Bienvenue sur votre tableau de bord ⚽️</h1>

      <Settings />
    </div>
  );
}

export default Dashboard;
