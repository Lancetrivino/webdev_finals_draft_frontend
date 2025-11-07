import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../App";

function Feedback() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { eventId } = useParams(); // ✅ get event ID from URL

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  // ✅ Redirect users who aren’t logged in
  useEffect(() => {
    if (!currentUser) {
      toast.error("Please log in to submit feedback.");
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error("⚠️ Please enter your feedback before submitting.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/feedback/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send feedback.");

      // ✅ Show toast safely before navigation
      toast.success("✅ Thank you for your feedback!");
      setComment("");
      setRating(5);

      // ✅ Optional: small delay before redirecting, so toast renders cleanly
      setTimeout(() => {
        navigate("/events");
      }, 1200);
    } catch (err) {
      toast.error(err.message || "Error submitting feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-right from-orange-900 via-orange-700 to-orange-500 p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Event Feedback
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Your thoughts help us make future events better.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating Selector */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Rating (1–5)
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 outline-none"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} ⭐
                </option>
              ))}
            </select>
          </div>

          {/* Comment box */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Your Feedback
            </label>
            <textarea
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="5"
              placeholder="Write your feedback here..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 outline-none resize-none"
            ></textarea>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 font-semibold text-white rounded-lg shadow-lg transition-transform transform hover:scale-105 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Feedback;
