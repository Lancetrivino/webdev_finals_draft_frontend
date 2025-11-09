import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import jwt_decode from "jwt-decode"; // install via `npm i jwt-decode`
import { API_BASE_URL } from "../App";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage and validate token
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp < currentTime) {
          // Token expired
          logout(false);
        } else {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (err) {
        logout(false);
      }
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setCurrentUser(data.user);

      return data.user;
    } catch (err) {
      toast.error(err.message || "Login failed");
      throw err;
    }
  };

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

  const logout = (showToast = true) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    if (showToast) toast.success("👋 Logged out successfully.");
  };

  // Update current user after profile changes
  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated,
    updateCurrentUser, // ✅ allows profile page to update context without logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
