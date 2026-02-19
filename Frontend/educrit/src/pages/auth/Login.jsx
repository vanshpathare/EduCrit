import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import api from "../../api/axios";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect user back to where they came from
  const from = location.state?.from?.pathname || "/";

  const [isDeactivated, setIsDeactivated] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // NEW: State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setIsDeactivated(false);
      await login(formData);
      toast.success("Logged in successfully");
      navigate(from, { replace: true });
    } catch (error) {
      const responseData = error.response?.data;
      if (error.response?.status === 403 && responseData?.isDeactivated) {
        setIsDeactivated(true); // This makes the yellow box appear
        toast.error("Account deactivated. Click 'Restore' to reactivate.");
      } else {
        const message =
          responseData?.message || error.message || "Login failed";
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setLoading(true);
      const res = await api.post("/auth/reactivate", formData);
      toast.success(res.data.message || "Account restored! You can now login.");
      setIsDeactivated(false); // Hide the restore button
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to restore account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        {/* Password Input Wrapper (Relative for positioning icon) */}
        {/* Password Input Wrapper with INLINE STYLES to force visibility */}
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            // specific style to make room for the icon so text doesn't overlap
            style={{ paddingRight: "40px" }}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            // Force positioning with standard CSS
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#6b7280", // Gray color to ensure it's not invisible
            }}
          >
            {showPassword ? (
              // Open Eye
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            ) : (
              // Closed Eye
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {isDeactivated && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700 mb-2 text-center font-medium">
              It looks like your account was deactivated. Would you like to
              restore it and your listings?
            </p>
            <button
              type="button"
              onClick={handleReactivate}
              className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 transition-colors shadow-md"
            >
              {loading ? "Restoring..." : "Restore Account & Listings"}
            </button>
          </div>
        )}
      </form>

      <p className="mt-4 text-center">
        Don’t have an account?{" "}
        <Link to="/register" className="text-blue-600">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
