import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../App";

export default function FeedbackEnhanced() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("idea");
  const [email, setEmail] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const maxChars = 500;
  const maxPhotos = 5;

  useEffect(() => {
    const checkEligibility = async () => {
      if (!currentUser) {
        toast.error("Please log in to submit feedback.");
        navigate("/login");
        return;
      }

      try {
        const token = localStorage.getItem("token");

        const eventRes = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const eventData = await eventRes.json();
        setEvent(eventData.event || eventData);

        // ✅ REMOVED: Join check
        // ✅ REMOVED: Event date check

        // Only check if already submitted
        const feedbackRes = await fetch(`${API_BASE_URL}/api/feedback/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const feedbackData = await feedbackRes.json();
        const feedbacks = feedbackData.feedbacks || feedbackData || [];
        const userFeedback = Array.isArray(feedbacks)
          ? feedbacks.find((f) => f.user?._id === currentUser._id || f.user === currentUser._id)
          : null;
        setAlreadySubmitted(!!userFeedback);
      } catch (error) {
        console.error("Error checking eligibility:", error);
        toast.error("Failed to load event details");
      }
    };

    checkEligibility();
  }, [currentUser, eventId, navigate]);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);

    if (photos.length + files.length > maxPhotos) {
      toast.error(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreviews((prev) => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });

    setPhotos((prev) => [...prev, ...validFiles]);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ REMOVED: Join requirement check
    // ✅ REMOVED: Event date check

    if (alreadySubmitted) {
      toast.error("⚠️ You have already submitted feedback for this event.");
      return;
    }

    if (!comment.trim()) {
      toast.error("⚠️ Please enter your feedback before submitting.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You are not authorized. Please log in again.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("rating", rating);
      formData.append("comment", comment);
      formData.append("type", type);
      if (email) formData.append("email", email);

      photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      const res = await fetch(`${API_BASE_URL}/api/feedback/${eventId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send feedback.");

      toast.success("✅ Thank you for your feedback!");
      setTimeout(() => navigate(`/events/${eventId}`), 1500);
    } catch (err) {
      toast.error(err.message || "Error submitting feedback.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ REMOVED: hasJoined check UI
  // ✅ REMOVED: eventHasPassed check UI

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
        <div className="max-w-md text-center bg-white rounded-2xl p-8 shadow-2xl border-2 border-violet-200">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Feedback Already Submitted</h2>
          <p className="text-gray-600 mb-6">You have already submitted feedback for this event. Thank you!</p>
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Back to Event
          </button>
        </div>
      </div>
    );
  }

  // Main form (compact card layout)
  return (
    <div className="min-h-screen flex items-center justify-center p-6 mt-24 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
     <div className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl px-4 sm:px-6 mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-violet-200">
          {/* header */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-1">Event Feedback</h2>
            <p className="text-sm text-gray-500 text-center">
              {event ? event.title : "Your event"} – share a quick review
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* stars */}
            <div className="flex flex-col items-center bg-violet-50 rounded-xl p-4 border-2 border-violet-200">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-3xl transition-transform hover:scale-110"
                    aria-label={`${star} star`}
                  >
                    {star <= (hoverRating || rating) ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">{rating} / 5</p>
            </div>

            {/* segmented tabs (Idea / Complaint / Suggestion) */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setType("idea")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  type === "idea"
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                    : "bg-violet-50 text-gray-700 border-2 border-violet-100"
                }`}
              >
                Idea
              </button>
              <button
                type="button"
                onClick={() => setType("issue")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  type === "issue"
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                    : "bg-violet-50 text-gray-700 border-2 border-violet-100"
                }`}
              >
                Complaint
              </button>
              <button
                type="button"
                onClick={() => setType("suggestion")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  type === "suggestion"
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                    : "bg-violet-50 text-gray-700 border-2 border-violet-100"
                }`}
              >
                Suggestion
              </button>
            </div>

            {/* comment */}
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, maxChars))}
                placeholder="Type your feedback..."
                rows={4}
                className="w-full border-2 border-violet-200 rounded-xl p-3 focus:ring-4 focus:ring-violet-200 focus:border-violet-500 outline-none resize-none transition-all duration-200"
                required
              />
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span className="italic">{comment.trim() ? "" : "Describe your experience"}</span>
                <span>
                  {comment.length}/{maxChars}
                </span>
              </div>
            </div>

            {/* email + attach */}
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="flex-1 border-2 border-violet-200 rounded-xl p-3 focus:ring-4 focus:ring-violet-200 focus:border-violet-500 outline-none transition-all duration-200"
              />

              {/* attach button (opens hidden file input) */}
              <div className="relative">
                <input
                  id="photo-upload-compact"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={photos.length >= maxPhotos}
                />
                <label
                  htmlFor="photo-upload-compact"
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border-2 border-violet-200 cursor-pointer transition ${
                    photos.length >= maxPhotos ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
                  }`}
                >
                  <svg className="h-6 w-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 01-2.828 0L3 11" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 7l3-3m0 0l3 3M7 7v12" />
                  </svg>
                </label>
              </div>
            </div>

            {/* photo previews (small) */}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {photoPreviews.map((preview, i) => (
                  <div key={i} className="relative rounded-md overflow-hidden border-2 border-violet-100">
                    <img src={preview} alt={`preview-${i}`} className="w-full h-20 object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 shadow-md"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>

          <div className="p-4 text-center text-xs text-gray-400">
            By community
          </div>
        </div>
      </div>
    </div>
  );
}