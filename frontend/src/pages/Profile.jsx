import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../App";

function Profile() {
  const { currentUser, logout, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (!currentUser) {
      toast.error("Please log in to view your profile.");
      navigate("/login");
    } else {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
      });
      setAvatarPreview(currentUser.avatar || ""); // Optional: existing avatar URL
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      if (avatar) formPayload.append("avatar", avatar);

      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile.");

      // ✅ Update context & localStorage without logout
      updateCurrentUser(data.user);

      toast.success("✅ Profile updated successfully!");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-right from-orange-900 via-orange-700 to-orange-500 p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          My Profile
        </h2>

        {currentUser && (
          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <label className="block text-gray-700 font-semibold mb-2">Profile Picture</label>
              <div className="w-24 h-24 rounded-full overflow-hidden mb-2 border-2 border-gray-300">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xl">
                    👤
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Role</label>
              <p className="w-full border border-gray-200 rounded-lg p-3 bg-gray-100 text-gray-700 capitalize">
                {currentUser.role}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-semibold text-white rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-right from-orange-800 via-orange-600 to-orange-500 hover:opacity-90"
              }`}
            >
              {loading && (
                <div className="w-5 h-5 border-2 border-t-white border-gray-200 rounded-full animate-spin"></div>
              )}
              {loading ? "Saving..." : "Update Profile"}
            </button>
          </form>
        )}

        <button
          onClick={handleLogout}
          className="w-full mt-4 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;
