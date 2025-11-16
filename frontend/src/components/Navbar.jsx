// src/components/Navbar.jsx
import React, { useMemo, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const NavBar = () => {
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = useMemo(() => {
    const name = currentUser?.name || "U";
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("");
  }, [currentUser]);

  const navLinkStyle = ({ isActive }) =>
    `relative px-4 py-2 inline-block text-center tracking-wide transition-all duration-200
     text-white/90 hover:text-white hover:-translate-y-1 hover:brightness-125
     ${isActive ? "after:block after:h-[2px] after:w-full after:bg-white after:mt-1" : ""}`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[50] h-20 
      bg-gradient-to-r from-[#8a63e6] via-[#9a6ef0] to-[#7fc6ee]
      backdrop-blur-md shadow-lg transition-transform ${
        isAuthPage
          ? "pointer-events-none opacity-0 -translate-y-4"
          : "opacity-100 translate-y-0"
      }`}
      aria-hidden={isAuthPage}
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="flex items-center justify-between w-full">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2"
            aria-label="Eventure Home"
          >
            <span
              className="
                inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white shadow-lg 
                transition-all duration-200 
                hover:scale-105 active:scale-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <defs>
                  <linearGradient id="ev-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8a63e6" />
                    <stop offset="100%" stopColor="#9a6ef0" />
                  </linearGradient>
                </defs>
                <circle cx="12" cy="12" r="10" fill="url(#ev-grad)" />
              </svg>

              {/* Extra Effects */}
              <span
                className="
                  text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-[#667eea] to-[#764ba2]
                  bg-clip-text text-transparent tracking-tight
                  transition-all duration-200 
                  hover:scale-105 hover:font-black
                  active:scale-100 active:font-extrabold"
              >
                Eventure
              </span>
            </span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/events" className={navLinkStyle}>
              Events
            </NavLink>
            <NavLink to="/available-events" className={navLinkStyle}>
              Available Events
            </NavLink>
            <NavLink to="/create-event" className={navLinkStyle}>
              Create Event
            </NavLink>
            <NavLink to="/feedback" className={navLinkStyle}>
              Feedback
            </NavLink>

            {currentUser?.role === "Admin" && (
              <NavLink to="/admin" className={navLinkStyle}>
                Admin
              </NavLink>
            )}

            <div className="relative ml-2">
              <button
                onClick={() => setAvatarOpen((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#667eea] font-bold shadow-lg hover:shadow-xl transition-all"
                aria-label="User menu"
              >
                {initials}
              </button>

              {avatarOpen && (
                <div
                  className="absolute right-0 mt-3 w-48 rounded-2xl bg-white py-2 shadow-xl z-[60]"
                  onMouseLeave={() => setAvatarOpen(false)}
                >
                  <div className="px-4 py-2 text-xs text-gray-500 font-medium">
                    Hello, {currentUser?.name || "User"}
                  </div>
                  <NavLink
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => setAvatarOpen(false)}
                  >
                    Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>

          <button
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white/10 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 pb-4">
            <div className="flex flex-col gap-2">
              <NavLink
                to="/events"
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg font-medium transition"
                onClick={() => setMenuOpen(false)}
              >
                Events
              </NavLink>
              <NavLink
                to="/available-events"
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg font-medium transition"
                onClick={() => setMenuOpen(false)}
              >
                Available Events
              </NavLink>
              <NavLink
                to="/create-event"
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg font-medium transition"
                onClick={() => setMenuOpen(false)}
              >
                Create Event
              </NavLink>
              <NavLink
                to="/feedback"
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg font-medium transition"
                onClick={() => setMenuOpen(false)}
              >
                Feedback
              </NavLink>
              <NavLink
                to="/profile"
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg font-medium transition"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </NavLink>

              {currentUser?.role === "Admin" && (
                <NavLink
                  to="/admin"
                  className="px-4 py-2 text-white hover:bg-white/10 rounded-lg font-medium transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin
                </NavLink>
              )}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="mt-3 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-[#667eea] font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
