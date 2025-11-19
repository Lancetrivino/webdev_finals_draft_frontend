// frontend/src/pages/BookEvent.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function BookEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    date: "",
    timeStart: "",
    timeEnd: "",
    packages: [],
    notes: "",
  });

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.status === 401 || res.status === 403) {
          toast.error("Please login to continue.");
          navigate("/login");
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch event");

        setEvent(data.event ?? data);
      } catch (err) {
        console.error("❌ Error fetching event:", err);
        toast.error(err.message || "Failed to load event.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg font-medium">Loading event...</p>
      </div>
    );

  if (!event)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg font-medium">Event not found.</p>
      </div>
    );

  const togglePackage = (p) => {
    setForm((prev) => {
      const has = prev.packages.includes(p);
      return {
        ...prev,
        packages: has ? prev.packages.filter((x) => x !== p) : [...prev.packages, p],
      };
    });
  };

  // Check if event is full
  const remainingSlots = (event.capacity || 0) - (event.participants?.length || 0);
  const isFull = remainingSlots <= 0;

  const submit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.date || !form.timeStart || !form.timeEnd) {
      toast.error("Please select date and time.");
      return;
    }

    if (form.timeEnd <= form.timeStart) {
      toast.error("End time must be after start time.");
      return;
    }

    if (isFull) {
      toast.error("Sorry, this event is fully booked.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.info("Please login first.");
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/events/${id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to book event");

      toast.success(data.message || "Booking successful!");
      setTimeout(() => navigate("/available-events"), 1200); // short delay for UX
    } catch (err) {
      console.error("❌ Booking error:", err);
      toast.error(err.message || "Booking failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-start gap-6 rounded-2xl bg-white p-6 shadow">
          <img
            src={event.imageData || "/placeholder.png"}
            alt={event.title}
            className="h-32 w-44 rounded-xl object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{event.title}</h1>
            <p className="text-slate-500">{event.venue}</p>
            <p className="mt-2 max-w-2xl text-slate-600">{event.description}</p>
            {event.amenities && event.amenities.length > 0 && (
              <div className="mt-2 text-sm text-slate-500">
                <span className="font-medium text-slate-700">Amenities:</span>{" "}
                {event.amenities.join(" • ")}
              </div>
            )}
            {isFull && (
              <div className="mt-2 text-red-600 font-semibold">⚠️ Event is fully booked!</div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={submit} className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Choose date & time</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Time (start)</label>
                <input
                  type="time"
                  value={form.timeStart}
                  onChange={(e) => setForm({ ...form, timeStart: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Time (end)</label>
                <input
                  type="time"
                  value={form.timeEnd}
                  onChange={(e) => setForm({ ...form, timeEnd: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-1 block text-sm font-medium text-slate-700">Notes (optional)</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                placeholder="Anything we should know?"
              />
            </div>
          </div>

          {/* Packages */}
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Packages</h2>
            <div className="space-y-2">
              {(event.packages || []).map((p) => (
                <label key={p} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.packages.includes(p)}
                    onChange={() => togglePackage(p)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700">{p}</span>
                </label>
              ))}
            </div>

            {event.price && (
              <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Base price</span>
                  <span className="font-semibold text-slate-800">
                    ₱{event.price.toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  * Example UI only. Submitting will book the event.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isFull}
              className={`mt-6 w-full rounded-xl px-4 py-2.5 font-semibold text-white shadow-md transition active:scale-[.99] ${
                isFull
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isFull ? "Fully Booked" : "Book now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
