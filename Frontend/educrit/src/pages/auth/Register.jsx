import { useState } from "react"; // Removed useEffect
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../../api/auth.api";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ 1. State for Search Results
  const [instituteList, setInstituteList] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    institution: "",
    termsAccepted: false,
  });

  // DELETED: The useEffect that fetched ALL institutes (Caused Lag)

  // 2. NEW: Search Handler (Typing)
  const handleInstituteChange = async (e) => {
    const userInput = e.target.value.toUpperCase();

    // Update form state immediately
    setFormData((prev) => ({ ...prev, institution: userInput }));

    // Optimization: Don't search if input is too short
    if (userInput.length < 2) {
      setInstituteList([]);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";
      const { data } = await axios.get(
        `${apiUrl}/institutes/search?query=${userInput}`,
      );
      setInstituteList(data);
    } catch (error) {
      console.error("Search error", error);
    }
  };

  // ✅ 3. NEW: Focus Handler (Clicking)
  const handleInstituteFocus = async () => {
    if (instituteList.length > 0) return; // Don't refetch if list exists
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";
      // Fetch default results (e.g., "A") so the list isn't empty
      const { data } = await axios.get(
        `${apiUrl}/api/institutes/search?query=A`,
      );
      setInstituteList(data);
    } catch (error) {
      console.error("Focus error", error);
    }
  };

  // Standard handler for other inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.termsAccepted) {
      toast.error("You must accept terms and conditions");
      return;
    }

    try {
      setLoading(true);
      await registerUser(formData);

      toast.success("Registered successfully. Verify your email.");
      navigate("/verify-email", {
        state: { email: formData.email },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
            style={{ paddingRight: "40px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            {showPassword ? (
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

        {/* ✅ 4. UPDATED INSTITUTE INPUT */}
        <div>
          <input
            list="institute-options"
            type="text"
            name="institution"
            placeholder="Select or Type Institution"
            value={formData.institution}
            onChange={handleInstituteChange} // 👈 Use Search Handler
            onFocus={handleInstituteFocus} // 👈 Use Focus Handler
            autoComplete="off"
            required
            className="w-full border p-2 uppercase rounded"
          />
          <datalist id="institute-options">
            {instituteList.map((item, index) => {
              // 🛡️ Safety check: Use .name if object, or item if string
              const val = typeof item === "object" ? item.name : item;
              return <option key={index} value={val} />;
            })}
          </datalist>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={handleChange}
          />
          I accept the terms and conditions
        </label>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="mt-4 text-sm text-center">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-600 font-semibold hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
