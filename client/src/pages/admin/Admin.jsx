import React, {useContext} from 'react';
import AdminUsers from "../../components/admin/AdminUsers.jsx";
import {UserContext} from "../../contexts/UserContext.jsx";
import {Navigate, useNavigate} from "react-router-dom";

const Admin = () => {
  const { user } = useContext(UserContext)
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    return <Navigate to={'/'} replace />
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      <AdminUsers />
    </div>
  );
}

export default Admin;