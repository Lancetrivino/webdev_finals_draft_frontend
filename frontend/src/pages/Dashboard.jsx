import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const { currentUser } = useAuth();
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

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Avatar initials
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

  // Pretty role badge (purple theme)
  const roleBadge = useMemo(() => {
    const r = roleLabel.toLowerCase();
    if (r.includes("admin")) return "bg-rose-50 text-rose-700 border-rose-200";
    if (r.includes("organizer") || r.includes("host"))
      return "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200";
    return "bg-violet-50 text-violet-700 border-violet-200";
  }, [roleLabel]);

  // ===== No page scroll =====
  const NAV_HEIGHT = 80; // adjust if your navbar differs
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
    // Fixed area under navbar
    <div className="fixed left-0 right-0 bottom-0 bg-[#fbfbff]" style={{ top: NAV_HEIGHT }}>
      <div className="h-full w-full flex items-center justify-center p-2 sm:p-4">
        {/* Main Card */}
        <div
          className="relative w-[min(1400px,98vw)] h-[min(820px,92vh)] rounded-[30px] overflow-hidden border border-white/60 shadow-[0_25px_80px_rgba(30,27,75,0.10)]"
          style={{
            background:
              "radial-gradient(1200px 600px at 50% -10%, rgba(233,213,255,0.55), transparent 60%), radial-gradient(1200px 600px at 50% 110%, rgba(191,219,254,0.55), transparent 60%), linear-gradient(180deg, #ffffff 0%, #f9f7ff 100%)",
          }}
        >
          {/* top accent bar like your reference */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-400 via-fuchsia-500 to-pink-400" />

          {/* soft decorative glow */}
          <div className="pointer-events-none absolute -top-24 right-16 w-56 h-56 rounded-full bg-white/35 backdrop-blur-xl shadow-[0_10px_35px_rgba(99,102,241,0.25)]" />
          <div className="pointer-events-none absolute -bottom-24 left-10 w-72 h-72 rounded-full bg-white/25 backdrop-blur-xl shadow-[0_10px_35px_rgba(236,72,153,0.20)]" />

          {/* CONTENT */}
          <div className="relative flex flex-col h-full">
            {/* Header */}
            <div className="px-8 pt-10 pb-4">
              <h1 className="text-center text-[clamp(36px,5vw,60px)] font-extrabold tracking-tight text-[#0b1220]">
                Eventure
              </h1>
              <p className="mt-2 text-center text-sm text-gray-500">
                {now.toLocaleDateString()} • {now.toLocaleTimeString()}
              </p>
            </div>

            {/* Main Grid */}
            <div className="px-8 pb-10 flex-grow overflow-hidden">
              <div className="grid h-full gap-8 grid-cols-12">
                {/* Left Panel */}
                <div className="col-span-12 lg:col-span-4">
                  <div className="h-full rounded-3xl border border-white/70 bg-white/70 backdrop-blur-md shadow-[0_10px_30px_rgba(17,24,39,0.06)] p-7">
                    <div className="flex items-center gap-5">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-[0_10px_25px_rgba(99,102,241,0.35)]">
                        {initials}
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-gray-500">
                          Welcome
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {currentUser?.name || "User"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${roleBadge}`}
                      >
                        <span className="inline-block h-2 w-2 rounded-full bg-current opacity-70" />
                        Role: <span className="capitalize">{roleLabel}</span>
                      </span>
                    </div>

                    <div className="mt-7 space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Local time</span>
                        <span className="font-medium text-gray-900">
                          {now.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Session start</span>
                        <span className="font-medium text-gray-900">
                          {sessionStartRef.current.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
                  {/* Welcome row */}
                  <div className="rounded-3xl border border-white/70 bg-white/75 backdrop-blur-md px-6 py-4 shadow-[0_10px_30px_rgba(17,24,39,0.06)] flex items-center justify-between">
                    <span className="text-base sm:text-lg font-semibold text-gray-800">
                      Welcome:
                    </span>
                    <span className="text-base sm:text-lg font-medium text-gray-900">
                      {currentUser?.name || "User"}
                    </span>
                  </div>

                  {/* Role row */}
                  <div className="rounded-3xl border border-white/70 bg-white/75 backdrop-blur-md px-6 py-4 shadow-[0_10px_30px_rgba(17,24,39,0.06)] flex items-center justify-between">
                    <span className="text-base sm:text-lg font-semibold text-gray-800">
                      Role:
                    </span>
                    <span className="capitalize text-base sm:text-lg font-medium text-gray-900">
                      {roleLabel}
                    </span>
                  </div>

                  {/* Backend status row */}
                  <div className="rounded-3xl border border-white/70 bg-white/75 backdrop-blur-md px-6 py-5 shadow-[0_10px_30px_rgba(17,24,39,0.06)] flex items-center gap-4">
                    {loading ? (
                      <div className="w-5 h-5 border-4 border-t-indigo-500 border-gray-200 rounded-full animate-spin" />
                    ) : (
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${
                          message.startsWith("❌") ? "bg-rose-500" : "bg-indigo-500"
                        }`}
                      />
                    )}
                    <span
                      className={`text-base sm:text-lg font-medium ${
                        message.startsWith("❌") ? "text-rose-600" : "text-indigo-600"
                      }`}
                    >
                      {loading ? "Connecting..." : message}
                    </span>
                  </div>

                  {/* spacer */}
                  <div className="flex-grow" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /card */}
      </div>
    </div>
  );
}

export default Dashboard;
