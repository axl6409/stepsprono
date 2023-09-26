import React, {useContext} from 'react';
import { Navigate } from 'react-router-dom';
import {UserContext} from "../contexts/UserContext.jsx";

export default function ProtectedRoute({ component: Component }) {
  const { isAuthenticated } = useContext(UserContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  return <Component />;
}
