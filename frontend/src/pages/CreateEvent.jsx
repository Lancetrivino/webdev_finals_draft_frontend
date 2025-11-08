import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL;

function CreateEvent() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
  });

  useEffect(() => {
    if (!currentUser) {
      toast.error("Please log in first to create an event.");
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setEventData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !eventData.title.trim() ||
      !eventData.description.trim() ||
      !eventData.date ||
      !eventData.venue.trim()
    ) {
      toast.error("⚠️ Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to create an event.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create event.");

      toast.success("🎉 Event created successfully! Pending admin approval.");
      setTimeout(() => navigate("/events"), 1200);
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12">
      {/* Header */}
      <div className="mx-auto max-w-5xl mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
          Create event
        </h1>
      </div>

      {/* Card */}
      <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-lg ring-1 ring-black/5 border border-slate-100">
        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Title</label>
            <div className="relative">
              <input
                type="text"
                name="title"
                value={eventData.title}
                onChange={handleChange}
                placeholder="Hikoot app concept development"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                📝
              </span>
            </div>
          </div>

          {/* Date row */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Day */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Day</label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                  📅
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Your event will take place on the selected date.
              </p>
            </div>

            {/* Hour (optional UI only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Hour (optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="10"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="30"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <p className="text-xs text-slate-400">
                (These are visual-only and won’t be sent to the server.)
              </p>
            </div>

            {/* Duration (optional UI only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Duration (optional)
              </label>
              <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option>30m</option>
                <option>1h</option>
                <option>1h 30m</option>
                <option>2h</option>
                <option>2h 45m</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Location</label>
            <div className="relative">
              <input
                type="text"
                name="venue"
                value={eventData.venue}
                onChange={handleChange}
                placeholder="Store Kongensgade 66, 1264 København K, Denmark"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                📍
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              name="description"
              value={eventData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Add a short description..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* (Optional) Attachments - UI only */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">
              Upload attachments (optional)
            </label>
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center text-sm text-slate-500">
              You can also drop your files here
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl px-5 py-3 text-white font-semibold shadow-md transition
                ${loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 active:scale-[.99]"}
              `}
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;
