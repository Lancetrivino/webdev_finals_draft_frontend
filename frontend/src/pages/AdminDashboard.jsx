import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

  // Redirect non-admins
  useEffect(() => {
    if (!currentUser) {
      toast.error("Please log in first.");
      navigate("/login");
    } else if (currentUser.role !== "Admin") {
      toast.error("Access denied. Admins only.");
      navigate("/");
    }
  }, [currentUser, navigate]);

  // Fetch events
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token") || "";
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

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token") || "";
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

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchUsers()]).finally(() => setLoading(false));
  }, []);

  // Event actions
  const handleApproveEvent = async (id) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_BASE}/api/events/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_BASE}/api/events/${deleteTarget}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
  const handleRoleChange = async () => {
    if (!roleTarget) return;
    setProcessing(true);
    try {
      const { userId, newRole } = roleTarget;
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_BASE}/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) throw new Error("Failed to update role");
      setUsers((prev) => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success("✅ User role updated!");
      setRoleTarget(null);
    } catch (err) {
      toast.error(err.message || "Error updating role");
      setRoleTarget(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeactivateUser = async () => {
    if (!deactivateTarget) return;
    setProcessing(true);
    try {
      const { userId, active } = deactivateTarget;
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_BASE}/api/users/${userId}/active`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active })
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

  // Filtered
  const filteredEvents = useMemo(() => events.filter(e => e.title.toLowerCase().includes(search.toLowerCase())), [events, search]);
  const filteredUsers = useMemo(() => users.filter(u => u.name.toLowerCase().includes(search.toLowerCase())), [users, search]);

  // Chart
  const chartData = useMemo(() => {
    const approved = events.filter(e => e.status === "approved").length;
    const pending = events.filter(e => e.status === "pending").length;
    return {
      labels: ["Pending", "Approved"],
      datasets: [{
        label: "Events",
        data: [pending, approved],
        backgroundColor: ["#F97316", "#10B981"]
      }]
    };
  }, [events]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header & Tab */}
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => setTab("events")} className={`px-4 py-2 rounded-xl font-semibold ${tab === "events" ? "bg-orange-600 text-white" : "bg-white text-gray-700 shadow"}`}>Events</button>
            <button onClick={() => setTab("users")} className={`px-4 py-2 rounded-xl font-semibold ${tab === "users" ? "bg-orange-600 text-white" : "bg-white text-gray-700 shadow"}`}>Users</button>
            <input type="text" placeholder={`Search ${tab}...`} value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center">
            <h2 className="text-gray-500">Pending Events</h2>
            <p className="text-2xl font-bold text-orange-600">{events.filter(e => e.status === "pending").length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center">
            <h2 className="text-gray-500">Approved Events</h2>
            <p className="text-2xl font-bold text-green-600">{events.filter(e => e.status === "approved").length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center">
            <h2 className="text-gray-500">Total Users</h2>
            <p className="text-2xl font-bold text-gray-800">{users.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center">
            <h2 className="text-gray-500">Active Users</h2>
            <p className="text-2xl font-bold text-green-600">{users.filter(u => u.active).length}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-gray-700 font-semibold mb-4 text-center">Event Status Overview</h2>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
        </div>

        {/* Tab Content */}
        {tab === "events" && (
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full table-auto text-left">
              <thead className="bg-orange-600 text-white">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Venue</th>
                  <th className="p-4">Created By</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center p-6 text-gray-500">Loading events...</td></tr>
                ) : filteredEvents.length === 0 ? (
                  <tr><td colSpan="6" className="text-center p-6 text-gray-500">No events found.</td></tr>
                ) : filteredEvents.map(event => (
                  <tr key={event._id} className={`hover:bg-gray-50 ${event.status === "pending" ? "bg-orange-50" : ""}`}>
                    <td className="p-4 border-b">{event.title}</td>
                    <td className="p-4 border-b">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="p-4 border-b">{event.venue}</td>
                    <td className="p-4 border-b">{event.createdBy?.name || "Unknown"}</td>
                    <td className="p-4 border-b capitalize">{event.status}</td>
                    <td className="p-4 border-b flex flex-wrap gap-2">
                      {event.status === "pending" && (
                        <button disabled={processing} onClick={() => handleApproveEvent(event._id)} className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition disabled:opacity-50">Approve</button>
                      )}
                      <button disabled={processing} onClick={() => setDeleteTarget(event._id)} className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition disabled:opacity-50">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "users" && (
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full table-auto text-left">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center p-6 text-gray-500">Loading users...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="5" className="text-center p-6 text-gray-500">No users found.</td></tr>
                ) : filteredUsers.map(user => (
                  <tr key={user._id} className={`hover:bg-gray-50 ${!user.active ? "bg-gray-100" : ""}`}>
                    <td className="p-4 border-b">{user.name}</td>
                    <td className="p-4 border-b">{user.email}</td>
                    <td className="p-4 border-b capitalize">{user.role}</td>
                    <td className="p-4 border-b">{user.active ? "Active" : "Deactivated"}</td>
                    <td className="p-4 border-b flex flex-wrap gap-2">
                      {user.role !== "Admin" && (
                        <>
                          <select disabled={processing} value={user.role} onChange={(e) => setRoleTarget({ userId: user._id, newRole: e.target.value })} className="border px-2 py-1 rounded-lg">
                            <option value="Student">Student</option>
                            <option value="Teacher">Teacher</option>
                          </select>
                          <button disabled={processing} onClick={() => setDeactivateTarget({ userId: user._id, active: !user.active })} className={`px-3 py-1 rounded-lg text-white transition ${user.active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}>{user.active ? "Deactivate" : "Activate"}</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button onClick={handleDeleteEvent} disabled={processing} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50">Yes, Delete</button>
              <button onClick={() => setDeleteTarget(null)} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Confirmation Modal */}
      {roleTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Role Change</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to change this user&apos;s role to <strong>{roleTarget.newRole}</strong>?</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button onClick={handleRoleChange} disabled={processing} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50">Yes, Change</button>
              <button onClick={() => setRoleTarget(null)} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {deactivateTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{deactivateTarget.active ? "Activate User" : "Deactivate User"}</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to {deactivateTarget.active ? "activate" : "deactivate"} this user?</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button onClick={handleDeactivateUser} disabled={processing} className={`px-4 py-2 rounded-lg text-white ${deactivateTarget.active ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} transition disabled:opacity-50`}>Yes</button>
              <button onClick={() => setDeactivateTarget(null)} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
