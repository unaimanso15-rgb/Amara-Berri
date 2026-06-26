import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Clock } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import api from "@/lib/api";

export const Teams = () => {
  const { t, lang } = useLang();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/teams")
      .then(({ data }) => setTeams(data))
      .catch(() => setTeams([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="teams" data-testid="teams-section" className="py-24 md:py-32 bg-brand-navy relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-2xl mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-brand-sky">{t.teams.label}</span>
          <h2 className="font-display font-semibold uppercase tracking-tight text-3xl md:text-5xl mt-4">
            {t.teams.title}
          </h2>
          <p className="mt-5 text-white/70 text-base md:text-lg leading-relaxed">{t.teams.subtitle}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-brand-surface rounded-xl h-80 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <p className="text-white/50" data-testid="teams-empty">{t.teams.empty}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teams.map((team, i) => (
              <motion.div
                key={team.id}
                data-testid={`team-card-${i}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
                className="group bg-brand-surface rounded-xl border border-white/10 overflow-hidden hover:border-brand-sky/50 transition-colors"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={team.image_url}
                    alt={lang === "eu" ? team.name_eu : team.name_es}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-brand-sky text-brand-dark text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {team.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-semibold uppercase tracking-tight text-xl">
                    {lang === "eu" ? team.name_eu : team.name_es}
                  </h3>
                  <p className="text-white/55 text-sm mt-2 leading-relaxed line-clamp-3">
                    {lang === "eu" ? team.description_eu : team.description_es}
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-sm">
                    {team.coach && (
                      <div className="flex items-center gap-2 text-white/70">
                        <User size={15} className="text-brand-sky" /> {team.coach}
                      </div>
                    )}
                    {team.schedule && (
                      <div className="flex items-center gap-2 text-white/70">
                        <Clock size={15} className="text-brand-sky" /> {team.schedule}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
