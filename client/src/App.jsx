import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";
import MainLayout from "./components/layout/MainLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const Landing         = lazy(() => import("./pages/Landing"));
const Login           = lazy(() => import("./pages/Login"));
const Register        = lazy(() => import("./pages/Register"));
const Doctors         = lazy(() => import("./pages/Doctors"));
const DoctorDetail    = lazy(() => import("./pages/DoctorDetail"));
const Notifications   = lazy(() => import("./pages/Notifications"));
const ApplyDoctor     = lazy(() => import("./pages/ApplyDoctor"));
const NotFound        = lazy(() => import("./pages/NotFound"));

// Patient pages
const UserDashboard     = lazy(() => import("./pages/patient/UserDashboard"));
const MyAppointments    = lazy(() => import("./pages/patient/MyAppointments"));
const AppointmentDetail = lazy(() => import("./pages/patient/AppointmentDetail"));
const UserProfile       = lazy(() => import("./pages/patient/UserProfile"));
const BookAppointment   = lazy(() => import("./pages/BookAppointment"));

// Doctor pages
const DoctorDashboard    = lazy(() => import("./pages/doctor/DoctorDashboard"));
const DoctorAppointments = lazy(() => import("./pages/doctor/DoctorAppointments"));
const DoctorProfile      = lazy(() => import("./pages/doctor/DoctorProfile"));

// Admin pages
const AdminDashboard    = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers        = lazy(() => import("./pages/admin/AdminUsers"));
const AdminDoctors      = lazy(() => import("./pages/admin/AdminDoctors"));
const AdminAppointments = lazy(() => import("./pages/admin/AdminAppointments"));

// ─── Page loader ──────────────────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "center",
    minHeight: "100vh", background: "#f0f2f5",
  }}>
    <Spin size="large" tip="Loading..." />
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public routes (with Navbar + Footer) ── */}
        <Route element={<MainLayout />}>
          <Route path="/"           element={<Landing />} />
          <Route path="/doctors"    element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorDetail />} />

          <Route element={<PublicRoute />}>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>

        {/* ── Patient protected routes ── */}
        <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
          <Route element={<DashboardLayout role="patient" />}>
            <Route path="/dashboard"           element={<UserDashboard />} />
            <Route path="/appointments"        element={<MyAppointments />} />
            <Route path="/appointments/:id"    element={<AppointmentDetail />} />
            <Route path="/notifications"       element={<Notifications />} />
            <Route path="/apply-doctor"        element={<ApplyDoctor />} />
            <Route path="/profile"             element={<UserProfile />} />
            <Route path="/book/:doctorId"      element={<BookAppointment />} />
          </Route>
        </Route>

        {/* ── Doctor protected routes ── */}
        <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
          <Route element={<DashboardLayout role="doctor" />}>
            <Route path="/doctor/dashboard"      element={<DoctorDashboard />} />
            <Route path="/doctor/appointments"   element={<DoctorAppointments />} />
            <Route path="/doctor/profile"        element={<DoctorProfile />} />
            <Route path="/doctor/notifications"  element={<Notifications />} />
          </Route>
        </Route>

        {/* ── Admin protected routes ── */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<DashboardLayout role="admin" />}>
            <Route path="/admin/dashboard"     element={<AdminDashboard />} />
            <Route path="/admin/users"         element={<AdminUsers />} />
            <Route path="/admin/doctors"       element={<AdminDoctors />} />
            <Route path="/admin/appointments"  element={<AdminAppointments />} />
            <Route path="/admin/notifications" element={<Notifications />} />
          </Route>
        </Route>

        {/* ── Fallback ── */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*"    element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
