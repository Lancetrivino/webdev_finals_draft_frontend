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

        // Fetch event details
        const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.status === 401 || res.status === 403) {
          toast.error("Your session expired. Please log in again.");
          navigate("/login");
          return;
        }

        const text = await res.text();
        let data;
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          throw new Error(`Unexpected response from server (status ${res.status}).`);
        }

        if (!res.ok) {
          throw new Error(data?.message || `Failed to fetch event. (${res.status})`);
        }

        setEvent(data?.event ?? data);
      } catch (err) {
        console.error("❌ Error fetching event details:", err);
        toast.error(err.message || "Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate, currentUser]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg font-medium">Loading event details...</p>
      </div>
    );

  if (!event)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Event not found.</p>
      </div>
    );

  const { title, description, date, venue, time, duration, image, reminders, status } =
    event;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-emerald-700">{title}</h1>
        {status && (
          <span
            className={`px-4 py-1 text-sm rounded-full font-semibold ${
              status === "Approved"
                ? "bg-green-100 text-green-700"
                : status === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {status}
          </span>
        )}
      </div>

      {/* Image */}
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full max-h-80 object-cover rounded-xl mb-6 shadow-md"
        />
      )}

      {/* Event Details */}
      <div className="space-y-2 text-slate-700 mb-6">
        <p>
          <span className="font-semibold">📅 Date:</span>{" "}
          {date ? new Date(date).toLocaleDateString() : "—"}
        </p>
        {time && (
          <p>
            <span className="font-semibold">⏰ Time:</span> {time}
          </p>
        )}
        {duration && (
          <p>
            <span className="font-semibold">🕒 Duration:</span> {duration}
          </p>
        )}
        <p>
          <span className="font-semibold">📍 Venue:</span> {venue || "—"}
        </p>
      </div>

      {/* Description */}
      <p className="text-slate-700 mb-8 whitespace-pre-line">
        {description || "No description provided."}
      </p>

      {/* Reminders */}
      {reminders && reminders.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-lg mb-2">Reminders:</h2>
          <ul className="list-disc list-inside text-slate-700 space-y-1">
            {reminders.map((reminder, idx) => (
              <li key={idx}>{reminder}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Feedback Button */}
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
