"use client";

import { FormEvent, useState } from "react";
import { db } from "@/lib/db";

function getErrorMessage(err: unknown) {
  if (!err) return null;
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

export default function LoginPage() {
  const { user, isLoading, error } = (db as any).useAuth?.() ?? {};

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function handleRequestCode(e: FormEvent) {
    e.preventDefault();
    if (!process.env.NEXT_PUBLIC_INSTANT_APP_ID) {
      setStatus(
        "Missing NEXT_PUBLIC_INSTANT_APP_ID. Add it in Vercel → Settings → Environment Variables, then redeploy.",
      );
      return;
    }
    const sendMagicCode = (db as any).auth?.sendMagicCode;
    if (!sendMagicCode) {
      setStatus("Magic code auth is unavailable in this build.");
      return;
    }
    setStatus("Sending code…");
    try {
      await sendMagicCode({ email });
      setStatus("We emailed you a 6-digit code. Check your inbox.");
      setStep("code");
    } catch (err) {
      console.error(err);
      setStatus(
        getErrorMessage(err) ||
          "Something went wrong sending the code. Please try again.",
      );
    }
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    if (!process.env.NEXT_PUBLIC_INSTANT_APP_ID) {
      setStatus(
        "Missing NEXT_PUBLIC_INSTANT_APP_ID. Add it in Vercel → Settings → Environment Variables, then redeploy.",
      );
      return;
    }
    const signInWithMagicCode = (db as any).auth?.signInWithMagicCode;
    if (!signInWithMagicCode) {
      setStatus("Magic code auth is unavailable in this build.");
      return;
    }
    setStatus("Verifying code…");
    try {
      await signInWithMagicCode({ email, code });
      setStatus("You’re in. Redirecting…");
      // Next.js will usually redirect based on route usage; for MVP we rely on user navigating back.
    } catch (err) {
      console.error(err);
      setStatus(getErrorMessage(err) || "Code was invalid or expired. Try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center">
        <p className="text-sm text-slate-700">Checking your session...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-xl border border-sky-200/70 bg-white/80 p-6 shadow-lg shadow-sky-100/70 backdrop-blur">
        <h1 className="text-xl font-semibold">You’re already signed in</h1>
        <p className="text-sm text-slate-700">
          You can start exploring guides and events, or sign out to switch
          accounts.
        </p>
        <button
          onClick={() => (db as any).auth?.signOut?.()}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-slate-200 hover:bg-slate-800"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-xl border border-sky-200/70 bg-white/80 p-6 shadow-lg shadow-sky-100/70 backdrop-blur">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to Softlanding
        </h1>
        <p className="mt-2 text-sm text-slate-700">
          Sign in with a magic code. No password to remember. We’ll email you a
          6-digit code to confirm it’s really you.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400">
          {(error as any)?.message ?? "Something went wrong. Please try again."}
        </p>
      )}

      {step === "email" && (
        <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-900">Email address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            <span className="text-xs text-slate-600">
              Using your university email helps event organizers understand real
              turnout.
            </span>
          </label>
          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-sky-200 hover:bg-sky-500"
          >
            Email me a code
          </button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-900">
              Enter your 6-digit code
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            <span className="text-xs text-slate-600">
              Check your inbox (and spam folder) for an email from Softlanding.
            </span>
          </label>
          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-sky-200 hover:bg-sky-500"
          >
            Confirm and sign in
          </button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="text-xs text-slate-600 underline hover:text-slate-950"
          >
            Use a different email
          </button>
        </form>
      )}

      {status && <p className="text-xs text-slate-600">{status}</p>}
    </div>
  );
}

