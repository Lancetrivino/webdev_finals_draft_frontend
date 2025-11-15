import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div 
            className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin mx-auto mb-4"
            style={{ borderTopColor: '#667eea' }}
          ></div>
          <p className="text-lg font-medium text-gray-700">Loading events...</p>
        </div>
      </div>
    );
  }

if (events.length === 0) {
  const role = JSON.parse(localStorage.getItem("user"))?.role || "User";
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-50">
      
      {/* GRADIENT OUTLINE CONTAINER */}
      <div
        className="text-center max-w-md rounded-3xl shadow-lg p-[3px]"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        }}
      >
        {/* WHITE BOX INSIDE */}
        <div className="bg-white rounded-3xl p-12">

          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {role === "Admin" ? "No events available" : "No events yet"}
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {role === "Admin"
              ? "Create your first event to get started!"
              : "Create an event and it will appear here after admin approval."}
          </p>

          <Link
            to="/create-event"
            className="inline-flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </Link>

        </div>
      </div>
    </div>
  );
}


  const statusStyles = {
    Approved: "bg-green-500 text-white",
    Pending: "bg-yellow-500 text-white",
    Rejected: "bg-red-500 text-white",
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl shadow-sm p-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {JSON.parse(localStorage.getItem("user"))?.role === "Admin"
                  ? "All Events"
                  : "My Events"}
              </h1>
              <p className="text-gray-600">
                {events.length} {events.length === 1 ? "event" : "events"} available
              </p>
            </div>
            <Link
              to="/create-event"
              className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </Link>
          </div>
        </div>

        {/* Event Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const remainingSlots = event.capacity - (event.participants?.length || 0);

            return (
              <article
                key={event._id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                {/* Image Section */}
                <div className="relative h-52 overflow-hidden">
                  {event.image || event.imageData ? (
                    <img
                      src={event.image || event.imageData}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                      <svg className="w-16 h-16 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm ${
                        statusStyles[event.status] || "bg-gray-500 text-white"
                      }`}
                    >
                      {event.status || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text transition-all"
                    style={{ 
                      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text'
                    }}
                  >
                    {event.title}
                  </h3>

                  {/* Rating */}
                  {event.averageRating > 0 && (
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(event.averageRating)
                                ? "text-yellow-400"
                                : "text-gray-200"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {event.averageRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({event.totalReviews} reviews)
                      </span>
                    </div>
                  )}

                  {/* Event Details */}
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' }}
                      >
                        <svg className="w-4 h-4" style={{ color: '#667eea' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">{new Date(event.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' }}
                      >
                        <svg className="w-4 h-4" style={{ color: '#667eea' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="line-clamp-1 font-medium">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' }}
                      >
                        <svg className="w-4 h-4" style={{ color: '#667eea' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span className="font-bold">{remainingSlots} slots remaining</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Link
                      to={`/events/${event._id}`}
                      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                      className="w-full text-center px-4 py-3 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      View Details
                    </Link>
                    <div className="flex gap-2">
                      <Link
                        to={`/events/edit/${event._id}`}
                        className="flex-1 text-center px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
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
      </div>
    </div>
  );
}

export default Events;