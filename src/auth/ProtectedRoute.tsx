import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../pages/@shared/api";

interface ProtectedRouteProps {
  element: React.ReactElement;
  allowedType: "PERSONAL" | "STUDENT";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedType }) => {
  const location = useLocation();
  const [userType, setUserType] = useState<"PERSONAL" | "STUDENT" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("auth-token");

    if (!user || !token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = JSON.parse(user);
      setUserType(userData.type);

      if (userData.type === allowedType) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      api
        .get("/auth/profile")
        .then(({ data }) => {

          if (data.type === allowedType) {
            setIsAuthorized(true);
          } else {
            localStorage.removeItem("user");
            localStorage.removeItem("auth-token");
          }
        })
        .catch(() => {
          localStorage.removeItem("user");
          localStorage.removeItem("auth-token");
        })
        .finally(() => setIsLoading(false));
    } catch (error) {
      localStorage.removeItem("user");
      localStorage.removeItem("auth-token");
      setIsLoading(false);
    }
  }, [allowedType]);

  if (isLoading) return null; // Aguarda a verificação antes de renderizar

  if (!localStorage.getItem("user") || !localStorage.getItem("auth-token")) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userType === "STUDENT" && allowedType !== "STUDENT") {
    return <Navigate to="/my-workouts" state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return element;
};

export default ProtectedRoute;
