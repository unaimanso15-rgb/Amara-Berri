import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Teams } from "@/components/sections/Teams";
import { Contact } from "@/components/sections/Contact";

export default function Landing() {
  return (
    <div className="bg-brand-dark text-white min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Teams />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
