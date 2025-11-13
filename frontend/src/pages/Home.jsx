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

    const { token } = JSON.parse(storedUser);

    const fetchEvents = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_BASE}/api/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch events");

        setEvents(data);
      } catch (error) {
        toast.error("Failed to load events. Check your connection or permissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [navigate]);

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
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
    } catch {
      toast.error("Failed to delete event.");
    }
  };

  // Status badge colors
  const statusColors = {
    Approved: "bg-green-100 text-green-700 border-green-200",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <p className="text-gray-700 text-lg font-medium">Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    const role = JSON.parse(localStorage.getItem("user"))?.role || "User";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white px-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {role === "Admin" ? "No events available." : "You haven't created any events yet."}
        </h2>
        <p className="text-gray-500 mt-2 text-center max-w-xl">
          {role === "Admin"
            ? "Create your first event to get started!"
            : "Create an event and it will appear here after admin approval."}
        </p>
        <Link
          to="/create-event"
          className="mt-6 px-6 py-3 bg-green-600 text-white rounded-full font-medium shadow-md hover:bg-green-700 transition"
        >
          Create Event
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-gray-800">
            {JSON.parse(localStorage.getItem("user"))?.role === "Admin"
              ? "All Events"
              : "My Events"}
          </h2>
          <Link
            to="/create-event"
            className="px-6 py-3 bg-green-600 text-white rounded-full font-medium shadow hover:bg-green-700 transition"
          >
            + Create Event
          </Link>
        </div>

        {/* Event Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const remainingSlots = event.capacity - (event.participants?.length || 0);

            return (
              <article
                key={event._id}
                className="relative bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-48 rounded-t-2xl overflow-hidden">
                  {event.image || event.imageData ? (
                    <img
                      src={event.image || event.imageData}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-200 via-green-100 to-white" />
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[event.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}
                    >
                      {event.status || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{event.title}</h3>
                  <div className="text-sm text-gray-600 space-y-1 mb-3">
                    <p>📅 <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                    <p>📍 <strong>Venue:</strong> {event.venue}</p>
                    <p>🎟️ <strong>Remaining Slots:</strong> {remainingSlots}</p>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                    {event.description}
                  </p>

                  <div className="flex justify-between items-center gap-2">
                    <Link
                      to={`/events/${event._id}`}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-full transition hover:bg-green-700"
                    >
                      View Details
                    </Link>

                    <div className="flex gap-2">
                      <Link
                        to={`/events/edit/${event._id}`}
                        className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-full hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Three Circles */}
                <div className="absolute left-4 bottom-4 flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="w-3 h-3 rounded-full bg-green-600" />
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
