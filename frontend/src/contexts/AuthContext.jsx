import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../App";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // 'initializing' is true only while restoring user from storage on app start
  const [initializing, setInitializing] = useState(true);

  // 'authLoading' is true during login/register network requests
  const [authLoading, setAuthLoading] = useState(false);

  // Load user from localStorage on app start
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Failed to read user from localStorage", err);
    } finally {
      setInitializing(false);
    }
  }, []);

  // login still accepts an object: login({ email, password })
  const login = async ({ email, password }) => {
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      const userWithToken = { ...data.user, token: data.token };
      localStorage.setItem("user", JSON.stringify(userWithToken));
      setCurrentUser(userWithToken);

      // return the user immediately so callers (Login.jsx) can navigate safely
      return userWithToken;
    } catch (err) {
      toast.error(err.message || "Login failed");
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async ({ name, email, password }) => {
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      toast.success("Account created! Please log in.");
      return true;
    } catch (err) {
      toast.error(err.message || "Registration failed");
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    toast.success("Logged out successfully.");
  };

  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const isAuthenticated = () => !!currentUser?.token;

  const value = {
    currentUser,
    login,
    register,
    logout,
    updateCurrentUser,
    isAuthenticated,
    // expose flags your App.jsx route guards expect
    initializing,
    authLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {initializing ? (
        <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-600">
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
