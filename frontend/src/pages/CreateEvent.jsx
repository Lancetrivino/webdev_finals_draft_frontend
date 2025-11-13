import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

import { API_BASE_URL } from "../App";
/* ---------- Icons ---------- */
const ClockIcon = (props) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" {...props}>
    <path
      d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 10.268V7a1 1 0 1 0-2 0v6a1 1 0 0 0 .553.894l4 2a1 1 0 1 0 .894-1.788L13 12.268Z"
      fill="currentColor"
    />
  </svg>
);

const CalendarIcon = (props) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" {...props}>
    <path
      d="M7 2a1 1 0 0 0-1 1v1H5a3 3 0 0 0-3 3v1h20V7a3 3 0 0 0-3-3h-1V3a1 1 0 1 0-2 0v1H8V3a1 1 0 0 0-1-1ZM22 10H2v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-9Z"
      fill="currentColor"
    />
  </svg>
);

const UploadIcon = (props) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" {...props}>
    <path
      d="M12 3a1 1 0 0 1 1 1v7.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4.007 4.007a1.25 1.25 0 0 1-1.4.243 1.25 1.25 0 0 1-.243-.243L7.05 10.707a1 1 0 0 1 1.414-1.414L10.757 11.586V4a1 1 0 0 1 1-1ZM4 15a1 1 0 1 1 0 2h-.5A1.5 1.5 0 0 0 2 18.5v.5A3 3 0 0 0 5 22h14a3 3 0 0 0 3-3v-.5a1.5 1.5 0 0 0-1.5-1.5H20a1 1 0 1 1 0-2h.5A3.5 3.5 0 0 1 24 18.5V19a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5v-.5A3.5 3.5 0 0 1 3.5 15H4Z"
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
      onChange(null);
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

/* ---------- Small UI helpers ---------- */
const Label = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
  >
    {children}
  </label>
);

const Field = ({ children }) => (
  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-500">
    {children}
  </div>
);

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
    capacity: 50,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
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
    if (file.size > 5 * 1024 * 1024)
      return toast.error("Max image size is 5MB.");

    setImageFile(file);
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

    // ✅ Frontend validation
    if (
      !eventData.title?.trim() ||
      !eventData.description?.trim() ||
      !eventData.date ||
      !eventData.venue?.trim()
    ) {
      toast.error(
        "Please fill all required fields (title, description, date, venue)."
      );
      return;
    }

    if (eventData.capacity < 1) {
      toast.error("Capacity must be at least 1.");
      return;
    }

    setLoading(true);

    try {
      const token = currentUser?.token;

      if (!token) {
        toast.error("Please log in first.");
        navigate("/login");
        return;
      }

      // ✅ Build FormData correctly
      const formData = new FormData();

      formData.append("title", eventData.title.trim());
      formData.append("description", eventData.description.trim());
      formData.append("date", eventData.date); // YYYY-MM-DD
      formData.append("venue", eventData.venue.trim());
      formData.append("capacity", Number(eventData.capacity));
      formData.append("reminders", JSON.stringify(eventData.reminders));

      // ✅ Only append optional fields if they have values
      if (eventData.time) {
        formData.append("time", eventData.time);
      }
      if (eventData.typeOfEvent?.trim()) {
        formData.append("typeOfEvent", eventData.typeOfEvent.trim());
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      // ✅ Debug log (remove in production)
      console.log("📤 Sending event data:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      const res = await fetch(`${API_BASE_URL}/api/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ✅ Do NOT set Content-Type - browser sets it automatically with boundary
        },
        body: formData,
      });

      const data = await res.json();
      console.log("📥 Server response:", data);

      if (!res.ok) {
        console.error("❌ Server Error:", data);
        const errorMessage =
          data.message || data.details || "Error creating event.";
        toast.error(errorMessage);
        return;
      }

      // ✅ Validate response structure
      if (!data?.event?._id) {
        console.error("❌ Invalid response structure:", data);
        toast.error("Server returned invalid response");
        return;
      }

      toast.success("✅ Event created successfully!");
      setTimeout(() => {
        navigate(`/events/${data.event._id}`);
      }, 100);
    } catch (err) {
      console.error("❌ Create Event Error:", err);

      if (err.name === "TypeError" && err.message.includes("fetch")) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(err.message || "Server error.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar strip for subtle depth */}
      <div className="h-14 bg-white/70 backdrop-blur-sm ring-1 ring-black/5" />

      <div className="mx-auto max-w-5xl px-4 pb-20">
        <h1 className="mt-8 mb-6 text-3xl font-bold tracking-tight text-slate-800">
          Create event
        </h1>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title + Description */}
            <div className="space-y-3">
              <Label htmlFor="title">Title *</Label>
              <Field>
                <input
                  id="title"
                  name="title"
                  value={eventData.title}
                  onChange={handleChange}
                  placeholder="Event name"
                  className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
                  required
                />
              </Field>

              <Label htmlFor="description">Description *</Label>
              <Field>
                <textarea
                  id="description"
                  name="description"
                  value={eventData.description}
                  onChange={handleChange}
                  placeholder="Add a short description"
                  rows={3}
                  className="w-full resize-none bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
                  required
                />
              </Field>
            </div>

            {/* Date / Time / Capacity / Type */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <Label htmlFor="date">Day *</Label>
                <div className="relative">
                  <Field>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">
                        <CalendarIcon />
                      </span>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={eventData.date}
                        onChange={handleChange}
                        className="w-full bg-transparent text-slate-800 focus:outline-none"
                        required
                      />
                    </div>
                  </Field>
                </div>
              </div>

              <div>
                <Label>Time</Label>
                <TimePicker
                  value={eventData.time}
                  onChange={(val) =>
                    setEventData((p) => ({ ...p, time: val || "" }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Field>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    min={1}
                    value={eventData.capacity}
                    onChange={handleChange}
                    placeholder="50"
                    className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="typeOfEvent">Type of event</Label>
                <Field>
                  <input
                    id="typeOfEvent"
                    name="typeOfEvent"
                    value={eventData.typeOfEvent}
                    onChange={handleChange}
                    placeholder="e.g., Conference, Workshop, Seminar"
                    className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="venue">Location *</Label>
                <Field>
                  <input
                    id="venue"
                    name="venue"
                    value={eventData.venue}
                    onChange={handleChange}
                    placeholder="Venue"
                    className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
                    required
                  />
                </Field>
              </div>
            </div>

            {/* Upload section */}
            <div className="space-y-3">
              <Label>Upload attachments</Label>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
                    <UploadIcon />
                  </div>
                  <div className="text-sm text-slate-600">
                    {imageFile ? imageFile.name : "No file selected"}
                  </div>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  + Add files
                </label>
              </div>

              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                You can also drop your files here
              </div>

              {imagePreview && (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Reminders */}
            <div className="space-y-3">
              <Label>Reminders</Label>
              <div className="flex gap-2">
                <Field>
                  <input
                    value={reminderInput}
                    onChange={(e) => setReminderInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addReminder();
                      }
                    }}
                    placeholder="Add reminder"
                    className="w-72 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </Field>
                <button
                  type="button"
                  onClick={addReminder}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Add
                </button>
              </div>

              {!!eventData.reminders.length && (
                <ul className="flex flex-wrap gap-2">
                  {eventData.reminders.map((r, i) => (
                    <li
                      key={i}
                      className="group inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                    >
                      {r}
                      <button
                        type="button"
                        onClick={() => removeReminder(i)}
                        className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                        aria-label="Remove reminder"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;
