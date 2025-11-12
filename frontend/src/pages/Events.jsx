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

        // Admin sees all events, users see only their own created events
        const filteredEvents =
          role === "Admin"
            ? data
            : data.filter((event) => event.createdBy?._id === userId);

        setEvents(filteredEvents);
      } catch (error) {
        console.error(error);
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
        <p className="text-gray-500 mt-2">Check back later!</p>
      </div>
    );
  }

  // MAIN DISPLAY
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h2 className="text-3xl font-bold text-center text-emerald-600 mb-8">
        {JSON.parse(localStorage.getItem("user"))?.role === "Admin"
          ? "All Events"
          : "My Events"}
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => {
          const remainingSlots =
            event.capacity - (event.participants?.length || 0);

          return (
            <article
              key={event._id}
              className="group rounded-2xl bg-white shadow-[0_10px_25px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_35px_-15px_rgba(0,0,0,0.25)] transition-all overflow-hidden"
            >
              {/* Image */}
              <div className="h-40 w-full overflow-hidden">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-top-right from-indigo-400 via-sky-400 to-cyan-400 group-hover:scale-105 transition-transform duration-500" />
                )}
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

                <div className="mt-4 flex items-center justify-between">
                  <Link
                    to={`/events/${event._id}`}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-white font-medium shadow-md hover:shadow-lg active:scale-95 transition"
                  >
                    View Details
                  </Link>

                  {/* Edit/Delete for creators/admins */}
                  {JSON.parse(localStorage.getItem("user"))?.role !==
                    "Guest" && (
                    <div className="flex gap-2">
                      <Link
                        to={`/events/edit/${event._id}`}
                        className="rounded-full bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="rounded-full bg-red-600 px-3 py-2 text-sm font-medium text-white"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default Events;
