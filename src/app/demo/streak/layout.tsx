import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./streak.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const interSt = Inter({
  variable: "--font-inter-st",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Streak · Habit tracker prototype",
  description:
    "A warm, focused habit tracker. Interactive UI/UX prototype by Rafii Manggala.",
};

export default function StreakLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${fraunces.variable} ${interSt.variable}`}
      style={{ minHeight: "100dvh", background: "#f6f1e9" }}
    >
      {children}
    </div>
  );
}
