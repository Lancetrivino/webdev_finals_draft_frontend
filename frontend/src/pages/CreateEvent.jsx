// frontend/src/pages/CreateEvent.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL;

/* ---------- Icons (SVG, no deps) ---------- */
const CalendarIcon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" {...props}>
    <path
      d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm12 6H5v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z"
      fill="currentColor"
    />
  </svg>
);
const ClockIcon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" {...props}>
    <path
      d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 10.268V7a1 1 0 1 0-2 0v6a1 1 0 0 0 .553.894l4 2a1 1 0 1 0 .894-1.788L13 12.268Z"
      fill="currentColor"
    />
  </svg>
);

/* ---------- Time Picker (custom) ---------- */
function TimePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState("am");
  const wrapperRef = useRef(null);

  // Parse incoming value like "07:23"
  useEffect(() => {
    if (!value) return;
    const [h, m] = value.split(":").map((n) => Number(n));
    const p = h >= 12 ? "pm" : "am";
    const hr12 = h % 12 === 0 ? 12 : h % 12;
    setHour(hr12);
    setMinute(m || 0);
    setPeriod(p);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const to24h = (h12, p) => {
    if (p === "am") return h12 === 12 ? 0 : h12;
    return h12 === 12 ? 12 : h12 + 12;
  };

  const renderValue = () => {
    const h = String(hour).padStart(2, "0");
    const m = String(minute).padStart(2, "0");
    return `${h}:${m} ${period}`;
  };

  const commitChange = (h = hour, m = minute, p = period) => {
    const h24 = to24h(h, p);
    const out = `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    onChange(out); // store 24h format in eventData.time
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Display field */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      >
        {value ? renderValue() : <span className="text-slate-400">--:-- --</span>}
      </button>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        <ClockIcon />
      </span>

      {/* Popover */}
      {open && (
        <div className="absolute z-20 mt-2 w-[18rem] rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          <div className="grid grid-cols-3 gap-2">
            {/* Hours */}
            <div className="max-h-60 overflow-y-auto rounded-lg ring-1 ring-slate-200">
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => { setHour(h); commitChange(h, minute, period); }}
                  className={`block w-full px-3 py-2 text-sm ${
                    h === hour ? "bg-emerald-600 text-white" : "hover:bg-slate-50"
                  }`}
                >
                  {String(h).padStart(2, "0")}
                </button>
              ))}
            </div>

            {/* Minutes */}
            <div className="max-h-60 overflow-y-auto rounded-lg ring-1 ring-slate-200">
              {minutes.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMinute(m); commitChange(hour, m, period); }}
                  className={`block w-full px-3 py-2 text-sm ${
                    m === minute ? "bg-emerald-600 text-white" : "hover:bg-slate-50"
                  }`}
                >
                  {String(m).padStart(2, "0")}
                </button>
              ))}
            </div>

            {/* AM/PM */}
            <div className="flex flex-col rounded-lg ring-1 ring-slate-200">
              {["am", "pm"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setPeriod(p); commitChange(hour, minute, p); }}
                  className={`flex-1 px-3 py-2 text-sm ${
                    p === period ? "bg-emerald-600 text-white" : "hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateEvent() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    typeOfEvent: "",
    venue: "",
    imageData: "",
    reminders: [],
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

  const dateInputRef = useRef(null);
  const openNativeDate = () => {
    // Open the native date picker when clicking the calendar icon (supported in modern Chromium)
    if (dateInputRef.current && dateInputRef.current.showPicker) {
      dateInputRef.current.showPicker();
    } else {
      // Fallback: focus the input
      dateInputRef.current?.focus();
    }
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

      const body = {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        venue: eventData.venue,
        time: eventData.time || undefined,        // now 24h "HH:MM"
        typeOfEvent: eventData.typeOfEvent || undefined,
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

      toast.success("Event created successfully! Pending admin approval.");
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
      <div className="mx-auto mb-6 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
          Create event
        </h1>
        <p className="mt-1 text-slate-500">Fill in the details below to create a new event.</p>
      </div>

      {/* Card */}
      <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-lg ring-1 ring-black/5 border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-8 p-6 md:p-10">
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
            </div>
          </div>

          {/* Date / Time / Type */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Date *</label>
              <div className="relative">
                <input
                  ref={dateInputRef}
                  type="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={openNativeDate}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Open calendar"
                >
                  <CalendarIcon />
                </button>
              </div>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Time</label>
              <TimePicker
                value={eventData.time}
                onChange={(t) => setEventData((p) => ({ ...p, time: t }))}
              />
            </div>

            {/* Type of Event */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Type of Event</label>
              <input
                type="text"
                name="typeOfEvent"
                value={eventData.typeOfEvent}
                onChange={handleChange}
                placeholder="e.g., Car meet, Charity event, Seminar"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p className="text-xs text-slate-400">Describe the type of event you are hosting.</p>
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

          {/* Image Upload */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Event Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full cursor-pointer text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white hover:file:bg-emerald-700"
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
          </div>

          {/* Reminders */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-semibold text-slate-700">Reminders (optional)</h3>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                type="text"
                value={reminderInput}
                onChange={(e) => setReminderInput(e.target.value)}
                placeholder="Add a reminder..."
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={addReminder}
                className="rounded-xl bg-emerald-600 px-4 py-3 text-white font-semibold hover:bg-emerald-700 active:scale-95"
              >
                Add
              </button>
            </div>

            {eventData.reminders.length > 0 && (
              <ul className="mt-4 space-y-2">
                {eventData.reminders.map((r, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-white px-4 py-2 ring-1 ring-slate-200"
                  >
                    <span className="text-slate-700 text-sm">{r}</span>
                    <button
                      type="button"
                      onClick={() => removeReminder(idx)}
                      className="text-slate-400 hover:text-red-500 text-sm"
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
              className={`w-full rounded-xl px-5 py-3 text-white font-semibold shadow-md transition ${
                loading ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
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
