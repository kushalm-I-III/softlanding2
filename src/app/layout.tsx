import type { Metadata } from "next";
import "./globals.css";
import { InstantDBProvider } from "@instantdb/react";
import schema from "../../instant.schema";

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;

export const metadata: Metadata = {
  title: "Softlanding",
  description:
    "Peer guides and events for international students to land smoothly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <InstantDBProvider appId={APP_ID} schema={schema}>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
              <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold tracking-tight">
                    Softlanding
                  </span>
                  <span className="text-xs text-slate-400">
                    For international students
                  </span>
                </div>
              </div>
            </header>
            <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-6">
              {children}
            </main>
          </div>
        </InstantDBProvider>
      </body>
    </html>
  );
}

