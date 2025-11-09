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
    time: "",
    duration: "",
    venue: "",
    imageData: "",
    reminders: [],
  });
  const [imagePreview, setImagePreview] = useState("");
  const [reminderInput, setReminderInput] = useState("");

  // Redirect if user not logged in
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

    // Validation
    if (!eventData.title.trim() || !eventData.description.trim() || !eventData.date || !eventData.venue.trim()) {
      toast.error("⚠️ Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      // Get token either from localStorage or currentUser object
      const token = localStorage.getItem("token") || currentUser?.token;
      console.log("Token being sent:", token);

      if (!token) {
        toast.error("You must be logged in to create an event.");
        setLoading(false);
        navigate("/login");
        return;
      }

      const body = {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        venue: eventData.venue,
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
      if (!res.ok) throw new Error(data?.message || "Failed to create event.");

      toast.success("🎉 Event created successfully! Pending admin approval.");
      setTimeout(() => navigate("/events"), 1200);
    } catch (err) {
      console.error("Error creating event:", err);
      toast.error(err.message || "Something went wrong while creating the event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-bottom from-slate-50 to-slate-100 px-4 py-12">
      {/* Header */}
      <div className="mx-auto max-w-5xl mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
          Create Event
        </h1>
        <p className="text-slate-500 mt-1">Fill in the details below to create a new event.</p>
      </div>

      {/* Form Card */}
      <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-lg ring-1 ring-black/5 border border-slate-100">
        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Title *</label>
            <input
              type="text"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              placeholder="Event name"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Date / Time / Duration */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Date *</label>
              <input
                type="date"
                name="date"
                value={eventData.date}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Time</label>
              <input
                type="time"
                name="time"
                value={eventData.time}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Duration</label>
              <input
                type="text"
                name="duration"
                value={eventData.duration}
                onChange={handleChange}
                placeholder="e.g., 2h 15m"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Venue */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Venue *</label>
            <input
              type="text"
              name="venue"
              value={eventData.venue}
              onChange={handleChange}
              placeholder="Event's address"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
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
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Event Image (optional)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && <img src={imagePreview} alt="Preview" className="h-40 w-full max-w-md rounded-xl object-cover mt-2" />}
          </div>

          {/* Reminders */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Reminders (optional)</h3>
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={reminderInput}
                onChange={(e) => setReminderInput(e.target.value)}
                placeholder="Add a reminder"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3"
              />
              <button type="button" onClick={addReminder} className="bg-emerald-600 text-white px-4 py-3 rounded-xl">
                Add
              </button>
            </div>
            {eventData.reminders.length > 0 && (
              <ul className="mt-4 space-y-1">
                {eventData.reminders.map((r, idx) => (
                  <li key={idx} className="flex justify-between bg-white p-2 rounded-xl border border-slate-200">
                    <span>{r}</span>
                    <button type="button" onClick={() => removeReminder(idx)} className="text-red-500">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl px-5 py-3 text-white font-semibold shadow-md ${
              loading ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
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
