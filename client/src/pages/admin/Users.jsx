import React, {useContext} from 'react';
import AdminUsers from "../../components/admin/AdminUsers.jsx";
import {UserContext} from "../../contexts/UserContext.jsx";
import {Link, Navigate, useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft} from "@fortawesome/free-solid-svg-icons";

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
      <h1 className="text-center font-title uppercase font-black text-xxl my-4">Gestion des utilisateurs</h1>
      <AdminUsers />
    </div>
  );
}

export default Users;