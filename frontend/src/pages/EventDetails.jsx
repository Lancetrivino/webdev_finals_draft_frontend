import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../App";
import { useAuth } from "../contexts/AuthContext";

const EventDetails = () => {
  const { id } = useParams(); // ✅ event ID from URL
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/events`, {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        });
        const data = await res.json();
        const foundEvent = data.find((e) => e._id === id);
        setEvent(foundEvent);
      } catch (error) {
        console.error("❌ Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, currentUser]);

  if (loading) return <div className="text-white text-center mt-10">Loading event details...</div>;
  if (!event) return <div className="text-white text-center mt-10">Event not found</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-10">
      <h1 className="text-3xl font-bold text-orange-800 mb-4">{event.title}</h1>
      <p className="text-gray-700 mb-2">
        <span className="font-semibold">Date:</span> {new Date(event.date).toLocaleDateString()}
      </p>
      <p className="text-gray-700 mb-2">
        <span className="font-semibold">Location:</span> {event.location}
      </p>
      <p className="text-gray-700 mb-6">{event.description}</p>

      {/* ✅ Give Feedback Button */}
      <button
        onClick={() => navigate(`/feedback/${id}`)}
        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl transition duration-300"
      >
        Give Feedback
      </button>
    </div>
  );
};

export default EventDetails;
