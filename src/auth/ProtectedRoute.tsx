import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserRole } from '../domain/types';

interface ProtectedRouteProps {
  element: React.ReactElement;
  allowedType: UserRole | "ALL";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedType }) => {
  const location = useLocation();
  const userRaw = localStorage.getItem('user');
  const token = localStorage.getItem('auth-token');

  if (!userRaw || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const user = JSON.parse(userRaw) as { type?: UserRole };
    if (allowedType === 'ALL' || user.type === allowedType) return element;
    return <Navigate to={user.type === 'STUDENT' ? '/my-workouts' : '/'} replace />;
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('auth-token');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;
