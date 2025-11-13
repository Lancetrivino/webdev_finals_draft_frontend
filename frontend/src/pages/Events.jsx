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
        console.error("❌ Error fetching events:", error);
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

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg font-medium">Loading events...</p>
      </div>
    );
  }

  // No events UI
  if (events.length === 0) {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role || "User";

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          {role === "Admin" ? "No events available." : "You haven't created any events yet."}
        </h2>
        <p className="text-gray-500 mt-2 text-center max-w-xl">
          {role === "Admin"
            ? "Create your first event to get started!"
            : "Create an event and it will appear here after admin approval."}
        </p>
        <Link
          to="/create-event"
          className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition shadow-md"
        >
          Create Event
        </Link>
      </div>
    );
  }

  // palette (same as feedback)
  const palette = {
    deep: "#08324A",
    navy: "#0B63A3",
    blue: "#0F85D0",
    soft: "#BFE7FF",
    pale: "#DFF3FB",
    accent: "#8B5CF6", // purple accent used for subtle glow
  };

  // map status to badge styles
  const statusColors = {
    Approved: "bg-green-100 text-green-700 border-green-200",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold" style={{ color: palette.deep }}>
            {JSON.parse(localStorage.getItem("user"))?.role === "Admin" ? "All Events" : "My Events"}
          </h2>
          <Link
            to="/create-event"
            className="px-6 py-3 rounded-full font-medium shadow-md transition transform hover:-translate-y-0.5"
            style={{ background: `linear-gradient(90deg, ${palette.blue}, ${palette.navy})`, color: "white" }}
          >
            + Create Event
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const remainingSlots = event.capacity - (event.participants?.length || 0);

            return (
              <article
                key={event._id}
                className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow"
                aria-labelledby={`event-title-${event._id}`}
              >
                {/* Image area with rounded corners and purple glow */}
                <div className="relative h-44 overflow-hidden">
                  {event.image || event.imageData ? (
                    <img
                      src={event.image || event.imageData}
                      alt={event.title}
                      className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                      style={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
                    />
                  ) : (
                    <div
                      className="w-full h-full bg-gradient-to-br from-indigo-200 via-sky-200 to-cyan-200"
                      style={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
                    />
                  )}

                  {/* subtle purple glow under image */}
                  <div
                    aria-hidden
                    className="absolute inset-x-6 -bottom-6 h-6 rounded-xl"
                    style={{
                      background: `linear-gradient(90deg, ${palette.accent}22, ${palette.blue}11)`,
                      filter: "blur(12px)",
                      opacity: 0.95,
                    }}
                  />

                  {/* status badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[event.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}
                    >
                      {event.status || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 id={`event-title-${event._id}`} className="text-lg font-extrabold text-slate-800 mb-2">
                    {event.title}
                  </h3>

                  <div className="text-sm text-slate-600 space-y-1 mb-3">
                    <p className="flex items-center gap-2">
                      <span aria-hidden></span>
                      <span><strong className="text-slate-700">Date:</strong> {new Date(event.date).toLocaleDateString()}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span aria-hidden></span>
                      <span><strong className="text-slate-700">Venue:</strong> {event.venue}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span aria-hidden></span>
                      <span><strong className="text-slate-700">Remaining Slots:</strong> {remainingSlots}</span>
                    </p>
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-bold text-slate-800">{event.price ? `$${event.price}` : ""}</div>
                      <div className="text-xs text-gray-400">/ person</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/events/${event._id}`}
                        className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium shadow"
                        style={{ background: `linear-gradient(90deg, ${palette.blue}, ${palette.navy})`, color: "white" }}
                      >
                        See More
                      </Link>

                      {/* Edit/Delete for creators/admins */}
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

                {/* three circles at bottom-left (kept as requested) */}
                <div className="absolute left-4 bottom-4 flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: palette.accent, boxShadow: `0 8px 20px ${palette.accent}33` }}
                    aria-hidden
                  />
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: palette.blue, boxShadow: `0 8px 20px ${palette.blue}33` }}
                    aria-hidden
                  />
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: palette.navy, boxShadow: `0 8px 20px ${palette.navy}33` }}
                    aria-hidden
                  />
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
