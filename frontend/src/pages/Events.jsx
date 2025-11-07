import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../App";

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
        console.log("🌍 Fetching:", `${API_BASE_URL}/api/events`);
        const res = await fetch(`${API_BASE_URL}/api/events`, {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        });

        const text = await res.text();
        console.log("🧾 Raw response:", text);

        const data = JSON.parse(text);
        console.log("✅ Parsed events:", data);

        if (!res.ok) throw new Error(data.message || "Failed to fetch events");

        const allEvents = Array.isArray(data) ? data : data.events || [];
        setEvents(allEvents);
      } catch (error) {
        console.error("❌ Error fetching events:", error);
        toast.error("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg font-medium">Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-semibold text-gray-700">
          No approved events yet.
        </h2>
        <p className="text-gray-500 mt-2">Check back later!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <h2 className="text-3xl font-bold text-center text-green-600 mb-6">
        Approved Events
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div
            key={event._id}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <h3 className="text-xl font-bold text-green-700 mb-2">
              {event.title}
            </h3>
            <p className="text-gray-700 mb-1">
              📅 <strong>Date:</strong>{" "}
              {new Date(event.date).toLocaleDateString()}
            </p>
            <p className="text-gray-700 mb-1">
              📍 <strong>Venue:</strong> {event.venue}
            </p>
            <p className="text-gray-600 mb-3">
              {event.description || "No description available"}
            </p>

            <Link
              to={`/events/${event._id}`}
              className="inline-block mt-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 active:scale-95 transition-transform"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Events;
