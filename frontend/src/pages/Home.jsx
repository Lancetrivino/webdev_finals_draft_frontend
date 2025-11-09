import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const featuresRef = useRef(null); // Scroll target

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

  // --- NavLinks Component (Unchanged, already clean) ---
  const NavLinks = () => {
    if (!isClient) return null;

    const baseLinkClass = "relative text-gray-700 font-medium transition duration-150 group";
    const hoverEffect = "group-hover:text-green-600 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-green-600 after:transition-all after:duration-300 group-hover:after:w-full";

    return isAuthenticated ? (
      <>
        <a href="/dashboard" className={`${baseLinkClass} ${hoverEffect}`}>
          Dashboard
        </a>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-red-500 border border-red-500 rounded-full hover:bg-red-500 hover:text-white transition duration-150 shadow-sm hover:shadow-md"
        >
          Logout
        </button>
      </>
    ) : (
      <div className="flex items-center space-x-6">
        <button onClick={scrollToFeatures} className={`${baseLinkClass} ${hoverEffect}`}>
          Features
        </button>
        <a href="/login" className={`${baseLinkClass} ${hoverEffect}`}>
          Login
        </a>
        <a
          href="/register"
          className="px-5 py-2 bg-green-600 text-white rounded-full font-semibold shadow-md hover:bg-green-700 transition duration-200 transform hover:scale-105"
        >
          Sign Up Free
        </a>
      </div>
    );
  };

  // --- Main Button Design (Unchanged) ---
  const mainButtonClass = "px-10 py-4 text-xl font-bold rounded-full shadow-xl transition duration-300 transform hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-green-300";

  const mainButton = isAuthenticated ? (
    <a
      href="/dashboard"
      className={`${mainButtonClass} bg-green-600 text-white hover:bg-green-700`}
    >
      Go to Dashboard
    </a>
  ) : (
    <button
      onClick={scrollToFeatures}
      className={`${mainButtonClass} bg-green-600 text-white hover:bg-green-700`}
    >
      Explore Features
    </button>
  );

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      
      {/* --- Sticky Navbar --- */}
      <nav className="sticky top-0 bg-white bg-opacity-95 backdrop-blur-sm z-30 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20"> 
            <a href="/" className="text-3xl font-black text-green-600 tracking-wider">
              Eventure
            </a>
            <div className="flex items-center space-x-6">
              <NavLinks />
            </div>
          </div>
        </div>
      </nav>

      {/* --- REVISED: Hero Section Tagline --- */}
      <header className="relative pt-16 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bottom-right from-green-50 to-white opacity-80 z-0"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Plan, Promote, and Attend <span className="text-green-600 block sm:inline-block">Any Event</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mb-12 font-light">
            Eventure is the ultimate platform for community organizers and attendees, whether you’re hosting a car meet, food festival, or local gathering.
          </p>
          {mainButton}
          <button 
             onClick={scrollToFeatures} 
             className="mt-16 text-gray-400 hover:text-green-600 transition duration-300" 
             aria-label="Scroll down to features">
            <svg className="w-6 h-6 animate-bounce" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </button>
        </div>
      </header>

      {/* --- REVISED: Features Section (For General Events) --- */}
      <section ref={featuresRef} id="features" className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">Key Features for Every Event</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature Card 1: Organizer Focused */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
            <div className="text-green-600 mb-4 text-3xl">🛠️</div> 
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Event Creation Hub</h3>
            <p className="text-gray-600 leading-relaxed">
              Quickly set up any type of public or private event—from music festivals and workshops to local car meets and charity runs.
            </p>
          </div>
          {/* Feature Card 2: Participant Focused */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
             <div className="text-green-600 mb-4 text-3xl">📍</div> 
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Discover Local Gatherings</h3>
            <p className="text-gray-600 leading-relaxed">
              Explore events near you with filtering options by category (e.g., Food, Sports, Arts). RSVP and get instant directions.
            </p>
          </div>
          {/* Feature Card 3: Management Focused */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
             <div className="text-green-600 mb-4 text-3xl">📣</div> 
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Built-in Promotion Tools</h3>
            <p className="text-gray-600 leading-relaxed">
              Generate shareable links, send bulk updates to registered attendees, and track ticket sales or RSVP numbers in real time.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 mt-16 py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Eventure. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}