"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { id as instantId } from "@instantdb/react";
import { db } from "@/lib/db";

function useAuthSafe() {
  const auth = (db as any).useAuth?.();
  return auth ?? { user: null, isLoading: false, error: null };
}

export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuthSafe();

  const { data, isLoading, error } =
    (db as any).useQuery?.({
      events: {
        $: { where: { id } },
        author: {},
        votes: { author: {} },
      },
    }) ?? {};

  const event = data?.events?.[0];

  if (isLoading) {
    return <p className="text-sm text-slate-300">Loading event...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-400">
        Failed to load this event. Please try again.
      </p>
    );
  }

  if (!event) {
    return (
      <p className="text-sm text-slate-300">
        This event does not exist or was removed.
      </p>
    );
  }

  const goingCount: number = event.goingCount ?? 0;
  const interestedCount: number = event.interestedCount ?? 0;
  const notGoingCount: number = event.notGoingCount ?? 0;

  const total = goingCount + interestedCount + notGoingCount || 1;
  const goingPct = Math.round((goingCount / total) * 100);
  const interestedPct = Math.round((interestedCount / total) * 100);

  async function updateStatus(status: "going" | "interested" | "not_going") {
    if (!user) return;
    try {
      const updates: any = {};
      if (status === "going") {
        updates.goingCount = goingCount + 1;
      } else if (status === "interested") {
        updates.interestedCount = interestedCount + 1;
      } else {
        updates.notGoingCount = notGoingCount + 1;
      }
      await (db as any).transact?.(
        (db as any).tx.events[event.id].update(updates),
      );
    } catch (err) {
      console.error(err);
    }
  }

  const eventDate =
    typeof event.eventDate === "number"
      ? new Date(event.eventDate).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <div className="flex w-full flex-col gap-6">
      <Link
        href="/"
        className="text-xs text-slate-600 underline hover:text-slate-950"
      >
        ← Back to home
      </Link>

      <article className="rounded-2xl border border-sky-200/70 bg-white/85 p-6 shadow-lg shadow-sky-100/70 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-950">
              {event.title}
            </h1>
            <p className="mt-1 text-xs text-slate-700">
              {event.university || event.author?.university || "Unknown uni"}
            </p>
            {eventDate && (
              <p className="text-[11px] text-slate-500">{eventDate}</p>
            )}
          </div>
          <span className="rounded-full bg-sky-700 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white shadow-sm shadow-sky-200">
            {event.category}
          </span>
        </div>

        <div className="mt-4 h-px w-full bg-sky-100" />

        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
          {event.description}
        </p>

        <section className="mt-6 flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
            Attendance signals
          </h2>
          <div className="flex flex-col gap-3 rounded-xl border border-sky-200 bg-sky-50/70 p-3 shadow-sm shadow-sky-100">
            <div className="flex flex-col gap-2 text-[11px] text-slate-800">
              <div className="flex items-center justify-between gap-2">
                <span>Going</span>
                <span className="font-semibold">{goingCount}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-sky-100">
                <div
                  className="h-full bg-sky-500"
                  style={{ width: `${goingPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Interested</span>
                <span className="font-semibold">{interestedCount}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-sky-100">
                <div
                  className="h-full bg-sky-400"
                  style={{ width: `${interestedPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Not going</span>
                <span className="font-semibold">{notGoingCount}</span>
              </div>
            </div>

            {user ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => updateStatus("going")}
                  className="inline-flex items-center justify-center rounded-full bg-sky-600 px-3 py-1 text-xs font-medium text-white shadow-sm shadow-sky-200 hover:bg-sky-500"
                >
                  I’m going
                </button>
                <button
                  onClick={() => updateStatus("interested")}
                  className="inline-flex items-center justify-center rounded-full border border-sky-400/80 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 hover:bg-sky-100"
                >
                  I’m interested
                </button>
                <button
                  onClick={() => updateStatus("not_going")}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-800 hover:bg-slate-100"
                >
                  Not going
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-600">
                Sign in with a magic code to signal whether you’re going or just
                curious.
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
            Who’s going
          </h3>
          <p className="text-[11px] text-slate-600">
            This list helps organizers book the right size room and gives you a
            sense of who else might be there.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {goingCount === 0 && interestedCount === 0 && (
              <p className="text-sm text-slate-600">
                No one has raised their hand yet. Be the first to signal
                interest.
              </p>
            )}
            {Array.from({ length: goingCount }).map((_, idx) => (
              <span
                key={`going-${idx}`}
                className="rounded-full bg-sky-600/10 px-3 py-1 text-[11px] text-sky-800"
              >
                Student · Going
              </span>
            ))}
            {Array.from({ length: interestedCount }).map((_, idx) => (
              <span
                key={`interested-${idx}`}
                className="rounded-full bg-sky-400/10 px-3 py-1 text-[11px] text-sky-800"
              >
                Student · Interested
              </span>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}

