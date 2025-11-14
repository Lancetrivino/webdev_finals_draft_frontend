import React, { useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AvailableEvents() {
  const [events, setEvents] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [joinedEventIds, setJoinedEventIds] = useState([]);
  const [sortOption, setSortOption] = useState("date");
  const [processingEvent, setProcessingEvent] = useState(null); // ✅ NEW: Track which event is being processed

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

        // Use the new /available endpoint that returns all approved events
        const res = await fetch(`${API_BASE}/api/events/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch events");

        // The endpoint already returns only approved events, no need to filter
        setEvents(data);

        // Mark events the user already joined
        const joined = data
          .filter((e) => e.participants?.includes(userId))
          .map((e) => e._id);
        setJoinedEventIds(joined);
      } catch (error) {
        console.error(error);
        toast.error(
          "Failed to load events. Check your connection or permissions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 🔎 Search + Sort
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

  // ✅ Enhanced Handle Join Event with Loading State
  const handleBook = async (eventId) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      toast.info("Please login first.");
      navigate("/login");
      return;
    }

    const { token, _id: userId } = storedUser;
    const API_BASE = import.meta.env.VITE_API_URL;

    setProcessingEvent(eventId); // ✅ Show loading state

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

      // ✅ Get event name for better success message
      const eventName = events.find((e) => e._id === eventId)?.title || "event";
      toast.success(`🎉 You've successfully joined "${eventName}"!`, {
        position: "top-center",
        autoClose: 3000,
      });

      // Update joined events list
      setJoinedEventIds((prev) => [...prev, eventId]);

      // Update events state
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId
            ? {
                ...e,
                participants: [...(e.participants || []), userId],
              }
            : e
        )
      );
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error joining event.", {
        position: "top-center",
      });
    } finally {
      setProcessingEvent(null); // ✅ Clear loading state
    }
  };

  // ✅ Enhanced Handle Leave Event with Loading State
  const handleLeave = async (eventId) => {
    const eventName =
      events.find((e) => e._id === eventId)?.title || "this event";

    if (!window.confirm(`Are you sure you want to leave "${eventName}"?`)) {
      return; // User cancelled
    }
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return toast.info("Please login first.");
    const { token, _id: userId } = storedUser;

    const API_BASE = import.meta.env.VITE_API_URL;

    setProcessingEvent(eventId); // ✅ Show loading state

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

      // ✅ Get event name for better success message
      const eventName = events.find((e) => e._id === eventId)?.title || "event";
      toast.success(`You've left "${eventName}"`, {
        position: "top-center",
        autoClose: 3000,
      });

      // Update joined events list
      setJoinedEventIds((prev) => prev.filter((id) => id !== eventId));

      // Update events state
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
      console.error(error);
      toast.error(error.message || "Error leaving event.", {
        position: "top-center",
      });
    } finally {
      setProcessingEvent(null); // ✅ Clear loading state
    }
  };

  // 🌀 Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg font-medium">
            Loading events...
          </p>
        </div>
      </div>
    );
  }

  // 🔭 No results
  if (filtered.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-700">
          No events found.
        </h2>
        <p className="text-gray-500 mt-2">
          Try adjusting your search or check back later!
        </p>
      </div>
    );
  }

  // 🎟️ Events display
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-slate-800">
            Available Events
          </h1>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search events or venue…"
              className="w-full sm:w-64 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pl-11 text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
            />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="date">Sort by Date</option>
              <option value="slots">Sort by Availability</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => {
            const remaining = (e.capacity || 0) - (e.participants?.length || 0);
            const isFull = remaining <= 0;
            const joined = joinedEventIds.includes(e._id);
            const isProcessing = processingEvent === e._id; // ✅ Check if this event is being processed

            return (
              <article
                key={e._id}
                className="group overflow-hidden rounded-2xl bg-white shadow-[0_10px_25px_-10px_rgba(0,0,0,0.2)] transition-all hover:shadow-[0_18px_35px_-12px_rgba(0,0,0,0.25)]"
              >
                <div className="h-40 w-full overflow-hidden">
                  <img
                    src={e.image || e.imageData || "/placeholder.png"}
                    alt={e.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {e.title}
                  </h3>
                  <p className="text-sm text-slate-500">{e.venue}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                    {e.description}
                  </p>

                  {/* ✅ Rating Display */}
                  {e.averageRating > 0 && e.totalReviews > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-yellow-400 text-lg">★</span>
                      <span className="font-semibold text-slate-800">
                        {e.averageRating.toFixed(1)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ({e.totalReviews}{" "}
                        {e.totalReviews === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        isFull ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {isFull ? "Full" : `${remaining} slots left`}
                    </span>

                    {joined ? (
                      <button
                        onClick={() => handleLeave(e._id)}
                        disabled={isProcessing}
                        className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Leaving...
                          </span>
                        ) : (
                          "Leave"
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBook(e._id)}
                        disabled={isFull || isProcessing}
                        className={`rounded-full px-4 py-2 text-sm font-medium text-white shadow-md transition active:scale-95 ${
                          isFull || isProcessing
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Joining...
                          </span>
                        ) : isFull ? (
                          "Full"
                        ) : (
                          "Join Event"
                        )}
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
