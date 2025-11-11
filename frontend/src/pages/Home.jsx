import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Home() {
  const { currentUser } = useAuth();
  const [nearestEvent] = useState({
    name: "Community Tech Expo 2025",
    date: "March 12, 2025",
    time: "10:00 AM",
    location: "San Diego Convention Hall",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-10">

      {/* HELLO BLOCK */}
      <section className="max-w-5xl mx-auto text-center mb-14">
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl py-12 px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hello, {currentUser?.name || "Guest"}
          </h1>

          {/* ROUND IMAGE */}
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg ring-4 ring-purple-300/40">
              <img
                src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe"
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <p className="text-gray-600 max-w-lg mx-auto">
            Welcome back to Eventure. Your next event is coming up soon!
          </p>
        </div>
      </section>

      {/* UPCOMING EVENT CARD */}
      <section className="max-w-3xl mx-auto mb-16">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {nearestEvent.name}
          </h2>

          <p className="text-gray-600">Date: {nearestEvent.date}</p>
          <p className="text-gray-600">Time: {nearestEvent.time}</p>
          <p className="text-gray-600">Location: {nearestEvent.location}</p>

          <Link
            to="/events"
            className="inline-block mt-6 px-6 py-3 bg-purple-600 text-white rounded-full shadow-md hover:bg-purple-700 transition"
          >
            View Event Details
          </Link>
        </div>
      </section>

      {/* THREE SHORTCUT CARDS */}
      <section className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* CARD 1 */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Eventure Email
            </h3>
            <p className="text-gray-500 text-sm">
              Contact support or request event help.
            </p>
          </div>

          {/* CARD 2 */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Number
            </h3>
            <p className="text-gray-500 text-sm">
              Your registered phone number or alerts.
            </p>
          </div>

          {/* CARD 3 */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Location
            </h3>
            <p className="text-gray-500 text-sm">
              Your saved home or event discovery region.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
