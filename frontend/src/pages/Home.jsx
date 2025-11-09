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
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const NavLinks = () => {
    if (!isClient) return null;

    return isAuthenticated ? (
      <>
        <a
          href="/dashboard"
          className="text-gray-700 hover:text-green-600 font-medium transition duration-150"
        >
          Dashboard
        </a>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150"
        >
          Logout
        </button>
      </>
    ) : (
      <div className="flex space-x-4">
        <a
          href="/login"
          className="text-gray-700 hover:text-green-600 font-medium transition duration-150"
        >
          Login
        </a>
        <a
          href="/register"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150"
        >
          Register
        </a>
      </div>
    );
  };

  const mainButton = isAuthenticated ? (
    <a
      href="/dashboard"
      className="px-8 py-4 text-xl font-semibold bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105"
    >
      Go to Dashboard
    </a>
  ) : (
    <button
      onClick={scrollToFeatures}
      className="px-8 py-4 text-xl font-semibold bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105"
    >
      Get Started
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white shadow-md z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="text-2xl font-extrabold text-green-600">
              Eventure
            </a>
            <div className="flex items-center space-x-4">
              <NavLinks />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 bg-gradient-to-bottom-right from-green-100 to-green-50">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
          Welcome to <span className="text-green-600">Eventure</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10">
          Manage and join school events effortlessly. Eventure connects administrators and participants in one seamless platform.
        </p>
        {mainButton}
      </div>

      {/* Wave Divider */}
      <div className="relative">
        <svg
          className="absolute bottom-0 w-full h-20 md:h-32"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#f8fafc"
            fillOpacity="1"
            d="M0,64L60,80C120,96,240,128,360,128C480,128,600,96,720,85.3C840,75,960,85,1080,117.3C1200,149,1320,203,1380,229.3L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="relative z-10 max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transform hover:-translate-y-2 transition duration-300">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Organize Events</h3>
          <p className="text-gray-600 text-sm">
            Easily create and manage school events with full control and visibility.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transform hover:-translate-y-2 transition duration-300">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Join Events</h3>
          <p className="text-gray-600 text-sm">
            Explore available events and register quickly with a few clicks.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transform hover:-translate-y-2 transition duration-300">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Feedback & Reports</h3>
          <p className="text-gray-600 text-sm">
            Provide feedback and get insights on your events’ performance and participation.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 mt-16 py-6 text-center text-gray-600">
        &copy; {new Date().getFullYear()} Eventure. All rights reserved.
      </footer>
    </div>
  );
}
