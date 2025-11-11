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

    const baseLinkClass =
      "relative text-gray-700 font-medium transition duration-150 group";
    const hoverEffect =
      "group-hover:text-green-600 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-green-600 after:transition-all after:duration-300 group-hover:after:w-full";

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

  const mainButtonClass =
    "px-10 py-4 text-xl font-bold rounded-full shadow-xl transition duration-300 transform hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-green-300";

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

      {/* Navbar */}
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

      {/* ✅ Updated HERO Section - Matches your screenshot */}
      <header className="relative flex items-center justify-center py-20 sm:py-32 bg-[#E8DAFF]">
        <div className="relative w-[92%] max-w-5xl rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden px-6 sm:px-10 py-24 sm:py-36">

          <span className="absolute top-6 left-6 text-sm font-semibold text-violet-700/70">
            Fleeped
          </span>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="w-72 h-72 sm:w-[28rem] sm:h-[28rem] rounded-full blur-3xl opacity-90"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(255,255,255,0.9), transparent 65%), conic-gradient(from 90deg at 50% 50%, #FDE68A, #F0ABFC, #93C5FD, #86EFAC, #FDE68A)"
              }}
            />
          </div>

          <div className="relative flex items-center justify-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white drop-shadow-md">
              Welcome
            </h1>
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section ref={featuresRef} id="features" className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
          Key Features for Every Event
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
            <div className="text-green-600 mb-4 text-3xl">🛠️</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Event Creation Hub</h3>
            <p className="text-gray-600 leading-relaxed">
              Quickly set up any type of public or private event—from music festivals and workshops to local car meets and charity runs.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
            <div className="text-green-600 mb-4 text-3xl">📍</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Discover Local Gatherings</h3>
            <p className="text-gray-600 leading-relaxed">
              Explore events near you with filtering options by category (e.g., Food, Sports, Arts). RSVP and get instant directions.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
            <div className="text-green-600 mb-4 text-3xl">📣</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Built-in Promotion Tools</h3>
            <p className="text-gray-600 leading-relaxed">
              Generate shareable links, send bulk updates to registered attendees, and track ticket sales or RSVP numbers in real time.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-50 mt-16 py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Eventure. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
