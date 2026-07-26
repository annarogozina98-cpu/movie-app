import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Кино на двоих",
  description: "Наш общий список фильмов",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body`}>
        <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
          <header className="mb-6">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Кино на двоих
            </h1>
            <div className="perf-strip mt-3 w-full" />
          </header>
          <Nav />
          <main className="mt-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
