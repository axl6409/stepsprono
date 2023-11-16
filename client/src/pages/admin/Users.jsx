import React, {useContext} from 'react';
import AdminUsers from "../../components/admin/AdminUsers.jsx";
import {UserContext} from "../../contexts/UserContext.jsx";
import {Link, Navigate, useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft} from "@fortawesome/free-solid-svg-icons";
import BackButton from "../../components/nav/BackButton.jsx";

const Users = () => {
  const { user } = useContext(UserContext)

  if (!user || user.role !== 'admin' && user.role !== 'manager') {
    return <Navigate to={'/'} replace />
  }

  return (
    <div className="inline-block w-full h-auto">
      <Link
        to="/admin"
        className="w-fit block relative my-4 ml-4 before:content-[''] before:inline-block before:absolute before:z-[-1] before:inset-0 before:bg-green-lime before:border-black before:border-2 group"
      >
        <span className="relative z-[2] w-full block border-2 border-black text-black px-3 py-1 text-center shadow-md bg-white transition -translate-y-1 translate-x-1 group-hover:-translate-y-0 group-hover:-translate-x-0">
          <FontAwesomeIcon icon={faCaretLeft} />
        </span>
      </Link>
      <h1 className="text-3xl font-black my-8 uppercase relative w-fit mx-auto text-center">Gestion des utilisateurs
        <span className="absolute left-0 bottom-0 text-flat-purple z-[-1] text-center transition-all duration-700 ease-in-out delay-500 -translate-x-0.5 translate-y-0.5">Gestion des utilisateurs</span>
        <span className="absolute left-0 bottom-0 text-green-lime z-[-2] text-center transition-all duration-700 ease-in-out delay-700 -translate-x-1 translate-y-1">Gestion des utilisateurs</span>
      </h1>
      <AdminUsers />
    </div>
  );
}

export default Users;