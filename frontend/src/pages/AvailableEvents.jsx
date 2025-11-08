import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import data from "../data/event.json";

export default function AvailableEvents() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (e) =>
        e.title.toLowerCase().includes(term) ||
        e.city.toLowerCase().includes(term)
    );
  }, [q]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Title + Search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-slate-800">Event Available</h1>

          <div className="relative w-full sm:w-80">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search events or city…"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pl-11 text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
            />
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">🔎</span>
          </div>
        </div>

        {/* Events for you */}
        <h2 className="mb-4 text-lg font-semibold text-slate-700">Events for you</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <article
              key={e.id}
              className="group overflow-hidden rounded-2xl bg-white shadow-[0_10px_25px_-10px_rgba(0,0,0,0.2)] transition-all hover:shadow-[0_18px_35px_-12px_rgba(0,0,0,0.25)]"
            >
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={e.image}
                  alt={e.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-5">
                <h3 className="text-lg font-semibold text-slate-800">{e.title}</h3>
                <p className="text-sm text-slate-500">{e.city}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{e.description}</p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-600">
                    ₱{e.price.toLocaleString()}/slot
                  </span>
                  <Link
                    to={`/available/${e.id}`}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-emerald-700 active:scale-95"
                  >
                    Book
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
