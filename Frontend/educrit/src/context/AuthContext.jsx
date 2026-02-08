import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie"; // Import the helper
import { getMe, logoutUser, loginUser } from "../api/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. FETCH USER (On Refresh)
  const fetchUser = async () => {
    // We don't need to check localStorage anymore.
    // The cookie is automatically sent by the browser because of 'withCredentials: true'
    try {
      const res = await getMe();
      setUser(res.data?.user || res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // 2. LOGIN (Manually Set Cookie)
  const login = async (data) => {
    const res = await loginUser(data);
    const user = res.data?.user || res.user;

    // 🔥 CRITICAL: Manually save the token as a cookie
    const token = res.token || res.data?.token;

    if (token) {
      // This saves the token in a cookie named "token" for 7 days
      Cookies.set("token", token, { expires: 7, path: "/" });
    }

    setUser(user);
    return res;
  };

  // 3. LOGOUT (Delete Cookie)
  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error(e);
    }
    // 🗑️ Delete the cookie manually so the backend sees you as logged out
    Cookies.remove("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
