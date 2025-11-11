import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../App";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Load user from localStorage when app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 🔹 Login user
  const login = async ({ email, password }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      // ✅ Store token *inside* the user object
      const userWithToken = { ...data.user, token: data.token };

      localStorage.setItem("user", JSON.stringify(userWithToken));
      setCurrentUser(userWithToken);

      return userWithToken;
    } catch (err) {
      toast.error(err.message || "Login failed");
      throw err;
    }
  };

  // 🔹 Register user
  const register = async ({ name, email, password }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      toast.success(" Account created! Please log in.");
      return true;
    } catch (err) {
      toast.error(err.message || "Registration failed");
      throw err;
    }
  };

  // 🔹 Logout user
  const logout = (showToast = true) => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    if (showToast) toast.success("Logged out successfully.");
  };

  // 🔹 Update user info locally
  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // 🔹 Check authentication
  const isAuthenticated = () => !!currentUser?.token;

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated,
    updateCurrentUser,
  };

  return (
  <AuthContext.Provider value={value}>
    {loading ? (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading...
      </div>
    ) : (
      children
    )}
  </AuthContext.Provider>
);
};
