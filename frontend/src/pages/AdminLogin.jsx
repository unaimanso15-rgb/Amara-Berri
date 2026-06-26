import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { CLUB } from "@/lib/club";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white flex items-center justify-center px-6 bg-grid">
      <div className="w-full max-w-md bg-brand-surface border border-white/10 rounded-2xl p-8 md:p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <img src={CLUB.logo} alt="Amara Berri K.E." className="h-16 w-auto mb-4" />
          <h1 className="font-display font-semibold uppercase tracking-tight text-2xl">Panel del club</h1>
          <p className="text-white/50 text-sm mt-1">Amara Berri K.E.</p>
        </div>

        <form onSubmit={submit} data-testid="admin-login-form" className="space-y-5">
          <div>
            <Label className="text-white/70 text-xs uppercase tracking-wider">Email</Label>
            <Input data-testid="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 bg-brand-dark border-white/10 text-white h-12 focus-visible:ring-brand-sky" />
          </div>
          <div>
            <Label className="text-white/70 text-xs uppercase tracking-wider">Contraseña</Label>
            <Input data-testid="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 bg-brand-dark border-white/10 text-white h-12 focus-visible:ring-brand-sky" />
          </div>

          {error && (
            <p data-testid="login-error" className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            data-testid="login-submit"
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-sky hover:bg-brand-skyhover text-brand-dark font-bold uppercase tracking-wider py-3.5 rounded-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
            Entrar
          </button>
        </form>

        <a href="/" className="block text-center text-white/40 hover:text-brand-sky text-sm mt-6 transition-colors">
          ← Volver a la web
        </a>
      </div>
    </div>
  );
}
