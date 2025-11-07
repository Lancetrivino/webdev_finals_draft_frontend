import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
      try {
        const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch event details");
        }

        const data = await res.json();
        setEvent(data);
      } catch (error) {
        console.error("❌ Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, currentUser]);

  if (loading)
    return (
      <div className="text-white text-center mt-10">Loading event details...</div>
    );

  if (!event)
    return (
      <div className="text-white text-center mt-10">Event not found</div>
    );

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-10">
      <h1 className="text-3xl font-bold text-orange-800 mb-4">{event.title}</h1>

      <div className="text-gray-700 space-y-2 mb-6">
        <p>
          <span className="font-semibold">📅 Date:</span>{" "}
          {new Date(event.date).toLocaleDateString()}
        </p>
        <p>
          <span className="font-semibold">📍 Venue:</span> {event.venue}
        </p>
        <p>
          <span className="font-semibold">👤 Organizer:</span>{" "}
          {event.createdBy?.name || "N/A"}
        </p>
        <p>
          <span className="font-semibold">📝 Status:</span>{" "}
          <span
            className={`font-bold ${
              event.status?.toLowerCase() === "approved"
                ? "text-green-600"
                : "text-yellow-600"
            }`}
          >
            {event.status}
          </span>
        </p>
        {event.feedbacks && (
          <p>
            <span className="font-semibold">💬 Feedbacks:</span>{" "}
            {event.feedbacks.length}
          </p>
        )}
      </div>

      <hr className="my-4" />

      <p className="text-gray-800 leading-relaxed mb-6">
        {event.description || "No description available."}
      </p>

      {/* ✅ Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/feedback/${id}`)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl transition duration-300"
        >
          Give Feedback
        </button>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-xl"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default EventDetails;
