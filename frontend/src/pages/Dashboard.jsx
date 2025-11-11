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

  // Fetch backend connectivity
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

  // live clock update
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const initials = useMemo(() => {
    const name = currentUser?.name || currentUser?.email || "User";
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [currentUser]);

  const roleLabel = currentUser?.role || "User";

  const roleBadge = useMemo(() => {
    const r = roleLabel.toLowerCase();
    if (r.includes("admin")) return "bg-rose-50 text-rose-700 border-rose-200";
    if (r.includes("organizer") || r.includes("host"))
      return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }, [roleLabel]);

  // Disable page scroll
  const NAV_HEIGHT = 80;
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
    <div className="fixed left-0 right-0 bottom-0 bg-white" style={{ top: NAV_HEIGHT }}>
      <div className="h-full w-full flex items-center justify-center p-2 sm:p-4">
        <div
          className="relative w-[min(1400px,98vw)] h-[min(820px,92vh)] rounded-[32px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.07)] border border-gray-100 overflow-hidden"
        >
          {/* large ambient glow */}
          <div className="pointer-events-none absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-48 -right-40 w-[500px] h-[500px] rounded-full bg-emerald-200/30 blur-[90px]" />

          <div className="relative flex flex-col h-full">
            {/* Header */}
            <div className="px-10 pt-10 pb-6">
              <h1 className="text-[clamp(36px,5vw,62px)] text-center font-extrabold text-emerald-600 tracking-tight">
                Eventure
              </h1>
              <div className="mx-auto mt-4 h-[4px] w-40 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" />
            </div>

            {/* Main */}
            <div className="px-10 pb-10 flex-grow overflow-hidden">
              <div className="grid h-full gap-8 grid-cols-12">
                {/* Left Panel */}
                <div className="col-span-12 lg:col-span-4">
                  <div className="h-full rounded-3xl border border-gray-200 shadow-sm bg-white p-8">
                    <div className="flex items-center gap-6">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 text-white flex items-center justify-center font-bold text-3xl shadow-lg">
                        {initials}
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Welcome:</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {currentUser?.name || "User"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${roleBadge}`}
                      >
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-current opacity-70" />
                        Role: <span className="capitalize">{roleLabel}</span>
                      </span>
                    </div>

                    <div className="mt-8 space-y-4 text-base">
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

                {/* Right Panel */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
                  <div className="rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-800">Welcome:</span>
                    <span className="text-lg font-medium text-gray-900">
                      {currentUser?.name || "User"}
                    </span>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-800">Role:</span>
                    <span className="capitalize text-lg font-medium text-gray-900">
                      {roleLabel}
                    </span>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm flex items-center gap-4">
                    {loading ? (
                      <div className="w-6 h-6 border-4 border-t-emerald-500 border-gray-200 rounded-full animate-spin" />
                    ) : (
                      <span
                        className={`inline-block h-4 w-4 rounded-full ${
                          message.startsWith("❌") ? "bg-red-500" : "bg-emerald-500"
                        }`}
                      />
                    )}
                    <span
                      className={`text-lg font-medium ${
                        message.startsWith("❌") ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {loading ? "Connecting..." : message}
                    </span>
                  </div>

                  {/* filler for balance */}
                  <div className="flex-grow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}

export default Dashboard;
