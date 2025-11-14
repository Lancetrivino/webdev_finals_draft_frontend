import { useEffect, useMemo, useState } from "react";
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
    return "bg-[#cde2ee] text-[#002d54] border-[#a8daf9]";
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
        // push it a bit lower than the nav and ensure it doesn't stack above the nav
        top: NAV_HEIGHT + 12, 
        zIndex: 0,
        background:
          "linear-gradient(180deg, #f9fafb 0%, #f1f5f9 50%, #e2e8f0 100%)",
      }}
    >
      <div className="h-full w-full flex items-center justify-center px-6 py-6">
        <div
          className="relative w-[min(1400px,98vw)] h-[min(820px,92vh)]
          rounded-[28px] overflow-hidden border border-white/40
          bg-white/40 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
        >
          {/* Accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/60" />

          {/* Subtle blurred blobs */}
          <div className="pointer-events-none absolute -top-24 right-8 w-56 h-56 rounded-full bg-[#a8daf9]/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-8 w-64 h-64 rounded-full bg-[#cde2ee]/50 blur-[70px]" />

          {/* MAIN LAYOUT */}
          {/* added a little top padding so the content doesn't sit flush with the rounded edge */}
          <div className="relative grid grid-cols-12 h-full px-10 py-10 gap-6 pt-4">

            {/* LEFT TEXT PANEL */}
            <div className="col-span-12 lg:col-span-6 flex flex-col justify-center pr-6">
              <div className="max-w-xl">
                <h1 className="text-[clamp(28px,4vw,46px)] font-bold tracking-tight text-[#002d54]">
                  Your Event Management System
                </h1>

                <p className="mt-4 text-gray-600 text-sm sm:text-base">
                  Manage, explore, and join events with ease.  
                  Connect your community, organize your activities,  
                  and stay updated with what’s happening around you.
                </p>
              </div>
            </div>

            {/* USER PANEL — moved to upper-right */}
            <div className="col-span-12 lg:col-span-6 flex justify-end">
              <div
                className="rounded-3xl border border-white/60 
                bg-white/50 backdrop-blur-lg shadow-sm p-6 w-[320px]"
              >
                <div className="flex items-center gap-5">
                  <button
                    onClick={goProfile}
                    className="h-16 w-16 rounded-2xl bg-[#002d54] text-white 
                    flex items-center justify-center font-bold text-xl shadow-sm 
                    hover:opacity-90 transition"
                  >
                    {initials}
                  </button>

                  <div>
                    <div className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
                      Welcome
                    </div>
                    <button
                      onClick={goProfile}
                      className="text-lg font-bold text-[#002d54] hover:opacity-80 transition"
                    >
                      {currentUser?.name || "User"}
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 
                    text-sm font-medium ${roleBadge}`}
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-current opacity-70" />
                    Role: <span className="capitalize">{roleLabel}</span>
                  </span>
                </div>

                {/* Time + Date */}
                <div className="mt-7 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Local time</span>
                    <span className="font-medium text-gray-700">
                      {now.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-700">
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
                      className="rounded-2xl bg-[#cde2ee]/60 border border-white/40 
                      backdrop-blur-md text-center py-3 shadow-sm"
                    >
                      <div className="text-xl font-semibold text-[#002d54]">
                        {s.val}
                      </div>
                      <div className="text-[11px] uppercase tracking-wide text-gray-500">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BOTTOM LARGE BOXES */}
            <div className="col-span-12 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {[
                  {
                    num: 1,
                    title: "Upcoming this week",
                    text: "See local meetups and activities happening soon.",
                    link: "/events",
                    btn: "Explore",
                  },
                  {
                    num: 2,
                    title: "Create your event",
                    text: "Host gatherings or community projects.",
                    link: "/create-event",
                    btn: "Create",
                  },
                  {
                    num: 3,
                    title: "Help us improve",
                    text: "Share feedback to make the app better.",
                    link: "/feedback",
                    btn: "Feedback",
                  },
                ].map((c) => (
                  <div
                    key={c.num}
                    className="rounded-3xl border border-white/50 bg-white/60 
                    backdrop-blur-lg px-6 py-7 shadow-sm h-[200px] flex flex-col"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-[#004887] text-white 
                        flex items-center justify-center font-semibold shadow"
                      >
                        {c.num}
                      </div>
                      <div className="font-semibold text-[#002d54] text-lg">
                        {c.title}
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-gray-600 flex-grow">
                      {c.text}
                    </p>

                    <a
                      href={c.link}
                      className="inline-flex mt-4 rounded-full px-3 py-1.5 text-sm font-medium
                      bg-[#0078c1] text-white shadow hover:opacity-90 transition self-start"
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
  );
}

export default Dashboard;
