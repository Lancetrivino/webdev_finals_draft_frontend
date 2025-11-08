import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

function Events() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      toast.info("Please login to view events");
      navigate("/login");
      return;
    }

    const fetchEvents = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/api/events`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch events");

        const approved = data.filter(
          (event) => event.status?.toLowerCase() === "approved"
        );
        setEvents(approved);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load events. Check your connection or permissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg font-medium">Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-700">No approved events yet.</h2>
        <p className="text-gray-500 mt-2">Check back later!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h2 className="text-3xl font-bold text-center text-emerald-600 mb-8">
        Approved Events
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <article
            key={event._id}
            className="group rounded-2xl bg-white shadow-[0_10px_25px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_35px_-15px_rgba(0,0,0,0.25)] transition-all overflow-hidden"
          >
            {/* Image/hero area (gradient placeholder so it always looks good) */}
            <div className="h-40 w-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-tr from-indigo-400 via-sky-400 to-cyan-400 group-hover:scale-105 transition-transform duration-500" />
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {event.title}
              </h3>

              <p className="text-slate-700 mb-1">
                <span className="mr-1">📅</span>
                <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
              </p>
              <p className="text-slate-700 mb-2">
                <span className="mr-1">📍</span>
                <strong>Venue:</strong> {event.venue}
              </p>

              <p className="text-slate-600 line-clamp-3">{event.description}</p>

              <Link
                to={`/events/${event._id}`}
                className="mt-4 inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-white font-medium shadow-md hover:shadow-lg active:scale-95 transition"
              >
                View Details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Events;
