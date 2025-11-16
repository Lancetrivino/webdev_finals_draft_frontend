import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const { currentUser } = useAuth();
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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

  const welcomeMessage = `Welcome back, ${currentUser?.name?.split(' ')[0] || "User"}!`;
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  const quickActions = [
    {
      icon: "🎯",
      title: "Browse Events",
      description: "Discover exciting local events and activities happening near you.",
      link: "/available-events",
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-200"
    },
    {
      icon: "✨",
      title: "Create Event",
      description: "Host your own gathering or community event in minutes.",
      link: "/create-event",
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      icon: "📋",
      title: "My Events",
      description: "Manage and track all your created events in one place.",
      link: "/events",
      color: "from-indigo-500 to-violet-500",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
    }
  ];

  const stats = [
    { label: "Events Joined", value: "12", icon: "🎉", color: "text-violet-600" },
    { label: "Events Created", value: "5", icon: "✨", color: "text-purple-600" },
    { label: "Total Reviews", value: "8", icon: "⭐", color: "text-indigo-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Animated Background Blobs */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border-2 border-violet-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full filter blur-3xl opacity-20 -mr-32 -mt-32"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">
                {initials}
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">{greeting} 👋</p>
                <h1 className="text-4xl font-black text-gray-900 mb-2">{welcomeMessage}</h1>
                <p className="text-gray-600">Ready to explore and create amazing events?</p>
              </div>
            </div>

            {/* Time & Date Card */}
            <div className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl p-6 border-2 border-violet-300 shadow-lg">
              <div className="text-center">
                <p className="text-sm font-semibold text-violet-600 mb-2">Current Time</p>
                <p className="text-3xl font-black text-violet-900 mb-1">
                  {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm text-violet-700">
                  {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-violet-200 group cursor-pointer transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">{stat.label}</p>
                  <p className={`text-4xl font-black ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                    {stat.value}
                  </p>
                </div>
                <div className="text-5xl group-hover:scale-110 transition-transform duration-200">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-4xl">⚡</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, idx) => (
              <div
                key={idx}
                onClick={() => navigate(action.link)}
                className={`${action.bgColor} rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${action.borderColor} cursor-pointer group transform hover:-translate-y-2`}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
                  {action.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {action.description}
                </p>
                <div className="flex items-center text-violet-600 font-bold group-hover:gap-3 gap-2 transition-all">
                  <span>Get Started</span>
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upcoming Events Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-violet-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Upcoming Events</h3>
              <span className="text-3xl">📅</span>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((_, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-violet-50 rounded-xl border border-violet-200 hover:bg-violet-100 transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold shadow">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Event Title {idx + 1}</p>
                    <p className="text-sm text-gray-600">Date • Location</p>
                  </div>
                  <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate("/available-events")}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              View All Events
            </button>
          </div>

          {/* Tips & Resources */}
          <div className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl p-8 shadow-lg text-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Tips & Resources</h3>
              <span className="text-3xl">💡</span>
            </div>
            <div className="space-y-4">
              {[
                "Create engaging event descriptions to attract more attendees",
                "Use high-quality images to make your events stand out",
                "Send timely reminders to boost attendance rates"
              ].map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur rounded-xl border border-white/20">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 px-6 py-3 bg-white text-violet-600 rounded-xl font-semibold hover:bg-violet-50 transition-all duration-200 shadow-lg">
              Learn More
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;