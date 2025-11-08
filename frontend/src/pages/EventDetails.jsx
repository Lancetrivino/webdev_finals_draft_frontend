// frontend/src/pages/EventDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../App";
import { useAuth } from "../contexts/AuthContext";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Hit the single-event endpoint
        const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        // Read as text first so we can show nice errors if it isn't JSON
        const text = await res.text();
        let data;
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          // Server returned HTML or other non-JSON (e.g., a 401 HTML page)
          throw new Error(
            `Unexpected response from server (status ${res.status}).`
          );
        }

        if (!res.ok) {
          if (res.status === 401) {
            toast.error("Your session has expired. Please log in again.");
            navigate("/login");
            return;
          }
          throw new Error(data?.message || `Failed to fetch event. (${res.status})`);
        }

        // If your backend returns the event object directly:
        setEvent(data);

        // If your backend instead returns { event: {...} }, use:
        // setEvent(data.event);

      } catch (err) {
        console.error("❌ Error fetching event details:", err);
        toast.error(err.message || "Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg font-medium">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Event not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-10">
      <h1 className="text-3xl font-bold text-emerald-700 mb-4">{event.title}</h1>

      <p className="text-gray-700 mb-2">
        <span className="font-semibold">Date:</span>{" "}
        {event.date ? new Date(event.date).toLocaleDateString() : "—"}
      </p>

      <p className="text-gray-700 mb-2">
        <span className="font-semibold">Venue:</span>{" "}
        {event.venue || "—"}
      </p>

      <p className="text-gray-700 mb-6">{event.description}</p>

      <button
        onClick={() => navigate(`/feedback/${id}`)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition"
      >
        Give Feedback
      </button>
    </div>
  );
};

export default EventDetails;
