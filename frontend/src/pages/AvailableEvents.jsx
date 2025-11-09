import React, { useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
export default function AvailableEvents() {
  const [events, setEvents] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [joinedEventIds, setJoinedEventIds] = useState([]);
  const [sortOption, setSortOption] = useState("date"); // default sort by date


  const navigate = useNavigate();
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");

        if (!token) {
          toast.info("Please login to see available events.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/api/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch events");

        const approvedEvents = data.filter(
          (event) => event.status?.toLowerCase() === "approved"
        );
        setEvents(approvedEvents);

        const joined = approvedEvents
          .filter((e) =>
            e.participants?.includes(localStorage.getItem("userId"))
          )
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

  // Search + filter
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let filteredEvents = term
      ? events.filter(
          (e) =>
            e.title.toLowerCase().includes(term) ||
            e.venue.toLowerCase().includes(term)
        )
      : [...events];

    // Sorting
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
    const API_BASE = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/api/events/${eventId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to book event");

      toast.success(data.message || "Successfully registered for event!");
      setJoinedEventIds((prev) => [...prev, eventId]);
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId
            ? {
                ...e,
                participants: [
                  ...(e.participants || []),
                  localStorage.getItem("userId"),
                ],
              }
            : e
        )
      );
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error booking event.");
    }
  };

  const handleLeave = async (eventId) => {
    const API_BASE = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

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

      toast.success(data.message || "Successfully unregistered from event!");
      setJoinedEventIds((prev) => prev.filter((id) => id !== eventId));
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId
            ? {
                ...e,
                participants: (e.participants || []).filter(
                  (id) => id !== localStorage.getItem("userId")
                ),
              }
            : e
        )
      );
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error leaving event.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg font-medium">Loading events...</p>
      </div>
    );
  }

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

            return (
              <article
                key={e._id}
                className="group overflow-hidden rounded-2xl bg-white shadow-[0_10px_25px_-10px_rgba(0,0,0,0.2)] transition-all hover:shadow-[0_18px_35px_-12px_rgba(0,0,0,0.25)]"
              >
                <div className="h-40 w-full overflow-hidden">
                  <img
                    src={e.imageData || "/placeholder.png"}
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
                        className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-red-700 active:scale-95"
                      >
                        Leave
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/book/${e._id}`)}
                        disabled={isFull}
                        className={`rounded-full px-4 py-2 text-sm font-medium text-white shadow-md transition active:scale-95 ${
                          isFull
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        Book
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
