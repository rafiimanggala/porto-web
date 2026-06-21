import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import PersonJsonLd from "@/components/seo/PersonJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jb = JetBrains_Mono({
  variable: "--font-jb",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rafiimanggala.vercel.app"),
  title: "Rafii Manggala · AI Engineer · Autonomous Systems",
  description:
    "I build systems where AI agents do the work, not just write the code. Trading bots, digital twins, and autonomous infra powered by Claude Code.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Rafii Manggala · AI Engineer",
    description:
      "Systems where AI agents do the work: trading bots, digital twins, autonomous infra.",
    type: "website",
    url: "https://rafiimanggala.vercel.app",
    siteName: "Rafii Manggala Japamel",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${space.variable} ${inter.variable} ${jb.variable}`}
    >
      <body>
        {children}
        <PersonJsonLd />
        <FaqJsonLd />
        <SiteChrome />
      </body>
    </html>
  );
}
