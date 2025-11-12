import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("events"); // "events" or "users"

  // 🔒 Redirect non-admins
  useEffect(() => {
    if (!currentUser) {
      toast.error("Please log in first.");
      navigate("/login");
    } else if (currentUser.role !== "Admin") {
      toast.error("Access denied. Admins only.");
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  // ✅ Fetch token from localStorage (used for all API calls)
  const getToken = () => localStorage.getItem("token") || "";

  // 📦 Fetch events
  const fetchEvents = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (err) {
      toast.error(err.message || "Error fetching events");
    }
  };

  // 👥 Fetch users
  const fetchUsers = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast.error(err.message || "Error fetching users");
    }
  };

  // 🔁 Load data on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchUsers()]).finally(() => setLoading(false));
  }, []);

  // ✅ Approve Event
  const handleApproveEvent = async (id) => {
    setProcessing(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/events/${id}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to approve event");
      setEvents((prev) =>
        prev.map((e) => (e._id === id ? { ...e, status: "approved" } : e))
      );
      toast.success("✅ Event approved!");
    } catch (err) {
      toast.error(err.message || "Error approving event");
    } finally {
      setProcessing(false);
    }
  };

  // 🗑️ Delete Event
  const handleDeleteEvent = async () => {
    if (!deleteTarget) return;
    setProcessing(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/events/${deleteTarget}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete event");
      setEvents((prev) => prev.filter((e) => e._id !== deleteTarget));
      toast.success("🗑️ Event deleted!");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || "Error deleting event");
      setDeleteTarget(null);
    } finally {
      setProcessing(false);
    }
  };

  // 🧩 Update User Role
  const handleRoleChange = async () => {
    if (!roleTarget) return;
    setProcessing(true);
    try {
      const { userId, newRole } = roleTarget;
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      toast.success("✅ User role updated!");
      setRoleTarget(null);
    } catch (err) {
      toast.error(err.message || "Error updating role");
      setRoleTarget(null);
    } finally {
      setProcessing(false);
    }
  };

  // 🚫 Deactivate or Activate User
  const handleDeactivateUser = async () => {
    if (!deactivateTarget) return;
    setProcessing(true);
    try {
      const { userId, active } = deactivateTarget;
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/users/${userId}/active`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, active } : u))
      );
      toast.success(active ? "✅ User activated" : "⚠️ User deactivated");
      setDeactivateTarget(null);
    } catch (err) {
      toast.error(err.message || "Error updating status");
      setDeactivateTarget(null);
    } finally {
      setProcessing(false);
    }
  };

  // 🔍 Filtering
  const filteredEvents = useMemo(
    () => events.filter((e) => e.title.toLowerCase().includes(search.toLowerCase())),
    [events, search]
  );
  const filteredUsers = useMemo(
    () => users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase())),
    [users, search]
  );

  // 📊 Simple Event Status Chart
  const approved = events.filter((e) => e.status === "approved").length;
  const pending = events.filter((e) => e.status === "pending").length;
  const total = approved + pending || 1;
  const pendingWidth = `${(pending / total) * 100}%`;
  const approvedWidth = `${(approved / total) * 100}%`;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header & Tabs */}
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTab("events")}
              className={`px-4 py-2 rounded-xl font-semibold ${
                tab === "events"
                  ? "bg-orange-600 text-white"
                  : "bg-white text-gray-700 shadow"
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setTab("users")}
              className={`px-4 py-2 rounded-xl font-semibold ${
                tab === "users"
                  ? "bg-orange-600 text-white"
                  : "bg-white text-gray-700 shadow"
              }`}
            >
              Users
            </button>
            <input
              type="text"
              placeholder={`Search ${tab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>

        {/* Event Chart */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-gray-700 font-semibold mb-2 text-center">
            Event Status Overview
          </h2>
          <div className="w-full h-6 flex rounded-xl overflow-hidden border">
            <div className="bg-orange-500 h-full" style={{ width: pendingWidth }} />
            <div className="bg-green-500 h-full" style={{ width: approvedWidth }} />
          </div>
          <div className="flex justify-between text-gray-600 mt-2">
            <span>Pending: {pending}</span>
            <span>Approved: {approved}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
