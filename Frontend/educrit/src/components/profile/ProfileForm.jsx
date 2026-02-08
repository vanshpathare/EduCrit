import { useState } from "react";
import { updateProfile } from "../../api/user.api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import axios from "axios";

const ProfileForm = () => {
  const { user, refreshUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    institution: user?.institution || "",
  });

  const [loading, setLoading] = useState(false);
  const [instituteList, setInstituteList] = useState([]);

  // ❌ REMOVED: The generic useEffect that caused the crash.

  // ✅ 1. Search Handler (Typing)
  const handleInstituteChange = async (e) => {
    const userInput = e.target.value.toUpperCase();

    // Update the form state
    setForm((prev) => ({ ...prev, institution: userInput }));

    if (userInput.length < 2) {
      setInstituteList([]);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";
      const { data } = await axios.get(
        `${apiUrl}/api/institutes/search?query=${userInput}`,
      );
      setInstituteList(data);
    } catch (error) {
      console.error("Search error", error);
    }
  };

  // ✅ 2. Focus Handler (Clicking)
  const handleInstituteFocus = async () => {
    if (instituteList.length > 0) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";
      const { data } = await axios.get(
        `${apiUrl}/api/institutes/search?query=A`,
      );
      setInstituteList(data);
    } catch (error) {
      console.error("Focus error", error);
    }
  };

  // Handles normal inputs (Name)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await updateProfile(form);
      toast.success("Profile updated successfully");
      refreshUser();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4">
        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-bold text-gray-700 mb-1.5"
          >
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              id="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
            />
          </div>
        </div>

        {/* Institution Field (Updated) */}
        <div>
          <label
            htmlFor="institution"
            className="block text-sm font-bold text-gray-700 mb-1.5"
          >
            Institution / Organization
          </label>
          <div className="relative">
            <input
              list="institute-options"
              type="text"
              name="institution"
              id="institution"
              value={form.institution}
              onChange={handleInstituteChange} // 👈 Search Trigger
              onFocus={handleInstituteFocus} // 👈 Focus Trigger
              autoComplete="off"
              placeholder="Select or type your college..."
              className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out uppercase"
            />
            {/* The Dropdown */}
            <datalist id="institute-options">
              {instituteList.map((item, index) => {
                const val = typeof item === "object" ? item.name : item;
                return <option key={index} value={val} />;
              })}
            </datalist>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            This will be displayed on your public listings.
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving Changes...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
