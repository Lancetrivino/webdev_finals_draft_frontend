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
  const NAV_HEIGHT = 80; // Tailwind h-20

  useEffect(() => {
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

            {/* Main grid; right side gets more space */}
            <div className="px-6 sm:px-10 pb-6 grow overflow-hidden">
              <div className="grid h-full gap-5 grid-cols-12">
                {/* Left: avatar + facts */}
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

                {/* Right: rows + status + IMAGE GALLERY */}
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

                  {/* Pale-green image gallery (replaces the icon cards) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Image 1 */}
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-100 shadow-sm">
                      <img
                        src="/images/green-poly.jpg"
                        alt="Soft green polygon background"
                        className="h-40 w-full object-cover"
                      />
                      {/* pale green overlay */}
                      <div className="absolute inset-0 bg-emerald-400/25 mix-blend-multiply" />
                    </div>

                    {/* Image 2 */}
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-100 shadow-sm">
                      <img
                        src="/images/event-night.jpg"
                        alt="Event night poster"
                        className="h-40 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-emerald-400/25 mix-blend-multiply" />
                    </div>

                    {/* Image 3 */}
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-100 shadow-sm">
                      <img
                        src="/images/summer-festival.jpg"
                        alt="Summer music festival"
                        className="h-40 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-emerald-400/25 mix-blend-multiply" />
                    </div>
                  </div>

                  {/* Logout pinned to the bottom-right */}
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
