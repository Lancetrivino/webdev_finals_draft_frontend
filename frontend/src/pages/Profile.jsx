import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../App";

function Profile() {
  const { currentUser, logout, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", address: "" });
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
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // called by the circular edit button to open file picker
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
      toast.success("Profile updated successfully!");
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
    <div
      className="min-h-screen flex items-start justify-center pt-24 pb-12 px-4"
      style={{
        background:
          "linear-gradient(135deg,#6b39c9 0%, #7a48d6 20%, #4da6d8 60%, #2fa8c9 100%)",
      }}
    >
      <main className="w-full max-w-md">
        <div
          className="mx-auto rounded-3xl shadow-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 100%)",
            borderRadius: "24px",
            maxWidth: 720,
          }}
        >
          <div className="flex justify-center">
            <section className="w-full max-w-md px-8 py-10">
              <h2 className="text-2xl font-bold text-[#1b1b1b] text-center mb-4">
                My Profile
              </h2>

              {currentUser && (
                <form onSubmit={handleUpdate} className="space-y-5">
                  {/* Avatar + edit button */}
                  <div className="flex flex-col items-center relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Profile Picture
                    </label>

                    <div
                      className="w-28 h-28 rounded-full overflow-hidden mb-3 flex items-center justify-center relative"
                      style={{
                        border: "2px solid rgba(0,0,0,0.06)",
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
                        <div className="text-2xl text-slate-700">👤</div>
                      )}

                      {/* Edit button (bottom-right overlay) */}
                      <button
                        type="button"
                        onClick={openFilePicker}
                        aria-label="Edit profile picture"
                        className="absolute -right-2 -bottom-2 w-9 h-9 rounded-full bg-white border shadow-sm flex items-center justify-center hover:scale-105 transition"
                        title="Change avatar"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-[#7A6C5D]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536M3 21h4.586a1 1 0 00.707-.293L19.414 9.586a2 2 0 000-2.828l-3.172-3.172a2 2 0 00-2.828 0L5.293 12.414A1 1 0 005 13.121V17a1 1 0 001 1z"
                          />
                        </svg>
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-full border-2 border-black/20 bg-white/70 px-5 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#C9BEB3]/25 transition"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full rounded-full border-2 border-black/10 bg-gray-100 px-5 py-3 text-sm text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Add your address"
                      className="w-full rounded-full border-2 border-black/20 bg-white/70 px-5 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#C9BEB3]/25 transition"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Role
                    </label>
                    <p className="w-full rounded-full border-2 border-black/10 bg-gray-50 px-5 py-3 text-sm text-slate-700 capitalize">
                      {currentUser.role}
                    </p>
                  </div>

                  {/* Update button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full rounded-full py-3 text-lg font-bold transition flex items-center justify-center ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-[#1f2937] hover:bg-black text-[#5ea0ff]"
                    }`}
                  >
                    {loading ? "Saving..." : "Update Profile"}
                  </button>
                </form>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full mt-4 rounded-full py-3 bg-red-600 text-white font-semibold shadow-md hover:bg-red-700 transition"
              >
                Logout
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
