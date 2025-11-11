import React, { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../App";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Synchronously get the user from localStorage on app start
const getInitialUser = () => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(getInitialUser());

  // Login
  const login = async ({ email, password }) => {
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
    }
  };

  // Register
  const register = async ({ name, email, password }) => {
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
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    toast.success("Logged out successfully.");
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
