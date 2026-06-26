import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { CLUB } from "@/lib/club";

const LINKS = [
  { id: "hero", key: "home" },
  { id: "about", key: "about" },
  { id: "teams", key: "teams" },
  { id: "contact", key: "contact" },
];

export const Navbar = () => {
  const { t, lang, changeLang } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl bg-brand-dark/85 border-b border-white/10" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <button onClick={() => go("hero")} data-testid="nav-logo" className="flex items-center gap-3">
          <img src={CLUB.logo} alt="Amara Berri K.E." className="h-11 w-auto" />
          <span className="font-display font-semibold text-lg tracking-tight uppercase hidden sm:block">
            Amara Berri <span className="text-brand-sky">K.E.</span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-9">
          {LINKS.map((l) => (
            <button
              key={l.id}
              data-testid={`nav-${l.key}-link`}
              onClick={() => go(l.id)}
              className="text-sm font-medium uppercase tracking-wider text-white/70 hover:text-brand-sky transition-colors"
            >
              {t.nav[l.key]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-full border border-white/15 overflow-hidden text-xs font-bold">
            {["eu", "es"].map((l) => (
              <button
                key={l}
                data-testid={`lang-${l}`}
                onClick={() => changeLang(l)}
                className={`px-3 py-1.5 uppercase transition-colors ${
                  lang === l ? "bg-brand-sky text-brand-dark" : "text-white/60 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            data-testid="nav-join-btn"
            onClick={() => go("contact")}
            className="hidden sm:inline-flex bg-brand-sky hover:bg-brand-skyhover text-brand-dark font-bold uppercase text-sm tracking-wider px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5"
          >
            {t.nav.join}
          </button>
          <button data-testid="mobile-menu-btn" onClick={() => setOpen(!open)} className="md:hidden text-white">
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden bg-brand-dark/95 backdrop-blur-xl border-t border-white/10 px-6 py-6 flex flex-col gap-4">
          {LINKS.map((l) => (
            <button
              key={l.id}
              data-testid={`mobile-nav-${l.key}-link`}
              onClick={() => go(l.id)}
              className="text-left text-base font-medium uppercase tracking-wide text-white/80 hover:text-brand-sky"
            >
              {t.nav[l.key]}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
