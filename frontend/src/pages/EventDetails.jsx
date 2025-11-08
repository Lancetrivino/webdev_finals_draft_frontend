import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

// Prefer the same base URL strategy used elsewhere
const API_BASE =
  import.meta.env?.VITE_API_URL ||
  (import.meta.env?.DEV ? "http://localhost:5000" : "https://your-backend-name.onrender.com");

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to view event details.");
          navigate("/login");
          return;
        }

        const res = await fetch(`${API_BASE}/api/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Handle 401/403 explicitly
        if (res.status === 401 || res.status === 403) {
          toast.error("Your session expired. Please log in again.");
          navigate("/login");
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          // Backend may return {message: "..."} on errors
          throw new Error(data?.message || "Failed to fetch event details");
        }

        // Expect a single event object. If your API wraps it (e.g., {event: {...}})
        // support both shapes:
        const evt = data?.event ?? data;
        setEvent(evt);
      } catch (err) {
        console.error("❌ Error fetching event details:", err);
        toast.error(err.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-slate-600">Loading event details…</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-slate-600">Event not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-10">
      <h1 className="text-3xl font-bold text-emerald-700 mb-4">{event.title}</h1>

      <div className="space-y-2 text-slate-700 mb-6">
        <p>
          <span className="font-semibold">Date:</span>{" "}
          {event.date ? new Date(event.date).toLocaleDateString() : "—"}
        </p>
        <p>
          {/* Use 'venue' (your list page uses it) instead of 'location' */}
          <span className="font-semibold">Venue:</span> {event.venue || "—"}
        </p>
      </div>

      <p className="text-slate-700 mb-8 whitespace-pre-line">
        {event.description || "No description provided."}
      </p>

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
