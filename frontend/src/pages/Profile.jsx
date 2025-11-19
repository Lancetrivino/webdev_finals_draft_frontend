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

  // new state to hold events & computed stats
  const [allEvents, setAllEvents] = useState([]);
  const [eventsJoinedCount, setEventsJoinedCount] = useState(0);
  const [eventsCreatedCount, setEventsCreatedCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

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

  // Fetch events to compute joined/created counts
  useEffect(() => {
    const fetchEventsForStats = async () => {
      if (!currentUser) return;
      setLoadingStats(true);

      try {
        const token = localStorage.getItem("token") || currentUser?.token;
        const res = await fetch(`${API_BASE_URL}/api/events/available`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          // If the endpoint is protected and fails, don't crash UI — just keep counts 0
          console.warn("Failed to fetch events for stats:", res.status);
          setAllEvents([]);
          setEventsJoinedCount(0);
          setEventsCreatedCount(0);
          return;
        }

        const data = await res.json();
        const events = Array.isArray(data) ? data : [];
        setAllEvents(events);

        // compute counts
        const userId = currentUser._id || currentUser.id;
        let joined = 0;
        let created = 0;

        const checkIsCreator = (event) => {
          // Accept many shapes for creator
          const creatorCandidates = [
            event.creator,
            event.createdBy,
            event.owner,
            event.user,
            event.host,
            event.organizer,
            event.author,
            event.created_by,
            event.creatorId,
            event.userId,
            event.creator_id,
          ];

          for (const candidate of creatorCandidates) {
            if (!candidate) continue;
            if (typeof candidate === "object") {
              if (candidate._id === userId || candidate.id === userId || candidate.user === userId) return true;
              if (candidate.user && (candidate.user._id === userId || candidate.user.id === userId)) return true;
            } else {
              if (candidate === userId) return true;
            }
          }
          return false;
        };

        for (const ev of events) {
          // participants can be array of strings or objects
          const participants = ev.participants || [];
          const hasJoined = participants.some((p) => {
            if (!p) return false;
            if (typeof p === "object") {
              return p._id === userId || p.id === userId || p.user === userId;
            }
            return p === userId;
          });
          if (hasJoined) joined++;

          if (checkIsCreator(ev)) created++;
        }

        setEventsJoinedCount(joined);
        setEventsCreatedCount(created);
      } catch (err) {
        console.error("Error fetching events for profile stats:", err);
        setAllEvents([]);
        setEventsJoinedCount(0);
        setEventsCreatedCount(0);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchEventsForStats();
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    console.log("📸 File selected:", file); // Debug

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      setAvatar(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
        console.log("✅ Preview set"); // Debug
      };
      reader.readAsDataURL(file);
    }
  };

  const openFilePicker = () => {
    console.log("🖱️ File picker clicked"); // Debug
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    console.log("📤 Submitting profile update..."); // Debug
    console.log("  Name:", formData.name);
    console.log("  Address:", formData.address);
    console.log("  Avatar file:", avatar);

    setLoading(true);

    try {
      const token = localStorage.getItem("token") || currentUser?.token;
      if (!token) {
        toast.error("Please log in first.");
        navigate("/login");
        return;
      }

      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("address", formData.address || "");
      if (avatar) {
        formPayload.append("avatar", avatar);
        console.log("✅ Avatar attached to FormData"); // Debug
      }

      console.log("🌐 Sending request to:", `${API_BASE_URL}/api/users/profile`);

      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });

      console.log("📥 Response status:", res.status); // Debug

      const data = await res.json();
      console.log("📥 Response data:", data); // Debug

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      // Update auth context with new user data
      updateCurrentUser(data.user);

      // Also update localStorage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          ...data.user,
        })
      );

      toast.success("✅ Profile updated successfully!");

      // Clear avatar file state
      setAvatar(null);
    } catch (err) {
      console.error("❌ Error updating profile:", err);
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
                    className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full border border-violet-100 shadow-md flex items-center justify-center text-violet-700 hover:scale-105 transition-transform hover:bg-violet-50"
                    title="Change profile picture"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                      <path d="M12 4v16M5 12h14" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    aria-label="Upload profile picture"
                  />
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
                  placeholder="Enter your address (optional)"
                  className="w-full rounded-lg border border-violet-100 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {/* Updated: removed Reviews tile and resized/centered the remaining two */}
              <div className="mx-auto max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg border border-violet-100">
                  <div className="text-center">
                    <p className="text-4xl md:text-5xl font-extrabold text-violet-600">
                      {loadingStats ? "—" : eventsJoinedCount}
                    </p>
                    <p className="text-xs font-semibold text-gray-600 mt-1">Events Joined</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl md:text-5xl font-extrabold text-purple-600">
                      {loadingStats ? "—" : eventsCreatedCount}
                    </p>
                    <p className="text-xs font-semibold text-gray-600 mt-1">Events Created</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-violet-100">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 rounded-lg py-3 text-lg font-semibold shadow-md transition-all ${
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
                  className="flex-1 md:flex-none md:px-8 rounded-lg py-3 border border-red-500 bg-white text-red-600 font-semibold hover:bg-red-50 transition-all"
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
