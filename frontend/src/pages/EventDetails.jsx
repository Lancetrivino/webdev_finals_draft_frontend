// frontend/src/pages/EventDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

import { API_BASE_URL } from "../App";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const token = currentUser?.token;
        const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.status === 401 || res.status === 403) {
          toast.error("Your session expired. Please log in again.");
          navigate("/login");
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch event");

        setEvent(data.event ?? data);

        // Check if user already joined
        if (currentUser) {
          setJoined(
            (data.event?.participants || data.participants || []).includes(
              currentUser._id
            )
          );
        }
      } catch (err) {
        console.error("❌ Error fetching event details:", err);
        toast.error(err.message || "Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate, currentUser]);

  // Handle Join
  const handleBook = async () => {
    const token = currentUser?.token;
    if (!token) {
      toast.info("Please login first.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to join event");

      toast.success(data.message || "Successfully joined the event!");
      setJoined(true);
      setEvent((prev) => ({
        ...prev,
        participants: [...(prev.participants || []), currentUser._id],
      }));
    } catch (err) {
      toast.error(err.message || "Error joining event.");
    }
  };

  // Handle Leave
  const handleLeave = async () => {
    const token = currentUser?.token;
    if (!token) {
      toast.info("Please login first.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${id}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to leave event");

      toast.success(data.message || "Successfully left the event!");
      setJoined(false);
      setEvent((prev) => ({
        ...prev,
        participants: (prev.participants || []).filter((uid) => uid !== currentUser._id),
      }));
    } catch (err) {
      toast.error(err.message || "Error leaving event.");
    }
  };

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

  const {
    title,
    description,
    date,
    venue,
    time,
    duration,
    imageData,
    reminders,
    status,
    capacity,
    participants,
  } = event;

  const remainingSlots = capacity ? capacity - (participants?.length || 0) : null;
  const isFull = remainingSlots !== null && remainingSlots <= 0;

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
      {imageData && (
        <img
          src={imageData}
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
        {remainingSlots !== null && (
          <p className={`font-semibold ${isFull ? "text-red-600" : "text-emerald-600"}`}>
            {isFull ? "Event is Full" : `${remainingSlots} slots remaining`}
          </p>
        )}
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

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate(`/feedback/${id}`)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition"
        >
          Give Feedback
        </button>

        {currentUser && !isFull && !joined && (
          <button
            onClick={handleBook}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition"
          >
            Join Event
          </button>
        )}

        {currentUser && joined && (
          <button
            onClick={handleLeave}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition"
          >
            Leave Event
          </button>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
