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
      <div className="min-h-full w-full flex flex-col items-center px-6 py-12">
        <div
          className="relative w-[min(1400px,95vw)] min-h-[80vh] rounded-[32px] border border-white/20
            bg-white/50 backdrop-blur-xl shadow-[0_12px_50px_rgba(0,0,0,0.12)] p-12 flex flex-col justify-center items-center text-center"
        >
          {/* TIME & DATE TOP-RIGHT */}
          <div className="absolute top-6 right-6 text-right text-gray-600">
            <div className="text-sm font-medium">{now.toLocaleTimeString()}</div>
            <div className="text-xs">{now.toLocaleDateString()}</div>
          </div>

          {/* MAIN WELCOME TEXT */}
          <h1 className="text-[clamp(30px,5vw,50px)] font-extrabold text-transparent bg-clip-text
            bg-gradient-to-r from-[#35008d] via-[#4c00cb] to-[#6000ff] tracking-tight">
            Welcome back, {currentUser?.name || "User"}!
          </h1>
          <p className="mt-4 text-gray-700 text-base sm:text-lg max-w-2xl leading-relaxed">
            Dive into your Event Management System! Explore upcoming events, host your own, and
            connect with your community effortlessly. Let's make every moment count.
          </p>

          {/* BOTTOM LARGE BOXES */}
          <div className="mt-12 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: 1,
                title: "Upcoming Events",
                text: "Discover local meetups and exciting activities happening soon.",
                link: "/events",
                btn: "Explore",
              },
              {
                num: 2,
                title: "Create Your Event",
                text: "Host gatherings or community projects to engage others.",
                link: "/create-event",
                btn: "Create",
              },
              {
                num: 3,
                title: "Feedback & Support",
                text: "Share your thoughts to help us improve your experience.",
                link: "/feedback",
                btn: "Feedback",
              },
            ].map((c) => (
              <div
                key={c.num}
                className="rounded-3xl border border-white/30 bg-white/50
                  backdrop-blur-lg px-6 py-7 shadow-sm flex flex-col h-[240px] hover:translate-y-1 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-xl bg-[#4200af] text-white 
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
                  className="inline-flex rounded-full px-4 py-2 text-sm font-medium
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
