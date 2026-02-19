import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    navigate("/");
    await logout();
    toast.success("Logged out successfully");
    setMenuOpen(false);
  };

  const navLinkStyle = ({ isActive }) =>
    `text-sm font-medium ${
      isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        {/* 🟢 MAIN CONTAINER: Added 'relative' so absolute positioning works inside it */}
        <div className="relative flex items-center justify-between h-16">
          {/* --- LEFT: LOGO --- */}
          {/* 🟢 Added 'z-20' so logo stays on top/clickable */}
          <div className="flex-shrink-0 flex items-center z-20">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="EduCrit Logo"
                // Adjusted height to h-12 (48px) so it fits nicely in h-16 navbar
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>

          {/* --- CENTER: ADD YOUR ITEM --- */}
          {/* 🟢 THE FIX: 
              1. 'absolute left-1/2 top-1/2 ...' -> Centers perfectly on Mobile
              2. 'md:static md:transform-none'   -> Resets to normal position on Desktop
          */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-max md:static md:transform-none">
            <Link
              to={user ? "/add-item" : "/list-your-item"}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition whitespace-nowrap"
            >
              Add your item
            </Link>
          </div>

          {/* --- RIGHT: DESKTOP AUTH --- */}
          {/* 🟢 Added 'z-20' */}
          <div className="hidden md:flex items-center gap-6 z-20">
            {loading ? (
              <span className="text-sm text-gray-400">Loading...</span>
            ) : user ? (
              <>
                <NavLink to="/my-listings" className={navLinkStyle}>
                  My Listings
                </NavLink>
                <NavLink to="/history" className={navLinkStyle}>
                  History
                </NavLink>
                <NavLink to="/profile" className={navLinkStyle}>
                  Profile
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkStyle}>
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>

          {/* --- RIGHT: MOBILE HAMBURGER --- */}
          {/* 🟢 Wrapped in div with 'z-20' so it stays clickable */}
          <div className="md:hidden flex items-center z-20">
            <button
              className="text-2xl text-gray-600 focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU (No changes needed here) */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white shadow-lg animate-fade-in-down">
          <div className="px-4 py-6 space-y-4">
            {user ? (
              /* --- LOGGED IN USER MENU --- */
              <div className="flex flex-col gap-3">
                <div className="text-center mb-2">
                  <p className="text-gray-500 text-sm">Welcome back,</p>
                  <p className="font-bold text-gray-900 text-lg">{user.name}</p>
                </div>

                <NavLink
                  to="/my-listings"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `w-full text-center py-3 rounded-xl font-semibold text-base transition border ${
                      isActive
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  My Listings
                </NavLink>

                <NavLink
                  to="/history"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `w-full text-center py-3 rounded-xl font-semibold text-base transition border ${
                      isActive
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  History
                </NavLink>

                <NavLink
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `w-full text-center py-3 rounded-xl font-semibold text-base transition border ${
                      isActive
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  Profile
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="w-full text-center bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 py-3 rounded-xl font-semibold text-base transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              /* --- LOGGED OUT USER MENU --- */
              <div className="flex flex-col gap-3">
                <NavLink
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center border border-blue-600 text-blue-600 py-3 rounded-xl font-semibold text-base hover:bg-blue-50 transition"
                >
                  Log in
                </NavLink>

                <NavLink
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-base shadow-sm transition"
                >
                  Create account
                </NavLink>

                <p className="text-xs text-center text-gray-500 mt-1">
                  Join EduCrit to buy, sell or rent items
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
