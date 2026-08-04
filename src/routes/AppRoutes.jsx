import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";

import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Suits from "../pages/Suits.jsx";
import Customers from "../pages/Customers.jsx";
import Bookings from "../pages/Bookings.jsx";
import Rentals from "../pages/Rentals.jsx";
import Returns from "../pages/Returns.jsx";
import Reports from "../pages/Reports.jsx";
import Users from "../pages/Users.jsx";
import NotFound from "../pages/NotFound.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/suits" element={<Suits />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/reports" element={<Reports />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute adminOnly>
              <Users />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
