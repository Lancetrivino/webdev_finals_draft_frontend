import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../App";
import { useAuth } from "../contexts/AuthContext";

export default function FeedbackList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token"); // or from AuthContext
        const res = await fetch(`${API_BASE_URL}/api/events`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading)
    return <div className="text-center mt-20 text-gray-600">Loading events...</div>;

  if (events.length === 0)
    return <div className="text-center mt-20 text-gray-600">No events available for feedback.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Give Feedback</h1>
      <ul className="grid gap-4">
        {events.map((event) => (
          <li
            key={event._id}
            className="flex justify-between items-center p-4 border rounded-xl hover:shadow-md transition"
          >
            <div>
              <h2 className="font-semibold text-lg">{event.name}</h2>
              <p className="text-gray-500">{event.date || event.location || ""}</p>
            </div>
            <Link
              to={`/feedback/${event._id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Give Feedback
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
