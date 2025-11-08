import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import data from "../data/event.json";

export default function BookEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const event = useMemo(() => data.find((e) => e.id === id), [id]);

  const [form, setForm] = useState({
    date: "",
    timeStart: "",
    timeEnd: "",
    packages: [],
    notes: ""
  });

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-4xl text-center text-slate-600">
          Event not found.
        </div>
      </div>
    );
  }

  const togglePackage = (p) => {
    setForm((prev) => {
      const has = prev.packages.includes(p);
      return { ...prev, packages: has ? prev.packages.filter((x) => x !== p) : [...prev.packages, p] };
    });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.date || !form.timeStart || !form.timeEnd) {
      toast.error("Please select date and time.");
      return;
    }
    toast.success("Booking request sent!");
    setTimeout(() => navigate("/available"), 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-start gap-6 rounded-2xl bg-white p-6 shadow">
          <img
            src={event.image}
            alt={event.title}
            className="h-32 w-44 rounded-xl object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{event.title}</h1>
            <p className="text-slate-500">{event.city}</p>
            <p className="mt-2 max-w-2xl text-slate-600">{event.description}</p>
            <div className="mt-2 text-sm text-slate-500">
              <span className="font-medium text-slate-700">Amenities:</span>{" "}
              {event.amenities.join(" • ")}
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <form onSubmit={submit} className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Choose date & time</h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    📆
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Time (start)</label>
                <input
                  type="time"
                  value={form.timeStart}
                  onChange={(e) => setForm({ ...form, timeStart: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Time (end)</label>
                <input
                  type="time"
                  value={form.timeEnd}
                  onChange={(e) => setForm({ ...form, timeEnd: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Notes (optional)
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                placeholder="Anything we should know?"
              />
            </div>
          </div>

          {/* Packages */}
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Packages</h2>
            <div className="space-y-2">
              {event.packages.map((p) => (
                <label key={p} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.packages.includes(p)}
                    onChange={() => togglePackage(p)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700">{p}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Base price</span>
                <span className="font-semibold text-slate-800">
                  ₱{event.price.toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                * Example UI only. Submitting will just show a toast.
              </p>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white shadow-md transition hover:bg-emerald-700 active:scale-[.99]"
            >
              Book now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
