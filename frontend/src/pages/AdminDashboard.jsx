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
  const [rejectTarget, setRejectTarget] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("events");
  const [eventView, setEventView] = useState("all");

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

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/events`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (err) {
      console.error("Error fetching events:", err);
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
      console.error("Error fetching users:", err);
      toast.error(err.message || "Error fetching users");
    }
  };

  useEffect(() => {
    if (currentUser?.role === "Admin") {
      setLoading(true);
      Promise.all([fetchEvents(), fetchUsers()]).finally(() => setLoading(false));
    }
  }, [currentUser]);

  const handleApproveEvent = async (id) => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}/approve`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${getToken()}` 
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to approve event");
      }
      
      setEvents((prev) => prev.map(e => e._id === id ? { ...e, status: "approved" } : e));
      toast.success("✅ Event approved!");
    } catch (err) {
      console.error("Error approving event:", err);
      toast.error(err.message || "Error approving event");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectEvent = async () => {
    if (!rejectTarget) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/events/${rejectTarget}/reject`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${getToken()}` 
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to reject event");
      }
      
      setEvents((prev) => prev.map(e => e._id === rejectTarget ? { ...e, status: "rejected" } : e));
      toast.success("❌ Event rejected!");
      setRejectTarget(null);
    } catch (err) {
      console.error("Error rejecting event:", err);
      toast.error(err.message || "Error rejecting event");
      setRejectTarget(null);
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
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete event");
      }
      
      setEvents((prev) => prev.filter(e => e._id !== deleteTarget));
      toast.success("🗑️ Event deleted!");
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error(err.message || "Error deleting event");
      setDeleteTarget(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/role`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update role");
      }
      
      setUsers((prev) => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success("✅ User role updated!");
    } catch (err) {
      console.error("Error updating role:", err);
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
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ active }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update status");
      }
      
      setUsers((prev) => prev.map(u => u._id === userId ? { ...u, active } : u));
      toast.success(active ? "✅ User activated" : "⚠️ User deactivated");
      setDeactivateTarget(null);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err.message || "Error updating status");
      setDeactivateTarget(null);
    } finally {
      setProcessing(false);
    }
  };

  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    if (eventView === "my") {
      filtered = filtered.filter(e => e.createdBy === currentUser?._id || e.userId === currentUser?._id);
    }
    
    filtered = filtered.filter(e => 
      e.title.toLowerCase().includes(search.toLowerCase())
    );
    
    return filtered;
  }, [events, search, eventView, currentUser]);
  
  const filteredUsers = useMemo(() => 
    users.filter(u => u.name.toLowerCase().includes(search.toLowerCase())), 
    [users, search]
  );

  const stats = useMemo(() => {
    const pending = events.filter(e => e.status?.toLowerCase() === "pending").length;
    const approved = events.filter(e => e.status?.toLowerCase() === "approved").length;
    const rejected = events.filter(e => e.status?.toLowerCase() === "rejected").length;
    const activeUsers = users.filter(u => u.active).length;
    
    return { pending, approved, rejected, totalEvents: events.length, activeUsers, totalUsers: users.length };
  }, [events, users]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto pt-28">

        {/* Header */}
        <div className="mb-8 bg-white rounded-3xl shadow-2xl p-8 border-2 border-violet-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage events and users</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setTab("events")} 
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 ${
                  tab === "events" 
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg" 
                    : "bg-white text-gray-700 shadow border-2 border-violet-200 hover:border-violet-400"
                }`}
              >
                📅 Events
              </button>
              <button 
                onClick={() => setTab("users")} 
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 ${
                  tab === "users" 
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg" 
                    : "bg-white text-gray-700 shadow border-2 border-violet-200 hover:border-violet-400"
                }`}
              >
                👥 Users
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-200">
            <div className="text-4xl font-black text-orange-600 mb-2">{stats.pending}</div>
            <div className="text-sm font-semibold text-gray-600">Pending Events</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200">
            <div className="text-4xl font-black text-green-600 mb-2">{stats.approved}</div>
            <div className="text-sm font-semibold text-gray-600">Approved Events</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-200">
            <div className="text-4xl font-black text-red-600 mb-2">{stats.rejected}</div>
            <div className="text-sm font-semibold text-gray-600">Rejected Events</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-violet-200">
            <div className="text-4xl font-black text-violet-600 mb-2">{stats.activeUsers}</div>
            <div className="text-sm font-semibold text-gray-600">Active Users</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 bg-white rounded-2xl p-4 shadow-lg border-2 border-violet-200">
          <div className="relative">
            <input 
              type="text" 
              placeholder={`Search ${tab}...`} 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-200 outline-none transition-all"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Event View Toggle */}
        {tab === "events" && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setEventView("all")}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                eventView === "all"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-white text-gray-700 shadow border-2 border-violet-200 hover:border-violet-400"
              }`}
            >
              All Events ({events.length})
            </button>
            <button
              onClick={() => setEventView("my")}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                eventView === "my"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-white text-gray-700 shadow border-2 border-violet-200 hover:border-violet-400"
              }`}
            >
              My Events ({events.filter(e => e.createdBy === currentUser?._id || e.userId === currentUser?._id).length})
            </button>
          </div>
        )}

        {/* Status Chart */}
        {tab === "events" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-violet-200">
            <h2 className="text-gray-800 font-bold mb-4 text-lg">
              {eventView === "all" ? "All Events Status" : "My Events Status"}
            </h2>
            <div className="w-full h-10 flex rounded-xl overflow-hidden border-2 border-violet-200 shadow-md">
              <div 
                className="bg-orange-500 h-full flex items-center justify-center text-white text-sm font-bold transition-all" 
                style={{ 
                  width: `${(filteredEvents.filter(e => e.status?.toLowerCase() === "pending").length / (filteredEvents.length || 1)) * 100}%`,
                  minWidth: filteredEvents.filter(e => e.status?.toLowerCase() === "pending").length > 0 ? '50px' : '0'
                }} 
              >
                {filteredEvents.filter(e => e.status?.toLowerCase() === "pending").length || ''}
              </div>
              <div 
                className="bg-green-500 h-full flex items-center justify-center text-white text-sm font-bold transition-all" 
                style={{ 
                  width: `${(filteredEvents.filter(e => e.status?.toLowerCase() === "approved").length / (filteredEvents.length || 1)) * 100}%`,
                  minWidth: filteredEvents.filter(e => e.status?.toLowerCase() === "approved").length > 0 ? '50px' : '0'
                }} 
              >
                {filteredEvents.filter(e => e.status?.toLowerCase() === "approved").length || ''}
              </div>
              <div 
                className="bg-red-500 h-full flex items-center justify-center text-white text-sm font-bold transition-all" 
                style={{ 
                  width: `${(filteredEvents.filter(e => e.status?.toLowerCase() === "rejected").length / (filteredEvents.length || 1)) * 100}%`,
                  minWidth: filteredEvents.filter(e => e.status?.toLowerCase() === "rejected").length > 0 ? '50px' : '0'
                }} 
              >
                {filteredEvents.filter(e => e.status?.toLowerCase() === "rejected").length || ''}
              </div>
            </div>
            <div className="flex justify-center gap-8 mt-4 text-sm font-semibold">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>Pending ({filteredEvents.filter(e => e.status?.toLowerCase() === "pending").length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Approved ({filteredEvents.filter(e => e.status?.toLowerCase() === "approved").length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Rejected ({filteredEvents.filter(e => e.status?.toLowerCase() === "rejected").length})</span>
              </div>
            </div>
          </div>
        )}

        {/* Events Table */}
        {tab === "events" && (
          <div className="bg-white shadow-lg rounded-2xl p-6 overflow-x-auto border-2 border-violet-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {eventView === "all" ? "All Events Management" : "My Events"}
            </h2>
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <p className="text-gray-500 text-lg">
                  {eventView === "my" ? "You haven't created any events yet" : "No events found"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-violet-50 border-b-2 border-violet-200">
                      <th className="p-4 font-bold text-gray-800">Title</th>
                      <th className="p-4 font-bold text-gray-800">Date</th>
                      <th className="p-4 font-bold text-gray-800">Location</th>
                      <th className="p-4 font-bold text-gray-800">Status</th>
                      <th className="p-4 font-bold text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map(event => {
                      const eventStatus = (event.status || '').toLowerCase().trim();
                      
                      return (
                        <tr key={event._id} className="hover:bg-violet-50 transition-colors border-b border-violet-100">
                          <td className="p-4 font-medium text-gray-900">{event.title}</td>
                          <td className="p-4 text-gray-700">{new Date(event.date).toLocaleDateString()}</td>
                          <td className="p-4 text-gray-700">{event.location || event.venue || "N/A"}</td>
                          <td className="p-4">
                            <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                              eventStatus === "approved" 
                                ? "bg-green-100 text-green-700 border-2 border-green-300" 
                                : eventStatus === "rejected"
                                ? "bg-red-100 text-red-700 border-2 border-red-300"
                                : "bg-orange-100 text-orange-700 border-2 border-orange-300"
                            }`}>
                              {event.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2 flex-wrap">
                              {eventView === "all" && eventStatus === "pending" && (
                                <>
                                  <button 
                                    disabled={processing} 
                                    onClick={() => handleApproveEvent(event._id)} 
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                                  >
                                    ✓ Approve
                                  </button>
                                  <button 
                                    disabled={processing} 
                                    onClick={() => setRejectTarget(event._id)} 
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                                  >
                                    ✕ Reject
                                  </button>
                                </>
                              )}
                              
                              <button 
                                disabled={processing} 
                                onClick={() => setDeleteTarget(event._id)} 
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                              >
                                🗑 Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Table */}
        {tab === "users" && (
          <div className="bg-white shadow-lg rounded-2xl p-6 overflow-x-auto border-2 border-violet-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Users Management</h2>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-gray-500 text-lg">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-violet-50 border-b-2 border-violet-200">
                      <th className="p-4 font-bold text-gray-800">Name</th>
                      <th className="p-4 font-bold text-gray-800">Email</th>
                      <th className="p-4 font-bold text-gray-800">Role</th>
                      <th className="p-4 font-bold text-gray-800">Status</th>
                      <th className="p-4 font-bold text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user._id} className="hover:bg-violet-50 transition-colors border-b border-violet-100">
                        <td className="p-4 font-medium text-gray-900">{user.name}</td>
                        <td className="p-4 text-gray-700">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                            user.role === "Admin" 
                              ? "bg-purple-100 text-purple-700 border-2 border-purple-300" 
                              : "bg-blue-100 text-blue-700 border-2 border-blue-300"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                            user.active 
                              ? "bg-green-100 text-green-700 border-2 border-green-300" 
                              : "bg-gray-100 text-gray-700 border-2 border-gray-300"
                          }`}>
                            {user.active ? "✓ Active" : "✕ Inactive"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 flex-wrap">
                            <button 
                              disabled={processing || user._id === currentUser?._id} 
                              onClick={() => handleRoleChange(user._id, user.role === "User" ? "Admin" : "User")} 
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                              title={user._id === currentUser?._id ? "Cannot change your own role" : "Toggle role"}
                            >
                              {user.role === "User" ? "↑ Make Admin" : "↓ Make User"}
                            </button>
                            <button 
                              disabled={processing || user._id === currentUser?._id} 
                              onClick={() => setDeactivateTarget({ userId: user._id, active: !user.active })} 
                              className={`px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md ${
                                user.active 
                                  ? "bg-red-500 hover:bg-red-600 text-white" 
                                  : "bg-green-500 hover:bg-green-600 text-white"
                              }`}
                              title={user._id === currentUser?._id ? "Cannot modify your own account" : user.active ? "Deactivate" : "Activate"}
                            >
                              {user.active ? "⊗ Deactivate" : "✓ Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modals */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-violet-200">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Confirm Delete</h3>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setDeleteTarget(null)} 
                disabled={processing}
                className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteEvent} 
                disabled={processing}
                className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors disabled:opacity-50 shadow-lg"
              >
                {processing ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-violet-200">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Confirm Reject</h3>
            <p className="mb-6 text-gray-600">Are you sure you want to reject this event?</p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setRejectTarget(null)} 
                disabled={processing}
                className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleRejectEvent} 
                disabled={processing}
                className="px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-bold transition-colors disabled:opacity-50 shadow-lg"
              >
                {processing ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deactivateTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-violet-200">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              {deactivateTarget.active ? "Activate User" : "Deactivate User"}
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to {deactivateTarget.active ? "activate" : "deactivate"} this user?
              {!deactivateTarget.active && " They will not be able to log in."}
            </p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setDeactivateTarget(null)} 
                disabled={processing}
                className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeactivateUser} 
                disabled={processing}
                className={`px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 shadow-lg ${
                  deactivateTarget.active 
                    ? "bg-green-500 hover:bg-green-600 text-white" 
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {processing ? "Processing..." : (deactivateTarget.active ? "Activate" : "Deactivate")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}