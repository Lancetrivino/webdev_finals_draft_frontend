import { useEffect, useMemo, useRef, useState } from "react";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const featuresRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setIsClient(true), []);

  // derive a friendly name from localStorage user (if your auth stores it there)
  const username = useMemo(() => {
    if (!isClient) return "";
    try {
      const raw = localStorage.getItem("user");
      const obj = raw ? JSON.parse(raw) : null;
      const name = obj?.name || obj?.username || obj?.email || "";
      if (!name) return "";
      const first = String(name).trim().split(" ")[0];
      return first.charAt(0).toUpperCase() + first.slice(1);
    } catch {
      return "";
    }
  }, [isClient]);

  const scrollToContent = () =>
    featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <header className="relative overflow-hidden">
        {/* pastel spectrum background (no images) */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 opacity-90 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100" />
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-40 bg-indigo-300" />
          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full blur-3xl opacity-40 bg-pink-300" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* LEFT: welcome copy */}
            <div>
              <p className="inline-flex items-center rounded-full bg-white/70 ring-1 ring-slate-200 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm mb-5">
                Eventure • Plan, promote, attend
              </p>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
                Welcome{username ? `, ${username}` : ""} 👋
              </h1>
              <p className="mt-5 text-lg md:text-xl text-slate-600">
                Your hub for effortless event discovery and organizing — designed with a
                clean, modern look inspired by soft gradients and subtle glass effects.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="/create-event"
                  className="px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition"
                >
                  Create an Event
                </a>
                <a
                  href="/available-events"
                  className="px-6 py-3 rounded-full bg-white/80 ring-1 ring-slate-200 text-slate-800 font-semibold hover:bg-white transition"
                >
                  Explore Events
                </a>
                <button
                  onClick={scrollToContent}
                  className="px-4 py-3 rounded-full text-slate-600 hover:text-indigo-700"
                  aria-label="Scroll to images"
                >
                  Learn more ↓
                </button>
              </div>
            </div>

            {/* RIGHT: three rectangles (you will insert images) */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-5">
              {/* Card 1 */}
              <div className="relative h-44 md:h-52 rounded-2xl ring-1 ring-slate-200 bg-white/60 backdrop-blur shadow-[0_15px_35px_-15px_rgba(0,0,0,0.25)] overflow-hidden">
                {/* Insert image in this div (as background or <img>) */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                  Insert Image #1
                </div>
              </div>
              {/* Card 2 */}
              <div className="relative h-44 md:h-52 rounded-2xl ring-1 ring-slate-200 bg-white/60 backdrop-blur shadow-[0_15px_35px_-15px_rgba(0,0,0,0.25)] overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                  Insert Image #2
                </div>
              </div>
              {/* Card 3 */}
              <div className="relative h-44 md:h-52 rounded-2xl ring-1 ring-slate-200 bg-white/60 backdrop-blur shadow-[0_15px_35px_-15px_rgba(0,0,0,0.25)] overflow-hidden sm:col-span-2 lg:col-span-1">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                  Insert Image #3
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT / FEATURE BLURB (optional anchor for "Learn more") */}
      <section ref={featuresRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white/80 ring-1 ring-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Create</h3>
            <p className="text-slate-600">
              Set up public or private events with categories, RSVPs, and sharing tools.
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 ring-1 ring-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Discover</h3>
            <p className="text-slate-600">
              Find gatherings near you and filter by interests, date, or location.
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 ring-1 ring-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Promote</h3>
            <p className="text-slate-600">
              Share links, send updates, and track attendance effortlessly.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT TOAST */}
      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl bg-white/90 ring-1 ring-slate-200 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">✉</span>
                <div>
                  <div className="text-sm text-slate-500">Email</div>
                  <div className="text-slate-900 font-medium">contact@eventure.app</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white font-semibold">☎</span>
                <div>
                  <div className="text-sm text-slate-500">Phone</div>
                  <div className="text-slate-900 font-medium">+1 (000) 000-0000</div>
                </div>
              </div>
            </div>

            {/* subtle decorative bar */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 h-3 w-48 rounded-full bg-gradient-to-r from-indigo-400/40 via-purple-400/40 to-pink-400/40 blur-md" />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Eventure. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
