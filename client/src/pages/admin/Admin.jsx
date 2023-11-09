import React, {useContext} from 'react';
import {UserContext} from "../../contexts/UserContext.jsx";
import {Link, Navigate, useNavigate} from "react-router-dom";

const Admin = () => {
  const { user } = useContext(UserContext)
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    return <Navigate to={'/'} replace />
  }

  return (
    <div className="inline-block w-full h-auto">
      <h1 className="text-center font-title uppercase font-black text-xxl my-4">Admin Panel</h1>
      <Link
        to="/admin/users"
        className="w-3/4 block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
      >
        <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Utilisateurs</span>
      </Link>
      <Link
        to="/admin/settings"
        className="w-3/4 block mx-auto relative my-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-green-lime before:border-black before:border-2 group"
      >
        <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-2 rounded-full text-center shadow-md bg-white transition -translate-y-2.5 group-hover:-translate-y-0">Réglages</span>
      </Link>
    </div>
  );
}

export default Admin;