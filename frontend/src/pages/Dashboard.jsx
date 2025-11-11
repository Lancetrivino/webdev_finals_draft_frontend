import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [message, setMessage] = useState("Connecting to backend...");
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const sessionStartRef = useRef(new Date());
  const navigate = useNavigate();

  // ---- Original backend connectivity check (unchanged) ----
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE}/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) throw new Error("Failed to fetch backend data.");

        const data = await response.text();
        setMessage(data || "✅ Connected to backend successfully!");
      } catch (error) {
        console.error("Error:", error);
        setMessage("❌ Cannot connect to backend. Check API URL and CORS.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---- Client-only extras (no backend) ----
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

  const roleLabel = (currentUser?.role || "User").toString();
  const roleBadge = useMemo(() => {
    const r = roleLabel.toLowerCase();
    if (r.includes("admin")) return "bg-rose-50 text-rose-700 border-rose-200";
    if (r.includes("organizer") || r.includes("host"))
      return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }, [roleLabel]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ===== No page scroll: lock <html> and <body>, and use a fixed viewport =====
  const NAV_HEIGHT = 80; // px (Tailwind h-20). Change if your navbar height differs.

  useEffect(() => {
    // lock page scroll while this page is mounted
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  return (
    // Fixed container that occupies the viewport area under the navbar
    <div className="fixed left-0 right-0 bottom-0 bg-white" style={{ top: NAV_HEIGHT }}>
      {/* Center the card; give a tiny padding without causing page scroll */}
      <div className="h-full w-full flex items-center justify-center p-4">
        {/* Card fills the fixed area height (no page scroll). */}
        <div
          className="relative w-[min(1200px,96vw)] rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden"
          style={{ height: "100%" }}
        >
          {/* ---------- FULL-CARD GREEN 'PAINT' BACKGROUND ---------- */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(36rem 28rem at 55% 45%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0.4) 60%, rgba(255,255,255,0.2) 75%, transparent 100%), conic-gradient(from 90deg at 50% 50%, #bbf7d0, #86efac, #a7f3d0, #86efac, #bbf7d0)",
              filter: "blur(26px)",
              opacity: 0.95,
            }}
          />

          {/* ---------- CONTENT (no outer page scroll) ---------- */}
          <div className="relative flex flex-col h-full">
            {/* Header */}
            <div className="px-6 sm:px-10 pt-6 pb-2 shrink-0">
              <h1 className="text-center text-[clamp(36px,5.6vw,64px)] font-extrabold tracking-tight text-emerald-600 drop-shadow-[0_1px_8px_rgba(16,185,129,0.25)]">
                Eventure
              </h1>
              <p className="text-center text-sm text-gray-600">
                {now.toLocaleDateString()} • {now.toLocaleTimeString()}
              </p>
            </div>

            {/* Main grid; right side gets more space to “maximize” content */}
            <div className="px-6 sm:px-10 pb-6 grow overflow-hidden">
              <div className="grid h-full gap-5 grid-cols-12">
                {/* Left: avatar + facts (4/12) */}
                <div className="col-span-12 lg:col-span-4">
                  <div className="rounded-2xl border border-white/50 bg-white/70 backdrop-blur-md shadow-md p-5 h-full">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                        {initials}
                      </div>
                      <div>
                        <div className="text-sm text-gray-700">Welcome:</div>
                        <div className="font-semibold text-gray-900">
                          {currentUser?.name || "User"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${roleBadge}`}
                      >
                        <span className="inline-block h-2 w-2 rounded-full bg-current opacity-70" />
                        Role: <span className="capitalize">{roleLabel}</span>
                      </span>
                    </div>

                    <div className="mt-5 space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Local time</span>
                        <span className="font-medium text-gray-900">
                          {now.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Session start</span>
                        <span className="font-medium text-gray-900">
                          {sessionStartRef.current.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: rows + status + green feature gallery (8/12) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden">
                  <div className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 backdrop-blur-md px-5 py-3 shadow-sm">
                    <span className="font-semibold text-gray-900">Welcome:</span>
                    <span className="font-medium text-gray-900">
                      {currentUser?.name || "User"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 backdrop-blur-md px-5 py-3 shadow-sm">
                    <span className="font-semibold text-gray-900">Role:</span>
                    <span className="capitalize font-medium text-gray-900">
                      {roleLabel}
                    </span>
                  </div>

                  {/* Backend status */}
                  <div className="rounded-xl border border-white/60 bg-white/70 backdrop-blur-md px-5 py-4 shadow-sm flex items-center gap-3">
                    {loading ? (
                      <div className="w-5 h-5 border-4 border-t-emerald-500 border-white/70 rounded-full animate-spin" />
                    ) : (
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${
                          message.startsWith("❌") ? "bg-red-500" : "bg-emerald-500"
                        }`}
                      />
                    )}
                    <span
                      className={`font-medium ${
                        message.startsWith("❌") ? "text-red-700" : "text-emerald-700"
                      }`}
                    >
                      {loading ? "Connecting..." : message}
                    </span>
                  </div>

                  {/* GREEN FEATURE GALLERY — purely client-side, no backend */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                    {/* Card 1: Create Event */}
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-4 shadow-sm">
                      <div className="h-10 w-10 rounded-lg bg-white shadow flex items-center justify-center mb-3">
                        {/* calendar icon */}
                        <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600">
                          <path fill="currentColor" d="M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v3H3V6a2 2 0 0 1 2-2h2V2Zm14 9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9h18ZM7 15h4v4H7v-4Z"/>
                        </svg>
                      </div>
                      <div className="text-sm font-semibold text-emerald-800">Create Event</div>
                      <p className="text-xs text-emerald-700/80 mt-1">Plan details, date & venue.</p>
                    </div>

                    {/* Card 2: Promote */}
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-4 shadow-sm">
                      <div className="h-10 w-10 rounded-lg bg-white shadow flex items-center justify-center mb-3">
                        {/* megaphone icon */}
                        <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600">
                          <path fill="currentColor" d="M3 10v4a1 1 0 0 0 1 1h2l4 4v-14l-4 4H4a1 1 0 0 0-1 1Zm14-4v12l4 2V4l-4 2Z"/>
                        </svg>
                      </div>
                      <div className="text-sm font-semibold text-emerald-800">Promote</div>
                      <p className="text-xs text-emerald-700/80 mt-1">Share links & updates.</p>
                    </div>

                    {/* Card 3: Track RSVPs */}
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-4 shadow-sm">
                      <div className="h-10 w-10 rounded-lg bg-white shadow flex items-center justify-center mb-3">
                        {/* ticket icon */}
                        <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600">
                          <path fill="currentColor" d="M3 7h18v4a2 2 0 0 0 0 2v4H3v-4a2 2 0 0 0 0-2V7Zm12 2v6h2V9h-2Z"/>
                        </svg>
                      </div>
                      <div className="text-sm font-semibold text-emerald-800">Track RSVPs</div>
                      <p className="text-xs text-emerald-700/80 mt-1">Monitor attendees live.</p>
                    </div>

                    {/* Card 4: Discover Nearby */}
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-4 shadow-sm">
                      <div className="h-10 w-10 rounded-lg bg-white shadow flex items-center justify-center mb-3">
                        {/* map pin icon */}
                        <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600">
                          <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/>
                        </svg>
                      </div>
                      <div className="text-sm font-semibold text-emerald-800">Discover Nearby</div>
                      <p className="text-xs text-emerald-700/80 mt-1">Find events around you.</p>
                    </div>
                  </div>

                  {/* Logout pinned to the bottom-right of right column */}
                  <div className="mt-auto flex">
                    <button
                      onClick={handleLogout}
                      className="ml-auto px-8 py-3 rounded-full bg-red-600 text-white font-semibold shadow-lg hover:shadow-xl hover:bg-red-700 transition transform hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-red-300"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* /grid */}
          </div>
          {/* /content */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
