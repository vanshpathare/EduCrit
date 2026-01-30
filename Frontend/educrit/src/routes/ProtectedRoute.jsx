import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import toast from "react-hot-toast";
import Loader from "../components/common/Loader";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // 🛑 FIX: Add '!loading' check here.
    // This prevents the toast from firing while we are still checking who the user is.
    if (!loading && !user) {
      toast.error("Please login first to access this page.");
    }
  }, [user, loading]); // 👈 Add 'loading' to dependency array

  // While checking auth
  if (loading) {
    return <Loader />;
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in → allow access
  return <Outlet />;
};

export default ProtectedRoute;
