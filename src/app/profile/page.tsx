"use client";

import { FormEvent, useState } from "react";
import { db } from "@/lib/db";

function useAuthSafe() {
  const auth = (db as any).useAuth?.();
  return auth ?? { user: null, isLoading: false, error: null };
}

export default function ProfilePage() {
  const { user, isLoading, error } = useAuthSafe();
  const [status, setStatus] = useState<string | null>(null);

  const { data, isLoading: profileLoading } =
    user && (db as any).useQuery
      ? (db as any).useQuery({
          profiles: {
            $: { where: { id: (user as any).id } },
          },
        })
      : { data: null, isLoading: false };

  const existing = (data as any)?.profiles?.[0] ?? {};

  const [name, setName] = useState(existing.name ?? "");
  const [university, setUniversity] = useState(existing.university ?? "");
  const [program, setProgram] = useState(existing.program ?? "");
  const [intakeYear, setIntakeYear] = useState(existing.intakeYear ?? "");
  const [bio, setBio] = useState(existing.bio ?? "");

  if (isLoading) {
    return (
      <p className="text-sm text-slate-300">Loading your profile...</p>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Build your Softlanding profile
        </h1>
        <p className="text-sm text-slate-300">
          Sign in with your email first, then you’ll be able to fill out your
          profile so other students can see who’s behind each guide and RSVP.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("Saving your profile...");
    try {
      await (db as any).transact?.(
        (db as any).tx.profiles[(user as any).id].update({
          name: name.trim(),
          university: university.trim(),
          program: program.trim(),
          intakeYear: intakeYear.trim(),
          bio: bio.trim(),
          updatedAt: Date.now(),
        }),
      );
      setStatus("Profile saved ✔️");
    } catch (err) {
      console.error(err);
      setStatus("Could not save your profile. Please try again.");
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Your student profile
        </h1>
        <p className="mt-2 text-sm text-slate-700">
          Add a few details so your guides, comments, and event RSVPs feel more
          personal and trustworthy to other students.
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-400">
            {(error as any)?.message ??
              "Something went wrong loading your account."}
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 md:grid-cols-2 md:gap-6"
      >
        <div className="space-y-4 md:col-span-1">
          <div>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-900">Full name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya Sharma"
                className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </label>
          </div>
          <div>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-900">University</span>
              <input
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="New York University"
                className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
              <span className="text-[11px] text-slate-600">
                Use the name students on campus actually use.
              </span>
            </label>
          </div>
          <div>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-900">Program</span>
              <input
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="MSc Finance"
                className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </label>
          </div>
          <div>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-900">Intake year</span>
              <input
                value={intakeYear}
                onChange={(e) => setIntakeYear(e.target.value)}
                placeholder="2026"
                className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </label>
          </div>
        </div>

        <div className="space-y-4 md:col-span-1">
          <div>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-900">Short bio</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={6}
                placeholder="Share where you’re from, what you’re studying, and one thing you wish someone had told you before you arrived."
                className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </label>
          </div>
          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-slate-600">
              Only your name, university, and program may appear next to your
              guides and RSVPs. We’ll never show your email.
            </p>
            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-sky-200 hover:bg-sky-500 disabled:opacity-50"
            >
              Save profile
            </button>
          </div>
        </div>
      </form>

      {status && (
        <p className="text-xs text-slate-600" aria-live="polite">
          {status}
        </p>
      )}
    </div>
  );
}

