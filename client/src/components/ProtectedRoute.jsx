import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext.jsx';

const ProtectedRoute = ({ component: Component, componentProps, ...rest }) => {
  const { isAuthenticated, user } = useContext(UserContext);
  const navigate = useNavigate();

  // Check if user is authenticated and not retired
  useEffect(() => {
    if (isAuthenticated && user?.status === 'retired') {
      // Clear auth state and redirect to login
      navigate('/login', { 
        state: { error: 'Votre compte est désactivé pour la saison en cours.' },
        replace: true 
      });
    }
  }, [isAuthenticated, user, navigate]);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is retired, don't render the component (will be handled by useEffect)
  if (user?.status === 'retired') {
    return null; // or a loading spinner
  }

  // User is authenticated and not retired, render the protected component
  return <Component {...componentProps} {...rest} />;
};

export default ProtectedRoute;
