import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent"; // ✅ ADD THIS IMPORT
import AdminDashboard from "./pages/AdminDashboard";
import Events from "./pages/Events";
import Feedback from "./pages/Feedback";
import FeedbackList from "./pages/FeedbackList";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import EventDetails from "./pages/EventDetails";
import AvailableEvents from "./pages/AvailableEvents";
import BookEvent from "./pages/BookEvent";

// Components
import Navbar from "./components/Navbar";

// API base URL setup
let API_BASE = import.meta.env?.VITE_API_URL;
if (!API_BASE) {
  API_BASE = import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://webdev-finals-draft-backend.onrender.com";
}
export const API_BASE_URL = API_BASE;

// Global styles
const GlobalStyles = () => (
  <style>{`
    body { 
      font-family: 'Inter', sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }
    
    .Toastify__toast-container { top: 3em; right: 1em; }
    .Toastify__toast {
      border-radius: 0.75rem;
      font-weight: 600;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1),
                  0 4px 6px -2px rgba(0,0,0,0.05);
    }
    .Toastify__toast--success { background-color: #10B981; color: white; }
    .Toastify__toast--error   { background-color: #EF4444; color: white; }
    .Toastify__toast--info    { background-color: #3B82F6; color: white; }
  `}</style>
);

// =========================
// Route Guards
// =========================

const PrivateRoute = ({ children }) => {
  const { currentUser, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { currentUser, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  const role = (currentUser.role || "").toString().toLowerCase();
  if (!role.includes("admin")) return <Navigate to="/" replace />;

  return children;
};

// =========================
// App Content
// =========================

const AppContent = () => (
  <>
    <GlobalStyles />
    <ToastContainer position="top-center" />
    <Navbar />

    <div className="min-h-screen">
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
          {/* ✅ ADD EDIT EVENT ROUTE */}
          <Route
            path="/events/edit/:id"
            element={
              <PrivateRoute>
                <EditEvent />
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
          <Route
            path="/events/:id"
            element={
              <PrivateRoute>
                <EventDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <PrivateRoute>
                <FeedbackList />
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
          <Route
            path="/available-events"
            element={
              <PrivateRoute>
                <AvailableEvents />
              </PrivateRoute>
            }
          />
          <Route
            path="/book/:placeId"
            element={
              <PrivateRoute>
                <BookEvent />
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

          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  </>
);

// Main App

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;