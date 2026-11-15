import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SportIQ | Sports Betting AI Assistant & Booking Code Converter",
  description:
    "100% Free universal multi-bookmaker code bridge, intelligent bet slip optimizer powered by Google Gemini, automated risk diagnostics, and dynamic double chance converter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
