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

  // Check backend status (original logic)
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

  // Live local time
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

  return (
    <div className="min-h-screen flex items-start justify-center bg-white px-4 py-12">
      {/* Outer Card */}
      <div className="relative w-full max-w-5xl rounded-3xl bg-white shadow-xl border border-gray-100 overflow-hidden">

        {/* Paint Hero */}
        <div className="relative px-6 sm:px-10 pt-12 pb-8">
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              maskImage: "radial-gradient(circle, white 40%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(circle, white 40%, transparent 75%)",
            }}
          >
            <div
              className="w-[36rem] h-[36rem] blur-3xl"
              style={{
                background:
                  "conic-gradient(from 90deg at 50% 50%, #FDE68A, #F0ABFC, #93C5FD, #86EFAC, #FDE68A)",
              }}
            />
          </div>

          <h1 className="relative text-center text-5xl sm:text-6xl font-extrabold text-gray-800 drop-shadow-sm">
            Welcome
          </h1>
        </div>

        {/* Content */}
        <div className="relative px-6 sm:px-10 pb-10">
          <div className="grid gap-6 lg:grid-cols-3">

            {/* Left side: avatar + user info */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Welcome:</div>
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
                    <span className="text-gray-500">Local time</span>
                    <span className="font-medium text-gray-800">
                      {now.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Session start</span>
                    <span className="font-medium text-gray-800">
                      {sessionStartRef.current.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: welcome, role, backend status */}
            <div className="lg:col-span-2 space-y-5">

              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-5 py-3 border border-gray-200 shadow-sm">
                <span className="font-semibold text-gray-700">Welcome:</span>
                <span className="font-medium text-gray-800">
                  {currentUser?.name || "User"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-5 py-3 border border-gray-200 shadow-sm">
                <span className="font-semibold text-gray-700">Role:</span>
                <span className="capitalize font-medium text-gray-800">
                  {roleLabel}
                </span>
              </div>

              <div className="rounded-xl bg-gray-50 px-5 py-4 border border-gray-200 shadow-sm flex items-center gap-3">
                {loading ? (
                  <div className="w-5 h-5 border-4 border-t-violet-500 border-gray-200 rounded-full animate-spin" />
                ) : (
                  <span
                    className={`inline-block h-3 w-3 rounded-full ${
                      message.startsWith("❌") ? "bg-red-500" : "bg-green-500"
                    }`}
                  />
                )}

                <span
                  className={`font-medium ${
                    message.startsWith("❌") ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {loading ? "Connecting..." : message}
                </span>
              </div>

              {/* Logout */}
              <div className="pt-2 flex">
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

      </div>
    </div>
  );
}

export default Dashboard;
