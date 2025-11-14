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
  const maxChars = 300;

  const palette = {
    deep: "#08324A",
    navy: "#0B63A3",
    blue: "#0F85D0",
    soft: "#BFE7FF",
    pale: "#DFF3FB",
  };

  // ✅ Check participation and event status
  useEffect(() => {
    const checkEligibility = async () => {
      if (!currentUser) {
        toast.error("Please log in to submit feedback.");
        navigate("/login");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        
        // Fetch event details
        const eventRes = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const eventData = await eventRes.json();
        setEvent(eventData.event || eventData);

        // Check if user joined
        const joined = (eventData.event?.participants || eventData.participants || [])
          .includes(currentUser._id);
        setHasJoined(joined);

        // Check if event has passed
        const eventDate = new Date(eventData.event?.date || eventData.date);
        const now = new Date();
        setEventHasPassed(now > eventDate);

        // Check if already submitted feedback
        const feedbackRes = await fetch(`${API_BASE_URL}/api/feedback/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const feedbacks = await feedbackRes.json();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
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

      toast.success("✅ Thank you for your feedback!");
      setTimeout(() => navigate(`/events/${eventId}`), 1500);
    } catch (err) {
      toast.error(err.message || "Error submitting feedback.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show eligibility messages
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

  // Rest of your existing form JSX...
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: `linear-gradient(90deg, ${palette.deep} 0%, ${palette.navy} 50%, ${palette.blue} 100%)` }}
    >
      {/* Your existing form code */}
    </div>
  );
}