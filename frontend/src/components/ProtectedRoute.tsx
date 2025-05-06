import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles.length > 0 &&
    user &&
    !allowedRoles.includes(user.role.toLowerCase())
  ) {
    // Redirect to the appropriate dashboard based on role
    if (user.role.toLowerCase() === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (user.role.toLowerCase() === "hod") {
      return <Navigate to="/hod" replace />;
    } else if (user.role.toLowerCase() === "staff") {
      return <Navigate to="/staff" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
