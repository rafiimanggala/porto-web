import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono, Titan_One, Anton } from "next/font/google";
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

// Giant rounded display face for the cream home theme (--font-display there).
const titan = Titan_One({
  weight: "400",
  variable: "--font-titan",
  subsets: ["latin"],
  display: "swap",
});

const jb = JetBrains_Mono({
  variable: "--font-jb",
  subsets: ["latin"],
  display: "swap",
});

// Tall, condensed black grotesk for WorkReel's big overlaid card titles --
// viens-la.com's actual project cards use this register, not the rounded
// Titan One the rest of the green theme runs on. Scoped to card titles only
// via --font-card-title, not promoted to --font-display, so the page's own
// type identity elsewhere is untouched.
const anton = Anton({
  weight: "400",
  variable: "--font-card-title",
  subsets: ["latin"],
  display: "swap",
});

// viewportFit cover makes env(safe-area-inset-bottom) real on notched phones, which
// the sticky brief bar relies on.
export const viewport: Viewport = { viewportFit: "cover" };

export const metadata: Metadata = {
  metadataBase: new URL("https://rafiimanggala.vercel.app"),
  title: "Rafii Manggala · AI Engineer · Autonomous Systems",
  description:
    "AI agents that do the work, not just write the code. Trading bots, digital twins, and autonomous infra powered by Claude Code.",
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
      className={`${space.variable} ${inter.variable} ${jb.variable} ${titan.variable} ${anton.variable}`}
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
