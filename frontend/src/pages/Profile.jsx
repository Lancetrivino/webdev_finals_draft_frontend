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
      toast.success("Profile updated successfully");
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
    <div
      className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 py-12 px-4"
      style={{ paddingTop: "calc(var(--nav-height,72px) + 24px)" }}
    >
      <main className="w-full max-w-4xl mx-auto relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-violet-100">

          <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 h-36 flex items-center px-8">
            <div className="w-full max-w-3xl mx-auto grid grid-cols-12 gap-4 items-center">

              <div className="col-span-3">
                <div className="relative w-fit mx-auto md:mx-0">
                  <div className="w-28 h-28 rounded-md overflow-hidden border-4 border-white bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-extrabold text-white">{getInitials()}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full border border-violet-100 shadow-md flex items-center justify-center text-violet-700 hover:scale-105 transition-transform"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                      <path d="M12 4v16M5 12h14" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>

                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </div>
              </div>

              <div className="col-span-9 text-white">
                <div className="text-sm font-semibold opacity-90">{currentUser?.role || ""}</div>
                <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{formData.name || "User"}</h1>
                <div className="text-sm opacity-90 mt-1">{formData.email}</div>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8 pt-6">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-violet-100 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-violet-100 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg border border-violet-100">
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-violet-600">12</p>
                  <p className="text-xs font-semibold text-gray-600">Events Joined</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-purple-600">5</p>
                  <p className="text-xs font-semibold text-gray-600">Events Created</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-indigo-600">8</p>
                  <p className="text-xs font-semibold text-gray-600">Reviews Given</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-violet-100">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 rounded-lg py-3 text-lg font-semibold shadow-md ${
                    loading
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90"
                  }`}
                >
                  {loading ? "Updating..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 md:flex-none md:px-8 rounded-lg py-3 border border-red-500 bg-white text-red-600 font-semibold hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-4 bg-white rounded-lg border border-violet-100 hover:border-violet-200 hover:shadow-md transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-violet-50">
                <div className="w-4 h-4 bg-violet-600 rounded-sm"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Dashboard</p>
                <p className="text-sm text-gray-600">View overview</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/events")}
            className="p-4 bg-white rounded-lg border border-violet-100 hover:border-violet-200 hover:shadow-md transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-50">
                <div className="w-4 h-4 bg-purple-600 rounded-sm"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">My Events</p>
                <p className="text-sm text-gray-600">Manage events</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/available-events")}
            className="p-4 bg-white rounded-lg border border-violet-100 hover:border-violet-200 hover:shadow-md transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-50">
                <div className="w-4 h-4 bg-indigo-600 rounded-sm"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Browse Events</p>
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
