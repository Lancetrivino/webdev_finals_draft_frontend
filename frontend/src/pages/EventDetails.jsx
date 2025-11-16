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
  const [eventHasPassed, setEventHasPassed] = useState(false);
  const [alreadySubmittedFeedback, setAlreadySubmittedFeedback] = useState(false);

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

  // Check feedback eligibility
  useEffect(() => {
    if (!event || !currentUser) return;
    
    const eventDate = new Date(event.date);
    const now = new Date();
    setEventHasPassed(now > eventDate);
    
    const checkFeedback = async () => {
      try {
        const token = currentUser?.token;
        const res = await fetch(`${API_BASE_URL}/api/feedback/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          const userFeedback = data.feedbacks?.find(
            f => f.user?._id === currentUser._id || f.user === currentUser._id
          );
          setAlreadySubmittedFeedback(!!userFeedback);
        }
      } catch (error) {
        console.error("Error checking feedback:", error);
      }
    };
    
    checkFeedback();
  }, [event, currentUser, id]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading event details...</p>
        </div>
      </div>
    );

  if (!event)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
        <div className="text-center bg-white rounded-2xl p-12 shadow-2xl border-2 border-violet-200">
          <div className="text-6xl mb-4">😞</div>
          <p className="text-xl text-gray-600 font-semibold">Event not found.</p>
        </div>
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
    averageRating,
    totalReviews,
  } = event;

  const remainingSlots = capacity ? capacity - (participants?.length || 0) : null;
  const isFull = remainingSlots !== null && remainingSlots <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-violet-200">
          {/* Gradient Header Bar */}
          <div className="h-2 bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500" />
          
          {/* Header */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
                <div className="flex items-center gap-2 text-violet-600">
                  <span>📍</span>
                  <span className="text-lg font-medium">{venue || "—"}</span>
                </div>
              </div>
              {status && (
                <span
                  className={`px-5 py-2 text-sm rounded-full font-bold shadow-lg ${
                    status === "Approved"
                      ? "bg-green-100 text-green-700 border-2 border-green-300"
                      : status === "Pending"
                      ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
                      : "bg-red-100 text-red-700 border-2 border-red-300"
                  }`}
                >
                  {status}
                </span>
              )}
            </div>

            {/* Image */}
            {imageData && (
              <div className="rounded-2xl overflow-hidden mb-8 shadow-xl border-2 border-violet-200">
                <img
                  src={imageData}
                  alt={title}
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}

            {/* Event Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-violet-50 rounded-xl p-6 border-2 border-violet-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                      📅
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Date</p>
                      <p className="text-gray-900 font-semibold">
                        {date ? new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : "—"}
                      </p>
                    </div>
                  </div>

                  {time && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                        ⏰
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Time</p>
                        <p className="text-gray-900 font-semibold">{time}</p>
                      </div>
                    </div>
                  )}

                  {duration && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                        🕐
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Duration</p>
                        <p className="text-gray-900 font-semibold">{duration}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-violet-50 rounded-xl p-6 border-2 border-violet-200">
                <div className="space-y-4">
                  {remainingSlots !== null && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                        👥
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Availability</p>
                        <p className={`font-bold text-lg ${isFull ? "text-red-600" : "text-green-600"}`}>
                          {isFull ? "Event is Full" : `${remainingSlots} slots remaining`}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {averageRating > 0 && totalReviews > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                        ⭐
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Rating</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-violet-600">{averageRating.toFixed(1)}</span>
                          <span className="text-gray-600">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About This Event</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-violet-50 p-6 rounded-xl border-2 border-violet-200">
                {description || "No description provided."}
              </p>
            </div>

            {/* Reminders */}
            {reminders && reminders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Important Reminders</h2>
                <ul className="space-y-2">
                  {reminders.map((reminder, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-violet-50 p-4 rounded-xl border-2 border-violet-200">
                      <span className="text-violet-600 font-bold">•</span>
                      <span className="text-gray-700">{reminder}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              {currentUser && joined && eventHasPassed && !alreadySubmittedFeedback && (
                <button
                  onClick={() => navigate(`/feedback/${id}`)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  ⭐ Leave Review
                </button>
              )}

              {totalReviews > 0 && (
                <button
                  onClick={() => navigate(`/feedback/${id}/list`)}
                  className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  📝 View Reviews ({totalReviews})
                </button>
              )}

              {currentUser && !isFull && !joined && (
                <button
                  onClick={handleBook}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Join Event
                </button>
              )}

              {currentUser && joined && (
                <button
                  onClick={handleLeave}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Leave Event
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;