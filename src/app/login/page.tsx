"use client";

import { FormEvent, useState } from "react";
import { db } from "@/src/lib/db";

export default function LoginPage() {
  const { user, isLoading, error, signIn, signOut, sendMagicCode } =
    (db as any).useAuth?.() ?? {};

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function handleRequestCode(e: FormEvent) {
    e.preventDefault();
    if (!sendMagicCode) return;
    setStatus("Sending code...");
    try {
      await sendMagicCode({ email });
      setStatus("We emailed you a 6-digit code. Check your inbox.");
      setStep("code");
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong sending the code. Please try again.");
    }
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    setStatus("Verifying code...");
    try {
      await signIn({ email, code });
      setStatus("You’re in. Redirecting...");
      // Next.js will usually redirect based on route usage; for MVP we rely on user navigating back.
    } catch (err) {
      console.error(err);
      setStatus("Code was invalid or expired. Try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center">
        <p className="text-sm text-slate-300">Checking your session...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h1 className="text-xl font-semibold">You’re already signed in</h1>
        <p className="text-sm text-slate-300">
          You can start exploring guides and events, or sign out to switch
          accounts.
        </p>
        <button
          onClick={() => signOut?.()}
          className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to Softlanding
        </h1>
        <p className="mt-2 text-sm text-slate-300">
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
            <span className="font-medium text-slate-100">Email address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <span className="text-xs text-slate-400">
              Using your university email helps event organizers understand real
              turnout.
            </span>
          </label>
          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400"
          >
            Email me a code
          </button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-100">
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
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <span className="text-xs text-slate-400">
              Check your inbox (and spam folder) for an email from Softlanding.
            </span>
          </label>
          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400"
          >
            Confirm and sign in
          </button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="text-xs text-slate-400 underline hover:text-slate-200"
          >
            Use a different email
          </button>
        </form>
      )}

      {status && <p className="text-xs text-slate-400">{status}</p>}
    </div>
  );
}

