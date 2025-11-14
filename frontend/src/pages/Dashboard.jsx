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
  const welcomeMessage = `Hello ${currentUser?.name || "User"}!`;

  return (
    <div
      className="fixed left-0 right-0 bottom-0 overflow-y-auto"
      style={{
        top: NAV_HEIGHT + 12,
        zIndex: 0,
        height: `calc(100vh - ${NAV_HEIGHT + 12}px)`,
        WebkitOverflowScrolling: "touch",
        background: `url('/assets/purple_balloon.jpg') center/cover no-repeat`,
      }}
    >
      {/* Top-right time and date side by side */}
      <div className="fixed top-[92px] right-8 flex flex-row items-center gap-4 text-sm sm:text-base text-gray-700 font-medium z-10">
        <span>{now.toLocaleTimeString()}</span>
        <span>{now.toLocaleDateString()}</span>
      </div>

      {/* Main container with blur and transparency */}
      <div className="min-h-full w-full flex items-start justify-center px-6 py-12">
        <div
          className="relative w-[min(1400px,98vw)] flex flex-col items-center
            rounded-[28px] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.08)]
            py-24 bg-white/30 backdrop-blur-xl"
        >
          {/* Centered welcome text with animation */}
          <div className="relative z-10 text-center max-w-2xl px-6 animate-fade-in-up">
            <h1 className="text-[clamp(32px,5vw,48px)] font-extrabold text-[#35008d]">
              {welcomeMessage}
            </h1>
            <p className="mt-4 text-gray-700 text-base sm:text-lg leading-relaxed">
              Ready to explore today's events and make things happen? Discover, join, and create events
              in your community. Stay updated with the latest happenings and make meaningful connections today.
            </p>
          </div>

          {/* Bottom three boxes inside main container */}
          <div className="mt-12 flex justify-center px-4 gap-8 w-full max-w-6xl">
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
                className="rounded-2xl flex-1 flex flex-col justify-between px-6 py-6 shadow-md h-[220px] bg-white"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-full bg-[#35008d] text-white
                      flex items-center justify-center font-semibold shadow"
                  >
                    {c.num}
                  </div>
                  <div className="font-semibold text-[#35008d] text-lg">{c.title}</div>
                </div>

                <p className="mt-2 text-sm text-gray-600 flex-grow">{c.text}</p>

                <div className="w-full">
                  {/* Thin line above button */}
                  <div className="h-[1px] bg-gray-300 w-full mb-2" />
                  <a
                    href={c.link}
                    className="inline-flex rounded-full px-4 py-2 text-sm font-medium
                      bg-white/30 backdrop-blur-md text-[#35008d] shadow hover:bg-white/50 transition"
                  >
                    {c.btn}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
