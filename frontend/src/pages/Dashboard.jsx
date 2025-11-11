import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const { currentUser } = useAuth();
  const [now, setNow] = useState(new Date());
  const sessionStartRef = useRef(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const initials = useMemo(() => {
    const name = currentUser?.name || currentUser?.email || "User";
    return name
      .toString()
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [currentUser]);

  const roleLabel = (currentUser?.role || "User").toString();

  const roleBadge = useMemo(() => {
    const r = roleLabel.toLowerCase();
    if (r.includes("admin")) return "bg-rose-50 text-rose-700 border-rose-200";
    if (r.includes("organizer") || r.includes("host"))
      return "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200";
    return "bg-violet-50 text-violet-700 border-violet-200";
  }, [roleLabel]);

  const NAV_HEIGHT = 80;
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  const goProfile = () => navigate("/profile");

  return (
    <div
      className="fixed left-0 right-0 bottom-0"
      style={{
        top: NAV_HEIGHT,
        background: "linear-gradient(180deg,#ffffff 0%, #fbf7ff 35%, #f7f4ff 100%)",
      }}
    >
      <div className="h-full w-full flex items-center justify-center px-3 sm:px-6 py-3 sm:py-6">
        <div
          className="relative w-[min(1400px,98vw)] h-[min(820px,92vh)] rounded-[28px] overflow-hidden border border-white/60 shadow-[0_25px_80px_rgba(30,27,75,0.10)] bg-white/70 backdrop-blur-xl"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-400 via-fuchsia-500 to-pink-400" />

          <div className="pointer-events-none absolute -top-20 right-10 w-56 h-56 rounded-full bg-white/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 w-72 h-72 rounded-full bg-white/30 blur-[72px]" />

          <div className="relative flex flex-col h-full">
            {/* Header */}
            <div className="px-6 sm:px-10 pt-8 pb-3 text-center">
              <h1 className="text-[clamp(34px,5vw,60px)] font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                Eventure
              </h1>

              <p className="mt-2 text-center text-sm text-gray-500">
                {now.toLocaleDateString()} • {now.toLocaleTimeString()}
              </p>
            </div>

            <div className="px-6 sm:px-10 pb-8 flex-grow overflow-hidden">
              <div className="grid h-full gap-6 grid-cols-12">
                {/* LEFT SIDE */}
                <div className="col-span-12 lg:col-span-4">
                  <div className="h-full rounded-3xl border border-white/70 bg-white/80 backdrop-blur-md shadow-[0_10px_30px_rgba(17,24,39,0.06)] p-6">
                    <div className="flex items-center gap-5">
                      <button
                        onClick={goProfile}
                        className="h-16 w-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow hover:scale-[1.03] transition"
                      >
                        {initials}
                      </button>

                      <div>
                        <div className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
                          Welcome
                        </div>

                        <button
                          onClick={goProfile}
                          className="text-lg font-extrabold bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent hover:opacity-90 transition"
                        >
                          {currentUser?.name || "User"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-5">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${roleBadge}`}
                      >
                        <span className="inline-block h-2 w-2 rounded-full bg-current opacity-70" />
                        Role: <span className="capitalize">{roleLabel}</span>
                      </span>
                    </div>

                    <div className="mt-7 space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Local time</span>
                        <span className="font-medium text-gray-900">{now.toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Session start</span>
                        <span className="font-medium text-gray-900">
                          {sessionStartRef.current.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-8 grid grid-cols-3 gap-3">
                      {[
                        { label: "Saved", val: "12" },
                        { label: "Joined", val: "8" },
                        { label: "Nearby", val: "5" },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="rounded-2xl bg-white/80 border border-white/70 text-center py-3 shadow-sm"
                        >
                          <div className="text-xl font-bold text-gray-900">{s.val}</div>
                          <div className="text-[11px] uppercase tracking-wide text-gray-500">
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
                  {/* Welcome */}
                  <div className="rounded-3xl border border-white/70 bg-white/85 backdrop-blur-md px-6 py-4 shadow flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-800">Welcome:</span>
                    <span className="text-lg font-medium text-gray-900">
                      {currentUser?.name || "User"}
                    </span>
                  </div>

                  {/* Role */}
                  <div className="rounded-3xl border border-white/70 bg-white/85 backdrop-blur-md px-6 py-4 shadow flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-800">Role:</span>
                    <span className="capitalize text-lg font-medium text-gray-900">{roleLabel}</span>
                  </div>

                  {/* Three Highlight Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1 */}
                    <div className="rounded-3xl border border-white/70 bg-white/85 backdrop-blur-md px-5 py-5 shadow">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center font-bold">
                          1
                        </div>
                        <div className="font-semibold text-gray-900">Upcoming this week</div>
                      </div>
                      <p className="mt-3 text-sm text-gray-500">
                        Never miss local meetups and new experiences.
                      </p>
                      <a
                        href="/events"
                        className="inline-flex mt-4 rounded-full px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 text-white shadow hover:opacity-95 transition"
                      >
                        Explore events
                      </a>
                    </div>

                    {/* Card 2 - changed to Create Event */}
                    <div className="rounded-3xl border border-white/70 bg-white/85 backdrop-blur-md px-5 py-5 shadow">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white flex items-center justify-center font-bold">
                          2
                        </div>
                        <div className="font-semibold text-gray-900">Create your event</div>
                      </div>
                      <p className="mt-3 text-sm text-gray-500">
                        Host gatherings, workshops, or community activities.
                      </p>
                      <a
                        href="/create-event"
                        className="inline-flex mt-4 rounded-full px-3 py-1.5 text-sm font-medium bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition"
                      >
                        Create event
                      </a>
                    </div>

                    {/* Card 3 - Send feedback */}
                    <div className="rounded-3xl border border-white/70 bg-white/85 backdrop-blur-md px-5 py-5 shadow">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold">
                          3
                        </div>
                        <div className="font-semibold text-gray-900">Help us improve</div>
                      </div>
                      <p className="mt-3 text-sm text-gray-500">
                        Tell us your experience and what features you’d like.
                      </p>
                      <a
                        href="/feedback"
                        className="inline-flex mt-4 rounded-full px-3 py-1.5 text-sm font-medium bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 transition"
                      >
                        Send feedback
                      </a>
                    </div>
                  </div>

                  <div className="flex-grow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}

export default Dashboard;
