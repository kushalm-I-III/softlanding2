"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";

const GUIDE_CATEGORIES = [
  "Housing",
  "Banking",
  "ID & Documents",
  "Campus Life",
  "Clubs",
  "Food & Places",
] as const;

function useAuthSafe() {
  const auth = (db as any).useAuth?.();
  return auth ?? { user: null, isLoading: false, error: null };
}

export default function NewGuidePage() {
  const router = useRouter();
  const { user, isLoading } = useAuthSafe();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(GUIDE_CATEGORIES[0]);
  const [university, setUniversity] = useState(
    (user as any)?.university ?? "",
  );
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-slate-300">Checking your session...</p>;
  }

  if (!user) {
    return (
      <div className="flex w-full flex-col gap-4">
        <p className="text-sm text-slate-300">
          You need to sign in with a magic code before posting a guide.
        </p>
        <Link
          href="/login"
          className="inline-flex w-fit items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400"
        >
          Sign in to post a guide
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("Publishing your guide...");
    try {
      const guideId = id();
      await (db as any).transact?.(
        (db as any).tx.guides[guideId]
          .update({
            title: title.trim(),
            body: body.trim(),
            category,
            university: university.trim(),
            createdAt: Date.now(),
          })
          .link({
            author: (user as any).id,
          }),
      );
      setStatus("Guide published!");
      router.push(`/guides/${guideId}`);
    } catch (err) {
      console.error(err);
      setStatus("Could not publish your guide. Please try again.");
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
          Share a guide from your experience
        </h1>
        <p className="mt-1 text-xs text-slate-700">
          Think about what you wish someone had told you in your first few
          weeks. Keep it practical, concrete, and kind.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-900">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Getting your SSN and bank account in week one"
              className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-900">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                {GUIDE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-900">University</span>
              <input
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                required
                placeholder="New York University"
                className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
              <span className="text-[11px] text-slate-600">
                Free text is okay — use the name students on your campus
                recognize.
              </span>
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-900">Guide body</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={8}
              placeholder="Walk through the steps in order. Include links, office locations, and any 'I wish I knew' details."
              className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-[11px] text-slate-600">
              Your name and university will appear on the guide so others know
              who it’s from.
            </p>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-sky-200 hover:bg-sky-500 disabled:opacity-50"
              disabled={!title.trim() || !body.trim() || !university.trim()}
            >
              Publish guide
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

