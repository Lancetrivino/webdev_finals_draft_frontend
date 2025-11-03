import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context
import { useAuth, AuthProvider } from "./contexts/AuthContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateEvent from "./pages/CreateEvent";
import AdminDashboard from "./pages/AdminDashboard";
import Events from "./pages/Events";
import Feedback from "./pages/Feedback";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

// Components
import Navbar from "./components/Navbar";

// ✅ Dynamic API Base Configuration
let API_BASE = import.meta.env?.VITE_API_URL;

if (!API_BASE) {
  if (import.meta.env.DEV) {
    API_BASE = "http://localhost:5000";
  } else {
    API_BASE = window.location.origin;
  }
}

export const API_BASE_URL = API_BASE;
console.log("🌐 API_BASE =", API_BASE);

const GlobalStyles = () => (
  <style>
    {`
      body {
        font-family: 'Inter', sans-serif;
      }
      .Toastify__toast-container {
        top: 3em;
        right: 1em;
      }
      .Toastify__toast {
        border-radius: 0.75rem;
        font-weight: 600;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1),
                    0 4px 6px -2px rgba(0,0,0,0.05);
      }
      .Toastify__toast--success { background-color: #10B981; color: white; }
      .Toastify__toast--error   { background-color: #EF4444; color: white; }
    `}
  </style>
);

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== "Admin") return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <GlobalStyles />
      <div className="min-h-screen bg-gradient-to-red from-orange-900 via-orange-700 to-orange-500">
        <ToastContainer position="top-center" />
        <Navbar />

        <main className="pt-6 pb-12">
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/feedback" element={<Feedback />} />

            {/* User Protected */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/events"
              element={
                <PrivateRoute>
                  <Events />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-event"
              element={
                <PrivateRoute>
                  <CreateEvent />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Admin Protected */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Default & 404 */}
            <Route path="/" element={<Navigate to="/events" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;
