import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../App";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const token = useMemo(() => localStorage.getItem("token") || "", []);

  useEffect(() => {
    let isMounted = true;

    const fetchEvent = async () => {
      setLoading(true);
      setErr("");

      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      try {
        // 1) Try single-event endpoint first
        const singleRes = await fetch(`${API_BASE_URL}/api/events/${id}`, {
          headers,
        });

        if (singleRes.ok) {
          const singleData = await singleRes.json();
          if (isMounted) setEvent(singleData);
          return;
        }

        // If 404 or endpoint not supported, try fetching the list and find the event locally
        const listRes = await fetch(`${API_BASE_URL}/api/events`, {
          headers,
        });

        if (!listRes.ok) {
          const data = await listRes.json().catch(() => ({}));
          throw new Error(data.message || "Failed to fetch events.");
        }

        const listData = await listRes.json();
        const found = Array.isArray(listData)
          ? listData.find((e) => e._id === id)
          : null;

        if (!found) {
          if (isMounted) {
            setErr("Event not found.");
            setEvent(null);
          }
          return;
        }

        if (isMounted) setEvent(found);
      } catch (e) {
        console.error("❌ Error fetching event details:", e);
        if (isMounted) setErr(e.message || "Something went wrong.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // If routes are protected you should always have a user, but guard anyway
    if (!currentUser) {
      toast.info("Please login to view this event.");
      navigate("/login", { replace: true });
      return;
    }

    fetchEvent();
    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL, currentUser, id, navigate, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded-xl bg-white/80 px-6 py-4 shadow">
          <p className="text-slate-700">Loading event details…</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-xl mx-auto mt-10 rounded-xl bg-white shadow p-6">
        <p className="text-red-600 font-medium mb-4">{err}</p>
        <button
          onClick={() => navigate("/events")}
          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          Back to Events
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto mt-10 rounded-xl bg-white shadow p-6">
        <p className="text-slate-700">Event not found.</p>
        <button
          onClick={() => navigate("/events")}
          className="mt-4 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-10">
      <div className="mb-6">
        <div className="h-40 w-full rounded-xl bg-gradient-to-tr from-indigo-400 via-sky-400 to-cyan-400" />
      </div>

      <h1 className="text-3xl font-bold text-slate-800 mb-4">{event.title}</h1>

      <div className="space-y-2 mb-6">
        <p className="text-slate-700">
          <span className="font-semibold">Date:</span>{" "}
          {event.date ? new Date(event.date).toLocaleDateString() : "—"}
        </p>
        <p className="text-slate-700">
          <span className="font-semibold">Venue:</span>{" "}
          {event.venue || "—"}
        </p>
      </div>

      <p className="text-slate-700 mb-8">{event.description || "No description."}</p>

      <button
        onClick={() => navigate(`/feedback/${event._id}`)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition"
      >
        Give Feedback
      </button>
    </div>
  );
};

export default EventDetails;
