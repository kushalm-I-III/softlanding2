"use client";

import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { id as instantId } from "@instantdb/react";
import { db } from "@/lib/db";

function useAuthSafe() {
  const auth = (db as any).useAuth?.();
  return auth ?? { user: null, isLoading: false, error: null };
}

export default function GuideDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuthSafe();

  const { data, isLoading, error } =
    (db as any).useQuery?.({
      guides: {
        $: { where: { id } },
        author: {},
        comments: { author: {} },
        votes: { author: {} },
      },
    }) ?? {};

  const guide = data?.guides?.[0];
  const [commentBody, setCommentBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-slate-300">Loading guide...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-400">
        Failed to load this guide. Please try again.
      </p>
    );
  }

  if (!guide) {
    return (
      <p className="text-sm text-slate-300">
        This guide does not exist or was removed.
      </p>
    );
  }

  const accurate = guide.accurateCount ?? 0;
  const outdated = guide.outdatedCount ?? 0;
  const totalVotes = accurate + outdated || 1;
  const accuratePct = Math.round((accurate / totalVotes) * 100);

  async function handleVote(type: "accurate" | "outdated") {
    if (!user) {
      setStatus("Sign in to vote on accuracy.");
      return;
    }
    setStatus("Recording your vote...");
    try {
      const updates: any = {};
      if (type === "accurate") {
        updates.accurateCount = accurate + 1;
      } else {
        updates.outdatedCount = outdated + 1;
      }
      await (db as any).transact?.(
        (db as any).tx.guides[guide.id].update(updates),
      );
      setStatus("Thanks for helping keep this accurate.");
    } catch (err) {
      console.error(err);
      setStatus("Could not record your vote. Please try again.");
    }
  }

  async function handleComment(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      setStatus("Sign in to comment.");
      return;
    }
    if (!commentBody.trim()) return;
    setStatus("Posting your comment...");
    try {
      await (db as any).transact?.(
        (db as any).tx.comments[instantId()]
          .update({
            body: commentBody.trim(),
            createdAt: Date.now(),
          })
          .link({
            author: user.id,
            guide: guide.id,
          }),
      );
      setCommentBody("");
      setStatus("Comment posted.");
    } catch (err) {
      console.error(err);
      setStatus("Could not post your comment. Please try again.");
    }
  }

  const createdAt =
    typeof guide.createdAt === "number"
      ? new Date(guide.createdAt).toLocaleDateString()
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
              {guide.title}
            </h1>
            <p className="mt-1 text-xs text-slate-700">
              {guide.author?.name || "Student"} ·{" "}
              {guide.author?.university || guide.university || "Unknown uni"}
            </p>
            {createdAt && (
              <p className="text-[11px] text-slate-500">Posted {createdAt}</p>
            )}
          </div>
          <span className="rounded-full bg-sky-700 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white shadow-sm shadow-sky-200">
            {guide.category}
          </span>
        </div>

        <div className="mt-4 h-px w-full bg-sky-100" />

        <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
          {guide.body}
        </div>

        <section className="mt-6 flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
            Accuracy check
          </h2>
          <div className="flex flex-col gap-2 rounded-xl border border-sky-200 bg-sky-50/70 p-3 shadow-sm shadow-sky-100">
            <div className="h-2 w-full overflow-hidden rounded-full bg-sky-100">
              <div
                className="h-full bg-sky-500"
                style={{ width: `${accuratePct}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-800">
              <span>
                ✅ Accurate:{" "}
                <span className="font-semibold">{accurate}</span>
              </span>
              <span>
                ⚠️ Outdated:{" "}
                <span className="font-semibold">{outdated}</span>
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleVote("accurate")}
                className="inline-flex items-center justify-center rounded-full bg-sky-600 px-3 py-1 text-xs font-medium text-white shadow-sm shadow-sky-200 hover:bg-sky-500"
              >
                Mark as accurate
              </button>
              <button
                onClick={() => handleVote("outdated")}
                className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
              >
                Mark as outdated
              </button>
            </div>
            <p className="text-[11px] text-slate-600">
              Your vote helps new students know whether to trust this today.
            </p>
          </div>
        </section>
      </article>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-950">
          Comments
        </h2>
        <p className="text-xs text-slate-600">
          Have a question or an update? Start the conversation below.
        </p>

        <form
          onSubmit={handleComment}
          className="flex flex-col gap-2 rounded-xl border border-sky-200 bg-white/85 p-3 shadow-sm shadow-sky-100"
        >
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder={
              user
                ? "Ask a question, add a clarification, or share what changed."
                : "Sign in to add a comment that will help the next student."
            }
            className="min-h-[80px] rounded-md border border-sky-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 shadow-sm shadow-sky-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-slate-600">
              Comments are tied to your Softlanding account.
            </p>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-sky-200 hover:bg-sky-500 disabled:opacity-50"
              disabled={!user || !commentBody.trim()}
            >
              Post comment
            </button>
          </div>
        </form>

        <div className="mt-2 flex flex-col gap-3">
          {(guide.comments ?? []).length === 0 && (
            <p className="text-sm text-slate-600">
              No comments yet. Be the first to share an update from your
              experience.
            </p>
          )}
          {(guide.comments ?? []).map((c: any) => {
            const created =
              typeof c.createdAt === "number"
                ? new Date(c.createdAt).toLocaleDateString()
                : "";
            return (
              <div
                key={c.id}
                className="rounded-xl border border-sky-200 bg-white/85 p-3 text-sm shadow-sm shadow-sky-100"
              >
                <p className="text-slate-900">{c.body}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                  <span>
                    {c.author?.name || "Student"} ·{" "}
                    {c.author?.university || "Unknown uni"}
                  </span>
                  {created && <span>{created}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {status && (
        <p className="text-xs text-slate-600" aria-live="polite">
          {status}
        </p>
      )}
    </div>
  );
}

