import { useState } from "react";
import { MapPin, Mail, Phone, Clock, Loader2, Send } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLang } from "@/context/LanguageContext";
import api, { formatApiError } from "@/lib/api";
import { CLUB } from "@/lib/club";

const EMPTY = { name: "", email: "", phone: "", type: "info", message: "" };

export const Contact = () => {
  const { t } = useLang();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", form);
      toast.success(t.contact.success);
      setForm(EMPTY);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || t.contact.error);
    } finally {
      setLoading(false);
    }
  };

  const info = [
    { icon: MapPin, text: t.contact.address },
    { icon: Mail, text: CLUB.email },
    { icon: Phone, text: CLUB.phone },
    { icon: Clock, text: t.contact.hours },
  ];

  return (
    <section id="contact" data-testid="contact-section" className="py-24 md:py-32 bg-brand-dark relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-14">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-brand-sky">{t.contact.label}</span>
          <h2 className="font-display font-semibold uppercase tracking-tight text-3xl md:text-5xl mt-4 leading-tight">
            {t.contact.title}
          </h2>
          <p className="mt-5 text-white/70 text-base md:text-lg leading-relaxed max-w-md">{t.contact.subtitle}</p>

          <div className="mt-10 space-y-5">
            {info.map((it, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-brand-surface border border-white/10 flex items-center justify-center shrink-0">
                  <it.icon size={20} className="text-brand-sky" />
                </div>
                <span className="text-white/75">{it.text}</span>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={submit}
          data-testid="contact-form"
          className="bg-brand-surface border border-white/10 rounded-2xl p-7 md:p-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Label className="text-white/70 text-xs uppercase tracking-wider">{t.contact.name}</Label>
              <Input data-testid="contact-name" required value={form.name} onChange={set("name")} className="mt-2 bg-brand-dark border-white/10 text-white h-12 focus-visible:ring-brand-sky" />
            </div>
            <div>
              <Label className="text-white/70 text-xs uppercase tracking-wider">{t.contact.email}</Label>
              <Input data-testid="contact-email" type="email" required value={form.email} onChange={set("email")} className="mt-2 bg-brand-dark border-white/10 text-white h-12 focus-visible:ring-brand-sky" />
            </div>
            <div>
              <Label className="text-white/70 text-xs uppercase tracking-wider">{t.contact.phone}</Label>
              <Input data-testid="contact-phone" value={form.phone} onChange={set("phone")} className="mt-2 bg-brand-dark border-white/10 text-white h-12 focus-visible:ring-brand-sky" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-white/70 text-xs uppercase tracking-wider">{t.contact.type}</Label>
              <Select value={form.type} onValueChange={set("type")}>
                <SelectTrigger data-testid="contact-type" className="mt-2 bg-brand-dark border-white/10 text-white h-12 focus:ring-brand-sky">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-brand-surface border-white/10 text-white">
                  <SelectItem value="info">{t.contact.typeInfo}</SelectItem>
                  <SelectItem value="inscription">{t.contact.typeInscription}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-white/70 text-xs uppercase tracking-wider">{t.contact.message}</Label>
              <Textarea data-testid="contact-message" required rows={4} value={form.message} onChange={set("message")} className="mt-2 bg-brand-dark border-white/10 text-white focus-visible:ring-brand-sky resize-none" />
            </div>
          </div>

          <button
            data-testid="contact-submit"
            type="submit"
            disabled={loading}
            className="mt-7 w-full inline-flex items-center justify-center gap-2 bg-brand-sky hover:bg-brand-skyhover text-brand-dark font-bold uppercase tracking-wider py-4 rounded-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {loading ? t.contact.sending : t.contact.send}
          </button>
        </form>
      </div>
    </section>
  );
};
