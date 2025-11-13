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
  const [eventView, setEventView] = useState("all"); // "all" or "my"

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

  // Event actions
  const handleApproveEvent = async (id) => {
    console.log("Approving event:", id);
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
    console.log("Rejecting event:", rejectTarget);
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
    console.log("Deleting event:", deleteTarget);
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

  // User actions
  const handleRoleChange = async (userId, newRole) => {
    console.log("Changing role for user:", userId, "to", newRole);
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
    console.log("Updating user status:", deactivateTarget);
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

  // Filter events based on search and view
  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    // Filter by ownership if viewing "my events"
    if (eventView === "my") {
      filtered = filtered.filter(e => e.createdBy === currentUser?._id || e.userId === currentUser?._id);
    }
    
    // Filter by search term
    filtered = filtered.filter(e => 
      e.title.toLowerCase().includes(search.toLowerCase())
    );
    
    return filtered;
  }, [events, search, eventView, currentUser]);
  
  const filteredUsers = useMemo(() => 
    users.filter(u => u.name.toLowerCase().includes(search.toLowerCase())), 
    [users, search]
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header & Tabs */}
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setTab("events")} 
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                tab === "events" 
                  ? "bg-orange-600 text-white shadow-lg" 
                  : "bg-white text-gray-700 shadow hover:bg-gray-50"
              }`}
            >
              Events
            </button>
            <button 
              onClick={() => setTab("users")} 
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                tab === "users" 
                  ? "bg-orange-600 text-white shadow-lg" 
                  : "bg-white text-gray-700 shadow hover:bg-gray-50"
              }`}
            >
              Users
            </button>
            <input 
              type="text" 
              placeholder={`Search ${tab}...`} 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400" 
            />
          </div>
        </div>

        {/* Event View Toggle (only show on events tab) */}
        {tab === "events" && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setEventView("all")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                eventView === "all"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 shadow hover:bg-gray-50"
              }`}
            >
              All Events ({events.length})
            </button>
            <button
              onClick={() => setEventView("my")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                eventView === "my"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 shadow hover:bg-gray-50"
              }`}
            >
              My Events ({events.filter(e => e.createdBy === currentUser?._id || e.userId === currentUser?._id).length})
            </button>
          </div>
        )}

        {/* Event Status Chart */}
        {tab === "events" && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-gray-700 font-semibold mb-4 text-center">
              {eventView === "all" ? "All Events Status Overview" : "My Events Status Overview"}
            </h2>
            <div className="w-full h-8 flex rounded-xl overflow-hidden border">
              <div 
                className="bg-orange-500 h-full flex items-center justify-center text-white text-xs font-semibold" 
                style={{ 
                  width: `${(filteredEvents.filter(e => (e.status || '').toLowerCase() === "pending").length / (filteredEvents.length || 1)) * 100}%`,
                  minWidth: filteredEvents.filter(e => (e.status || '').toLowerCase() === "pending").length > 0 ? '40px' : '0'
                }} 
              >
                {filteredEvents.filter(e => (e.status || '').toLowerCase() === "pending").length > 0 && 
                  `${filteredEvents.filter(e => (e.status || '').toLowerCase() === "pending").length}`
                }
              </div>
              <div 
                className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-semibold" 
                style={{ 
                  width: `${(filteredEvents.filter(e => (e.status || '').toLowerCase() === "approved").length / (filteredEvents.length || 1)) * 100}%`,
                  minWidth: filteredEvents.filter(e => (e.status || '').toLowerCase() === "approved").length > 0 ? '40px' : '0'
                }} 
              >
                {filteredEvents.filter(e => (e.status || '').toLowerCase() === "approved").length > 0 && 
                  `${filteredEvents.filter(e => (e.status || '').toLowerCase() === "approved").length}`
                }
              </div>
              <div 
                className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-semibold" 
                style={{ 
                  width: `${(filteredEvents.filter(e => (e.status || '').toLowerCase() === "rejected").length / (filteredEvents.length || 1)) * 100}%`,
                  minWidth: filteredEvents.filter(e => (e.status || '').toLowerCase() === "rejected").length > 0 ? '40px' : '0'
                }} 
              >
                {filteredEvents.filter(e => (e.status || '').toLowerCase() === "rejected").length > 0 && 
                  `${filteredEvents.filter(e => (e.status || '').toLowerCase() === "rejected").length}`
                }
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>Pending ({filteredEvents.filter(e => (e.status || '').toLowerCase() === "pending").length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Approved ({filteredEvents.filter(e => (e.status || '').toLowerCase() === "approved").length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Rejected ({filteredEvents.filter(e => (e.status || '').toLowerCase() === "rejected").length})</span>
              </div>
            </div>
          </div>
        )}

        {/* Events Table */}
        {tab === "events" && (
          <div className="bg-white shadow rounded-2xl p-6 overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">
              {eventView === "all" ? "All Events Management" : "My Events"}
            </h2>
            {filteredEvents.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {eventView === "my" ? "You haven't created any events yet" : "No events found"}
              </p>
            ) : (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b p-3 font-semibold text-gray-700">Title</th>
                    <th className="border-b p-3 font-semibold text-gray-700">Date</th>
                    <th className="border-b p-3 font-semibold text-gray-700">Location</th>
                    <th className="border-b p-3 font-semibold text-gray-700">Status</th>
                    <th className="border-b p-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map(event => {
                    // Normalize status to lowercase for comparison
                    const eventStatus = (event.status || '').toLowerCase().trim();
                    
                    return (
                      <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 border-b">{event.title}</td>
                        <td className="p-3 border-b">{new Date(event.date).toLocaleDateString()}</td>
                        <td className="p-3 border-b">{event.location || "N/A"}</td>
                        <td className="p-3 border-b">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            eventStatus === "approved" 
                              ? "bg-green-100 text-green-700" 
                              : eventStatus === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="p-3 border-b">
                          <div className="flex gap-2 flex-wrap">
                            {/* Show approve/reject for pending events (only in "All Events" view) */}
                            {eventView === "all" && eventStatus === "pending" && (
                              <>
                                <button 
                                  disabled={processing} 
                                  onClick={() => {
                                    console.log('Approving event:', event._id);
                                    handleApproveEvent(event._id);
                                  }} 
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  Approve
                                </button>
                                <button 
                                  disabled={processing} 
                                  onClick={() => {
                                    console.log('Setting reject target:', event._id);
                                    setRejectTarget(event._id);
                                  }} 
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            
                            {/* Always show delete button */}
                            <button 
                              disabled={processing} 
                              onClick={() => setDeleteTarget(event._id)} 
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Users Table */}
        {tab === "users" && (
          <div className="bg-white shadow rounded-2xl p-6 overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">Users Management</h2>
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No users found</p>
            ) : (
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b p-3 font-semibold text-gray-700">Name</th>
                    <th className="border-b p-3 font-semibold text-gray-700">Email</th>
                    <th className="border-b p-3 font-semibold text-gray-700">Role</th>
                    <th className="border-b p-3 font-semibold text-gray-700">Active</th>
                    <th className="border-b p-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 border-b">{user.name}</td>
                      <td className="p-3 border-b">{user.email}</td>
                      <td className="p-3 border-b">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === "Admin" 
                            ? "bg-purple-100 text-purple-700" 
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3 border-b">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.active 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {user.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3 border-b">
                        <div className="flex gap-2 flex-wrap">
                          <button 
                            disabled={processing || user._id === currentUser?._id} 
                            onClick={() => handleRoleChange(user._id, user.role === "User" ? "Admin" : "User")} 
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title={user._id === currentUser?._id ? "Cannot change your own role" : "Toggle role between User and Admin"}
                          >
                            {user.role === "User" ? "Make Admin" : "Make User"}
                          </button>
                          <button 
                            disabled={processing || user._id === currentUser?._id} 
                            onClick={() => setDeactivateTarget({ userId: user._id, active: !user.active })} 
                            className={`px-3 py-1 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                              user.active 
                                ? "bg-red-500 hover:bg-red-600 text-white" 
                                : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                            title={user._id === currentUser?._id ? "Cannot deactivate your own account" : user.active ? "Deactivate user" : "Activate user"}
                          >
                            {user.active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>

      {/* Delete Event Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Delete</h3>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setDeleteTarget(null)} 
                disabled={processing}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteEvent} 
                disabled={processing}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50"
              >
                {processing ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Event Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Reject</h3>
            <p className="mb-6 text-gray-600">Are you sure you want to reject this event? The event will be marked as rejected.</p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setRejectTarget(null)} 
                disabled={processing}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleRejectEvent} 
                disabled={processing}
                className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-colors disabled:opacity-50"
              >
                {processing ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate User Modal */}
      {deactivateTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
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
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeactivateUser} 
                disabled={processing}
                className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
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