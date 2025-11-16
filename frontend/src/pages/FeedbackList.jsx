import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../App";

function Star({ filled }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 ${filled ? "fill-yellow-400" : "fill-gray-200"}`}
      viewBox="0 0 20 20"
    >
      <path d="M10 15.27 16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
    </svg>
  );
}

function Stars({ value, outOf = 5 }) {
  const full = Math.round(value);
  return (
    <div className="flex items-center gap-1" aria-label={`${value} out of ${outOf} stars`}>
      {Array.from({ length: outOf }).map((_, i) => (
        <Star key={i} filled={i < full} />
      ))}
    </div>
  );
}

function RatingBar({ stars, count, total }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 text-sm text-gray-600 font-medium">{stars}★</div>
      <div className="relative h-3 flex-1 rounded-full bg-violet-100 overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500" 
          style={{ width: `${pct}%` }} 
        />
      </div>
      <div className="w-10 text-right text-sm tabular-nums text-gray-600 font-medium">{count}</div>
    </div>
  );
}

function ReviewCard({ review }) {
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  return (
    <article className="rounded-2xl border-2 border-violet-200 p-6 hover:shadow-lg transition-all duration-200 bg-white">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-lg">
            {review.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900">{review.user?.name || "Anonymous"}</p>
              {review.verified && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold border border-green-200">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {new Date(review.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <Stars value={review.rating} />
      </div>

      {review.title && <h3 className="mt-3 font-semibold text-gray-900">{review.title}</h3>}
      {review.comment && <p className="mt-2 text-gray-700 leading-relaxed">{review.comment}</p>}

      {/* Display Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {review.photos.map((photoUrl, index) => (
              <div
                key={index}
                className="relative group cursor-pointer"
                onClick={() => setLightboxPhoto(photoUrl)}
              >
                <img
                  src={photoUrl}
                  alt={`Review photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-violet-200 hover:border-violet-500 transition"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition rounded-lg flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-2xl">
                    🔍
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 text-white text-3xl hover:text-violet-300 transition z-10"
          >
            ✕
          </button>
          <img
            src={lightboxPhoto}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
}

export default function EventFeedbackPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const EVENT_URL = `${API_BASE_URL}/api/events/${eventId}`;
  const REVIEWS_URL = `${API_BASE_URL}/api/feedback/${eventId}`;

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const [evRes, revRes] = await Promise.all([
          fetch(EVENT_URL, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(REVIEWS_URL, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!evRes.ok) throw new Error("Failed to fetch event");
        if (!revRes.ok) throw new Error("Failed to fetch reviews");

        const ev = await evRes.json();
        const rev = await revRes.json();
        if (isMounted) {
          setEvent(ev);
          const feedbacksArray = Array.isArray(rev) ? rev : (rev?.feedbacks || rev?.items || []);
          setReviews(feedbacksArray);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [EVENT_URL, REVIEWS_URL]);

  const summary = useMemo(() => {
    if (!reviews.length) return { avg: 0, total: 0, buckets: [0, 0, 0, 0, 0] };
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const avg = Math.round((sum / total) * 10) / 10;
    const buckets = [1, 2, 3, 4, 5].map(
      s => reviews.filter(r => Math.round(Number(r.rating)) === s).length
    );
    return { avg, total, buckets };
  }, [reviews]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading feedback…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border-2 border-violet-200">
          <div className="h-1 bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500 rounded-full mb-6" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{event?.title || "Event Feedback"}</h1>
              {event?.date && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span>📅</span>
                  <span>{new Date(event.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {/* FIXED: Navigate to /available-events instead of /events */}
              <Link
                to="/available-events"
                className="px-6 py-3 rounded-xl bg-violet-100 text-violet-700 hover:bg-violet-200 font-semibold transition-all duration-200 border-2 border-violet-300"
              >
                ← Back to Events
              </Link>
              <Link
                to={`/feedback/${eventId}`}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Write a Review
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
          {/* Left: ratings summary */}
          <section className="rounded-2xl border-2 border-violet-200 p-6 bg-white shadow-lg h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Ratings & Reviews</h2>

            <div className="flex items-center gap-6 mb-6 p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200">
              <div className="text-5xl font-bold text-violet-600 tabular-nums">
                {summary.avg.toFixed(1)}
              </div>
              <div>
                <Stars value={summary.avg} />
                <p className="mt-2 text-sm text-gray-600 font-medium">
                  Based on {summary.total} review{summary.total !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[5, 4, 3, 2, 1].map((s) => (
                <RatingBar
                  key={s}
                  stars={s}
                  count={summary.buckets[s - 1]}
                  total={summary.total}
                />
              ))}
            </div>

            <Link
              to={`/feedback/${eventId}`}
              className="block w-full text-center px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Leave Feedback
            </Link>
          </section>

          {/* Right: reviews list */}
          <section className="space-y-4">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border-2 border-violet-200 p-12 text-center bg-white shadow-lg">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-4xl">📝</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600 mb-6">Be the first to share your experience!</p>
                <Link
                  to={`/feedback/${eventId}`}
                  className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Write First Review
                </Link>
              </div>
            ) : (
              reviews.map((r) => <ReviewCard key={r._id || r.id} review={r} />)
            )}
          </section>
        </div>
      </div>
    </div>
  );
}