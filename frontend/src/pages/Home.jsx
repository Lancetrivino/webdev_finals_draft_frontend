import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const featuresRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const NavLinks = () => {
    if (!isClient) return null;

    return isAuthenticated ? (
      <>
        <a href="/dashboard" className="text-gray-700 hover:text-violet-600 font-medium transition-colors duration-200">
          Dashboard
        </a>
        <a href="/events" className="text-gray-700 hover:text-violet-600 font-medium transition-colors duration-200">
          My Events
        </a>
        <a href="/available-events" className="text-gray-700 hover:text-violet-600 font-medium transition-colors duration-200">
          Browse Events
        </a>
        <button
          onClick={handleLogout}
          className="px-6 py-2 text-red-600 border-2 border-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-200 font-semibold"
        >
          Logout
        </button>
      </>
    ) : (
      <div className="flex items-center space-x-6">
        <button onClick={scrollToFeatures} className="text-gray-700 hover:text-violet-600 font-medium transition-colors duration-200">
          Features
        </button>
        <a href="/login" className="text-gray-700 hover:text-violet-600 font-medium transition-colors duration-200">
          Login
        </a>
        <a
          href="/register"
          className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          Sign Up Free
        </a>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      
      {/* Animated Background Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

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
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Navbars */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-lg z-50 border-b-2 border-violet-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <a href="/" className="flex items-center space-x-3">
             
              <span className="text-3xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Eventure
              </span>
            </a>
            <div className="flex items-center space-x-6">
              <NavLinks />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-violet-100 border-2 border-violet-300 rounded-full mb-8 shadow-lg">
              <span className="text-violet-600 font-semibold text-sm">✨ Welcome to the Future of Events</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-6 leading-tight">
              Plan, Promote, and <br />
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Attend Any Event
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              The ultimate platform for community organizers and attendees. Host car meets, 
              food festivals, workshops, or any local gathering with ease.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {isAuthenticated ? (
                <a
                  href="/dashboard"
                  className="px-10 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-105"
                >
                  Go to Dashboard →
                </a>
              ) : (
                <>
                  <a
                    href="/register"
                    className="px-10 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-105"
                  >
                    Get Started Free
                  </a>
                  <button
                    onClick={scrollToFeatures}
                    className="px-10 py-4 bg-white text-violet-600 border-2 border-violet-600 rounded-xl text-lg font-bold hover:bg-violet-50 transition-all duration-200"
                  >
                    Explore Features
                  </button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              {[
                { number: "10K+", label: "Events Hosted" },
                { number: "50K+", label: "Active Users" },
                { number: "4.9★", label: "User Rating" }
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl font-black text-violet-600 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Scroll Indicator */}
            <button 
              onClick={scrollToFeatures} 
              className="mt-16 text-violet-600 hover:text-violet-700 transition-colors duration-300 animate-bounce" 
              aria-label="Scroll down to features"
            >
              <svg className="w-8 h-8 mx-auto" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-gray-900 mb-4">
            Everything You Need to <span className="text-violet-600">Succeed</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed for modern event organizers and attendees
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "🛠️",
              title: "Easy Event Creation",
              description: "Set up any type of event in minutes—from music festivals to local meetups. Customize every detail to match your vision.",
              gradient: "from-violet-500 to-purple-500"
            },
            {
              icon: "🔍",
              title: "Discover Local Events",
              description: "Explore events near you with smart filters. Find exactly what you're looking for by category, date, or location.",
              gradient: "from-purple-500 to-indigo-500"
            },
            {
              icon: "📣",
              title: "Built-in Promotion",
              description: "Generate shareable links, send updates to attendees, and track RSVPs in real-time. Everything in one place.",
              gradient: "from-indigo-500 to-violet-500"
            },
            {
              icon: "📊",
              title: "Analytics Dashboard",
              description: "Track attendance, engagement, and feedback. Make data-driven decisions for your next event.",
              gradient: "from-violet-500 to-pink-500"
            },
            {
              icon: "💳",
              title: "Flexible Ticketing",
              description: "Free events or paid tickets—your choice. Integrated payment processing makes it seamless.",
              gradient: "from-pink-500 to-purple-500"
            },
            {
              icon: "⭐",
              title: "Reviews & Ratings",
              description: "Build trust with attendee reviews and ratings. Let your successful events speak for themselves.",
              gradient: "from-purple-500 to-violet-500"
            }
          ].map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-violet-200 group"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-12 md:p-16 text-center shadow-2xl border-2 border-violet-300">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers who trust Eventure to bring their communities together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="px-10 py-4 bg-white text-violet-600 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
            >
              Create Free Account
            </a>
            <a
              href="/login"
              className="px-10 py-4 bg-violet-700 text-white border-2 border-white rounded-xl text-lg font-bold hover:bg-violet-800 transition-all duration-200"
            >
              Sign In
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white mt-16 py-12 border-t-2 border-violet-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎉</span>
                </div>
                <span className="text-2xl font-black text-violet-600">Eventure</span>
              </div>
              <p className="text-gray-600 text-sm">
                Making event management simple and accessible for everyone.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-violet-600">Features</a></li>
                <li><a href="#" className="hover:text-violet-600">Pricing</a></li>
                <li><a href="#" className="hover:text-violet-600">Events</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-violet-600">About</a></li>
                <li><a href="#" className="hover:text-violet-600">Blog</a></li>
                <li><a href="#" className="hover:text-violet-600">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-violet-600">Privacy</a></li>
                <li><a href="#" className="hover:text-violet-600">Terms</a></li>
                <li><a href="#" className="hover:text-violet-600">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-violet-200 pt-8 text-center">
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} Eventure. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}