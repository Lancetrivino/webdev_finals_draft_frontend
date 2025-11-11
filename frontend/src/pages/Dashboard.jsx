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
    if (r.includes("admin"))
      return "bg-rose-50 text-rose-700 border-rose-200";
    if (r.includes("organizer") || r.includes("host"))
      return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }, [roleLabel]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // If your navbar height is NOT 80px, change this number.
  const containerStyle = { height: "calc(100svh - 80px)" };

  return (
    // Window must not scroll; container height = viewport minus navbar
    <div
      className="w-full bg-white flex items-center justify-center overflow-hidden"
      style={containerStyle}
    >
      {/* Card fits within container; inner content can scroll if needed */}
      <div className="relative w-[min(1100px,94vw)] h-[min(100%,760px)] rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
        {/* ---------- FULL-CARD 'PAINT' BACKGROUND ---------- */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(40rem 28rem at 55% 45%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 35%, rgba(255,255,255,0.35) 60%, rgba(255,255,255,0.15) 75%, transparent 100%), conic-gradient(from 90deg at 50% 50%, #FDE68A, #F0ABFC, #93C5FD, #86EFAC, #FDE68A)",
            filter: "blur(28px)",
            opacity: 0.95,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            WebkitMaskImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0.75) 80%, rgba(0,0,0,0) 100%)",
            maskImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0.75) 80%, rgba(0,0,0,0) 100%)",
            background:
              "radial-gradient(closest-side, rgba(255,255,255,0.9), rgba(255,255,255,0))",
          }}
        />

        {/* ---------- CONTENT (scrolls only inside the card if necessary) ---------- */}
        <div className="relative h-full overflow-auto">
          {/* Header (compact to help fit) */}
          <div className="px-6 sm:px-10 pt-6 pb-2">
            <h1 className="text-center text-5xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
              Welcome
            </h1>
          </div>

          {/* Grid */}
          <div className="px-6 sm:px-10 pb-6">
            <div className="grid gap-5 lg:grid-cols-3">
              {/* Left: avatar + facts */}
              <div className="lg:col-span-1">
                <div className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-md shadow-md p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
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

                  <div className="mt-5 space-y-2.5 text-sm">
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

              {/* Right: rows + status + logout */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-white/60 bg-white/60 backdrop-blur-md px-5 py-3 shadow-sm">
                  <span className="font-semibold text-gray-900">Welcome:</span>
                  <span className="font-medium text-gray-900">
                    {currentUser?.name || "User"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/60 bg-white/60 backdrop-blur-md px-5 py-3 shadow-sm">
                  <span className="font-semibold text-gray-900">Role:</span>
                  <span className="capitalize font-medium text-gray-900">
                    {roleLabel}
                  </span>
                </div>

                <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-md px-5 py-4 shadow-sm flex items-center gap-3">
                  {loading ? (
                    <div className="w-5 h-5 border-4 border-t-violet-500 border-white/70 rounded-full animate-spin" />
                  ) : (
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${
                        message.startsWith("❌") ? "bg-red-500" : "bg-green-500"
                      }`}
                    />
                  )}
                  <span
                    className={`font-medium ${
                      message.startsWith("❌") ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    {loading ? "Connecting..." : message}
                  </span>
                </div>

                <div className="pt-1 flex">
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
          {/* /Grid */}
        </div>
        {/* /Content */}
      </div>
      {/* /Card */}
    </div>
  );
}

export default Dashboard;
