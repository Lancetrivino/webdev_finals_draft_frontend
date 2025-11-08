// frontend/src/pages/CreateEvent.jsx
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
    time: "",        // NEW
    duration: "",    // NEW (user-entered)
    venue: "",
    imageData: "",   // NEW (base64, optional)
    reminders: [],   // NEW (array of strings)
  });

  const [imagePreview, setImagePreview] = useState("");
  const [reminderInput, setReminderInput] = useState("");

  useEffect(() => {
    if (!currentUser) {
      toast.error("Please log in first to create an event.");
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image is too large. Max size is 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result?.toString() || "";
      setEventData((prev) => ({ ...prev, imageData: base64 }));
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const addReminder = () => {
    const trimmed = reminderInput.trim();
    if (!trimmed) return;
    setEventData((prev) => ({ ...prev, reminders: [...prev.reminders, trimmed] }));
    setReminderInput("");
  };

  const removeReminder = (idx) => {
    setEventData((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !eventData.title.trim() ||
      !eventData.description.trim() ||
      !eventData.date ||
      !eventData.venue.trim()
    ) {
      toast.error("⚠️ Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to create an event.");
        setLoading(false);
        return;
      }

      // Body keeps your original fields and adds optional ones.
      const body = {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        venue: eventData.venue,
        // Optional extras (backend may ignore if not supported)
        time: eventData.time || undefined,
        duration: eventData.duration || undefined,
        image: eventData.imageData || undefined,
        reminders: eventData.reminders.length ? eventData.reminders : undefined,
      };

      const res = await fetch(`${API_BASE}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
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
    <div className="min-h-screen bg-gradient-to-bottom from-slate-50 to-slate-100 px-4 py-12">
      {/* Header */}
      <div className="mx-auto max-w-5xl mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
          Create event
        </h1>
        <p className="text-slate-500 mt-1">Fill in the details below to create a new event.</p>
      </div>

      {/* Card */}
      <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-lg ring-1 ring-black/5 border border-slate-100">
        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Title *</label>
            <div className="relative">
              <input
                type="text"
                name="title"
                value={eventData.title}
                onChange={handleChange}
                placeholder="Event name"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {/* Decorative icon */}
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">✏️</span>
            </div>
          </div>

          {/* Date / Time / Duration */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Date *</label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                    /* calendar icon changed below */
                  value={eventData.date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {/* NEW calendar SVG icon */}
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </span>
              </div>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Time</label>
              <input
                type="time"
                name="time"
                value={eventData.time}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Duration (user-entered) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Duration</label>
              <input
                type="text"
                name="duration"
                value={eventData.duration}
                onChange={handleChange}
                placeholder="e.g., 2h 15m"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p className="text-xs text-slate-400">Enter any format you prefer (e.g., “1h”, “45m”, “1h 30m”).</p>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Location *</label>
            <div className="relative">
              <input
                type="text"
                name="venue"
                value={eventData.venue}
                onChange={handleChange}
                placeholder="Event's address"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">📍</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Description *</label>
            <textarea
              name="description"
              value={eventData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Add a short description..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Image Upload (no drag & drop) */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Event Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white hover:file:bg-emerald-700 cursor-pointer"
            />
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 w-full max-w-md rounded-xl object-cover ring-1 ring-slate-200 shadow-sm"
                />
              </div>
            )}
            <p className="text-xs text-slate-400">
              PNG/JPG up to 4MB. (If your backend doesn’t yet store images, this will still submit as base64 under <code>image</code>.)
            </p>
          </div>

          {/* Reminders Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Reminders (optional)</h3>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                type="text"
                value={reminderInput}
                onChange={(e) => setReminderInput(e.target.value)}
                placeholder="Add a reminder (e.g., ‘Email attendees 1 day before’)"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={addReminder}
                className="rounded-xl bg-emerald-600 px-4 py-3 text-white font-semibold hover:bg-emerald-700 active:scale-[.99]"
              >
                Add
              </button>
            </div>

            {eventData.reminders.length > 0 && (
              <ul className="mt-4 space-y-2">
                {eventData.reminders.map((r, idx) => (
                  <li
                    key={`${r}-${idx}`}
                    className="flex items-center justify-between rounded-xl bg-white px-4 py-2 ring-1 ring-slate-200"
                  >
                    <span className="text-slate-700 text-sm">{r}</span>
                    <button
                      type="button"
                      onClick={() => removeReminder(idx)}
                      className="text-slate-400 hover:text-rose-500 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl px-5 py-3 text-white font-semibold shadow-md transition
                ${
                  loading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 active:scale-[.99]"
                }`}
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
