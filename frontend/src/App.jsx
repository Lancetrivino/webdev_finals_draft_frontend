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
import EventDetails from "./pages/EventDetails";

// Components
import Navbar from "./components/Navbar";

// API base url (unchanged)
let API_BASE = import.meta.env?.VITE_API_URL;
if (!API_BASE) {
  if (import.meta.env.DEV) {
    API_BASE = "http://localhost:5000";
  } else {
    API_BASE = "https://your-backend-name.onrender.com";
  }
}
export const API_BASE_URL = API_BASE;
console.log("🌐 API_BASE =", API_BASE);

// Global styles (unchanged)
const GlobalStyles = () => (
  <style>{`
    body { font-family: 'Inter', sans-serif; }
    .Toastify__toast-container { top: 3em; right: 1em; }
    .Toastify__toast {
      border-radius: 0.75rem;
      font-weight: 600;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1),
                  0 4px 6px -2px rgba(0,0,0,0.05);
    }
    .Toastify__toast--success { background-color: #10B981; color: white; }
    .Toastify__toast--error   { background-color: #EF4444; color: white; }
  `}</style>
);

// Route guards (unchanged)
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

const AppContent = () => {
  return (
    <>
      <GlobalStyles />
      <ToastContainer position="top-center" />
      {/* Always mount Navbar; it will hide itself on /login and /register */}
      <Navbar />

      {/* Soft app background */}
      <div className="min-h-screen bg-slate-50">
        {/* Add small top padding so content doesn't hug the floating nav */}
        <main className="pt-4 pb-12">
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />

            {/* Dynamic */}
            <Route
              path="/events/:id"
              element={
                <PrivateRoute>
                  <EventDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/feedback/:eventId"
              element={
                <PrivateRoute>
                  <Feedback />
                </PrivateRoute>
              }
            />

            {/* Protected */}
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

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Default */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
