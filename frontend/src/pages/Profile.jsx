import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../App";

function Profile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      toast.error("Please log in to view your profile.");
      navigate("/login");
    } else {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
      });
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile.");

      toast.success("✅ Profile updated successfully!");
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.info("Please re-login to see changes.");
      logout();
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2EEEB] p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8 border border-[#D9D2CC]">
        <h2 className="text-2xl font-bold text-center text-[#5B5149] mb-6">
          My Profile
        </h2>

        {currentUser && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-[#5B5149] font-semibold mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-[#D9D2CC] rounded-lg p-3 focus:ring-2 focus:ring-[#B0755E] outline-none bg-[#FAF8F7]"
              />
            </div>

            <div>
              <label className="block text-[#5B5149] font-semibold mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full border border-[#D9D2CC] rounded-lg p-3 bg-[#EDE8E5] cursor-not-allowed text-gray-600"
              />
            </div>

            <div>
              <label className="block text-[#5B5149] font-semibold mb-1">
                Role
              </label>
              <p className="w-full border border-[#D9D2CC] rounded-lg p-3 bg-[#EDE8E5] text-[#5B5149]">
                {currentUser.role}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-semibold text-white rounded-lg shadow-md transition-transform transform hover:scale-105 ${
                loading
                  ? "bg-[#A39C96] cursor-not-allowed"
                  : "bg-[#8B6B61] hover:bg-[#7A5D55]"
              }`}
            >
              {loading ? "Saving..." : "Update Profile"}
            </button>
          </form>
        )}

        <button
          onClick={handleLogout}
          className="w-full mt-4 py-3 bg-[#B05E48] text-white font-semibold rounded-lg shadow-md hover:bg-[#9C4E3A] transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;
