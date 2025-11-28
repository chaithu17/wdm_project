import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export default function RequireAdmin({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  // Adjust this logic to your auth shape if needed
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  if (!isAdmin) {
    return <Navigate to="/signin" state={{ from: location, reason: "admin_required" }} replace />;
  }
  return children;
}
