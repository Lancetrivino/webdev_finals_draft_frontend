// contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../App";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Failed to parse user from storage:", err);
      } finally {
        setInitializing(false);
      }
    };
    loadUser();
  }, []);

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
    initializing,
    authLoading,
  };

  
  return (
    <AuthContext.Provider value={value}>
      {/* Render children always so hook order stays constant */}
      {children}

      {/* A loader overlay while the auth initializes */}
      {initializing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-lg shadow">
            Loading...
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
