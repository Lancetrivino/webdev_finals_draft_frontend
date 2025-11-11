import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const { currentUser, logout } = useAuth(); // logout kept but unused per request
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

  // ===== No page scroll: lock <html> and <body>, and use a fixed viewport =====
  const NAV_HEIGHT = 80; // Tailwind h-20; change if your navbar differs

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
        {/* Minimal, impactful card */}
        <div
          className="relative w-[min(1180px,96vw)] h-[min(680px,90vh)] rounded-[28px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden"
        >
          {/* Subtle green corner glows */}
          <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-200/30 blur-[72px]" />

          {/* Content */}
          <div className="relative flex flex-col h-full">
            {/* Header */}
            <div className="px-8 pt-8 pb-3 shrink-0 text-center">
              <h1 className="text-[clamp(34px,5.2vw,56px)] font-extrabold tracking-tight text-emerald-600">
                Eventure
              </h1>
              <div className="mx-auto mt-3 h-[3px] w-32 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" />
              <p className="mt-3 text-sm text-gray-600">
                {now.toLocaleDateString()} • {now.toLocaleTimeString()}
              </p>
            </div>

            {/* Main area */}
            <div className="px-8 pb-8 grow overflow-hidden">
              <div className="grid h-full gap-6 grid-cols-12">
                {/* Left: avatar + quick facts */}
                <div className="col-span-12 lg:col-span-4">
                  <div className="h-full rounded-2xl border border-gray-200 shadow-sm bg-white p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 text-white flex items-center justify-center font-bold text-lg shadow">
                        {initials}
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Welcome:</div>
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

                    <div className="mt-6 space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Local time</span>
                        <span className="font-medium text-gray-900">
                          {now.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Session start</span>
                        <span className="font-medium text-gray-900">
                          {sessionStartRef.current.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: data rows */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-5 overflow-hidden">
                  <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                    <span className="font-semibold text-gray-800">Welcome:</span>
                    <span className="font-medium text-gray-900">
                      {currentUser?.name || "User"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                    <span className="font-semibold text-gray-800">Role:</span>
                    <span className="capitalize font-medium text-gray-900">
                      {roleLabel}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm flex items-center gap-3">
                    {loading ? (
                      <div className="w-5 h-5 border-4 border-t-emerald-500 border-gray-200 rounded-full animate-spin" />
                    ) : (
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${
                          message.startsWith("❌") ? "bg-red-500" : "bg-emerald-500"
                        }`}
                      />
                    )}
                    <span
                      className={`font-medium ${
                        message.startsWith("❌") ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {loading ? "Connecting..." : message}
                    </span>
                  </div>

                  {/* Spacer to keep balance */}
                  <div className="grow" />
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
