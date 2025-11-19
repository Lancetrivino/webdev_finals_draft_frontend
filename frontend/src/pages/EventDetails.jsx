import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../App";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [eventHasPassed, setEventHasPassed] = useState(false);
  const [alreadySubmittedFeedback, setAlreadySubmittedFeedback] = useState(false);

  // Reviews toast panel state
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Write-review inline form state inside panel
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewEmail, setReviewEmail] = useState(currentUser?.email || "");
  const [submittingReview, setSubmittingReview] = useState(false);

  // fetch event
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const token = currentUser?.token || localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.status === 401 || res.status === 403) {
          toast.error("Your session expired. Please log in again.");
          navigate("/login");
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch event");
        const eventData = data.event ?? data;
        setEvent(eventData);

        if (currentUser) {
          const participantIds = eventData.participants || [];
          const userId = currentUser._id || currentUser.id;
          setJoined(participantIds.includes(userId));
        }
      } catch (err) {
        console.error("❌ Error fetching event details:", err);
        toast.error(err.message || "Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate, currentUser]);

  // feedback eligibility
  useEffect(() => {
    if (!event || !currentUser) return;

    const eventDate = new Date(event.date);
    const now = new Date();
    setEventHasPassed(now > eventDate);

    const checkFeedback = async () => {
      try {
        const token = currentUser?.token || localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/feedback/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          const userId = currentUser._id || currentUser.id;
          const found = (data.feedbacks ?? data ?? []).find(
            (f) => (f.user?._id === userId || f.user === userId)
          );
          setAlreadySubmittedFeedback(!!found);
        }
      } catch (err) {
        console.error("Error checking feedback:", err);
      }
    };

    checkFeedback();
  }, [event, currentUser, id]);

  // fetch reviews and open panel
  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const token = currentUser?.token || localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/feedback/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      const feedbacks = data.feedbacks ?? data ?? [];
      setReviews(Array.isArray(feedbacks) ? feedbacks : []);
      setShowReviews(true);
      setShowWriteForm(false); 
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      toast.error(err.message || "Failed to load reviews.");
      setShowReviews(true);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleOpenWrite = () => {
    if (!currentUser) {
      toast.info("Please log in to write a review.");
      navigate("/login");
      return;
    }

    // ✅ REMOVED: Join requirement check
    // ✅ REMOVED: Event has passed check
    
    if (alreadySubmittedFeedback) {
      toast.info("You've already submitted feedback for this event.");
      return;
    }
    setShowWriteForm((s) => !s);
  };

  const submitReview = async (e) => {
    e?.preventDefault();
    if (!currentUser) {
      toast.info("Please login to submit a review.");
      navigate("/login");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please write your review before submitting.");
      return;
    }

    setSubmittingReview(true);
    try {
      const token = currentUser?.token || localStorage.getItem("token");
      const formData = new FormData();
      formData.append("rating", reviewRating);
      formData.append("comment", reviewComment);
      formData.append("type", "review");
      if (reviewEmail) formData.append("email", reviewEmail);

      const res = await fetch(`${API_BASE_URL}/api/feedback/${id}`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");

      const newReview = {
        comment: reviewComment,
        rating: reviewRating,
        createdAt: new Date().toISOString(),
        user: {
          name: currentUser.name || currentUser.username || "You",
          avatar: currentUser.avatar || null,
        },
      };
      setReviews((prev) => [newReview, ...prev]);
      toast.success("Thank you – your review was submitted!");
      setAlreadySubmittedFeedback(true);
      setShowWriteForm(false);
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      console.error("Failed to submit review:", err);
      toast.error(err.message || "Error submitting review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleJoin = async () => {
    if (!currentUser) {
      toast.info("Please login first.");
      navigate("/login");
      return;
    }
    setProcessing(true);
    try {
      const token = currentUser?.token || localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/events/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to join event");
      toast.success("🎉 " + (data.message || "Joined!"));
      setJoined(true);
      setEvent((prev) => ({ ...prev, participants: [...(prev.participants || []), currentUser._id || currentUser.id] }));
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error joining.");
    } finally {
      setProcessing(false);
    }
  };

  const handleLeave = async () => {
    if (!currentUser) {
      toast.info("Please login first.");
      navigate("/login");
      return;
    }
    if (!window.confirm("Are you sure you want to leave this event?")) return;
    setProcessing(true);
    try {
      const token = currentUser?.token || localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/events/${id}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to leave event");
      toast.success(data.message || "Left event");
      setJoined(false);
      const userId = currentUser._id || currentUser.id;
      setEvent((prev) => ({ ...prev, participants: (prev.participants || []).filter((u) => u !== userId) }));
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error leaving.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50" style={{ paddingTop: "calc(var(--nav-height,72px) + 24px)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading event details...</p>
        </div>
      </div>
    );

  if (!event)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50" style={{ paddingTop: "calc(var(--nav-height,72px) + 24px)" }}>
        <div className="text-center bg-white rounded-2xl p-12 shadow-2xl border-2 border-violet-200">
          <div className="text-6xl mb-4">😞</div>
          <p className="text-xl text-gray-600 font-semibold">Event not found.</p>
        </div>
      </div>
    );

  const {
    title,
    description,
    date,
    venue,
    time,
    duration,
    imageData,
    image,
    reminders,
    status,
    capacity,
    participants,
    averageRating,
    totalReviews,
  } = event;

  const remainingSlots = capacity ? capacity - (participants?.length || 0) : null;
  const isFull = remainingSlots !== null && remainingSlots <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 py-12 px-4" style={{ paddingTop: "calc(var(--nav-height,72px) + 24px)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-visible border-2 border-violet-200">
          <div className="h-2 bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500" />

          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
                <div className="flex items-center gap-2 text-violet-600">
                  <span>📍</span>
                  <span className="text-lg font-medium">{venue || "–"}</span>
                </div>
              </div>

              {status && (
                <span className={`px-5 py-2 text-sm rounded-full font-bold shadow-lg ${status.toLowerCase() === "approved" ? "bg-green-100 text-green-700 border-green-300" : status.toLowerCase() === "pending" ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-red-100 text-red-700 border-red-300"}`}>
                  {status}
                </span>
              )}
            </div>

            {(imageData || image) && <div className="rounded-2xl overflow-hidden mb-8 shadow-xl border-2 border-violet-200"><img src={imageData || image} alt={title} className="w-full max-h-96 object-cover" /></div>}

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-violet-50 rounded-xl p-6 border-2 border-violet-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">📅</div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Date</p>
                      <p className="text-gray-900 font-semibold">{date ? new Date(date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "–"}</p>
                    </div>
                  </div>

                  {time && <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">⏰</div><div><p className="text-xs text-gray-600 font-medium">Time</p><p className="text-gray-900 font-semibold">{time}</p></div></div>}
                  {duration && <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">🕐</div><div><p className="text-xs text-gray-600 font-medium">Duration</p><p className="text-gray-900 font-semibold">{duration}</p></div></div>}
                </div>
              </div>

              <div className="bg-violet-50 rounded-xl p-6 border-2 border-violet-200">
                <div className="space-y-4">
                  {remainingSlots !== null && <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">👥</div><div><p className="text-xs text-gray-600 font-medium">Availability</p><p className={`font-bold text-lg ${isFull ? "text-red-600" : "text-green-600"}`}>{isFull ? "Event is Full" : `${remainingSlots} slots remaining`}</p></div></div>}
                  {averageRating > 0 && totalReviews > 0 && <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">⭐</div><div><p className="text-xs text-gray-600 font-medium">Rating</p><div className="flex items-center gap-2"><span className="text-2xl font-bold text-violet-600">{averageRating.toFixed(1)}</span><span className="text-gray-600">({totalReviews} {totalReviews === 1 ? "review" : "reviews"})</span></div></div></div>}
                  {currentUser && joined && <div className="flex items-center gap-3 p-3 bg-green-100 rounded-lg border-2 border-green-300"><div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white shadow-lg">✓</div><div><p className="text-xs text-green-600 font-medium">Status</p><p className="font-bold text-green-700">You've joined this event</p></div></div>}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About This Event</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-violet-50 p-6 rounded-xl border-2 border-violet-200">{description || "No description provided."}</p>
            </div>

            {reminders && reminders.length > 0 && (<div className="mb-8"><h2 className="text-xl font-bold text-gray-900 mb-3">Important Reminders</h2><ul className="space-y-2">{reminders.map((r, i) => <li key={i} className="flex items-start gap-3 bg-violet-50 p-4 rounded-xl border-2 border-violet-200"><span className="text-violet-600 font-bold">•</span><span className="text-gray-700">{r}</span></li>)}</ul></div>)}

            {/* ✅ IMPROVED ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex gap-3 flex-1 flex-wrap">
                {/* Not logged in */}
                {!currentUser && (
                  <button 
                    onClick={() => navigate("/login")} 
                    className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:from-violet-700 hover:to-purple-700 transition-all"
                  >
                    Login to Join
                  </button>
                )}

                {/* Event is full and not joined */}
                {currentUser && isFull && !joined && (
                  <div className="px-6 py-3 bg-gray-200 text-gray-600 rounded-xl font-semibold flex items-center">
                    🚫 Event is Full
                  </div>
                )}

                {/* Can join */}
                {currentUser && !isFull && !joined && (
                  <button 
                    onClick={handleJoin} 
                    disabled={processing} 
                    className={`px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold shadow-lg transition-all ${processing ? "opacity-50 cursor-not-allowed" : "hover:from-green-700 hover:to-green-800"}`}
                  >
                    {processing ? "Joining..." : "✓ Join Event"}
                  </button>
                )}

                {/* Already joined - show status badge AND leave button */}
                {currentUser && joined && (
                  <>
                    <div className="px-6 py-3 bg-green-100 border-2 border-green-300 text-green-700 rounded-xl font-semibold flex items-center gap-2">
                      ✓ You're Attending
                    </div>
                    <button 
                      onClick={handleLeave} 
                      disabled={processing} 
                      className={`px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold shadow-lg transition-all ${processing ? "opacity-50 cursor-not-allowed" : "hover:from-red-700 hover:to-red-800"}`}
                    >
                      {processing ? "Leaving..." : "✕ Leave Event"}
                    </button>
                  </>
                )}
              </div>

              <div className="flex gap-3 items-center flex-wrap">
                {/* Write Review button - ✅ NO RESTRICTIONS */}
                {currentUser && !alreadySubmittedFeedback && (
                  <button 
                    onClick={() => navigate(`/feedback/${id}`)} 
                    className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                  >
                    ⭐ Write Review
                  </button>
                )}

                {/* View reviews button */}
                <button 
                  onClick={fetchReviews} 
                  className="px-5 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold shadow-lg hover:from-gray-700 hover:to-gray-800 transition-all" 
                  title={`View ${totalReviews || 0} reviews`}
                >
                  📝 Reviews ({totalReviews || 0})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews toast panel */}
      {showReviews && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowReviews(false)} />

          <div className="relative pointer-events-auto mb-8 w-[min(920px,95%)] max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-2xl border-2 border-violet-200">
            {/* header */}
            <div className="flex items-center justify-between p-4 border-b border-violet-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow">📝</div>
                <div>
                  <div className="font-bold text-gray-900">Reviews</div>
                  <div className="text-xs text-gray-500">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenWrite}
                  className="px-3 py-1.5 bg-violet-50 rounded-lg border-2 border-violet-100 font-semibold hover:bg-violet-100 transition"
                >
                  {showWriteForm ? "Cancel" : "Write a Review"}
                </button>

                <button onClick={() => setShowReviews(false)} className="px-3 py-1.5 text-sm bg-violet-50 rounded-lg border-2 border-violet-100 font-semibold hover:bg-violet-100 transition">Close</button>
              </div>
            </div>

            {/* body */}
            <div className="p-4 overflow-auto space-y-3 max-h-[62vh]">
              {/* inline write form */}
              {showWriteForm && (
                <form onSubmit={submitReview} className="p-4 rounded-xl border-2 border-violet-100 bg-violet-50/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold">Your Rating</div>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setReviewRating(n)}
                          onMouseEnter={() => setReviewHover(n)}
                          onMouseLeave={() => setReviewHover(0)}
                          className="text-2xl"
                          aria-label={`${n} star`}
                        >
                          {n <= (reviewHover || reviewRating) ? "⭐" : "☆"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value.slice(0, 1000))}
                    placeholder="Write your review here..."
                    rows={4}
                    className="w-full border-2 border-violet-100 rounded-xl p-3 focus:ring-4 focus:ring-violet-100 outline-none resize-none"
                    required
                  />

                  <input
                    type="email"
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    placeholder="Email (optional)"
                    className="w-full border-2 border-violet-100 rounded-xl p-3 focus:ring-4 focus:ring-violet-100 outline-none"
                  />

                  <div className="flex items-center justify-end gap-3">
                    <button type="button" onClick={() => setShowWriteForm(false)} className="px-4 py-2 bg-white border-2 border-violet-100 rounded-xl">
                      Cancel
                    </button>
                    <button type="submit" disabled={submittingReview} className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold">
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              )}

              {/* reviews list (or empty state) */}
              {loadingReviews && <div className="text-center py-6 text-gray-500">Loading reviews...</div>}

              {!loadingReviews && reviews.length === 0 && <div className="text-center py-6 text-gray-500">No reviews yet. Be the first to review!</div>}

              {!loadingReviews && reviews.map((r, idx) => {
                const reviewerName = r.user?.name || r.user?.username || r.name || "Anonymous";
                const text = r.comment || r.text || r.message || "";
                const stars = Number(r.rating ?? r.stars ?? 0);
                const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : (r.date ? new Date(r.date).toLocaleDateString() : "");

                return (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl border-2 border-violet-100 bg-white shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center overflow-hidden border-2 border-violet-200">
                      {r.user?.avatar ? <img src={r.user.avatar} alt={reviewerName} className="w-full h-full object-cover" /> : <div className="text-violet-600 font-bold">{(reviewerName || "A").charAt(0)}</div>}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold text-gray-900">{reviewerName}</div>
                          <div className="text-xs text-gray-500">{dateStr}</div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => <svg key={i} className={`w-4 h-4 ${i <= stars ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                        </div>
                      </div>

                      <div className="mt-2 text-gray-700 leading-relaxed">
                        {text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;