// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../App";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // auth state
  const [currentUser, setCurrentUser] = useState(null);

  // true while reading localStorage / initializing app
  const [initializing, setInitializing] = useState(true);

  // true while performing an auth network call (login/register/logout)
  const [authLoading, setAuthLoading] = useState(false);

  // On mount: load user from localStorage (synchronous) and finish initializing
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

  // Helper: wait until currentUser is available (or timeout)
  const waitForCurrentUser = useCallback((timeout = 2000, interval = 100) => {
    return new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        if (currentUser) {
          resolve(currentUser);
          return;
        }
        if (Date.now() - start >= timeout) {
          resolve(null);
          return;
        }
        setTimeout(check, interval);
      };
      check();
    });
  }, [currentUser]);

  // login: accepts either (email, password) or ({ email, password })
  const login = async (emailOrObj, maybePassword) => {
    setAuthLoading(true);
    try {
      let email, password;
      if (typeof emailOrObj === "object" && emailOrObj !== null) {
        email = emailOrObj.email;
        password = emailOrObj.password;
      } else {
        email = emailOrObj;
        password = maybePassword;
      }

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

      // Return the user immediately so callers can navigate safely based on returned user
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
    initializing,   // true only while initial localStorage load runs
    authLoading,    // true when login/register requests are in progress
    waitForCurrentUser, // helper to wait for currentUser (returns Promise)
  };

  // show full screen loader while the provider is initializing (prevents protected route flicker)
  if (initializing) {
    return (
      <AuthContext.Provider value={value}>
        <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-600">
          Loading...
        </div>
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
