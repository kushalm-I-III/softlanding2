"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Manrope } from "next/font/google";
import { db } from "@/lib/db";

const logoFont = Manrope({
  subsets: ["latin"],
  weight: ["700", "800"],
});

function useAuthSafe() {
  const auth = (db as any).useAuth?.();
  return auth ?? { user: null, isLoading: false, error: null };
}

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuthSafe();

  const onHome = pathname === "/";
  const onProfile = pathname?.startsWith("/profile");

  const profileId = (user as any)?.id ?? "__no_user__";
  const { data: profileData } = (db as any).useQuery?.({
    profiles: { $: { where: { id: profileId } } },
  }) ?? { data: null };
  const profile = (profileData as any)?.profiles?.[0];

  const displayName = (profile?.name || (user as any)?.name || "")
    .toString()
    .trim();
  const nameParts = displayName.split(/\s+/).filter(Boolean);
  const initials =
    (nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : nameParts.length === 1
        ? `${nameParts[0][0]}${nameParts[0][1] || nameParts[0][0]}`
        : ((user as any)?.email?.slice(0, 2) || "ST"))?.toUpperCase();

  const campusLabel =
    profile?.university ||
    (user as any)?.university ||
    "Your campus";

  return (
    <header className="border-b border-sky-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-sky-100 shadow-sm shadow-sky-200">
              <Image
                src="/softlanding-logo-new.png"
                alt="Softlanding logo"
                width={48}
                height={48}
                className="h-10 w-10 object-contain"
              />
            </span>
            <span
              className={`${logoFont.className} text-xl font-extrabold tracking-tight text-slate-950`}
            >
              Softlanding
            </span>
            <span className="hidden items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-800 shadow-sm shadow-sky-100 sm:inline-flex">
              {campusLabel}
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className={`rounded-full px-3 py-1 ${
              onHome
                ? "bg-sky-700 text-white shadow-sm shadow-sky-200"
                : "text-slate-700 hover:text-slate-950"
            }`}
          >
            Home
          </Link>
          {user && (
            <Link
              href="/profile"
              className={`rounded-full px-3 py-1 ${
                onProfile
                  ? "bg-sky-700 text-white shadow-sm shadow-sky-200"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              Profile
            </Link>
          )}

          {isLoading && (
            <div className="h-7 w-20 animate-pulse rounded-full bg-slate-800" />
          )}

          {!isLoading && !user && (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-sky-200 hover:bg-sky-500"
            >
              Sign in
            </Link>
          )}

          {!isLoading && user && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-semibold text-white shadow-sm shadow-sky-200">
                {initials}
              </div>
              <button
                onClick={() => (db as any).auth?.signOut?.()}
                className="text-xs text-slate-600 hover:text-slate-950"
              >
                Sign out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

