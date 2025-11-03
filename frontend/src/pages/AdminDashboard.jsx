import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext"; // ✅ Auth integration

const API_BASE = import.meta.env.VITE_API_URL; // ✅ deployment-safe dynamic URL

function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ✅ Redirect non-admins or unauthenticated users
  useEffect(() => {
    if (!currentUser) {
      toast.error("Please log in first.");
      navigate("/login");
    } else if (currentUser.role !== "Admin") {
      toast.error("Access denied. Admins only.");
      navigate("/");
    }
  }, [currentUser, navigate]);

  // ✅ Fetch all events and filter pending only
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();

      // show only pending events
      const pending = data.filter((e) => e.status.toLowerCase() === "pending");
      setEvents(pending);
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.message || "Error fetching events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✅ Approve Event
  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "approved" }),
      });

      if (!res.ok) throw new Error("Failed to approve event");
      toast.success("✅ Event approved!");
      fetchEvents();
    } catch (err) {
      toast.error(err.message || "Error approving event");
    }
  };

  // ✅ Delete Event (with custom modal)
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/events/${deleteTarget}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete event");

      toast.success("🗑️ Event deleted successfully!");
      setEvents(events.filter((e) => e._id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || "Error deleting event");
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-red from-orange-900 via-orange-700 to-orange-500 p-6 relative">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Admin Dashboard
        </h1>

        {loading ? (
          <div className="text-center text-gray-600 py-8">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No pending events to review.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-200">
              <thead className="bg-orange-600 text-white">
                <tr>
                  <th className="p-3 border border-gray-200">Title</th>
                  <th className="p-3 border border-gray-200">Date</th>
                  <th className="p-3 border border-gray-200">Venue</th>
                  <th className="p-3 border border-gray-200">Created By</th>
                  <th className="p-3 border border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-100">
                    <td className="p-3 border border-gray-200">{event.title}</td>
                    <td className="p-3 border border-gray-200">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="p-3 border border-gray-200">{event.venue}</td>
                    <td className="p-3 border border-gray-200">
                      {event.createdBy?.name || "Unknown"}
                    </td>
                    <td className="p-3 border border-gray-200 flex gap-2 justify-center">
                      <button
                        onClick={() => handleApprove(event._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setDeleteTarget(event._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
