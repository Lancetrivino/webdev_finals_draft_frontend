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
  const [hasJoined, setHasJoined] = useState(false);
  const [eventHasPassed, setEventHasPassed] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  
  // ✅ Photo upload state
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  
  const maxChars = 500;
  const maxPhotos = 5;

  const palette = {
    deep: "#08324A",
    navy: "#0B63A3",
    blue: "#0F85D0",
    soft: "#BFE7FF",
    pale: "#DFF3FB",
  };

  // Check eligibility
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
          headers: { Authorization: `Bearer ${token}` }
        });
        const eventData = await eventRes.json();
        setEvent(eventData.event || eventData);

        const joined = (eventData.event?.participants || eventData.participants || [])
          .includes(currentUser._id);
        setHasJoined(joined);

        const eventDate = new Date(eventData.event?.date || eventData.date);
        const now = new Date();
        setEventHasPassed(now > eventDate);

        const feedbackRes = await fetch(`${API_BASE_URL}/api/feedback/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const feedbackData = await feedbackRes.json();
        const feedbacks = feedbackData.feedbacks || feedbackData || [];
        const userFeedback = Array.isArray(feedbacks) 
          ? feedbacks.find(f => f.user?._id === currentUser._id || f.user === currentUser._id)
          : null;
        setAlreadySubmitted(!!userFeedback);

      } catch (error) {
        console.error("Error checking eligibility:", error);
        toast.error("Failed to load event details");
      }
    };

    checkEligibility();
  }, [currentUser, eventId, navigate]);

  // ✅ Handle photo selection
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
      reader.onload = (e) => {
        setPhotoPreviews((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });

    setPhotos((prev) => [...prev, ...validFiles]);
  };

  // ✅ Remove photo
  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Submit with photos
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasJoined) {
      toast.error("⚠️ You must join this event before giving feedback.");
      return;
    }

    if (!eventHasPassed) {
      toast.error("⚠️ You can submit feedback after the event ends.");
      return;
    }

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
      // ✅ Create FormData for file upload
      const formData = new FormData();
      formData.append("rating", rating);
      formData.append("comment", comment);
      formData.append("type", type);
      if (email) formData.append("email", email);

      // ✅ Append photos
      photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      const res = await fetch(`${API_BASE_URL}/api/feedback/${eventId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - browser will set it with boundary
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

  // Eligibility gates
  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md text-center bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Join Event First</h2>
          <p className="text-gray-600 mb-6">
            You must join this event before you can leave feedback.
          </p>
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Event
          </button>
        </div>
      </div>
    );
  }

  if (!eventHasPassed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md text-center bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Yet Complete</h2>
          <p className="text-gray-600 mb-2">
            You can submit feedback after the event date:
          </p>
          <p className="text-lg font-semibold text-blue-600 mb-6">
            {event && new Date(event.date).toLocaleDateString()}
          </p>
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Event
          </button>
        </div>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md text-center bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Feedback Already Submitted</h2>
          <p className="text-gray-600 mb-6">
            You have already submitted feedback for this event. Thank you!
          </p>
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Event
          </button>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: `linear-gradient(90deg, ${palette.deep} 0%, ${palette.navy} 50%, ${palette.blue} 100%)` }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Rate Your Experience</h1>
          <p className="text-gray-600">
            Share your thoughts about: <span className="font-semibold">{event?.title}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-6">
            <label className="text-lg font-semibold text-gray-700 mb-3">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-5xl transition-transform hover:scale-110"
                >
                  {star <= (hoverRating || rating) ? "⭐" : "☆"}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">{rating} out of 5 stars</p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, maxChars))}
              placeholder="What did you like? What could be improved?"
              rows={5}
              className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              required
            />
            <p className="text-sm text-gray-500 text-right mt-1">
              {comment.length}/{maxChars} characters
            </p>
          </div>

          {/* ✅ Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Add Photos (optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
                disabled={photos.length >= maxPhotos}
              />
              <label
                htmlFor="photo-upload"
                className={`cursor-pointer ${
                  photos.length >= maxPhotos ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  {photos.length >= maxPhotos
                    ? `Maximum ${maxPhotos} photos reached`
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG up to 10MB ({photos.length}/{maxPhotos})
                </p>
              </label>
            </div>

            {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Feedback Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="idea">💡 Idea/Suggestion</option>
              <option value="issue">⚠️ Issue/Problem</option>
              <option value="praise">👏 Praise</option>
              <option value="other">📝 Other</option>
            </select>
          </div>

          {/* Optional Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
            }`}
          >
            {loading ? "Submitting..." : "📝 Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}