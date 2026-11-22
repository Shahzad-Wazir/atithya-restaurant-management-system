import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false, kitchenOnly = false }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const loginPath = adminOnly || kitchenOnly ? "/admin/login" : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to={user.role === "kitchen" ? "/kitchen" : "/"} replace />;
  }

  if (kitchenOnly && !["kitchen", "admin"].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
