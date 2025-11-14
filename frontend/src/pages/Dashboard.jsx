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

  const NAV_HEIGHT = 80;

  return (
    <div
      className="fixed left-0 right-0 bottom-0"
      style={{
        top: NAV_HEIGHT + 12,
        zIndex: 0,
        height: `calc(100vh - ${NAV_HEIGHT + 12}px)`,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        background: "#f5f5f5",
      }}
    >
      <div className="min-h-full w-full flex flex-col items-center px-6 py-6">
        <div
          className="relative w-[min(1400px,98vw)] rounded-[28px] border border-white/20
            bg-white/40 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-10"
        >
          {/* TIME & DATE TOP-RIGHT */}
          <div className="absolute top-6 right-6 text-right text-gray-600">
            <div className="text-sm font-medium">{now.toLocaleTimeString()}</div>
            <div className="text-xs">{now.toLocaleDateString()}</div>
          </div>

          {/* LEFT TEXT PANEL */}
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 flex flex-col justify-center">
              <h1 className="text-[clamp(28px,4vw,46px)] font-bold tracking-tight text-[#35008d]">
                Welcome, {currentUser?.name || "User"}!<br />
                Your Event Management System
              </h1>
              <p className="mt-4 text-gray-700 text-sm sm:text-base max-w-lg">
                Manage, explore, and join events with ease. Connect your community, organize your
                activities, and stay updated with what’s happening around you.
              </p>
            </div>
          </div>

          {/* BOTTOM LARGE BOXES */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
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
                className="rounded-3xl border border-white/30 bg-white/50
                  backdrop-blur-lg px-6 py-7 shadow-sm flex flex-col h-[200px]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-11 w-11 rounded-xl bg-[#4200af] text-white 
                      flex items-center justify-center font-semibold shadow"
                  >
                    {c.num}
                  </div>
                  <div className="font-semibold text-[#35008d] text-lg">{c.title}</div>
                </div>

                <p className="mt-3 text-sm text-gray-600 flex-grow">{c.text}</p>

                <div className="mt-4 h-[1px] bg-gray-300 w-full mb-3"></div>

                <a
                  href={c.link}
                  className="inline-flex rounded-full px-3 py-1.5 text-sm font-medium
                  bg-[#5800ea] text-white shadow hover:opacity-90 transition self-start"
                >
                  {c.btn}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
