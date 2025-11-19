import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../App";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        console.log("🔐 Initializing auth...");
        console.log("  Stored user:", storedUser ? "✅ Found" : "❌ Not found");
        console.log("  Stored token:", storedToken ? "✅ Found" : "❌ Not found");

        if (storedUser && storedToken) {
          const user = JSON.parse(storedUser);
          
          // ✅ CRITICAL: Make sure token is included in user object
          user.token = storedToken;
          
          console.log("✅ User loaded:", user.email, "Role:", user.role);
          setCurrentUser(user);
        } else {
          console.log("⚠️ No stored credentials found");
        }
      } catch (error) {
        console.error("❌ Error initializing auth:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setInitializing(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      console.log("📝 Login attempt:", credentials.email);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log("📥 Login response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.token) {
        throw new Error("No token received from server");
      }

      // ✅ Store token and user separately
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ CRITICAL: Include token in user object for immediate use
      const userWithToken = {
        ...data.user,
        token: data.token,
      };

      console.log("✅ Login successful:", userWithToken.email);
      console.log("  Role:", userWithToken.role);
      console.log("  Token:", data.token.substring(0, 20) + "...");

      setCurrentUser(userWithToken);
      return userWithToken;
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      console.log("📝 Register attempt:", userData.email);

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("📥 Register response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      console.log("✅ Registration successful:", data.user?.email);
      
      // Don't auto-login after registration
      // Let user go to login page
      return data;
    } catch (error) {
      console.error("❌ Register error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    console.log("👋 Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    console.log("✅ Logout complete");
  };

  // Update current user (for profile updates)
  const updateCurrentUser = (updatedUser) => {
    console.log("🔄 Updating current user...");
    
    // ✅ Keep the token when updating user
    const token = currentUser?.token || localStorage.getItem("token");
    
    const userWithToken = {
      ...updatedUser,
      token: token,
    };

    setCurrentUser(userWithToken);
    localStorage.setItem("user", JSON.stringify(userWithToken));
    console.log("✅ User updated");
  };

  const value = {
    currentUser,
    initializing,
    login,
    register,
    logout,
    updateCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};