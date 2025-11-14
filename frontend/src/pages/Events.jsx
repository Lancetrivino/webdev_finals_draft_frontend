import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW PALETTE
  const palette = {
    light: "#d9c096",
    tan: "#b59175",
    softBrown: "#886355",
    darkBrown: "#3d302d",
    deep: "#0b0706",
  };

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

  // LOADING STATE
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: palette.light }}
      >
        <p className="text-gray-800 text-lg font-medium">Loading events...</p>
      </div>
    );
  }

  // EMPTY STATE
  if (events.length === 0) {
    const role = JSON.parse(localStorage.getItem("user"))?.role || "User";
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ backgroundColor: palette.light }}
      >
        <h2 className="text-2xl font-semibold" style={{ color: palette.darkBrown }}>
          {role === "Admin"
            ? "No events available."
            : "You haven't created any events yet."}
        </h2>

        <p className="mt-2 text-center max-w-xl" style={{ color: palette.softBrown }}>
          {role === "Admin"
            ? "Create your first event to get started!"
            : "Create an event and it will appear here after admin approval."}
        </p>

        <Link
          to="/create-event"
          className="mt-6 px-6 py-3 text-white rounded-full font-medium shadow transition hover:opacity-90"
          style={{ backgroundColor: palette.darkBrown }}
        >
          Create Event
        </Link>
      </div>
    );
  }

  // BADGE COLORS KEPT AS IS (status)
  const statusColors = {
    Approved: "bg-green-100 text-green-700 border-green-200",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div
      className="min-h-screen py-10 px-6"
      style={{ backgroundColor: palette.light }}
    >
      <div className="max-w-7xl mx-auto">

        {/* TOP HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold" style={{ color: palette.deep }}>
            {JSON.parse(localStorage.getItem("user"))?.role === "Admin"
              ? "All Events"
              : "My Events"}
          </h2>

          <Link
            to="/create-event"
            className="px-6 py-3 text-white rounded-full font-medium transition hover:opacity-90"
            style={{ backgroundColor: palette.softBrown }}
          >
            + Create Event
          </Link>
        </div>

        {/* EVENT CARDS */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const remainingSlots =
              event.capacity - (event.participants?.length || 0);

            return (
              <article
                key={event._id}
                className="relative rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border"
                style={{
                  backgroundColor: "#fff",
                  borderColor: palette.tan,
                }}
              >
                {/* IMAGE */}
                <div className="relative h-48 rounded-t-2xl overflow-hidden">
                  {event.image || event.imageData ? (
                    <img
                      src={event.image || event.imageData}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        background: `linear-gradient(135deg, ${palette.light}, ${palette.softBrown}, ${palette.darkBrown})`,
                        borderTopLeftRadius: "1rem",
                        borderTopRightRadius: "1rem",
                      }}
                    />
                  )}

                  {/* STATUS BADGE */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border
                      ${statusColors[event.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}
                    >
                      {event.status || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: palette.deep }}
                  >
                    {event.title}
                  </h3>

                  {/* RATING */}
                  {event.averageRating > 0 && event.totalReviews > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-yellow-500 text-lg">★</span>
                      <span
                        className="font-semibold"
                        style={{ color: palette.deep }}
                      >
                        {event.averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm" style={{ color: palette.softBrown }}>
                        ({event.totalReviews}{" "}
                        {event.totalReviews === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  )}

                  {/* DETAILS */}
                  <div className="text-sm space-y-1 mb-3" style={{ color: palette.darkBrown }}>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Venue:</strong> {event.venue}
                    </p>
                    <p>
                      <strong>Remaining Slots:</strong> {remainingSlots}
                    </p>
                  </div>

                  <p
                    className="text-sm line-clamp-3 mb-4"
                    style={{ color: palette.softBrown }}
                  >
                    {event.description}
                  </p>

                  {/* ACTION BUTTONS */}
                  <div className="flex justify-between items-center gap-2">
                    <Link
                      to={`/events/${event._id}`}
                      className="px-4 py-2 text-white text-sm font-medium rounded-full transition"
                      style={{ backgroundColor: palette.softBrown }}
                    >
                      View Details
                    </Link>

                    <div className="flex gap-2">
                      <Link
                        to={`/events/edit/${event._id}`}
                        className="px-3 py-2 text-sm rounded-full font-medium text-white transition"
                        style={{ backgroundColor: palette.darkBrown }}
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(event._id)}
                        className="px-3 py-2 text-sm rounded-full font-medium text-white transition"
                        style={{ backgroundColor: "#8e2828" }}
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
