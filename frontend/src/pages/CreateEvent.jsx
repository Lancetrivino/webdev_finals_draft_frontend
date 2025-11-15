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

/* ---------- Time Picker (Updated) ---------- */
function TimePicker({ value, onChange, selectedDate }) {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState("am");
  const wrapperRef = useRef(null);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const isToday = selectedDate === todayStr;

  const currentHour24 = today.getHours();
  const currentMinute = today.getMinutes();

  const disablePast = (h12, m, p) => {
    if (!isToday) return false;

    let convert = p === "pm" ? (h12 % 12) + 12 : h12 % 12;
    if (convert < currentHour24) return true;
    if (convert === currentHour24 && m < currentMinute) return true;
    return false;
  };

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
    if (disablePast(h, m, p)) {
      toast.error("You cannot select a past time.");
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
        className="w-full text-left rounded-xl border border-primary-200 bg-white px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {value
          ? `${String(hour).padStart(2, "0")}:${String(minute).padStart(
              2,
              "0"
            )} ${period}`
          : "Select time"}
      </button>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary-700">
        <ClockIcon />
      </span>

      {open && (
        <div className="absolute z-20 mt-2 w-64 rounded-xl border border-primary-200 bg-white p-3 shadow-xl">
          <div className="grid grid-cols-3 gap-2">
            <div className="max-h-60 overflow-y-auto rounded ring-1 ring-primary-200">
              {hours.map((h) => {
                const disabled = disablePast(h, minute, period);
                return (
                  <button
                    key={h}
                    disabled={disabled}
                    onClick={() => {
                      setHour(h);
                      commitChange(h, minute, period);
                    }}
                    className={`block w-full px-3 py-2 text-sm ${
                      disabled
                        ? "opacity-40 cursor-not-allowed"
                        : h === hour
                        ? "bg-primary text-white"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {String(h).padStart(2, "0")}
                  </button>
                );
              })}
            </div>

            <div className="max-h-60 overflow-y-auto rounded ring-1 ring-primary-200">
              {minutes.map((m) => {
                const disabled = disablePast(hour, m, period);
                return (
                  <button
                    key={m}
                    disabled={disabled}
                    onClick={() => {
                      setMinute(m);
                      commitChange(hour, m, period);
                    }}
                    className={`block w-full px-3 py-2 text-sm ${
                      disabled
                        ? "opacity-40 cursor-not-allowed"
                        : m === minute
                        ? "bg-primary text-white"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {String(m).padStart(2, "0")}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col rounded ring-1 ring-primary-200">
              {["am", "pm"].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    commitChange(hour, minute, p);
                  }}
                  className={`flex-1 px-3 py-2 text-sm ${
                    p === period
                      ? "bg-primary text-white"
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
    className="block text-xs font-semibold uppercase tracking-wide text-primary-700"
  >
    {children}
  </label>
);

const Field = ({ children }) => (
  <div className="rounded-xl border border-primary-200 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-primary">
    {children}
  </div>
);

/* ---------- Main CreateEvent ---------- */
function CreateEvent() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

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

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
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
      !eventData.title.trim() ||
      !eventData.description.trim() ||
      !eventData.date ||
      !eventData.venue.trim()
    ) {
      toast.error("Please fill all required fields.");
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

      const formData = new FormData();
      formData.append("title", eventData.title.trim());
      formData.append("description", eventData.description.trim());
      formData.append("date", eventData.date);
      formData.append("venue", eventData.venue.trim());
      formData.append("capacity", Number(eventData.capacity));
      formData.append("reminders", JSON.stringify(eventData.reminders));

      if (eventData.time) formData.append("time", eventData.time);
      if (eventData.typeOfEvent.trim())
        formData.append("typeOfEvent", eventData.typeOfEvent.trim());
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(`${API_BASE_URL}/api/events`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Error creating event.");
        return;
      }

      toast.success("🎉 Event submitted for admin approval!");

      setTimeout(() => navigate("/dashboard", { replace: true }), 1000);
    } catch (err) {
      toast.error("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
  className="relative min-h-screen bg-white overflow-hidden"
>
  {/* Left Side Image */}
  <img
    src="/left-bg.png"
    className="pointer-events-none select-none absolute left-0 top-0 h-full w-auto object-cover opacity-70"
    alt=""
  />

  {/* Right Side Image */}
  <img
    src="/right-bg.png"
    className="pointer-events-none select-none absolute right-0 top-0 h-full w-auto object-cover opacity-70"
    alt=""
  />
      <style>{`
        :root { --c900:#002d54; --c700:#004887; --c500:#0078c1; --c200:#a8daf9; --c100:#cde2ee; }
        .theme { background: var(--c100); }
        .theme .bg-primary { background-color: var(--c500) !important; }
        .theme .bg-primary-dark { background-color: var(--c700) !important; }
        .theme .bg-primary-900 { background-color: var(--c900) !important; }
        .theme .text-primary-900 { color: var(--c900) !important; }
        .theme .text-primary-700 { color: var(--c700) !important; }
        .theme .border-primary-200 { border-color: var(--c200) !important; }
        .theme .bg-muted { background-color: var(--c100) !important; }
        .theme .focus\:ring-primary:focus { box-shadow: 0 0 0 4px rgba(0,120,193,0.18); outline: none; }
      `}</style>

      <div className="h-14 bg-white/70 backdrop-blur-sm ring-1 ring-black/5" />

      <div className="mx-auto max-w-5xl px-4 pb-20 mt-10 relative z-10">
        <h1 className="text-center mt-16 mb-10 text-3xl font-bold tracking-tight text-primary-900">
          Create event
        </h1>

        <div className="rounded-2xl bg-white p-6 shadow-sm border-2"
     style={{
       borderImage: "linear-gradient(90deg, #ffaa9a, #fed9b7, #ffb6c1, #ff8ba0) 1",
     }}
>

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
                  className="w-full bg-transparent text-primary-900 placeholder-primary focus:outline-none"
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
                  className="w-full resize-none bg-transparent text-primary-900 placeholder-primary focus:outline-none"
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
                      <span className="text-primary-700">
                        <CalendarIcon />
                      </span>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={eventData.date}
                        min={today}
                        onChange={handleChange}
                        className="w-full bg-transparent text-primary-900 focus:outline-none"
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
                  selectedDate={eventData.date}
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
                    className="w-full bg-transparent text-primary-900 placeholder-primary focus:outline-none"
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
                    className="w-full bg-transparent text-primary-900 placeholder-primary focus:outline-none"
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
                    className="w-full bg-transparent text-primary-900 placeholder-primary focus:outline-none"
                    required
                  />
                </Field>
              </div>
            </div>

            {/* Upload section */}
            <div className="space-y-3">
              <Label>Upload attachments</Label>

              <div className="flex items-center justify-between rounded-xl border border-primary-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary-100 p-2 text-primary-700">
                    <UploadIcon />
                  </div>
                  <div className="text-sm text-primary-700 flex items-center gap-2">
                    <span>{imageFile ? imageFile.name : "No file selected"}</span>
                    {imageFile && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="ml-2 rounded-full bg-primary-100 p-1 text-primary-700 hover:bg-primary-200"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  + Add files
                </label>
              </div>

              {imagePreview && (
                <div className="relative overflow-hidden rounded-xl border border-primary-200">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-48 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-3 top-3 rounded-full bg-white/80 p-1 text-primary-700"
                  >
                    ✕
                  </button>
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
                    className="w-72 bg-transparent text-primary-900 placeholder-primary focus:outline-none"
                  />
                </Field>
                <button
                  type="button"
                  onClick={addReminder}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Add
                </button>
              </div>

              {!!eventData.reminders.length && (
                <ul className="flex flex-wrap gap-2">
                  {eventData.reminders.map((r, i) => (
                    <li
                      key={i}
                      className="group inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1.5 text-sm text-primary-700"
                    >
                      {r}
                      <button
                        type="button"
                        onClick={() => removeReminder(i)}
                        className="rounded-full p-0.5 text-primary-700 hover:bg-primary-200"
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
                className="rounded-xl border border-primary-200 bg-white px-5 py-3 text-sm font-medium text-primary-700 hover:bg-primary-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:opacity-60"
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
