import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [message, setMessage] = useState("Connecting to backend...");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8DAFF] px-4">
      {/* Card */}
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden px-6 sm:px-10 py-14">
        {/* Subtle label */}
        <span className="absolute top-6 left-6 text-sm font-semibold text-violet-700/70">
          Fleeped
        </span>

        {/* Soft rainbow blob */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="w-72 h-72 sm:w-[26rem] sm:h-[26rem] rounded-full blur-3xl opacity-90"
            style={{
              background:
                "radial-gradient(closest-side, rgba(255,255,255,0.9), transparent 65%), conic-gradient(from 90deg at 50% 50%, #FDE68A, #F0ABFC, #93C5FD, #86EFAC, #FDE68A)"
            }}
          />
        </div>

        {/* Center title */}
        <div className="relative flex items-center justify-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white drop-shadow-md select-none">
            Welcome
          </h1>
        </div>

        {/* Info panel */}
        <div className="relative mt-10 mx-auto max-w-2xl">
          {/* Rows */}
          <div className="grid gap-3 text-[15px] sm:text-base text-gray-700">
            {currentUser && (
              <>
                <div className="flex items-center justify-between rounded-xl bg-violet-50/60 border border-violet-100 px-4 py-3">
                  <span className="font-semibold text-gray-700">Welcome:</span>
                  <span className="font-medium text-gray-800">
                    {currentUser.name}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-violet-50/60 border border-violet-100 px-4 py-3">
                  <span className="font-semibold text-gray-700">Role:</span>
                  <span className="capitalize font-medium text-gray-800">
                    {currentUser.role}
                  </span>
                </div>
              </>
            )}

            {/* Backend status */}
            <div className="rounded-xl border px-4 py-3 bg-white/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {loading ? (
                  <div className="w-5 h-5 border-4 border-t-violet-500 border-gray-200 rounded-full animate-spin" />
                ) : (
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${
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
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-8 w-full sm:w-auto px-8 py-3 rounded-full bg-red-600 text-white font-semibold shadow-xl transition duration-300 hover:bg-red-700 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
