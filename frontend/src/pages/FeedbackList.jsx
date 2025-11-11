import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../App";

/* ---------- Small, tidy UI helpers ---------- */

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
  return (
    <article className="rounded-2xl border p-4 hover:shadow-sm transition">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
            {review.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-medium">{review.user?.name || "Anonymous"}</p>
            <p className="text-xs text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Stars value={review.rating} />
      </div>
      {review.title && <h3 className="mt-3 font-semibold">{review.title}</h3>}
      {review.comment && <p className="mt-2 text-gray-700">{review.comment}</p>}
    </article>
  );
}

/* ---------- Page ---------- */

export default function EventFeedbackPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Adjust these endpoints to match your API.
  const EVENT_URL = `${API_BASE_URL}/api/events/${eventId}`;
  const REVIEWS_URL = `${API_BASE_URL}/api/events/${eventId}/reviews`;

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
          setReviews(Array.isArray(rev) ? rev : rev?.items ?? []);
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
    return <div className="max-w-6xl mx-auto p-6 text-gray-600">Loading feedback…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{event?.name || "Event"}</h1>
          {event?.date && <p className="text-sm text-gray-500">{new Date(event.date).toLocaleString()}</p>}
        </div>
        <Link
          to={`/feedback/${eventId}/new`}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Write a Review
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-[320px,1fr]">
        {/* Left: ratings summary */}
        <section className="rounded-2xl border p-5">
          <h2 className="text-lg font-semibold">Ratings & Reviews</h2>

          <div className="mt-4 flex items-center gap-4">
            <div className="text-4xl font-bold tabular-nums">{summary.avg.toFixed(1)}</div>
            <div>
              <Stars value={summary.avg} />
              <p className="mt-1 text-sm text-gray-500">{summary.total} review{summary.total !== 1 ? "s" : ""}</p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {[5, 4, 3, 2, 1].map((s, i) => (
              <RatingBar
                key={s}
                stars={s}
                count={summary.buckets[s - 1]}
                total={summary.total}
              />
            ))}
          </div>

          <Link
            to={`/feedback/${eventId}/new`}
            className="mt-6 inline-block w-full rounded-xl bg-gray-900 px-4 py-2 text-center text-white hover:bg-black"
          >
            Leave Feedback
          </Link>
        </section>

        {/* Right: reviews list */}
        <section className="space-y-4">
          {reviews.length === 0 ? (
            <div className="rounded-2xl border p-6 text-gray-600">No reviews yet. Be the first!</div>
          ) : (
            reviews.map((r) => <ReviewCard key={r._id || r.id} review={r} />)
          )}
        </section>
      </div>
    </div>
  );
}
