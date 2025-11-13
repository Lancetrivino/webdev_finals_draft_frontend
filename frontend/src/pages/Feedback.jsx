import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../App";


export default function FeedbackEnhanced() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { eventId } = useParams();

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("idea");
  const [email, setEmail] = useState("");
  const maxChars = 300;

  useEffect(() => {
    if (!currentUser) {
      toast.error("Please log in to submit feedback.");
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const palette = {
    deep: "#08324A",
    navy: "#0B63A3",
    blue: "#0F85D0",
    soft: "#BFE7FF",
    pale: "#DFF3FB",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error(" Please enter your feedback before submitting.");
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
      const res = await fetch(`${API_BASE_URL}/api/feedback/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment, type, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send feedback.");

      toast.success("Thank you for your feedback!");
      setComment("");
      setRating(5);
      setHoverRating(0);
      setType("idea");
      setEmail("");
    } catch (err) {
      toast.error(err.message || "Error submitting feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: `linear-gradient(90deg, ${palette.deep} 0%, ${palette.navy} 50%, ${palette.blue} 100%)` }}
    >
      <div className="max-w-md w-full rounded-2xl shadow-2xl p-6" style={{ background: "white" }}>
        <header className="text-center mb-4">
          <h1 className="text-xl font-extrabold" style={{ color: palette.deep }}>
            Give us your feedback
          </h1>
          <p className="text-sm mt-1 text-gray-500">How would you rate our service?</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Stars */}
          <div className="flex flex-col items-center">
            <div className="flex gap-2" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    aria-checked={active}
                    aria-label={`${star} star`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={loading}
                    className={`text-3xl transition-transform transform focus:outline-none ${
                      active ? "scale-110" : ""
                    }`}
                    style={{ color: active ? "#FFB86B" : "#E6EDF3" }}
                  >
                    ★
                  </button>
                );
              })}
            </div>

            {/* Segmented control */}
            <div className="mt-4 w-full bg-gray-100 rounded-full p-1 flex items-center" role="tablist" aria-label="Feedback type">
              {[
                { key: "idea", label: "Idea" },
                { key: "complaint", label: "Complaint" },
                { key: "suggestion", label: "Suggestion" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={type === item.key}
                  onClick={() => setType(item.key)}
                  className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none ${
                    type === item.key
                      ? "shadow-inner"
                      : "opacity-80"
                  }`}
                  style={
                    type === item.key
                      ? { background: `linear-gradient(180deg, ${palette.blue}, ${palette.navy})`, color: "white" }
                      : { background: "transparent", color: palette.deep }
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Describe experience */}
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="comment">
              Describe your experience
            </label>
            <textarea
              id="comment"
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              maxLength={maxChars}
              placeholder="Type something here..."
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-opacity-60 outline-none resize-none"
              style={{ borderColor: palette.pale }}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">{comment.length}/{maxChars}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="text-sm rounded-md border border-gray-200 px-3 py-1 w-48 focus:ring-1 focus:ring-opacity-60"
                style={{ borderColor: palette.pale }}
              />
            </div>
          </div>

          {/* Attachment + Submit row */}
          <div className="flex items-center gap-3">
            <label htmlFor="file" className="flex items-center gap-2 cursor-pointer select-none">
              <div className="p-2 rounded-md" style={{ background: palette.soft }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" stroke={palette.deep} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 3l4 4" stroke={palette.deep} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm text-gray-600">Attach</span>
              <input id="file" name="file" type="file" className="hidden" />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 font-semibold rounded-xl shadow-md transition-transform transform hover:scale-102 focus:outline-none"
              style={{
                background: `linear-gradient(90deg, ${palette.blue}, ${palette.navy})`,
                color: "white",
              }}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>

          <p className="text-center text-xs text-gray-300 mt-1"></p>
        </form>
      </div>
    </div>
  );
}
