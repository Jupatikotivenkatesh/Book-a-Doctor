import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Wraps routes that require authentication and optionally a specific role.
 * Redirects unauthenticated users to /login.
 * Redirects unauthorized roles to their appropriate dashboard.
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to the correct dashboard based on actual role
    const dashboardMap = {
      admin: "/admin/dashboard",
      doctor: "/doctor/dashboard",
      patient: "/dashboard",
    };
    return <Navigate to={dashboardMap[user.role] || "/"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
