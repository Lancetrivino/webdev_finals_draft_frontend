import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.info("Please login to view events");
      navigate("/login");
      return;
    }

    const { token } = JSON.parse(storedUser);

    const fetchEvents = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_BASE}/api/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch events");
        setEvents(data);
      } catch (error) {
        toast.error("Failed to load events. Check your connection or permissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [navigate]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const { token } = storedUser;
      const API_BASE = import.meta.env.VITE_API_URL;

      const res = await fetch(`${API_BASE}/api/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete event");

      toast.success("Event deleted successfully.");
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
    } catch {
      toast.error("Failed to delete event.");
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || event.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-violet-600 mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading events...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    const role = JSON.parse(localStorage.getItem("user"))?.role || "User";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
        <div className="text-center max-w-md bg-white rounded-3xl shadow-2xl p-12 border-2 border-violet-200">
          <div className="w-24 h-24 rounded-lg flex items-center justify-center mx-auto mb-8 bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {role === "Admin" ? "No events available" : "No events yet"}
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {role === "Admin"
              ? "Create your first event to get started!"
              : "Create an event and it will appear here after admin approval."}
          </p>

          <Link
            to="/create-event"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </Link>
        </div>
      </div>
    );
  }

  const statusStyles = {
    Approved: "bg-green-100 text-green-700 border-green-300",
    Pending: "bg-amber-100 text-amber-700 border-amber-300",
    Rejected: "bg-red-100 text-red-700 border-red-300",
  };

  const sortOptions = [
    { value: "all", label: "All Status" },
    { value: "approved", label: "Approved" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="min-h-screen pt-28 py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-violet-200 relative z-20">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-5xl font-black text-gray-900 mb-3 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {JSON.parse(localStorage.getItem("user"))?.role === "Admin"
                    ? "All Events"
                    : "My Events"}
                </h1>
                <p className="text-gray-600 text-lg">
                  {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} {filterStatus !== "all" && `(${filterStatus})`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 px-4 py-3 pl-12 rounded-xl border-2 border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-200 outline-none transition-all"
                    aria-label="Search events"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <div className="relative" ref={sortRef}>
                  <button
                    type="button"
                    onClick={() => setSortOpen((s) => !s)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-violet-200 bg-white focus:outline-none focus:ring-4 focus:ring-violet-200 transition transform active:scale-95"
                    aria-expanded={sortOpen}
                    aria-haspopup="listbox"
                  >
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM8 13h8M10 9v10M14 9v10" />
                    </svg>
                    <span className="text-gray-700 font-medium">
                      {sortOptions.find(o => o.value === filterStatus)?.label || "Filter"}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 ml-1 transition-transform ${sortOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 011.04 1.08l-4.25 4a.75.75 0 01-1.06 0l-4.25-4a.75.75 0 01-.02-1.06z" />
                    </svg>
                  </button>

                  <ul
                    role="listbox"
                    className={`absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-violet-100 overflow-hidden transition-all transform origin-top-right ${sortOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
                  >
                    {sortOptions.map((opt) => (
                      <li
                        key={opt.value}
                        role="option"
                        onClick={() => { setFilterStatus(opt.value); setSortOpen(false); }}
                        className={`px-4 py-3 cursor-pointer text-gray-700 hover:bg-violet-50 transition-colors active:scale-95 ${filterStatus === opt.value ? "bg-violet-50 font-semibold" : ""}`}
                      >
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/create-event"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Event
                </Link>
              </div>
            </div>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-violet-200">
            <svg className="mx-auto mb-4 w-12 h-12 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const remainingSlots = event.capacity - (event.participants?.length || 0);

              return (
                <article
                  key={event._id}
                  className="group overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-violet-100"
                >
                  <div className="relative h-48 overflow-hidden">
                    {event.image || event.imageData ? (
                      <img
                        src={event.image || event.imageData}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-100">
                        <svg className="w-12 h-12 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-semibold backdrop-blur-sm border ${statusStyles[event.status] || "bg-gray-100 text-gray-700 border-gray-300"}`}
                      >
                        {event.status || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-violet-600 transition-colors">
                      {event.title}
                    </h3>

                    {event.averageRating > 0 && (
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-violet-50">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.round(event.averageRating) ? "text-yellow-400" : "text-gray-200"}`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{event.averageRating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({event.totalReviews})</span>
                      </div>
                    )}

                    <div className="space-y-3 mb-5 text-sm text-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="4" width="18" height="14" rx="2" strokeWidth="1.5" />
                            <path d="M8 2v4M16 2v4" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <span className="font-medium">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 10v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M12 3v7" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <span className="line-clamp-1 font-medium">{event.venue}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M17 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="12" cy="7" r="3" strokeWidth="1.5" />
                          </svg>
                        </div>
                        <span className="font-bold text-violet-600">{remainingSlots} slots remaining</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">{event.description}</p>

                    <div className="flex flex-col gap-3">
                      <Link
                        to={`/events/${event._id}`}
                        className="w-full text-center px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-lg hover:from-violet-700 hover:to-purple-700 shadow transition transform hover:-translate-y-0.5"
                      >
                        View Details
                      </Link>

                      <div className="flex gap-2">
                        <Link
                          to={`/events/edit/${event._id}`}
                          className="flex-1 text-center px-4 py-2.5 bg-violet-50 text-violet-700 font-semibold rounded-lg hover:bg-violet-100 transition-colors border border-violet-100"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="flex-1 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;
