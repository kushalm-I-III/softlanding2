"use client";

import Link from "next/link";
import { useState } from "react";
import { db } from "@/lib/db";

const GUIDE_CATEGORIES = [
  "Housing",
  "Banking",
  "ID & Documents",
  "Campus Life",
  "Clubs",
  "Food & Places",
] as const;

const EVENT_CATEGORIES = [
  "Hackathon",
  "Competition",
  "Workshop",
  "Social",
  "Cultural",
] as const;

type GuideCategory = (typeof GUIDE_CATEGORIES)[number];
type EventCategory = (typeof EVENT_CATEGORIES)[number];

function useAuthSafe() {
  const auth = (db as any).useAuth?.();
  return auth ?? { user: null, isLoading: false, error: null };
}

export default function Home() {
  const { user, isLoading: authLoading } = useAuthSafe();
  const [activeTab, setActiveTab] = useState<"guides" | "events">("guides");
  const [guideCategoryFilter, setGuideCategoryFilter] = useState<
    GuideCategory | "All"
  >("All");
  const [guideUniversityFilter, setGuideUniversityFilter] = useState("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState<
    EventCategory | "All"
  >("All");
  const [eventUniversityFilter, setEventUniversityFilter] = useState("");

  const guidesQuery = (db as any).useQuery?.({
    guides: { author: {}, votes: {} },
  });
  const eventsQuery = (db as any).useQuery?.({
    events: { author: {}, votes: {} },
  });

  const guides = guidesQuery?.data?.guides ?? [];
  const events = eventsQuery?.data?.events ?? [];

  const filteredGuides = guides.filter((g: any) => {
    const catOk =
      guideCategoryFilter === "All" || g.category === guideCategoryFilter;
    const uniOk = guideUniversityFilter
      ? g.university
          ?.toLowerCase()
          .includes(guideUniversityFilter.toLowerCase())
      : true;
    return catOk && uniOk;
  });

  const filteredEvents = events.filter((e: any) => {
    const catOk =
      eventCategoryFilter === "All" || e.category === eventCategoryFilter;
    const uniOk = eventUniversityFilter
      ? e.university
          ?.toLowerCase()
          .includes(eventUniversityFilter.toLowerCase())
      : true;
    return catOk && uniOk;
  });

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            International students · Real advice
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Land softly at your new campus.
          </h1>
          <p className="text-sm text-slate-700 md:text-base">
            Softlanding is your peer-built guide to housing, banking, IDs,
            events, and everything in between — from students who were in your
            shoes last semester.
          </p>
        </div>
        {!authLoading && !user && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2 text-sm font-medium text-white shadow-sm shadow-sky-200 hover:bg-sky-500"
              >
                Get started with a magic code
              </Link>
              <p className="text-xs text-slate-600">
                No passwords. Just a 6‑digit code sent to your inbox.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="mt-2 flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 p-1 text-sm text-sky-900 shadow-sm shadow-sky-100">
          <button
            className={`flex-1 rounded-full px-4 py-1.5 ${
              activeTab === "guides"
                ? "bg-sky-700 text-white shadow-sm shadow-sky-200"
                : "text-slate-700 hover:text-slate-950"
            }`}
            onClick={() => setActiveTab("guides")}
          >
            Guides
          </button>
          <button
            className={`flex-1 rounded-full px-4 py-1.5 ${
              activeTab === "events"
                ? "bg-sky-700 text-white shadow-sm shadow-sky-200"
                : "text-slate-700 hover:text-slate-950"
            }`}
            onClick={() => setActiveTab("events")}
          >
            Events
          </button>
        </div>

        {activeTab === "guides" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={guideCategoryFilter}
                onChange={(e) =>
                  setGuideCategoryFilter(e.target.value as GuideCategory | "All")
                }
                className="h-10 rounded-xl border border-sky-200 bg-white/90 px-3 text-xs font-medium text-slate-900 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="All">All categories</option>
                {GUIDE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                value={guideUniversityFilter}
                onChange={(e) => setGuideUniversityFilter(e.target.value)}
                placeholder="Filter by university"
                className="h-10 flex-1 min-w-[160px] rounded-xl border border-sky-200 bg-white/90 px-3 text-xs text-slate-950 placeholder:text-slate-400 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
              {user && (
                <Link
                  href="/guides/new"
                  className="ml-auto inline-flex items-center justify-center rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-200 hover:bg-sky-500"
                >
                  Post a guide
                </Link>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {guidesQuery?.isLoading && (
                <p className="text-sm text-slate-400">
                  Loading guides from students like you...
                </p>
              )}
              {!guidesQuery?.isLoading && filteredGuides.length === 0 && (
                <p className="text-sm text-slate-400">
                  No guides yet.{" "}
                  {user
                    ? "Be the first to write one for your campus."
                    : "Sign in to be the first to share what you learn."}
                </p>
              )}
              {filteredGuides.map((g: any) => {
                const accurate = g.accurateCount ?? 0;
                const outdated = g.outdatedCount ?? 0;
                return (
                  <Link
                    key={g.id}
                    href={`/guides/${g.id}`}
                    className="block rounded-2xl border border-sky-200/70 bg-white/85 p-4 shadow-sm shadow-sky-100 hover:border-sky-400"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-semibold text-slate-950">
                          {g.title}
                        </h2>
                        <span className="rounded-full bg-sky-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white shadow-sm shadow-sky-200">
                          {g.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {g.author?.university || g.university || "Unknown uni"}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-800">
                        <span className="inline-flex items-center gap-1">
                          ✅ Accurate:{" "}
                          <span className="font-semibold">{accurate}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          ⚠️ Outdated:{" "}
                          <span className="font-semibold">{outdated}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={eventCategoryFilter}
                onChange={(e) =>
                  setEventCategoryFilter(
                    e.target.value as EventCategory | "All",
                  )
                }
                className="h-10 rounded-xl border border-sky-200 bg-white/90 px-3 text-xs font-medium text-slate-900 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="All">All types</option>
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                value={eventUniversityFilter}
                onChange={(e) => setEventUniversityFilter(e.target.value)}
                placeholder="Filter by university"
                className="h-10 flex-1 min-w-[160px] rounded-xl border border-sky-200 bg-white/90 px-3 text-xs text-slate-950 placeholder:text-slate-400 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
              {user && (
                <Link
                  href="/events/new"
                  className="ml-auto inline-flex items-center justify-center rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-200 hover:bg-sky-500"
                >
                  Post an event
                </Link>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {eventsQuery?.isLoading && (
                <p className="text-sm text-slate-400">
                  Loading what’s happening across campuses...
                </p>
              )}
              {!eventsQuery?.isLoading && filteredEvents.length === 0 && (
                <p className="text-sm text-slate-400">
                  No events yet. Share your hackathon, mixer, or cultural night.
                </p>
              )}
              {filteredEvents.map((e: any) => {
                const going = e.goingCount ?? 0;
                const interested = e.interestedCount ?? 0;
                const date =
                  typeof e.eventDate === "number"
                    ? new Date(e.eventDate)
                    : null;
                return (
                  <Link
                    key={e.id}
                    href={`/events/${e.id}`}
                    className="block rounded-2xl border border-sky-200/70 bg-white/85 p-4 shadow-sm shadow-sky-100 hover:border-sky-400"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-semibold text-slate-950">
                          {e.title}
                        </h2>
                        <span className="rounded-full bg-sky-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white shadow-sm shadow-sky-200">
                          {e.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {e.university || e.author?.university || "Unknown uni"}
                      </p>
                      {date && (
                        <p className="text-xs text-slate-700">
                          {date.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-800">
                        <span className="inline-flex items-center gap-1">
                          ✅ Going:{" "}
                          <span className="font-semibold">{going}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          ⭐ Interested:{" "}
                          <span className="font-semibold">{interested}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

