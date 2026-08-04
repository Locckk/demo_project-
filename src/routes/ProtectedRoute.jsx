import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";

/**
 * Blocks a route until the user is signed in.
 * Pass adminOnly to restrict a page to the admin role.
 *
 * This is a usability guard, not a security boundary — the real check
 * lives on the server. Hiding a button never stops a crafted request.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner fullScreen label="Checking your session" />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
}
