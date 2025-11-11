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
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-10">
      {/* Card */}
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-xl border border-gray-100 overflow-hidden p-10">

        {/* Decorative hero section */}
        <div className="relative flex flex-col items-center text-center mb-10">
          {/* Rainbow glow */}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-90"
            style={{
              maskImage: "radial-gradient(circle, white 40%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(circle, white 40%, transparent 75%)",
            }}
          >
            <div
              className="w-[32rem] h-[32rem] blur-3xl"
              style={{
                background:
                  "conic-gradient(from 90deg at 50% 50%, #FDE68A, #F0ABFC, #93C5FD, #86EFAC, #FDE68A)"
              }}
            />
          </div>

          {/* Title */}
          <h1 className="relative text-5xl font-extrabold text-gray-800 drop-shadow-sm">
            Welcome
          </h1>
          <p className="relative mt-2 text-sm font-semibold text-violet-700/70">
            Fleeped Dashboard
          </p>
        </div>

        {/* Information Section */}
        <div className="relative space-y-5">

          {currentUser && (
            <>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-5 py-3 border border-gray-200 shadow-sm">
                <span className="font-semibold text-gray-700">Welcome:</span>
                <span className="font-medium text-gray-800">{currentUser.name}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-5 py-3 border border-gray-200 shadow-sm">
                <span className="font-semibold text-gray-700">Role:</span>
                <span className="capitalize font-medium text-gray-800">
                  {currentUser.role}
                </span>
              </div>
            </>
          )}

          {/* Backend status */}
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
          <div className="pt-4 flex justify-center">
            <button
              onClick={handleLogout}
              className="px-8 py-3 rounded-full bg-red-600 text-white font-semibold shadow-lg hover:shadow-xl hover:bg-red-700 transition transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
