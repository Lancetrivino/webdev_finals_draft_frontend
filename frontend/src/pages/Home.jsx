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

    const baseLinkClass = "relative text-gray-700 font-medium transition duration-150 group";
    const hoverEffect = "group-hover:text-brand-700 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-700 after:transition-all after:duration-300 group-hover:after:w-full";

    return isAuthenticated ? (
      <>
        <a href="/dashboard" className={`${baseLinkClass} ${hoverEffect}`}>
          Dashboard
        </a>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-brand-800 border border-brand-800 rounded-full hover:bg-brand-800 hover:text-white transition duration-150 shadow-sm hover:shadow-md"
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
          className="px-5 py-2 bg-brand-700 text-white rounded-full font-semibold shadow-md hover:bg-brand-800 transition duration-200 transform hover:scale-105"
        >
          Sign Up Free
        </a>
      </div>
    );
  };

  const mainButtonClass = "px-10 py-4 text-xl font-bold rounded-full shadow-xl transition duration-300 transform hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-brand-200";

  const mainButton = isAuthenticated ? (
    <a
      href="/dashboard"
      className={`${mainButtonClass} bg-brand-700 text-white hover:bg-brand-800`}
    >
      Go to Dashboard
    </a>
  ) : (
    <button
      onClick={scrollToFeatures}
      className={`${mainButtonClass} bg-brand-700 text-white hover:bg-brand-800`}
    >
      Explore Features
    </button>
  );

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <nav className="sticky top-0 bg-white bg-opacity-95 backdrop-blur-sm z-30 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <a href="/" className="text-3xl font-black text-brand-700 tracking-wider">
              Eventure
            </a>
            <div className="flex items-center space-x-6">
              <NavLinks />
            </div>
          </div>
        </div>
      </nav>

      <header className="relative pt-16 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-white opacity-80 z-0"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-brand-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-brand-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Plan, Promote, and Attend <span className="text-brand-700 block sm:inline-block">Any Event</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mb-12 font-light">
            Eventure is the ultimate platform for organizers and attendees, whether you’re hosting a car meet, food festival, or local gathering.
          </p>
          {mainButton}

          <button
            onClick={scrollToFeatures}
            className="mt-16 text-gray-400 hover:text-brand-700 transition duration-300"
            aria-label="Scroll down to features"
          >
            <svg className="w-6 h-6 animate-bounce" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </button>
        </div>
      </header>

      <section ref={featuresRef} id="features" className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">Key Features for Every Event</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
            <div className="text-brand-700 mb-4 text-3xl">🛠️</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Event Creation Hub</h3>
            <p className="text-gray-600 leading-relaxed">
              Quickly set up any type of event—from music festivals and workshops to local car meets.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
            <div className="text-brand-700 mb-4 text-3xl">📍</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Discover Local Gatherings</h3>
            <p className="text-gray-600 leading-relaxed">
              Explore events near you with filtering options by category.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
            <div className="text-brand-700 mb-4 text-3xl">📣</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Built-in Promotion Tools</h3>
            <p className="text-gray-600 leading-relaxed">
              Generate shareable links, send updates, and track RSVP numbers.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-gray-50 mt-16 py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Eventure. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
