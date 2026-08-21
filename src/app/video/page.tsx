import type { Metadata } from "next";
import Nav from "@/components/Nav";
import VideoHero from "@/components/VideoHero";
import SelectedWork from "@/components/SelectedWork";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "Rafii Manggala · AI Video Automation",
  description:
    "600+ AI-generated video and image assets delivered across 14 client accounts, on a self-hosted n8n pipeline that scripts, renders and cross-posts automatically.",
  alternates: { canonical: "/video" },
};

const VIDEO_SLUGS = ["content-automation-pipeline", "ai-video-production"];

export default function VideoHome() {
  return (
    <main className="relative">
      <Nav variant="video" />
      <VideoHero />
      <SelectedWork
        slugs={VIDEO_SLUGS}
        id="work"
        index="02"
        title="The work"
        intro="Two case studies: the automation behind delivery, and a sample of the output."
      />
      <Contact index="03" />
    </main>
  );
}
