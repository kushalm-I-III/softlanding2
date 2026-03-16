import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { CloudBackground } from "@/components/CloudBackground";

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
      <body className="min-h-screen bg-slate-50 text-slate-950 antialiased">
        <CloudBackground />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-10">
            <div className="w-full rounded-2xl border border-sky-200/70 bg-white/85 p-6 shadow-xl shadow-sky-100/80 backdrop-blur">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}



