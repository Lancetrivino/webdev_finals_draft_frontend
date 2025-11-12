import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://webdevfinals.onrender.com";

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
  const [tab, setTab] = useState("events");

  // Redirect non-admins
  useEffect(() => {
    if (!currentUser) {
      toast.error("Please log in first.");
      navigate("/login", { replace: true });
    } else if (currentUser.role !== "Admin") {
      toast.error("Access denied. Admins only.");
      navigate("/", { replace: true });
    }
  }, [currentUser, navigate]);

  const getToken = () => currentUser?.token || "";

  // Fetch events and users
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/events`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (err) {
      toast.error(err.message || "Error fetching events");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast.error(err.message || "Error fetching users");
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchUsers()]).finally(() => setLoading(false));
  }, [currentUser]);

  // Event actions
  const handleApproveEvent = async (id) => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to approve event");
      setEvents((prev) => prev.map(e => e._id === id ? { ...e, status: "approved" } : e));
      toast.success("✅ Event approved!");
    } catch (err) {
      toast.error(err.message || "Error approving event");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteTarget) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/events/${deleteTarget}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to delete event");
      setEvents((prev) => prev.filter(e => e._id !== deleteTarget));
      toast.success("🗑️ Event deleted!");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || "Error deleting event");
      setDeleteTarget(null);
    } finally {
      setProcessing(false);
    }
  };

  // User actions
  const handleRoleChange = async (userId, newRole) => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      setUsers((prev) => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success("✅ User role updated!");
    } catch (err) {
      toast.error(err.message || "Error updating role");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeactivateUser = async () => {
    if (!deactivateTarget) return;
    setProcessing(true);
    try {
      const { userId, active } = deactivateTarget;
      const res = await fetch(`${API_BASE}/api/users/${userId}/active`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setUsers((prev) => prev.map(u => u._id === userId ? { ...u, active } : u));
      toast.success(active ? "✅ User activated" : "⚠️ User deactivated");
      setDeactivateTarget(null);
    } catch (err) {
      toast.error(err.message || "Error updating status");
      setDeactivateTarget(null);
    } finally {
      setProcessing(false);
    }
  };

  const filteredEvents = useMemo(() => events.filter(e => e.title.toLowerCase().includes(search.toLowerCase())), [events, search]);
  const filteredUsers = useMemo(() => users.filter(u => u.name.toLowerCase().includes(search.toLowerCase())), [users, search]);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header & Tabs */}
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => setTab("events")} className={`px-4 py-2 rounded-xl font-semibold ${tab === "events" ? "bg-orange-600 text-white" : "bg-white text-gray-700 shadow"}`}>Events</button>
            <button onClick={() => setTab("users")} className={`px-4 py-2 rounded-xl font-semibold ${tab === "users" ? "bg-orange-600 text-white" : "bg-white text-gray-700 shadow"}`}>Users</button>
            <input type="text" placeholder={`Search ${tab}...`} value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>

        {/* Event Status Chart */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-gray-700 font-semibold mb-2 text-center">Event Status Overview</h2>
          <div className="w-full h-6 flex rounded-xl overflow-hidden border">
            <div className="bg-orange-500 h-full" style={{ width: `${(events.filter(e => e.status === "pending").length / (events.length || 1)) * 100}%` }} />
            <div className="bg-green-500 h-full" style={{ width: `${(events.filter(e => e.status === "approved").length / (events.length || 1)) * 100}%` }} />
          </div>
        </div>

        {/* Events Table */}
        {tab === "events" && (
          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Events</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b p-2">Title</th>
                  <th className="border-b p-2">Date</th>
                  <th className="border-b p-2">Status</th>
                  <th className="border-b p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(event => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="p-2">{event.title}</td>
                    <td className="p-2">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="p-2">{event.status}</td>
                    <td className="p-2 flex gap-2">
                      {event.status === "pending" && (
                        <button disabled={processing} onClick={() => handleApproveEvent(event._id)} className="bg-green-500 text-white px-2 py-1 rounded">Approve</button>
                      )}
                      <button disabled={processing} onClick={() => setDeleteTarget(event._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users Table */}
        {tab === "users" && (
          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b p-2">Name</th>
                  <th className="border-b p-2">Email</th>
                  <th className="border-b p-2">Role</th>
                  <th className="border-b p-2">Active</th>
                  <th className="border-b p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.role}</td>
                    <td className="p-2">{user.active ? "Yes" : "No"}</td>
                    <td className="p-2 flex gap-2">
                      <button disabled={processing} onClick={() => handleRoleChange(user._id, user.role === "User" ? "Admin" : "User")} className="bg-blue-500 text-white px-2 py-1 rounded">Toggle Role</button>
                      <button disabled={processing} onClick={() => setDeactivateTarget({ userId: user._id, active: !user.active })} className={`px-2 py-1 rounded ${user.active ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
                        {user.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Delete Event Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
              <button onClick={handleDeleteEvent} className="px-4 py-2 rounded bg-red-500 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate User Modal */}
      {deactivateTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">{deactivateTarget.active ? "Activate User" : "Deactivate User"}</h3>
            <p className="mb-6">Are you sure you want to {deactivateTarget.active ? "activate" : "deactivate"} this user?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setDeactivateTarget(null)} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
              <button onClick={handleDeactivateUser} className="px-4 py-2 rounded bg-red-500 text-white">
                {deactivateTarget.active ? "Activate" : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
