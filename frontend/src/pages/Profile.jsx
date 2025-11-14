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
      setAvatarPreview(currentUser.avatar || "");
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
    // ensure content sits below a fixed navbar and the full card is visible
    <div className="min-h-screen bg-[#EDE9E6] pt-24 pb-12 flex items-start justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-visible">
        <div className="px-8 py-8">
          <h2 className="text-2xl font-bold text-[#2C2C2C] text-center mb-4">My Profile</h2>

          {currentUser && (
            <form onSubmit={handleUpdate} className="space-y-5">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <label className="block text-sm font-semibold text-[#2C2C2C] mb-2">Profile Picture</label>

                <div
                  className="w-28 h-28 rounded-full overflow-hidden mb-3 flex items-center justify-center border-2"
                  style={{
                    borderColor: "rgba(44,44,44,0.06)",
                    background: avatarPreview
                      ? "transparent"
                      : "linear-gradient(135deg,#EDE9E6,#C9BEB3)",
                  }}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-2xl text-[#2C2C2C]">👤</div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="text-sm text-slate-600"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-[#2C2C2C] mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#C9BEB3] transition"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#2C2C2C] mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full border border-gray-200 rounded-lg p-3 bg-gray-100 cursor-not-allowed text-slate-700"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-[#2C2C2C] mb-1">Role</label>
                <p className="w-full border border-gray-100 rounded-lg p-3 bg-gray-50 text-slate-700 capitalize">
                  {currentUser.role}
                </p>
              </div>

              {/* Update button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white font-semibold shadow-md transition-transform transform hover:scale-[1.02] flex items-center justify-center gap-3 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#7A6C5D] hover:bg-[#5F5245]"
                }`}
              >
                {loading && (
                  <div className="w-5 h-5 border-2 border-t-white border-gray-200 rounded-full animate-spin"></div>
                )}
                {loading ? "Saving..." : "Update Profile"}
              </button>
            </form>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full mt-4 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
