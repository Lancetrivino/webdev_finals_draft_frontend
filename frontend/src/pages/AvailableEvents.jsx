import React, { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AvailableEvents() {
  const [events, setEvents] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [joinedEventIds, setJoinedEventIds] = useState([]);
  const [sortOption, setSortOption] = useState("date");
  const [processingEvent, setProcessingEvent] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        if (!storedToken || !storedUser) {
          toast.info("Please login to see available events.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);
        const userId = user._id || user.id;
        const API_BASE = import.meta.env.VITE_API_URL;

        console.log("🔍 Fetching available events...");
        console.log("  Token exists:", !!storedToken);
        console.log("  User ID:", userId);

        const res = await fetch(`${API_BASE}/api/events/available`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        console.log("📥 Response status:", res.status);

        const data = await res.json();
        
        if (!res.ok) {
          console.error("❌ Error response:", data);
          throw new Error(data.message || "Failed to fetch events");
        }

        console.log("✅ Events loaded:", data.length);
        setEvents(data);

        // Find events user has joined
        const joined = data
          .filter((e) => e.participants?.includes(userId))
          .map((e) => e._id);
        
        console.log("✅ User has joined:", joined.length, "events");
        setJoinedEventIds(joined);
      } catch (error) {
        console.error("❌ Fetch error:", error);
        toast.error(error.message || "Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let filteredEvents = term
      ? events.filter(
          (e) =>
            e.title.toLowerCase().includes(term) ||
            (e.venue || "").toLowerCase().includes(term)
        )
      : [...events];

    if (sortOption === "date") {
      filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortOption === "slots") {
      filteredEvents.sort(
        (a, b) =>
          b.capacity - (b.participants?.length || 0) -
          (a.capacity - (a.participants?.length || 0))
      );
    }

    return filteredEvents;
  }, [q, events, sortOption]);

  const handleBook = async (eventId) => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (!storedToken || !storedUser) {
      toast.info("Please login first.");
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    const userId = user._id || user.id;
    const API_BASE = import.meta.env.VITE_API_URL;

    setProcessingEvent(eventId);

    console.log("🎟️ Joining event:", eventId);
    console.log("  Token exists:", !!storedToken);
    console.log("  User ID:", userId);

    try {
      const res = await fetch(`${API_BASE}/api/events/${eventId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`,
        },
      });

      console.log("📥 Join response status:", res.status);

      const data = await res.json();
      
      if (!res.ok) {
        console.error("❌ Join error:", data);
        throw new Error(data.message || "Failed to join event");
      }

      const eventName = events.find((e) => e._id === eventId)?.title || "event";
      toast.success(`You've successfully joined "${eventName}"!`);

      setJoinedEventIds((prev) => [...prev, eventId]);

      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId
            ? { ...e, participants: [...(e.participants || []), userId] }
            : e
        )
      );

      console.log("✅ Successfully joined event");
    } catch (error) {
      console.error("❌ Join error:", error);
      toast.error(error.message || "Error joining event.");
    } finally {
      setProcessingEvent(null);
    }
  };

  const handleLeave = async (eventId) => {
    const eventName = events.find((e) => e._id === eventId)?.title || "this event";

    if (!window.confirm(`Are you sure you want to leave "${eventName}"?`))
      return;

    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (!storedToken || !storedUser) {
      toast.info("Please login first.");
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    const userId = user._id || user.id;
    const API_BASE = import.meta.env.VITE_API_URL;

    setProcessingEvent(eventId);

    console.log("🚪 Leaving event:", eventId);
    console.log("  Token exists:", !!storedToken);
    console.log("  User ID:", userId);

    try {
      const res = await fetch(`${API_BASE}/api/events/${eventId}/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`,
        },
      });

      console.log("📥 Leave response status:", res.status);

      const data = await res.json();
      
      if (!res.ok) {
        console.error("❌ Leave error:", data);
        throw new Error(data.message || "Failed to leave event");
      }

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

      console.log("✅ Successfully left event");
    } catch (error) {
      console.error("❌ Leave error:", error);
      toast.error(error.message || "Error leaving event.");
    } finally {
      setProcessingEvent(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center bg-gradient-to-br from-violet-25 to-sky-25">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-violet-400 mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading events...</p>
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-sky-50 px-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow p-10 border border-violet-100">
          <svg className="mx-auto mb-6 w-12 h-12 text-violet-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No events found</h2>
          <p className="text-gray-600 mb-8">Try adjusting your search or check back later for new events!</p>
          <button
            onClick={() => setQ("")}
            className="px-6 py-2 bg-gradient-to-r from-indigo-400 to-violet-400 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5"
          >
            Clear Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 px-6 py-12 bg-gradient-to-br from-violet-50 via-purple-50 to-sky-50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 bg-white rounded-2xl shadow p-6 border border-violet-100 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
                Discover Events
              </h1>
              <p className="text-gray-600 text-sm">
                {filtered.length} {filtered.length === 1 ? "event" : "events"} waiting for you
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search events or venue…"
                  className="w-full sm:w-72 px-4 py-2.5 pl-10 rounded-lg border border-violet-100 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="relative" ref={sortRef}>
                <button
                  type="button"
                  onClick={() => setSortOpen((s) => !s)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-violet-100 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-100 transition transform active:scale-95 shadow-sm"
                  aria-expanded={sortOpen}
                >
                  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h7" />
                  </svg>
                  <span className="text-sm font-medium">
                    {sortOption === "date" ? "Sort by Date" : "Sort by Availability"}
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 ml-1 transition-transform ${sortOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 011.04 1.08l-4.25 4a.75.75 0 01-1.06 0l-4.25-4a.75.75 0 01-.02-1.06z" />
                  </svg>
                </button>

                <ul
                  role="listbox"
                  className={`absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-violet-100 overflow-hidden transition-all transform origin-top-right ${sortOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
                >
                  <li
                    onClick={() => { setSortOption("date"); setSortOpen(false); }}
                    className={`px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-violet-50 transition ${sortOption === "date" ? "bg-violet-50 font-semibold" : ""}`}
                  >
                    Sort by Date
                  </li>
                  <li
                    onClick={() => { setSortOption("slots"); setSortOpen(false); }}
                    className={`px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-violet-50 transition ${sortOption === "slots" ? "bg-violet-50 font-semibold" : ""}`}
                  >
                    Sort by Availability
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => {
            const remaining = (e.capacity || 0) - (e.participants?.length || 0);
            const isFull = remaining <= 0;
            const joined = joinedEventIds.includes(e._id);
            const isProcessing = processingEvent === e._id;

            return (
              <article
                key={e._id}
                className="group overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-violet-100"
              >
                <div className="relative h-48 overflow-hidden">
                  {e.image || e.imageData ? (
                    <img
                      src={e.image || e.imageData}
                      alt={e.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 via-purple-100 to-sky-100">
                      <svg className="w-12 h-12 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-md text-xs font-semibold backdrop-blur-sm border ${isFull ? "bg-red-50 text-red-700 border-red-100" : "bg-green-50 text-green-700 border-green-100"}`}>
                      {isFull ? "Full" : `${remaining} spots`}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors">
                    {e.title}
                  </h3>

                  {e.averageRating > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.round(e.averageRating) ? "text-yellow-400" : "text-gray-200"}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{e.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({e.totalReviews})</span>
                    </div>
                  )}

                  <div className="space-y-3 mb-4 text-sm text-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="3" y="4" width="18" height="14" rx="2" strokeWidth="1.5" />
                          <path d="M8 2v4M16 2v4" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="font-medium">{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M21 10v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M12 3v7" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium line-clamp-1">{e.venue}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/events/${e._id}`)}
                      className="flex-1 px-4 py-2.5 bg-white border border-violet-100 text-violet-700 font-semibold rounded-lg hover:bg-violet-50 transition"
                    >
                      Details
                    </button>
                    {joined ? (
                      <button
                        onClick={() => handleLeave(e._id)}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? "..." : "Leave"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBook(e._id)}
                        disabled={isFull || isProcessing}
                        className={`flex-1 px-4 py-2.5 font-semibold rounded-lg transition shadow ${
                          isFull
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-gradient-to-r from-indigo-400 to-violet-400 text-white hover:from-indigo-500 hover:to-violet-500"
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