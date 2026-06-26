import { MapPin, Mail, Phone, Instagram, Facebook } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { CLUB } from "@/lib/club";

const LINKS = [
  { id: "hero", key: "home" },
  { id: "about", key: "about" },
  { id: "teams", key: "teams" },
  { id: "contact", key: "contact" },
];

export const Footer = () => {
  const { t } = useLang();
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer data-testid="footer" className="bg-brand-navy border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <img src={CLUB.logo} alt="Amara Berri K.E." className="h-12 w-auto" />
            <span className="font-display font-semibold text-lg uppercase tracking-tight">Amara Berri K.E.</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">{t.footer.tagline}</p>
          <div className="flex gap-3 mt-6">
            <a href={CLUB.instagram} target="_blank" rel="noreferrer" data-testid="footer-instagram" className="h-10 w-10 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:bg-brand-sky hover:text-brand-dark hover:border-brand-sky transition-colors">
              <Instagram size={18} />
            </a>
            <a href={CLUB.facebook} target="_blank" rel="noreferrer" data-testid="footer-facebook" className="h-10 w-10 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:bg-brand-sky hover:text-brand-dark hover:border-brand-sky transition-colors">
              <Facebook size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-brand-sky mb-5">{t.footer.nav}</h4>
          <ul className="space-y-3">
            {LINKS.map((l) => (
              <li key={l.id}>
                <button onClick={() => go(l.id)} className="text-white/70 hover:text-white text-sm transition-colors">
                  {t.nav[l.key]}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-brand-sky mb-5">{t.footer.contact}</h4>
          <ul className="space-y-4 text-sm text-white/70">
            <li className="flex items-start gap-3"><MapPin size={18} className="text-brand-sky shrink-0 mt-0.5" /> {t.contact.address}</li>
            <li className="flex items-center gap-3"><Mail size={18} className="text-brand-sky shrink-0" /> {CLUB.email}</li>
            <li className="flex items-center gap-3"><Phone size={18} className="text-brand-sky shrink-0" /> {CLUB.phone}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>© {new Date().getFullYear()} Amara Berri K.E. {t.footer.rights}</span>
          <a href="/admin/login" data-testid="footer-admin-link" className="hover:text-brand-sky transition-colors uppercase tracking-wider">
            {t.footer.admin}
          </a>
        </div>
      </div>
    </footer>
  );
};
