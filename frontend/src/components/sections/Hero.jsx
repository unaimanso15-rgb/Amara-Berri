import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const HERO_BG =
  "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1600";

export const Hero = () => {
  const { t } = useLang();
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const stats = [
    { value: "250+", label: t.hero.stat1 },
    { value: "5", label: t.hero.stat2 },
    { value: "40+", label: t.hero.stat3 },
  ];

  return (
    <section id="hero" data-testid="hero-section" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={HERO_BG} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-brand-dark/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/70 to-transparent" />
        <div className="absolute inset-0 bg-grid opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-brand-sky border border-brand-sky/30 rounded-full px-4 py-1.5 mb-7">
            {t.hero.badge}
          </span>
          <h1 className="font-display font-bold uppercase tracking-tight text-5xl sm:text-6xl lg:text-7xl leading-[0.98]" style={{ wordSpacing: "0.12em" }}>
            {t.hero.title1}{" "}
            <span className="text-brand-sky text-glow">{t.hero.highlight}</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">{t.hero.subtitle}</p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              data-testid="hero-join-btn"
              onClick={() => go("contact")}
              className="group inline-flex items-center gap-2 bg-brand-sky hover:bg-brand-skyhover text-brand-dark font-bold uppercase tracking-wider px-7 py-4 rounded-full transition-all hover:-translate-y-1"
            >
              {t.hero.cta1}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              data-testid="hero-teams-btn"
              onClick={() => go("teams")}
              className="inline-flex items-center gap-2 border border-white/25 hover:border-brand-sky hover:text-brand-sky text-white font-semibold uppercase tracking-wider px-7 py-4 rounded-full transition-colors"
            >
              {t.hero.cta2}
            </button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-xl">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display font-bold text-4xl md:text-5xl text-white">{s.value}</div>
                <div className="text-xs uppercase tracking-widest text-white/50 mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
