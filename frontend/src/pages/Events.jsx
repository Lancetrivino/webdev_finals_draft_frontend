import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      toast.info("Please login to view events");
      navigate("/login");
      return;
    }

    const { token, role, _id: userId } = JSON.parse(storedUser);

    console.log("=== Events.jsx Fetch ===");
    console.log("User Role:", role);
    console.log("User ID:", userId);

    const fetchEvents = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL;

        const res = await fetch(`${API_BASE}/api/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch events");

        console.log("📦 Raw data from backend:", data);
        console.log("📦 Total events received:", data.length);

        // ✅ Backend already filters by user, so just use the data directly
        // Admin gets all events, regular users get only their own events
        setEvents(data);

        console.log("✅ Events set in state:", data.length);
        
        // Debug: Show each event's creator
        data.forEach(event => {
          console.log(`Event: ${event.title}`);
          console.log(`  Creator ID: ${event.createdBy?._id || event.createdBy}`);
          console.log(`  Status: ${event.status}`);
        });

      } catch (error) {
        console.error("❌ Error fetching events:", error);
        toast.error(
          "Failed to load events. Check your connection or permissions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [navigate]);

  // DELETE handler
  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) return toast.info("Please login first.");

      const { token } = storedUser;
      const API_BASE = import.meta.env.VITE_API_URL;

      const res = await fetch(`${API_BASE}/api/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete event");

      toast.success("Event deleted successfully.");
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete event.");
    }
  };

  // LOADING state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg font-medium">Loading events...</p>
      </div>
    );
  }

  // NO EVENTS
  if (events.length === 0) {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role || "User";

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-700">
          {role === "Admin"
            ? "No events available."
            : "You haven't created any events yet."}
        </h2>
        <p className="text-gray-500 mt-2">
          {role === "Admin" 
            ? "Create your first event to get started!" 
            : "Create an event and it will appear here after admin approval."}
        </p>
        <Link
          to="/create-event"
          className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition"
        >
          Create Event
        </Link>
      </div>
    );
  }

  // MAIN DISPLAY
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-emerald-600">
            {JSON.parse(localStorage.getItem("user"))?.role === "Admin"
              ? "All Events"
              : "My Events"}
          </h2>
          <Link
            to="/create-event"
            className="px-6 py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition shadow-md"
          >
            + Create Event
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => {
            const remainingSlots =
              event.capacity - (event.participants?.length || 0);

            // Determine status badge color
            const statusColors = {
              Approved: "bg-green-100 text-green-700 border-green-200",
              Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
              Rejected: "bg-red-100 text-red-700 border-red-200"
            };

            return (
              <article
                key={event._id}
                className="group rounded-2xl bg-white shadow-[0_10px_25px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_35px_-15px_rgba(0,0,0,0.25)] transition-all overflow-hidden"
              >
                {/* Image */}
                <div className="h-40 w-full overflow-hidden relative">
                  {event.image || event.imageData ? (
                    <img
                      src={event.image || event.imageData}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-indigo-400 via-sky-400 to-cyan-400 group-hover:scale-105 transition-transform duration-500" />
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[event.status] || 'bg-gray-100 text-gray-700'}`}>
                      {event.status || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {event.title}
                  </h3>

                  <p className="text-slate-700 mb-1">
                    📅 <strong>Date:</strong>{" "}
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="text-slate-700 mb-1">
                    📍 <strong>Venue:</strong> {event.venue}
                  </p>
                  <p className="text-slate-700 mb-2">
                    🎟️ <strong>Remaining Slots:</strong> {remainingSlots}
                  </p>

                  <p className="text-slate-600 line-clamp-3">
                    {event.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <Link
                      to={`/events/${event._id}`}
                      className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-white font-medium shadow-md hover:shadow-lg active:scale-95 transition"
                    >
                      View Details
                    </Link>

                    {/* Edit/Delete for creators/admins */}
                    <div className="flex gap-2">
                      <Link
                        to={`/events/edit/${event._id}`}
                        className="rounded-full bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="rounded-full bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Events;