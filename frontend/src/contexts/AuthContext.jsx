import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../App"; // uses your dynamic API config

// Create context
const AuthContext = createContext();

// Hook for easy access
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------------
     Load stored user from localStorage on mount
     ------------------------------------------------------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /* -------------------------------------------------------------
     LOGIN FUNCTION
     ------------------------------------------------------------- */
  const login = async ({ email, password }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      // ✅ Save to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Update context
      setCurrentUser(data.user);

      
      return data.user;
    } catch (err) {
      toast.error(err.message || "Login failed");
      throw err;
    }
  };

  /* -------------------------------------------------------------
     REGISTER FUNCTION
     ------------------------------------------------------------- */
  const register = async ({ name, email, password }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      toast.success("🎉 Account created! Please log in.");
      return true;
    } catch (err) {
      toast.error(err.message || "Registration failed");
      throw err;
    }
  };

  /* -------------------------------------------------------------
     LOGOUT FUNCTION
     ------------------------------------------------------------- */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    toast.success("👋 Logged out successfully.");
  };

  /* -------------------------------------------------------------
     CHECK AUTH STATUS
     ------------------------------------------------------------- */
  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  /* -------------------------------------------------------------
     CONTEXT VALUE
     ------------------------------------------------------------- */
  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};