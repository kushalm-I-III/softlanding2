"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";

const EVENT_CATEGORIES = [
  "Hackathon",
  "Competition",
  "Workshop",
  "Social",
  "Cultural",
] as const;

function useAuthSafe() {
  const auth = (db as any).useAuth?.();
  return auth ?? { user: null, isLoading: false, error: null };
}

export default function NewEventPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthSafe();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(EVENT_CATEGORIES[0]);
  const [university, setUniversity] = useState(
    (user as any)?.university ?? "",
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-slate-300">Checking your session...</p>;
  }

  if (!user) {
    return (
      <div className="flex w-full flex-col gap-4">
        <p className="text-sm text-slate-300">
          You need to sign in with a magic code before posting an event.
        </p>
        <Link
          href="/login"
          className="inline-flex w-fit items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400"
        >
          Sign in to post an event
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("Publishing your event...");
    try {
      const eventId = id();
      const eventDate = date
        ? new Date(`${date}T${time || "12:00"}`).getTime()
        : Date.now();

      await (db as any).transact?.(
        (db as any).tx.events[eventId]
          .update({
            title: title.trim(),
            description: description.trim(),
            category,
            university: university.trim(),
            eventDate,
            createdAt: Date.now(),
          })
          .link({
            author: (user as any).id,
          }),
      );

      setStatus("Event published!");
      router.push(`/events/${eventId}`);
    } catch (err) {
      console.error(err);
      setStatus("Could not publish your event. Please try again.");
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <Link
        href="/"
        className="text-xs text-slate-600 underline hover:text-slate-950"
      >
        ← Back to home
      </Link>

      <div className="max-w-2xl rounded-2xl border border-sky-200/70 bg-white/85 p-6 shadow-lg shadow-sky-100/70 backdrop-blur">
        <h1 className="text-xl font-semibold tracking-tight text-slate-950">
          Post a cross-campus event
        </h1>
        <p className="mt-1 text-xs text-slate-700">
          Hackathon, case competition, mixer, or cultural night — help students
          on nearby campuses discover what you’re hosting.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-900">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Citywide Hack Night at NYU"
              className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-900">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              placeholder="Who is this for? What will happen? Any requirements or sign-up links?"
              className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-900">Host university</span>
              <input
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                required
                placeholder="Columbia University"
                className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-900">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-900">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-900">Time</span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
              <span className="text-[11px] text-slate-600">
                Optional — helpful for students planning travel.
              </span>
            </label>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-[11px] text-slate-600">
              Students across campuses will see real Going/Interested numbers
              tied to this event.
            </p>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-sky-200 hover:bg-sky-500 disabled:opacity-50"
              disabled={
                !title.trim() ||
                !description.trim() ||
                !university.trim() ||
                !date
              }
            >
              Publish event
            </button>
          </div>
        </form>

        {status && (
          <p className="mt-2 text-xs text-slate-600" aria-live="polite">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

