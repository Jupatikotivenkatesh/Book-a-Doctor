import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Redirects already-authenticated users away from login/register pages
 * to their appropriate dashboard.
 */
const PublicRoute = () => {
  const { user } = useSelector((state) => state.auth);

  if (user) {
    const dashboardMap = {
      admin: "/admin/dashboard",
      doctor: "/doctor/dashboard",
      patient: "/dashboard",
    };
    return <Navigate to={dashboardMap[user.role] || "/"} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
