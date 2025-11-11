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
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
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

// Route guards
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

// App content
const AppContent = () => (
  <>
    <GlobalStyles />
    <ToastContainer position="top-center" />
    <Navbar />

    <div className="min-h-screen bg-slate-50">
      <main className="pt-4 pb-12">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
          <Route path="/create-event" element={<PrivateRoute><CreateEvent /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/events/:id" element={<PrivateRoute><EventDetails /></PrivateRoute>} />
          <Route path="/feedback" element={<PrivateRoute><FeedbackList /></PrivateRoute>} />
          <Route path="/feedback/:eventId" element={<PrivateRoute><Feedback /></PrivateRoute>} />
          <Route path="/available-events" element={<PrivateRoute><AvailableEvents /></PrivateRoute>} />
          <Route path="/book/:placeId" element={<PrivateRoute><BookEvent /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  </>
);

// Main app
const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
