import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../App";

const IconCalendar = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="5" width="18" height="16" rx="2" ry="2" />
    <path d="M16 3v4M8 3v4" />
  </svg>
);
const IconClock = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v6l4 2" />
  </svg>
);
const IconDuration = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2v6" />
    <path d="M20.95 11A8.95 8.95 0 1111 3.05" />
  </svg>
);
const IconUsers = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconStar = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className={className} fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
const IconCheck = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M5 10l3 3L16 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconLeave = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);
const IconDetails = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 20h9" />
    <path d="M12 4h9" />
    <path d="M3 7h.01" />
    <path d="M3 12h.01" />
    <path d="M3 17h.01" />
  </svg>
);
const IconReviews = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

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

  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [showWriteForm, setShowWriteForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewEmail, setReviewEmail] = useState(currentUser?.email || "");
  const [submittingReview, setSubmittingReview] = useState(false);

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
        console.error("Error fetching event details:", err);
        toast.error(err.message || "Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate, currentUser]);

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
      toast.success(data.message || "Joined");
      setJoined(true);
      setEvent((prev) => ({ ...prev, participants: [...(prev.participants || []), currentUser._id || currentUser.id] }));
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error joining.");
    } finally {
      setProcessing(false);
    }
  };

  const confirmLeave = () =>
    new Promise((resolve) => {
      toast(
        ({ closeToast }) => (
          <div className="p-3 max-w-xs">
            <div className="text-sm text-gray-900 mb-3">Are you sure you want to leave this event?</div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  resolve(false);
                  closeToast();
                }}
                className="px-3 py-1 rounded border border-gray-200 bg-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resolve(true);
                  closeToast();
                }}
                className="px-3 py-1 rounded bg-red-600 text-white text-sm"
              >
                Leave
              </button>
            </div>
          </div>
        ),
        { autoClose: false, closeOnClick: false }
      );
    });

  const handleLeave = async () => {
    if (!currentUser) {
      toast.info("Please login first.");
      navigate("/login");
      return;
    }

    const confirmed = await confirmLeave();
    if (!confirmed) return;

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
        <div className="text-center bg-white rounded-2xl p-12 shadow-2xl border border-gray-100">
          <svg className="w-14 h-14 mx-auto mb-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 9v2"/><path d="M12 15h.01"/></svg>
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
        <div className="bg-white rounded-3xl shadow-md overflow-visible border border-gray-100">
          <div className="h-2 rounded-t-3xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{title}</h1>
                <div className="flex items-center gap-2 text-violet-600">
                  <div className="p-1 bg-violet-100 rounded-md">
                    <IconUsers className="w-4 h-4 text-violet-600" />
                  </div>
                  <span className="text-lg font-medium text-gray-700">{venue || "–"}</span>
                </div>
              </div>

              {status && (
                <span className={`px-4 py-2 text-sm rounded-full font-semibold shadow ${status.toLowerCase() === "approved" ? "bg-green-50 text-green-700 border" : status.toLowerCase() === "pending" ? "bg-amber-50 text-amber-700 border" : "bg-red-50 text-red-700 border"}`}>
                  {status}
                </span>
              )}
            </div>

            {(imageData || image) && (
              <div className="rounded-2xl overflow-hidden mb-8 shadow-sm border border-gray-100">
                <img src={imageData || image} alt={title} className="w-full max-h-96 object-cover" />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="rounded-xl p-6 border border-gray-100 bg-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-700 shadow-sm">
                      <IconCalendar className="w-5 h-5 text-violet-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Date</p>
                      <p className="text-gray-900 font-semibold">{date ? new Date(date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "–"}</p>
                    </div>
                  </div>

                  {time && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-700 shadow-sm">
                        <IconClock className="w-5 h-5 text-violet-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Start time</p>
                        <p className="text-gray-900 font-semibold">{time}</p>
                      </div>
                    </div>
                  )}

                  {duration && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-700 shadow-sm">
                        <IconDuration className="w-5 h-5 text-violet-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Duration</p>
                        <p className="text-gray-900 font-semibold">{duration}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl p-6 border border-gray-100 bg-white">
                <div className="space-y-4">
                  {remainingSlots !== null && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-700 shadow-sm">
                        <IconUsers className="w-5 h-5 text-violet-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Availability</p>
                        <p className={`font-bold text-lg ${isFull ? "text-red-600" : "text-green-600"}`}>{isFull ? "Event is full" : `${remainingSlots} slots remaining`}</p>
                      </div>
                    </div>
                  )}

                  {averageRating > 0 && totalReviews > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-700 shadow-sm">
                        <IconStar className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Rating</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-violet-700">{averageRating.toFixed(1)}</span>
                          <span className="text-gray-600">({totalReviews} {totalReviews === 1 ? "review" : "reviews"})</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentUser && joined && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                        <IconCheck className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-green-700 font-medium">Status</p>
                        <p className="font-bold text-green-800">You are attending</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About this event</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-6 rounded-lg border border-gray-100">{description || "No description provided."}</p>
            </div>

            {reminders && reminders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Important reminders</h2>
                <ul className="space-y-2">
                  {reminders.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="w-3 h-3 rounded-full bg-violet-500 mt-2" />
                      <span className="text-gray-700">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex gap-3 flex-1 flex-wrap">
                {!currentUser && (
                  <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-semibold shadow-sm hover:opacity-95 transition"
                  >
                    Sign in to join
                  </button>
                )}

                {currentUser && isFull && !joined && (
                  <div className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg font-semibold flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"/></svg>
                    Event is full
                  </div>
                )}

                {currentUser && !isFull && !joined && (
                  <button
                    onClick={handleJoin}
                    disabled={processing}
                    className={`px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold shadow-sm transition ${processing ? "opacity-50 cursor-not-allowed" : "hover:brightness-95"}`}
                  >
                    {processing ? "Joining..." : (
                      <span className="flex items-center gap-2">
                        <IconCheck className="w-4 h-4 text-white" />
                        <span>Join event</span>
                      </span>
                    )}
                  </button>
                )}

                {currentUser && joined && (
                  <>
                    <div className="px-6 py-3 bg-green-50 border border-green-100 text-green-800 rounded-lg font-semibold flex items-center gap-2">
                      <IconCheck className="w-4 h-4 text-green-800" />
                      You are attending
                    </div>
                    <button
                      onClick={handleLeave}
                      disabled={processing}
                      className={`px-6 py-3 bg-red-600 text-white rounded-lg font-semibold shadow-sm transition ${processing ? "opacity-50 cursor-not-allowed" : "hover:brightness-95"}`}
                    >
                      {processing ? "Leaving..." : (
                        <span className="flex items-center gap-2">
                          <IconLeave className="w-4 h-4 text-white" />
                          <span>Leave event</span>
                        </span>
                      )}
                    </button>
                  </>
                )}
              </div>

              <div className="flex gap-3 items-center flex-wrap">
                {currentUser && !alreadySubmittedFeedback && (
                  <button
                    onClick={() => navigate(`/feedback/${id}`)}
                    className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-sm hover:brightness-95 transition"
                  >
                    <span className="flex items-center gap-2">
                      <IconStar className="w-4 h-4 text-white" />
                      <span>Write review</span>
                    </span>
                  </button>
                )}

                <button
                  onClick={fetchReviews}
                  className="px-5 py-3 bg-gray-800 text-white rounded-lg font-semibold shadow-sm hover:opacity-95 transition flex items-center gap-2"
                  title={`View ${totalReviews || 0} reviews`}
                >
                  <IconReviews className="w-4 h-4 text-white" />
                  <span>Reviews ({totalReviews || 0})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReviews && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowReviews(false)} />

          <div className="relative pointer-events-auto mb-8 w-[min(920px,95%)] max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-700 font-bold shadow-sm"><IconReviews className="w-5 h-5 text-violet-700" /></div>
                <div>
                  <div className="font-semibold text-gray-900">Reviews</div>
                  <div className="text-xs text-gray-500">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenWrite}
                  className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 font-semibold hover:bg-gray-100 transition"
                >
                  {showWriteForm ? "Cancel" : "Write a review"}
                </button>

                <button onClick={() => setShowReviews(false)} className="px-3 py-1.5 text-sm bg-gray-50 rounded-lg border border-gray-100 font-semibold hover:bg-gray-100 transition">Close</button>
              </div>
            </div>

            <div className="p-4 overflow-auto space-y-3 max-h-[62vh]">
              {showWriteForm && (
                <form onSubmit={submitReview} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold">Your rating</div>
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
                          {n <= (reviewHover || reviewRating) ? <IconStar className="w-5 h-5 text-yellow-400" /> : <svg className="w-5 h-5 text-gray-200" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value.slice(0, 1000))}
                    placeholder="Write your review here..."
                    rows={4}
                    className="w-full border border-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-violet-100 outline-none resize-none"
                    required
                  />

                  <input
                    type="email"
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    placeholder="Email (optional)"
                    className="w-full border border-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-violet-100 outline-none"
                  />

                  <div className="flex items-center justify-end gap-3">
                    <button type="button" onClick={() => setShowWriteForm(false)} className="px-4 py-2 bg-white border border-gray-100 rounded-lg">
                      Cancel
                    </button>
                    <button type="submit" disabled={submittingReview} className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-semibold">
                      {submittingReview ? "Submitting..." : "Submit review"}
                    </button>
                  </div>
                </form>
              )}

              {loadingReviews && <div className="text-center py-6 text-gray-500">Loading reviews...</div>}

              {!loadingReviews && reviews.length === 0 && <div className="text-center py-6 text-gray-500">No reviews yet.</div>}

              {!loadingReviews && reviews.map((r, idx) => {
                const reviewerName = r.user?.name || r.user?.username || r.name || "Anonymous";
                const text = r.comment || r.text || r.message || "";
                const stars = Number(r.rating ?? r.stars ?? 0);
                const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : (r.date ? new Date(r.date).toLocaleDateString() : "");

                return (
                  <div key={idx} className="flex gap-4 p-4 rounded-lg border border-gray-100 bg-white shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                      {r.user?.avatar ? <img src={r.user.avatar} alt={reviewerName} className="w-full h-full object-cover" /> : <div className="text-gray-600 font-semibold">{(reviewerName || "A").charAt(0)}</div>}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold text-gray-900">{reviewerName}</div>
                          <div className="text-xs text-gray-500">{dateStr}</div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => <IconStar key={i} className={`w-4 h-4 ${i <= stars ? "text-yellow-400" : "text-gray-200"}`} />)}
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
      </div>
    </div>
  );
};

export default EventDetails;
