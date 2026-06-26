import { motion } from "framer-motion";
import { GraduationCap, Users, HeartHandshake, Target } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const ABOUT_IMG =
  "https://images.unsplash.com/photo-1594305548608-df04461f1b28?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85";

const ICONS = [GraduationCap, Users, HeartHandshake, Target];

export const About = () => {
  const { t } = useLang();

  return (
    <section id="about" data-testid="about-section" className="relative py-24 md:py-32 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="rounded-3xl overflow-hidden border border-white/10">
            <img src={ABOUT_IMG} alt="Donostia - San Sebastián" className="w-full h-[420px] object-cover" />
          </div>
          <div className="absolute -bottom-6 -right-4 sm:right-6 bg-brand-sky text-brand-dark rounded-2xl px-7 py-5 shadow-2xl">
            <div className="font-display font-bold text-3xl">Est. 1985</div>
            <div className="text-xs font-semibold uppercase tracking-widest">Amara Berri · Donostia</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-brand-sky">{t.about.label}</span>
          <h2 className="font-display font-semibold uppercase tracking-tight text-3xl md:text-5xl mt-4 leading-tight">
            {t.about.title}
          </h2>
          <p className="mt-6 text-white/70 text-base md:text-lg leading-relaxed">{t.about.p1}</p>
          <p className="mt-4 text-white/70 text-base md:text-lg leading-relaxed">{t.about.p2}</p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {t.about.values.map((v, i) => {
              const Icon = ICONS[i];
              return (
                <div
                  key={v.title}
                  data-testid={`about-value-${i}`}
                  className="bg-brand-surface border border-white/10 rounded-xl p-5 hover:border-brand-sky/50 transition-colors"
                >
                  <Icon className="text-brand-sky mb-3" size={26} />
                  <h3 className="font-display font-semibold uppercase tracking-tight text-lg">{v.title}</h3>
                  <p className="text-white/55 text-sm mt-1 leading-relaxed">{v.text}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
