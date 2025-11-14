import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const { currentUser } = useAuth();
  const [now, setNow] = useState(new Date());
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
    if (r.includes("admin")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (r.includes("organizer") || r.includes("host"))
      return "bg-sky-100 text-sky-800 border-sky-200";
    return "bg-cyan-100 text-cyan-800 border-cyan-200";
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
        background: "linear-gradient(180deg, #002d54 0%, #0078c1 45%, #cde2ee 100%)",
      }}
    >
      <div className="h-full w-full flex items-center justify-center px-3 sm:px-6 py-3 sm:py-6">
        <div className="relative w-[min(1400px,98vw)] h-[min(820px,92vh)] rounded-[28px] overflow-hidden border border-white/40 shadow-[0_25px_80px_rgba(0,0,0,0.15)] bg-white/40 backdrop-blur-lg">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#002d54] via-[#0078c1] to-[#a8daf9]" />

          <div className="pointer-events-none absolute -top-20 right-10 w-56 h-56 rounded-full bg-[#a8daf9]/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 w-72 h-72 rounded-full bg-[#cde2ee]/30 blur-[72px]" />

          <div className="relative flex flex-col h-full">
            {/* Center Introduction Box */}
            <div className="px-6 sm:px-10 pt-8 pb-3 text-center">
              <div className="inline-block bg-white/40 backdrop-blur-md rounded-2xl px-8 py-6 shadow-md max-w-2xl">
                <h1 className="text-[clamp(30px,5vw,52px)] font-extrabold tracking-tight text-[#002d54]">
                  Welcome to Easy Go Local
                </h1>
                <p className="mt-3 text-sm sm:text-base text-gray-600">
                  Discover, join, and create exciting local events in your area.  
                  Stay connected with your community and never miss what’s happening nearby!
                </p>
              </div>
            </div>

            <div className="px-6 sm:px-10 pb-8 flex-grow overflow-hidden">
              <div className="grid h-full gap-6 grid-cols-12">
                {/* LEFT SIDE */}
                <div className="col-span-12 lg:col-span-4">
                  <div className="h-full rounded-3xl border border-white/70 bg-white/70 backdrop-blur-md shadow p-6">
                    <div className="flex items-center gap-5">
                      <button
                        onClick={goProfile}
                        className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#004887] to-[#0078c1] text-white flex items-center justify-center font-bold text-xl shadow hover:scale-[1.03] transition"
                      >
                        {initials}
                      </button>

                      <div>
                        <div className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
                          Welcome
                        </div>

                        <button
                          onClick={goProfile}
                          className="text-lg font-extrabold bg-gradient-to-r from-[#002d54] to-[#0078c1] bg-clip-text text-transparent hover:opacity-90 transition"
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
                        <span className="text-gray-500">Date</span>
                        <span className="font-medium text-gray-900">
                          {now.toLocaleDateString()}
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
                          className="rounded-2xl bg-[#cde2ee]/70 border border-white/50 text-center py-3 shadow-sm"
                        >
                          <div className="text-xl font-bold text-[#002d54]">{s.val}</div>
                          <div className="text-[11px] uppercase tracking-wide text-gray-600">
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE (Highlight Cards Only) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        num: 1,
                        title: "Upcoming this week",
                        text: "Never miss local meetups and new experiences.",
                        link: "/events",
                        btn: "Explore events",
                        colorFrom: "#004887",
                        colorTo: "#0078c1",
                      },
                      {
                        num: 2,
                        title: "Create your event",
                        text: "Host gatherings, workshops, or community activities.",
                        link: "/create-event",
                        btn: "Create event",
                        colorFrom: "#0078c1",
                        colorTo: "#a8daf9",
                      },
                      {
                        num: 3,
                        title: "Help us improve",
                        text: "Tell us your experience and what features you’d like.",
                        link: "/feedback",
                        btn: "Send feedback",
                        colorFrom: "#002d54",
                        colorTo: "#004887",
                      },
                    ].map((c) => (
                      <div
                        key={c.num}
                        className="rounded-3xl border border-white/70 bg-white/60 backdrop-blur-md px-5 py-5 shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-xl text-white flex items-center justify-center font-bold"
                            style={{
                              background: `linear-gradient(to bottom right, ${c.colorFrom}, ${c.colorTo})`,
                            }}
                          >
                            {c.num}
                          </div>
                          <div className="font-semibold text-[#002d54]">{c.title}</div>
                        </div>
                        <p className="mt-3 text-sm text-gray-600">{c.text}</p>
                        <a
                          href={c.link}
                          className="inline-flex mt-4 rounded-full px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-[#004887] to-[#0078c1] text-white shadow hover:opacity-95 transition"
                        >
                          {c.btn}
                        </a>
                      </div>
                    ))}
                  </div>
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


