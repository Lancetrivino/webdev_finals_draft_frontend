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
    time: "",
    venue: "",
    reminders: [],
  });

  const [eventImage, setEventImage] = useState(null); // ✅ simple image upload
  const [reminderInput, setReminderInput] = useState("");

  useEffect(() => {
    if (!currentUser) {
      toast.error("Please log in first to create an event.");
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setEventData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // ✅ simple image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setEventImage(file);
  };

  // ✅ reminder add
  const addReminder = () => {
    if (!reminderInput.trim()) return;
    setEventData((p) => ({
      ...p,
      reminders: [...p.reminders, reminderInput],
    }));
    setReminderInput("");
  };

  const removeReminder = (index) => {
    setEventData((p) => ({
      ...p,
      reminders: p.reminders.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !eventData.title ||
      !eventData.description ||
      !eventData.date ||
      !eventData.time ||
      !eventData.venue
    ) {
      toast.error("⚠️ Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", eventData.title);
      formData.append("description", eventData.description);
      formData.append("date", eventData.date);
      formData.append("time", eventData.time);
      formData.append("venue", eventData.venue);
      formData.append("reminders", JSON.stringify(eventData.reminders));

      if (eventImage) {
        formData.append("image", eventImage);
      }

      const res = await fetch(`${API_BASE}/api/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create event.");

      toast.success("🎉 Event created successfully!");
      setTimeout(() => navigate("/events"), 1000);
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12">
      <div className="mx-auto max-w-4xl mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
          Create event
        </h1>
      </div>

      <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-lg ring-1 ring-black/5 border border-slate-100">
        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Title</label>
            <input
              type="text"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              placeholder="Event name"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                />

                {/* ✅ updated calendar icon */}
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Location</label>
            <input
              type="text"
              name="venue"
              value={eventData.venue}
              onChange={handleChange}
              placeholder="Event address"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              name="description"
              rows={4}
              value={eventData.description}
              onChange={handleChange}
              placeholder="Describe your event..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* ✅ SIMPLE Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Event Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="rounded-xl border border-slate-200 px-4 py-3 bg-slate-50"
            />
          </div>

          {/* Reminders */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Reminders</label>

            <div className="flex gap-2">
              <input
                type="text"
                value={reminderInput}
                onChange={(e) => setReminderInput(e.target.value)}
                placeholder="Add a reminder..."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3"
              />
              <button
                type="button"
                onClick={addReminder}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {eventData.reminders.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-100 px-4 py-2 rounded-lg"
                >
                  <span>{r}</span>
                  <button
                    type="button"
                    onClick={() => removeReminder(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl px-5 py-3 text-white font-semibold shadow-md transition ${
              loading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;
