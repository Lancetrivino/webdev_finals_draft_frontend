import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

// Inline icons (no extra deps)
const MailIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const PhoneIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M22 16.92v2a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 5.18 2 2 0 0 1 4.11 3h2a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.6a2 2 0 0 1-.45 2.11L7.1 10.9a16 16 0 0 0 6 6l1.47-1.18a2 2 0 0 1 2.11-.45c.83.29 1.7.5 2.6.62A2 2 0 0 1 22 16.92Z" />
  </svg>
);

const MapPinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M12 22s7-4.35 7-11A7 7 0 0 0 5 11c0 6.65 7 11 7 11Z" />
    <circle cx="12" cy="11" r="3" />
  </svg>
);

// Tiny logo pill to mirror your brand mark
const LogoPill = () => (
  <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 shadow-sm backdrop-blur">
    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500" />
    <span className="bg-clip-text text-transparent bg-gradient-to-tr from-indigo-500 via-blue-500 to-pink-500 font-semibold">
      Eventure
    </span>
  </div>
);

export default function Home() {
  const { currentUser } = useAuth();
  const [nearestEvent] = useState({
    name: "Community Tech Expo 2025",
    date: "March 12, 2025",
    time: "10:00 AM",
    location: "San Diego Convention Hall",
  });

  // Countdown
  const eventDate = useMemo(() => new Date(`${nearestEvent.date} ${nearestEvent.time}`), [nearestEvent]);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, eventDate.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50">

      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/20 via-purple-400/20 to-pink-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-tr from-fuchsia-400/20 via-purple-400/20 to-indigo-400/20 blur-3xl" />

      {/* Page container */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">

        {/* Top bar */}
        <div className="mb-8 flex items-center justify-between">
          <LogoPill />
          <Link
            to="/events"
            className="group inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur transition hover:shadow-md"
          >
            Explore events
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* HELLO BLOCK */}
        <section className="mb-12 text-center">
          <div className="relative rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl backdrop-blur-xl sm:p-12">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10" />

            <h1 className="mb-3 text-4xl font-bold text-gray-900 sm:text-5xl">
              Welcome,{" "}
              <span className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currentUser?.name || "Guest"}
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-gray-600">
              Great to see you back in <span className="font-semibold">Eventure</span>. Your next event is around the corner.
            </p>

            <div className="mt-8 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur" />
                <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-white/70">
                  <img
                    src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe"
                    alt="profile"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EVENT CARD */}
        <section className="mb-16">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-pink-500" />

            <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">{nearestEvent.name}</h2>
            <p className="text-gray-600">{nearestEvent.location}</p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="rounded-full border border-indigo-200/70 bg-indigo-50 px-3 py-1 text-indigo-700">{nearestEvent.date}</span>
              <span className="rounded-full border border-fuchsia-200/70 bg-fuchsia-50 px-3 py-1 text-fuchsia-700">{nearestEvent.time}</span>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              {diff > 0 ? (
                [
                  { label: "Days", value: days },
                  { label: "Hours", value: hours },
                  { label: "Mins", value: minutes },
                ].map((item) => (
                  <div key={item.label} className="min-w-[80px] rounded-2xl border border-white/70 bg-white/60 px-4 py-3 shadow-sm">
                    <div className="text-2xl font-bold text-gray-900">{String(item.value).padStart(2, "0")}</div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">{item.label}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-full bg-green-50 px-4 py-2 text-green-700">Happening now</div>
              )}
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/events"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 text-white shadow-lg transition hover:brightness-110"
              >
                View details
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </Link>

              <Link
                to="/create"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-6 py-3 text-indigo-700 shadow-sm backdrop-blur transition hover:shadow"
              >
                Create event
              </Link>
            </div>
          </div>
        </section>

        {/* SHORTCUTS */}
        <section>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">

            <ShortcutCard
              title="Eventure Email"
              desc="Contact support or request event help."
              icon={<MailIcon className="h-5 w-5" />}
              tag="Email"
            />

            <ShortcutCard
              title="Number"
              desc="Your registered phone number or alerts."
              icon={<PhoneIcon className="h-5 w-5" />}
              tag="Contact"
            />

            <ShortcutCard
              title="Location"
              desc="Your saved home or discovery region."
              icon={<MapPinIcon className="h-5 w-5" />}
              tag="Location"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function ShortcutCard({ title, desc, icon, tag = "Shortcut" }) {
  return (
    <div className="group relative rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-2xl">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-indigo-500/0 via-purple-500/0 to-pink-500/0 opacity-0 transition group-hover:opacity-10" />

      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-tr from-indigo-100 to-pink-100 px-3 py-1 text-xs font-medium text-indigo-700">
        <span className="text-indigo-700">{icon}</span>
        <span className="bg-clip-text text-transparent bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600">
          {tag}
        </span>
      </div>

      <h3 className="mb-1 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}
