import type { Metadata } from "next";
import FaqAccordion from "@/components/FaqAccordion";
import Contact from "@/components/Contact";
import FooterLinks from "@/components/FooterLinks";
import ServiceOrbit from "@/components/orbit/ServiceOrbit";
import Hero from "@/components/home/Hero";
import Dock from "@/components/home/Dock";
import DirectoryHead from "@/components/home/DirectoryHead";
import WorkReel from "@/components/home/WorkReel";

export const metadata: Metadata = {
  title: "Rafii Manggala · Web apps, AI features, automation",
  description:
    "Seven things I get hired for: full-stack web apps, AI features inside products, automation, AI video at scale, design and prototypes, fixing live systems, and custom Shopify builds.",
  alternates: { canonical: "/" },
};

// Section ids the floating dock relies on: #home (hero), #directory, #faq, #contact.
export default function Home() {
  return (
    <main className="theme-green relative min-h-screen pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]">
      <Hero />

      <WorkReel />

      <section
        id="directory"
        aria-labelledby="directory-h"
        className="mx-auto w-full max-w-[1120px] scroll-mt-4 px-6 pt-16 pb-24 sm:pt-24 lg:px-8 lg:pb-32"
      >
        <DirectoryHead />

        {/* Not wrapped in Reveal: its blur filter would sit on the WebGL canvas's
            ancestor for the life of the page. The orbit fades its own canvas in. */}
        <div className="mt-10">
          <ServiceOrbit />
        </div>
      </section>

      <FaqAccordion index="05" />
      <Contact index="06" lean hideHeading />
      <FooterLinks />

      <Dock />
    </main>
  );
}
