import axios from 'axios';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
const API_URL = `${process.env.REACT_APP_BACKEND_GRAPH_API}/auth/profile`

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
  axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json'
    }
  }).then(({data}) => {
    console.log("🚀 ~ data:", data)
    if (data.type != "PERSONAL") {
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
