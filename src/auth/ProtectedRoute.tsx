import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserRole } from '../domain/types';

interface ProtectedRouteProps {
  element: React.ReactElement;
  allowedType: UserRole | "ALL";
}

export const homeByRole: Record<UserRole, string> = {
  ADMIN: '/admin/personals',
  PERSONAL: '/',
  STUDENT: '/my-workouts',
};

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
    return <Navigate to={user.type && homeByRole[user.type] ? homeByRole[user.type] : '/login'} replace />;
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('auth-token');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;
