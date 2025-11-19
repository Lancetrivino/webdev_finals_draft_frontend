import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://webdevfinals.onrender.com";

function Dashboard() {
  const { currentUser } = useAuth();
  const [now, setNow] = useState(new Date());
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch upcoming events that the user has joined
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      if (!currentUser) return;
      
      setLoadingEvents(true);
      try {
        const token = localStorage.getItem("token") || currentUser?.token;
        
        console.log("🔍 Fetching upcoming events for user:", currentUser._id || currentUser.id);
        
        // Fetch all available events
        const res = await fetch(`${API_BASE_URL}/api/events/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch events");
        
        const data = await res.json();
        console.log("📥 All events received:", data.length);
        
        // Get user ID - try both _id and id
        const userId = currentUser._id || currentUser.id;
        console.log("👤 Current user ID:", userId);
        
        // Filter for events the user has joined and are in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const userUpcomingEvents = data
          .filter(event => {
            const eventDate = new Date(event.date);
            
            // Check if user has joined - handle both string and object IDs
            const participants = event.participants || [];
            const hasJoined = participants.some(p => {
              // Handle if participant is an object with _id or id
              if (typeof p === 'object') {
                return p._id === userId || p.id === userId;
              }
              // Handle if participant is just a string ID
              return p === userId;
            });
            
            const isFuture = eventDate >= today;
            
            console.log(`📅 Event: ${event.title}`);
            console.log(`  - Date: ${eventDate.toLocaleDateString()}`);
            console.log(`  - Participants:`, participants);
            console.log(`  - Has Joined: ${hasJoined}`);
            console.log(`  - Is Future: ${isFuture}`);
            
            return hasJoined && isFuture;
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3); // Get only the first 3 upcoming events
        
        console.log("✅ Filtered upcoming events:", userUpcomingEvents.length);
        setUpcomingEvents(userUpcomingEvents);
      } catch (error) {
        console.error("❌ Error fetching upcoming events:", error);
        toast.error("Failed to load upcoming events");
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchUpcomingEvents();
  }, [currentUser]);

  const initials = useMemo(() => {
    const name = currentUser?.name || currentUser?.email || "User";
    return name
      .toString()
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [currentUser]);

  const welcomeMessage = `Welcome back, ${currentUser?.name?.split(" ")[0] || "User"}!`;
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  const quickActions = [
    {
      title: "Browse Events",
      description: "Discover local events and activities near you.",
      link: "/available-events",
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-200",
      svg: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Create Event",
      description: "Host your own gathering or community event quickly.",
      link: "/create-event",
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      svg: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "My Events",
      description: "Manage and track the events you created.",
      link: "/events",
      color: "from-indigo-500 to-violet-500",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      svg: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  const stats = [
    { label: "Events Joined", value: "12", color: "text-violet-600" },
    { label: "Events Created", value: "5", color: "text-purple-600" },
    { label: "Total Reviews", value: "8", color: "text-indigo-600" },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50"
      style={{ paddingTop: "calc(5rem + 24px)" }}
    >
      <div className="fixed top-24 left-10 w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-12 animate-blob"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-12 animate-blob animation-delay-2000"></div>

      <style>{`
        @keyframes blob {
          0%,100%{ transform: translate(0px,0px) scale(1); }
          33%{ transform: translate(30px,-50px) scale(1.05); }
          66%{ transform: translate(-20px,20px) scale(0.95); }
        }
        .animate-blob { animation: blob 9s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border border-violet-100 overflow-hidden relative">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">
                {initials}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{greeting}</p>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{welcomeMessage}</h1>
                <p className="text-gray-600">Ready to explore and create events?</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-violet-100 shadow-sm w-full md:w-auto">
              <div className="text-center">
                <p className="text-xs font-semibold text-violet-600 mb-1">CURRENT TIME</p>
                <p className="text-3xl font-extrabold text-violet-900 mb-1">
                  {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-sm text-violet-700">
                  {now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-lg transition-transform duration-200 border border-violet-100"
              role="status"
            >
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className={`text-4xl font-extrabold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900">Quick Actions</h2>
            <div>
              <button
                onClick={() => navigate("/available-events")}
                className="px-4 py-2 rounded-lg bg-white border border-violet-100 shadow-sm text-sm font-medium text-violet-700 hover:shadow transition"
              >
                View Events
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, idx) => (
              <div
                key={idx}
                onClick={() => navigate(action.link)}
                className={`${action.bgColor} rounded-2xl p-8 shadow-lg transition-transform duration-300 border ${action.borderColor} cursor-pointer hover:-translate-y-2`}
              >
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${action.color} text-white shadow`}>
                  {action.svg}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{action.title}</h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">{action.description}</p>
                <div className="flex items-center text-violet-600 font-semibold gap-2">
                  <span>Get Started</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-violet-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Upcoming Events</h3>
              <div className="text-sm font-medium text-violet-600">Schedule</div>
            </div>
            
            {loadingEvents ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                <p className="mt-2 text-sm text-gray-500">Loading events...</p>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-gray-600 mb-4">No upcoming events</p>
                <button
                  onClick={() => navigate("/available-events")}
                  className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition shadow-lg text-sm"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event, idx) => (
                  <div
                    key={event._id}
                    onClick={() => navigate(`/events/${event._id}`)}
                    className="flex items-center gap-4 p-4 bg-violet-50 rounded-xl border border-violet-100 hover:bg-violet-100 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold shadow flex-shrink-0">
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{event.title}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })} • {event.venue}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-violet-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ))}
              </div>
            )}
            
            {upcomingEvents.length > 0 && (
              <button
                onClick={() => navigate("/available-events")}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition shadow-lg"
              >
                View All Events
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-violet-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Tips & Resources</h3>
              <div className="text-sm font-medium text-violet-600">Guides</div>
            </div>
            <div className="space-y-4">
              {[
                "Create engaging event descriptions to attract attendees",
                "Use high-quality images to make your events stand out",
                "Send timely reminders to boost attendance"
              ].map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-violet-50 rounded-xl border border-violet-100">
                  <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 text-violet-600">
                    {idx + 1}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate("/available-events")}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition shadow-lg"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;