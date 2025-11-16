import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../App";

function Profile() {
  const { currentUser, logout, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      toast.error("Please log in to view your profile.");
      navigate("/login");
    } else {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        address: currentUser.address || "",
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const openFilePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formPayload = new FormData();

      formPayload.append("name", formData.name);
      formPayload.append("address", formData.address || "");
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
      toast.success("✨ Profile updated successfully!");
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

  const getInitials = () => {
    const name = formData.name || formData.email || "User";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 py-12 px-4">
      {/* Animated Background Blobs */}
      <div className="fixed top-20 right-10 w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>

      <main className="w-full max-w-4xl mx-auto relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-violet-200">
          {/* Gradient Header */}
          <div className="h-32 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <div className="px-8 pb-8">
            {/* Avatar Section */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 -mt-16 mb-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center relative group">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-black text-white">{getInitials()}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={openFilePicker}
                      className="text-white font-bold"
                    >
                      Change
                    </button>
                  </div>
                </div>
                
                {/* Upload Button */}
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left md:pt-12">
                <h1 className="text-3xl font-black text-gray-900 mb-2">{formData.name || "User"}</h1>
                <p className="text-gray-600 mb-2">{formData.email}</p>
                {currentUser?.role && (
                  <span className="inline-block px-4 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-bold border-2 border-violet-200">
                    {currentUser.role}
                  </span>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-violet-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-4 focus:ring-violet-200 focus:border-violet-500 transition-all duration-200"
                    required
                  />
                </div>

                {/* Email (Disabled) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  className="w-full rounded-xl border-2 border-violet-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-4 focus:ring-violet-200 focus:border-violet-500 transition-all duration-200"
                />
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border-2 border-violet-200">
                <div className="text-center">
                  <p className="text-3xl font-black text-violet-600 mb-1">12</p>
                  <p className="text-xs font-semibold text-gray-600">Events Joined</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-purple-600 mb-1">5</p>
                  <p className="text-xs font-semibold text-gray-600">Events Created</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-indigo-600 mb-1">8</p>
                  <p className="text-xs font-semibold text-gray-600">Reviews Given</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-violet-200">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 rounded-xl py-4 text-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "💾 Save Changes"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 md:flex-none md:px-8 rounded-xl py-4 border-2 border-red-500 bg-white text-red-600 font-bold hover:bg-red-50 transition-all duration-200"
                >
                  🚪 Logout
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-4 bg-white rounded-2xl border-2 border-violet-200 hover:border-violet-400 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🏠
              </div>
              <div>
                <p className="font-bold text-gray-900">Dashboard</p>
                <p className="text-sm text-gray-600">View overview</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/events")}
            className="p-4 bg-white rounded-2xl border-2 border-violet-200 hover:border-violet-400 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📋
              </div>
              <div>
                <p className="font-bold text-gray-900">My Events</p>
                <p className="text-sm text-gray-600">Manage events</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/available-events")}
            className="p-4 bg-white rounded-2xl border-2 border-violet-200 hover:border-violet-400 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🎯
              </div>
              <div>
                <p className="font-bold text-gray-900">Browse Events</p>
                <p className="text-sm text-gray-600">Find new events</p>
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}

export default Profile;