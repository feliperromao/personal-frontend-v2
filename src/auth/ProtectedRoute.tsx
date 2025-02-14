import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../pages/@shared/api';

interface ProtectedRouteProps {
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const location = useLocation();

  const user = localStorage.getItem('user');
  const token = localStorage.getItem('auth-token');

  if ((!user || !token)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  //TODO: make reqiest to validate token
  api.get('/auth/profile').then(({ data }) => {
    if (data.type !== "PERSONAL") {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }).catch(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth-token');
    return <Navigate to="/login" state={{ from: location }} replace />;
  })

  return element;
};

export default ProtectedRoute;
