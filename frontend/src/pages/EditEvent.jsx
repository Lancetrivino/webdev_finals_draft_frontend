import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://webdevfinals.onrender.com";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    capacity: 50,
    typeOfEvent: "",
    duration: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [reminders, setReminders] = useState([]);
  const [reminderInput, setReminderInput] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchEvent = async () => {
      if (!currentUser) {
        toast.error("Please log in first.");
        navigate("/login");
        return;
      }

      try {
        const token = currentUser?.token || localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch event");

        const eventData = data.event || data;
        setEvent(eventData);

        // Check if user is authorized to edit
        const isCreator = eventData.createdBy?._id === currentUser._id || eventData.createdBy === currentUser._id;
        const isAdmin = currentUser.role === "Admin";
        
        if (!isCreator && !isAdmin) {
          toast.error("You are not authorized to edit this event");
          navigate("/events");
          return;
        }

        // Format date for input
        const eventDate = new Date(eventData.date);
        const formattedDate = eventDate.toISOString().split("T")[0];

        setFormData({
          title: eventData.title || "",
          description: eventData.description || "",
          date: formattedDate,
          time: eventData.time || "",
          venue: eventData.venue || "",
          capacity: eventData.capacity || 50,
          typeOfEvent: eventData.typeOfEvent || "",
          duration: eventData.duration || "",
        });

        setReminders(eventData.reminders || []);
        if (eventData.image || eventData.imageData) {
          setImagePreview(eventData.image || eventData.imageData);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error(error.message || "Failed to load event");
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addReminder = () => {
    if (reminderInput.trim()) {
      setReminders([...reminders, reminderInput.trim()]);
      setReminderInput("");
    }
  };

  const removeReminder = (index) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.venue.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const token = currentUser?.token || localStorage.getItem("token");
      const submitData = new FormData();

      submitData.append("title", formData.title.trim());
      submitData.append("description", formData.description.trim());
      submitData.append("date", formData.date);
      submitData.append("venue", formData.venue.trim());
      submitData.append("capacity", Number(formData.capacity));
      submitData.append("reminders", JSON.stringify(reminders));

      if (formData.time) submitData.append("time", formData.time);
      if (formData.duration) submitData.append("duration", formData.duration);
      if (formData.typeOfEvent.trim()) submitData.append("typeOfEvent", formData.typeOfEvent.trim());
      if (imageFile) submitData.append("image", imageFile);

      const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update event");

      toast.success("Event updated successfully!");
      navigate(`/events/${id}`);
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(error.message || "Failed to update event");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50" style={{ paddingTop: "calc(72px + 24px)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 py-12 px-4" style={{ paddingTop: "calc(72px + 24px)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-violet-200">
          <div className="h-2 bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500" />
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-bold text-gray-900">Edit Event</h1>
              <button
                onClick={() => navigate(`/events/${id}`)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-violet-200 px-4 py-3 focus:ring-4 focus:ring-violet-200 focus:border-violet-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border-2 border-violet-200 px-4 py-3 focus:ring-4 focus:ring-violet-200 focus:border-violet-500 outline-none resize-none transition-all"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    min={today}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-violet-200 px-4 py-3 focus:ring-4 focus:ring-violet-200 focus:border-violet-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-violet-200 px-4 py-3 focus:ring-4 focus:ring-violet-200 focus:border-violet-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Venue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-violet-200 px-4 py-3 focus:ring-4 focus:ring-violet-200 focus:border-violet-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                    className="w-full rounded-xl border-2 border-violet-200 px-4 py-3 focus:ring-4 focus:ring-violet-200 focus:border-violet-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
                  <input
                    type="text"
                    name="typeOfEvent"
                    value={formData.typeOfEvent}
                    onChange={handleChange}
                    placeholder="e.g., Conference, Workshop, Seminar"
                    className="w-full rounded-xl border-2 border-violet-200 px-4 py-3 focus:ring-4 focus:ring-violet-200 focus:border-violet-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g., 2 hours"
                    className="w-full rounded-xl border-2 border-violet-200 px-4 py-3 focus:ring-4 focus:ring-violet-200 focus:border-violet-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-xl border-2 border-violet-200 px-4 py-3 focus:ring-4 focus:ring-violet-200 focus:border-violet-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-50 file:text-violet-700 file:font-semibold hover:file:bg-violet-100 transition-all"
                />
                {imagePreview && (
                  <div className="mt-4 relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-xl border-2 border-violet-200 shadow-lg" />
                    {imageFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(event?.image || event?.imageData || "");
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-red-600 shadow-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reminders</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={reminderInput}
                    onChange={(e) => setReminderInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addReminder())}
                    placeholder="Add a reminder"
                    className="flex-1 rounded-xl border-2 border-violet-200 px-4 py-3 focus:ring-4 focus:ring-violet-200 focus:border-violet-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={addReminder}
                    className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 shadow-lg transition-all"
                  >
                    Add
                  </button>
                </div>
                {reminders.length > 0 && (
                  <div className="space-y-2">
                    {reminders.map((reminder, index) => (
                      <div key={index} className="flex items-center justify-between bg-violet-50 p-3 rounded-xl border-2 border-violet-200">
                        <span className="text-gray-700">{reminder}</span>
                        <button
                          type="button"
                          onClick={() => removeReminder(index)}
                          className="text-red-500 hover:text-red-700 font-bold text-xl"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t-2 border-violet-200">
                <button
                  type="button"
                  onClick={() => navigate(`/events/${id}`)}
                  className="flex-1 px-6 py-3 bg-white border-2 border-violet-200 text-gray-700 rounded-xl font-semibold hover:bg-violet-50 shadow-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? "Updating..." : "Update Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}