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
      <div className="w-8 text-sm text-gray-600">{stars}★</div>
      <div className="relative h-2 flex-1 rounded bg-gray-100">
        <div className="absolute inset-y-0 left-0 rounded bg-yellow-400" style={{ width: `${pct}%` }} />
      </div>
      <div className="w-10 text-right text-sm tabular-nums text-gray-600">{count}</div>
    </div>
  );
}

function ReviewCard({ review }) {
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  return (
    <article className="rounded-2xl border p-4 hover:shadow-sm transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow">
            {review.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{review.user?.name || "Anonymous"}</p>
              {review.verified && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Stars value={review.rating} />
      </div>

      {review.title && <h3 className="mt-3 font-semibold">{review.title}</h3>}
      {review.comment && <p className="mt-2 text-gray-700">{review.comment}</p>}

      {/* ✅ Display Photos */}
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
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition"
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

      {/* ✅ Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
          >
            ✕
          </button>
          <img
            src={lightboxPhoto}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
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
          // Handle both array and object with feedbacks property
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
      <div className="max-w-6xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading feedback…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{event?.title || "Event Feedback"}</h1>
          {event?.date && <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>}
        </div>
        <Link
          to={`/feedback/${eventId}`}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Write a Review
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-[320px,1fr]">
        {/* Left: ratings summary */}
        <section className="rounded-2xl border p-5 bg-white">
          <h2 className="text-lg font-semibold">Ratings & Reviews</h2>

          <div className="mt-4 flex items-center gap-4">
            <div className="text-4xl font-bold tabular-nums">{summary.avg.toFixed(1)}</div>
            <div>
              <Stars value={summary.avg} />
              <p className="mt-1 text-sm text-gray-500">{summary.total} review{summary.total !== 1 ? "s" : ""}</p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
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
            className="mt-6 inline-block w-full rounded-xl bg-gray-900 px-4 py-2 text-center text-white hover:bg-black"
          >
            Leave Feedback
          </Link>
        </section>

        {/* Right: reviews list */}
        <section className="space-y-4">
          {reviews.length === 0 ? (
            <div className="rounded-2xl border p-6 text-gray-600 bg-white text-center">
              <div className="text-4xl mb-2">📝</div>
              <p>No reviews yet. Be the first!</p>
            </div>
          ) : (
            reviews.map((r) => <ReviewCard key={r._id || r.id} review={r} />)
          )}
        </section>
      </div>
    </div>
  );
}