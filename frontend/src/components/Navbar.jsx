import React, { useMemo, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const NavBar = () => {
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Hide navbar on login/register pages
  if (location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/") return null;

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
    `relative px-2 md:px-3 py-1 font-medium transition text-slate-700
     ${isActive ? "text-slate-900" : "hover:text-slate-900"}
     after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:bg-slate-900
     after:scale-x-0 after:origin-left after:transition-transform after:duration-300
     ${isActive ? "after:scale-x-100" : "hover:after:scale-x-100"}`;

  return (
    <header className="sticky top-0 z-50 bg-transparent/30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mt-4 mb-3 rounded-[2rem] bg-white shadow-[0_15px_30px_-15px_rgba(0,0,0,0.15)] flex items-center justify-between px-5 sm:px-7 py-3">
          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-right from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
              Eventure
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/events" className={navLinkStyle}>Events</NavLink>
            <NavLink to="/available-events" className={navLinkStyle}>Available Events</NavLink>
            <NavLink to="/create-event" className={navLinkStyle}>Create Event</NavLink>
            <NavLink to="/feedback" className={navLinkStyle}>Feedback</NavLink>

            {currentUser?.role === "Admin" && (
              <NavLink to="/admin" className={navLinkStyle}>Admin</NavLink>
            )}

            {/* Avatar menu */}
            <div className="relative">
              <button
                onClick={() => setAvatarOpen((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-semibold shadow-md"
                aria-label="User menu"
              >
                {initials}
              </button>

              {avatarOpen && (
                <div
                  className="absolute right-0 mt-3 w-48 rounded-xl border border-slate-100 bg-white py-2 shadow-lg"
                  onMouseLeave={() => setAvatarOpen(false)}
                >
                  <div className="px-4 py-2 text-xs text-slate-500">
                    Hello, {currentUser?.name || "User"}
                  </div>
                  <NavLink
                    to="/profile"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setAvatarOpen(false)}
                  >
                    Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-700"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden">
          <div className="max-w-6xl mx-auto px-4">
            <div className="rounded-3xl bg-white shadow-[0_15px_30px_-15px_rgba(0,0,0,0.15)] px-6 py-4 mb-3">
              <div className="flex flex-col gap-3">
                <NavLink to="/events" className={navLinkStyle} onClick={() => setMenuOpen(false)}>Events</NavLink>
                <NavLink to="/available-events" className={navLinkStyle} onClick={() => setMenuOpen(false)}>Available Events</NavLink>
                <NavLink to="/create-event" className={navLinkStyle} onClick={() => setMenuOpen(false)}>Create Event</NavLink>
                <NavLink to="/feedback" className={navLinkStyle} onClick={() => setMenuOpen(false)}>Feedback</NavLink>
                <NavLink to="/profile" className={navLinkStyle} onClick={() => setMenuOpen(false)}>Profile</NavLink>

                {currentUser?.role === "Admin" && (
                  <NavLink to="/admin" className={navLinkStyle} onClick={() => setMenuOpen(false)}>Admin</NavLink>
                )}

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="mt-2 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-white"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
