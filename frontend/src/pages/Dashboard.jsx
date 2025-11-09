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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-green-600 mb-6">Dashboard</h2>

        {currentUser && (
          <div className="mb-6 text-gray-700 space-y-2">
            <p>
              <strong>Welcome:</strong> {currentUser.name}
            </p>
            <p>
              <strong>Role:</strong>{" "}
              <span className="capitalize font-medium">{currentUser.role}</span>
            </p>
          </div>
        )}

        <div className="p-4 border rounded-xl bg-gray-50 mb-6 flex items-center justify-center gap-2">
          {loading ? (
            <div className="w-6 h-6 border-4 border-t-orange-500 border-gray-200 rounded-full animate-spin"></div>
          ) : null}
          <span
            className={`font-medium ${
              message.startsWith("❌") ? "text-red-600" : "text-green-600"
            }`}
          >
            {loading ? "Connecting..." : message}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition w-full"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
