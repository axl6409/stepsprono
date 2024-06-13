import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext.jsx';

const ProtectedRoute = ({ component: Component, componentProps, ...rest }) => {
  const { isAuthenticated } = useContext(UserContext);

  return isAuthenticated ? (
    <Component {...componentProps} {...rest} />
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoute;
