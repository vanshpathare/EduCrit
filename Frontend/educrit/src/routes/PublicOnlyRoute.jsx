import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();

  // While auth is loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // If already logged in → redirect home
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Otherwise allow access
  return <Outlet />;
};

export default PublicOnlyRoute;
