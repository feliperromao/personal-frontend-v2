import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const location = useLocation();

  //TODO: check if exists user data and token in localstorage
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('auth-token');

  //TODO: make reqiest to validate token

  if ((!user || !token )) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return element;
};

export default ProtectedRoute;
