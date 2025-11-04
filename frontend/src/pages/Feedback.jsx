import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL;

function Feedback() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [feedback, setFeedback] = useState("");
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

    if (!feedback.trim()) {
      toast.error("⚠️ Please enter your feedback before submitting.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send feedback.");

      toast.success("✅ Thank you for your feedback!");
      setFeedback("");
    } catch (err) {
      toast.error(err.message || "Error submitting feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-red from-orange-900 via-orange-700 to-orange-500 p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          We Value Your Feedback
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Share your thoughts or suggestions to help us improve your experience.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            name="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows="5"
            placeholder="Write your feedback here..."
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 outline-none"
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 font-semibold text-white rounded-lg shadow-lg transition-transform transform hover:scale-105 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-right from-orange-800 via-orange-600 to-orange-500 hover:opacity-90"
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
