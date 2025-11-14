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
      if (!res.ok) throw new Error(data.message);

      const eventName = events.find((e) => e._id === eventId)?.title || "event";
      toast.success(`🎉 Joined "${eventName}"!`);

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

    if (!window.confirm(`Leave "${eventName}"?`)) return;

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
      if (!res.ok) throw new Error(data.message);

      toast.success(`You left "${eventName}".`);

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
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, #f3e8ff 0%, #e6cfff 25%, #cca3ff 50%, #a66bff 75%, #8040ff 100%)",
        }}
      >
        <div
          className="absolute w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse top-10 left-10"
          style={{ background: "linear-gradient(135deg,#f3e8ff,#cca3ff)" }}
        ></div>

        <div
          className="absolute w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse bottom-20 right-20"
          style={{ background: "linear-gradient(135deg,#e6cfff,#a66bff)" }}
        ></div>

        <div
          className="absolute w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ background: "linear-gradient(135deg,#cca3ff,#8040ff)" }}
        ></div>
      </div>

      {/* Content */}
      <div className="px-6 py-10 max-w-6xl mx-auto relative z-10">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-6">
          Available Events
        </h1>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events or venue…"
            className="w-full sm:w-64 rounded-2xl border px-4 py-2.5 text-slate-700"
          />

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="rounded-2xl border px-3 py-2 text-slate-700"
          >
            <option value="date">Sort by Date</option>
            <option value="slots">Sort by Availability</option>
          </select>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => {
            const remaining =
              (e.capacity || 0) - (e.participants?.length || 0);
            const joined = joinedEventIds.includes(e._id);
            const isFull = remaining <= 0;
            const isProcessing = processingEvent === e._id;

            return (
              <article
                key={e._id}
                className="rounded-2xl bg-white shadow-lg overflow-hidden"
              >
                <img
                  src={e.image || e.imageData}
                  className="h-40 w-full object-cover"
                />

                <div className="p-5">
                  <h3 className="font-semibold text-lg">{e.title}</h3>
                  <p className="text-sm text-gray-500">{e.venue}</p>

                  <div className="mt-4 flex justify-between items-center">
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
                        className="bg-red-600 text-white rounded-full px-4 py-2"
                      >
                        {isProcessing ? "Leaving..." : "Leave"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBook(e._id)}
                        disabled={isFull || isProcessing}
                        className={`rounded-full px-4 py-2 text-white ${
                          isFull ? "bg-gray-400" : "bg-emerald-600"
                        }`}
                      >
                        {isProcessing ? "Joining..." : "Join"}
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
