import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Checking session...</div>;

  if (!user) return <Navigate to="/login" />;

  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) {
      return <Navigate to="/login" />;
    }
  }

  return children;
};

export default ProtectedRoute;