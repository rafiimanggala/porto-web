import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Featured from "@/components/Featured";
import Toolkit from "@/components/Toolkit";
import Capabilities from "@/components/Capabilities";
import ProjectIndex from "@/components/ProjectIndex";
import About from "@/components/About";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <Featured />
      <Toolkit />
      <Capabilities />
      <ProjectIndex />
      <About />
      <Contact />
    </main>
  );
}
