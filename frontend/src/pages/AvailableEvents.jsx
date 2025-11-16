import React, { useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AvailableEvents() {
  const [events, setEvents] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [joinedEventIds, setJoinedEventIds] = useState([]);
  const [sortOption, setSortOption] = useState("date");
  const [processingEvent, setProcessingEvent] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          toast.info("Please login to see available events.");
          setLoading(false);
          return;
        }

        const { token, _id: userId } = JSON.parse(storedUser);
        const API_BASE = import.meta.env.VITE_API_URL;

        const res = await fetch(`${API_BASE}/api/events/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch events");

        setEvents(data);

        const joined = data
          .filter((e) => e.participants?.includes(userId))
          .map((e) => e._id);
        setJoinedEventIds(joined);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let filteredEvents = term
      ? events.filter(
          (e) =>
            e.title.toLowerCase().includes(term) ||
            e.venue.toLowerCase().includes(term)
        )
      : [...events];

    if (sortOption === "date") {
      filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortOption === "slots") {
      filteredEvents.sort(
        (a, b) =>
          b.capacity -
          (b.participants?.length || 0) -
          (a.capacity - (a.participants?.length || 0))
      );
    }

    return filteredEvents;
  }, [q, events, sortOption]);

  const handleBook = async (eventId) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      toast.info("Please login first.");
      navigate("/login");
      return;
    }

    const { token, _id: userId } = storedUser;
    const API_BASE = import.meta.env.VITE_API_URL;

    setProcessingEvent(eventId);

    try {
      const res = await fetch(`${API_BASE}/api/events/${eventId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to join event");

      const eventName = events.find((e) => e._id === eventId)?.title || "event";
      toast.success(`🎉 You've successfully joined "${eventName}"!`);

      setJoinedEventIds((prev) => [...prev, eventId]);

      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId
            ? { ...e, participants: [...(e.participants || []), userId] }
            : e
        )
      );
    } catch (error) {
      toast.error(error.message || "Error joining event.");
    } finally {
      setProcessingEvent(null);
    }
  };

  const handleLeave = async (eventId) => {
    const eventName =
      events.find((e) => e._id === eventId)?.title || "this event";

    if (!window.confirm(`Are you sure you want to leave "${eventName}"?`))
      return;

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return toast.info("Please login first.");

    const { token, _id: userId } = storedUser;
    const API_BASE = import.meta.env.VITE_API_URL;

    setProcessingEvent(eventId);

    try {
      const res = await fetch(`${API_BASE}/api/events/${eventId}/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to leave event");

      toast.success(`You've left "${eventName}"`);

      setJoinedEventIds((prev) => prev.filter((id) => id !== eventId));

      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId
            ? {
                ...e,
                participants: (e.participants || []).filter(
                  (id) => id !== userId
                ),
              }
            : e
        )
      );
    } catch (error) {
      toast.error(error.message || "Error leaving event.");
    } finally {
      setProcessingEvent(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-violet-600 mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading events...</p>
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 px-4">
        <div className="text-center max-w-md bg-white rounded-3xl shadow-2xl p-12 border-2 border-violet-200">
          <div className="text-6xl mb-6">🔍</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">No events found</h2>
          <p className="text-gray-600 mb-8">Try adjusting your search or check back later for new events!</p>
          <button
            onClick={() => setQ("")}
            className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Clear Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-12 bg-white rounded-3xl shadow-2xl p-8 border-2 border-violet-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Discover Events
              </h1>
              <p className="text-gray-600 text-lg">
                {filtered.length} amazing {filtered.length === 1 ? "event" : "events"} waiting for you
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search events or venue…"
                  className="w-full sm:w-72 px-4 py-3 pl-12 rounded-xl border-2 border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-200 outline-none transition-all"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Sort */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-200 outline-none transition-all bg-white font-medium"
              >
                <option value="date">Sort by Date</option>
                <option value="slots">Sort by Availability</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => {
            const remaining = (e.capacity || 0) - (e.participants?.length || 0);
            const isFull = remaining <= 0;
            const joined = joinedEventIds.includes(e._id);
            const isProcessing = processingEvent === e._id;

            return (
              <article
                key={e._id}
                className="group overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-violet-200"
              >
                {/* Image */}
                <div className="h-48 w-full overflow-hidden relative">
                  <img
                    src={e.image || e.imageData || "/placeholder.png"}
                    alt={e.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Availability Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xl backdrop-blur-sm border-2 ${
                      isFull 
                        ? "bg-red-100 text-red-700 border-red-300" 
                        : "bg-green-100 text-green-700 border-green-300"
                    }`}>
                      {isFull ? "FULL" : `${remaining} SPOTS LEFT`}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-violet-600 transition-colors">
                    {e.title}
                  </h3>

                  {/* Rating */}
                  {e.averageRating > 0 && (
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-violet-100">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(e.averageRating) ? "text-yellow-400" : "text-gray-200"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-bold">{e.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({e.totalReviews})</span>
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">📅</span>
                      <span className="text-gray-700 font-medium">
                        {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">📍</span>
                      <span className="text-gray-700 font-medium line-clamp-1">{e.venue}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/events/${e._id}`)}
                      className="flex-1 px-4 py-3 bg-violet-100 text-violet-700 font-bold rounded-xl hover:bg-violet-200 transition-colors border-2 border-violet-200"
                    >
                      Details
                    </button>
                    {joined ? (
                      <button
                        onClick={() => handleLeave(e._id)}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? "..." : "Leave"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBook(e._id)}
                        disabled={isFull || isProcessing}
                        className={`flex-1 px-4 py-3 font-bold rounded-xl transition-colors shadow-md ${
                          isFull
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isProcessing ? "..." : isFull ? "Full" : "Join"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}