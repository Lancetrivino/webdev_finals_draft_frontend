import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL;

/* ---------- Icons ---------- */
const ClockIcon = (props) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" {...props}>
    <path
      d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 10.268V7a1 1 0 1 0-2 0v6a1 1 0 0 0 .553.894l4 2a1 1 0 1 0 .894-1.788L13 12.268Z"
      fill="currentColor"
    />
  </svg>
);

/* ---------- Time Picker ---------- */
function TimePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState("am");
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!value) return;
    const [h, m] = value.split(":").map(Number);
    const p = h >= 12 ? "pm" : "am";
    setHour(h % 12 === 0 ? 12 : h % 12);
    setMinute(m || 0);
    setPeriod(p);
  }, [value]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const to24h = (h12, p) =>
    p === "am" ? (h12 === 12 ? 0 : h12) : h12 === 12 ? 12 : h12 + 12;
  const commitChange = (h = hour, m = minute, p = period) => {
    if (h == null || m == null || !p) {
      onChange(null); // don't set empty string
      return;
    }
    onChange(
      `${String(to24h(h, p)).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    );
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {value
          ? `${String(hour).padStart(2, "0")}:${String(minute).padStart(
              2,
              "0"
            )} ${period}`
          : "Select time"}
      </button>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        <ClockIcon />
      </span>

      {open && (
        <div className="absolute z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="grid grid-cols-3 gap-2">
            <div className="max-h-60 overflow-y-auto rounded ring-1 ring-slate-200">
              {hours.map((h) => (
                <button
                  key={h}
                  onClick={() => {
                    setHour(h);
                    commitChange(h, minute, period);
                  }}
                  className={`block w-full px-3 py-2 text-sm ${
                    h === hour
                      ? "bg-emerald-600 text-white"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {String(h).padStart(2, "0")}
                </button>
              ))}
            </div>
            <div className="max-h-60 overflow-y-auto rounded ring-1 ring-slate-200">
              {minutes.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMinute(m);
                    commitChange(hour, m, period);
                  }}
                  className={`block w-full px-3 py-2 text-sm ${
                    m === minute
                      ? "bg-emerald-600 text-white"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {String(m).padStart(2, "0")}
                </button>
              ))}
            </div>
            <div className="flex flex-col rounded ring-1 ring-slate-200">
              {["am", "pm"].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    commitChange(hour, minute, p);
                  }}
                  className={`flex-1 px-3 py-2 text-sm ${
                    p === period
                      ? "bg-emerald-600 text-white"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Main CreateEvent ---------- */
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
    reminders: [],
    capacity: 1,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null); // store actual file
  const [reminderInput, setReminderInput] = useState("");

  useEffect(() => {
    if (!currentUser) {
      toast.error("Please log in first.");
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
    if (!file.type.startsWith("image/"))
      return toast.error("Select a valid image file.");
    if (file.size > 4 * 1024 * 1024)
      return toast.error("Max image size is 4MB.");

    setImageFile(file); // save actual file
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result?.toString() || "");
    reader.readAsDataURL(file);
  };

  const addReminder = () => {
    const text = reminderInput.trim();
    if (!text) return;
    setEventData((p) => ({ ...p, reminders: [...p.reminders, text] }));
    setReminderInput("");
  };

  const removeReminder = (i) => {
    setEventData((p) => ({
      ...p,
      reminders: p.reminders.filter((_, idx) => idx !== i),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !eventData.title ||
      !eventData.description ||
      !eventData.date ||
      !eventData.venue ||
      !eventData.capacity
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const token = parsedUser?.token || currentUser?.token;

      if (!token) {
        toast.error("Please log in first.");
        navigate("/login");
        return;
      }

      const formData = new FormData();
      formData.append("title", eventData.title);
      formData.append("description", eventData.description);
      formData.append("date", eventData.date);
      formData.append("venue", eventData.venue);
      if (eventData.time) formData.append("time", eventData.time);
      if (eventData.typeOfEvent)
        formData.append("typeOfEvent", eventData.typeOfEvent);
      formData.append("capacity", Number(eventData.capacity));
      formData.append("reminders", JSON.stringify(eventData.reminders));
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(`${API_BASE}/api/events`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Server Error:", data);
        throw new Error(data.message || "Error creating event.");
      }

      toast.success("✅ Event created successfully!");
      navigate(`/events/${data.event._id}`);
    } catch (err) {
      console.error("❌ Create Event Error:", err);
      toast.error(err.message || "Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-bottom from-slate-50 to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-lg ring-1 ring-black/5">
        <h1 className="mb-6 text-3xl font-bold text-slate-800">Create Event</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Title *
            </label>
            <input
              name="title"
              value={eventData.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
              placeholder="Event name"
            />
          </div>

          {/* Date / Time / Type */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={eventData.date}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Time</label>
              <TimePicker
                value={eventData.time || null} // start as null
                onChange={(t) =>
                  setEventData((prev) => ({ ...prev, time: t || undefined }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Type of Event
              </label>
              <input
                name="typeOfEvent"
                value={eventData.typeOfEvent}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                placeholder="Car meet, seminar..."
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Venue *
            </label>
            <input
              name="venue"
              value={eventData.venue}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
              placeholder="Event location"
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Capacity *
            </label>
            <input
              type="number"
              name="capacity"
              min={1}
              value={eventData.capacity}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
              placeholder="Number of slots"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Description *
            </label>
            <textarea
              name="description"
              value={eventData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
              placeholder="Brief event description"
            />
          </div>

          {/* Image */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Event Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full cursor-pointer text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white hover:file:bg-emerald-700"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-3 h-40 w-full max-w-md rounded-xl object-cover"
              />
            )}
          </div>

          {/* Reminders */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">
              Reminders (optional)
            </h3>
            <div className="flex gap-3">
              <input
                value={reminderInput}
                onChange={(e) => setReminderInput(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                placeholder="Add a reminder..."
              />
              <button
                type="button"
                onClick={addReminder}
                className="rounded-xl bg-emerald-600 px-4 py-3 text-white font-semibold hover:bg-emerald-700"
              >
                Add
              </button>
            </div>
            {eventData.reminders.length > 0 && (
              <ul className="mt-4 space-y-1">
                {eventData.reminders.map((r, i) => (
                  <li
                    key={i}
                    className="flex justify-between rounded-lg bg-white px-4 py-2 shadow-sm"
                  >
                    <span>{r}</span>
                    <button
                      type="button"
                      onClick={() => removeReminder(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
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
            className="w-full rounded-xl bg-emerald-600 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;
