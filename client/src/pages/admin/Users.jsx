import React, {useContext} from 'react';
import AdminUsers from "../../components/admin/AdminUsers.jsx";
import {UserContext} from "../../contexts/UserContext.jsx";
import {Navigate, useNavigate} from "react-router-dom";

const Users = () => {
  const { user } = useContext(UserContext)

  if (!user || user.role !== 'admin') {
    return <Navigate to={'/'} replace />
  }

  return (
    <div className="inline-block w-full h-auto">
      <h1 className="text-center font-title uppercase font-black text-xxl my-4">Gestion des utilisateurs</h1>
      <AdminUsers />
    </div>
  );
}

export default Users;