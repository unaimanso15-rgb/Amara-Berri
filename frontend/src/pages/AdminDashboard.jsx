import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, Pencil, Trash2, Mail, Check, Users, Inbox, BellDot, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import api, { formatApiError } from "@/lib/api";
import { CLUB } from "@/lib/club";

const EMPTY_TEAM = {
  name_es: "", name_eu: "", category: "", description_es: "", description_eu: "",
  image_url: "", order: 0,
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [subs, setSubs] = useState([]);
  const [stats, setStats] = useState({ teams: 0, submissions: 0, unread: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_TEAM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [tRes, sRes, stRes] = await Promise.all([
      api.get("/teams"),
      api.get("/admin/submissions"),
      api.get("/admin/stats"),
    ]);
    setTeams(tRes.data);
    setSubs(sRes.data);
    setStats(stRes.data);
  }, []);

  useEffect(() => {
    load().catch(() => toast.error("Error cargando datos"));
  }, [load]);

  const doLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_TEAM);
    setDialogOpen(true);
  };

  const openEdit = (team) => {
    setEditing(team.id);
    setForm({ ...EMPTY_TEAM, ...team });
    setDialogOpen(true);
  };

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveTeam = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, order: Number(form.order) || 0 };
    delete payload.id;
    delete payload.created_at;
    try {
      if (editing) await api.put(`/admin/teams/${editing}`, payload);
      else await api.post("/admin/teams", payload);
      toast.success(editing ? "Equipo actualizado" : "Equipo creado");
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const deleteTeam = async (id) => {
    if (!window.confirm("¿Eliminar este equipo?")) return;
    await api.delete(`/admin/teams/${id}`);
    toast.success("Equipo eliminado");
    await load();
  };

  const markRead = async (id) => {
    await api.put(`/admin/submissions/${id}/read`);
    await load();
  };

  const deleteSub = async (id) => {
    if (!window.confirm("¿Eliminar esta solicitud?")) return;
    await api.delete(`/admin/submissions/${id}`);
    toast.success("Solicitud eliminada");
    await load();
  };

  const statCards = [
    { icon: Users, label: "Equipos", value: stats.teams },
    { icon: Inbox, label: "Solicitudes", value: stats.submissions },
    { icon: BellDot, label: "Sin leer", value: stats.unread },
  ];

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <header className="border-b border-white/10 bg-brand-navy sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={CLUB.logo} alt="" className="h-9 w-auto" />
            <span className="font-display font-semibold uppercase tracking-tight">Panel · Amara Berri K.E.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/50 text-sm hidden sm:block">{user?.email}</span>
            <button data-testid="logout-btn" onClick={doLogout} className="inline-flex items-center gap-2 text-sm border border-white/15 hover:border-brand-sky hover:text-brand-sky px-4 py-2 rounded-full transition-colors">
              <LogOut size={16} /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {statCards.map((s) => (
            <div key={s.label} className="bg-brand-surface border border-white/10 rounded-xl p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-brand-sky/10 flex items-center justify-center">
                <s.icon className="text-brand-sky" size={24} />
              </div>
              <div>
                <div className="font-display font-bold text-3xl">{s.value}</div>
                <div className="text-xs uppercase tracking-widest text-white/50">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="teams">
          <TabsList className="bg-brand-surface border border-white/10">
            <TabsTrigger value="teams" data-testid="tab-teams" className="data-[state=active]:bg-brand-sky data-[state=active]:text-brand-dark">Equipos</TabsTrigger>
            <TabsTrigger value="subs" data-testid="tab-subs" className="data-[state=active]:bg-brand-sky data-[state=active]:text-brand-dark">Solicitudes</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="mt-6">
            <div className="flex justify-end mb-4">
              <button data-testid="add-team-btn" onClick={openNew} className="inline-flex items-center gap-2 bg-brand-sky hover:bg-brand-skyhover text-brand-dark font-bold uppercase text-sm tracking-wider px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5">
                <Plus size={18} /> Nuevo equipo
              </button>
            </div>
            <div className="bg-brand-surface border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-white/60 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="text-left px-5 py-3">Orden</th>
                    <th className="text-left px-5 py-3">Nombre (ES)</th>
                    <th className="text-left px-5 py-3 hidden md:table-cell">Categoría</th>
                    <th className="text-right px-5 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id} data-testid={`admin-team-row-${team.id}`} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-5 py-3 text-white/50">{team.order}</td>
                      <td className="px-5 py-3 font-medium">{team.name_es}</td>
                      <td className="px-5 py-3 hidden md:table-cell"><Badge className="bg-brand-sky/15 text-brand-sky border-0">{team.category}</Badge></td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button data-testid={`edit-team-${team.id}`} onClick={() => openEdit(team)} className="h-9 w-9 flex items-center justify-center rounded-lg border border-white/10 hover:border-brand-sky hover:text-brand-sky transition-colors"><Pencil size={15} /></button>
                          <button data-testid={`delete-team-${team.id}`} onClick={() => deleteTeam(team.id)} className="h-9 w-9 flex items-center justify-center rounded-lg border border-white/10 hover:border-red-500 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="subs" className="mt-6">
            {subs.length === 0 ? (
              <p className="text-white/50" data-testid="subs-empty">No hay solicitudes todavía.</p>
            ) : (
              <div className="space-y-4">
                {subs.map((s) => (
                  <div key={s.id} data-testid={`submission-${s.id}`} className={`bg-brand-surface border rounded-xl p-5 ${s.is_read ? "border-white/10" : "border-brand-sky/40"}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-lg">{s.name}</span>
                          <Badge className={s.type === "inscription" ? "bg-brand-sky text-brand-dark border-0" : "bg-white/10 text-white border-0"}>
                            {s.type === "inscription" ? "Inscripción" : "Información"}
                          </Badge>
                          {!s.is_read && <span className="text-xs text-brand-sky uppercase tracking-wider">Nuevo</span>}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-white/60">
                          <a href={`mailto:${s.email}`} className="flex items-center gap-1.5 hover:text-brand-sky"><Mail size={14} /> {s.email}</a>
                          {s.phone && <span>{s.phone}</span>}
                          <span>{new Date(s.created_at).toLocaleString("es-ES")}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!s.is_read && (
                          <button data-testid={`read-sub-${s.id}`} onClick={() => markRead(s.id)} className="h-9 w-9 flex items-center justify-center rounded-lg border border-white/10 hover:border-brand-sky hover:text-brand-sky transition-colors"><Check size={16} /></button>
                        )}
                        <button data-testid={`delete-sub-${s.id}`} onClick={() => deleteSub(s.id)} className="h-9 w-9 flex items-center justify-center rounded-lg border border-white/10 hover:border-red-500 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <p className="mt-3 text-white/75 text-sm bg-brand-dark rounded-lg p-3">{s.message}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-brand-surface border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">{editing ? "Editar equipo" : "Nuevo equipo"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveTeam} data-testid="team-form" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre (ES)" testid="team-name-es" value={form.name_es} onChange={setF("name_es")} required />
            <Field label="Nombre (EU)" testid="team-name-eu" value={form.name_eu} onChange={setF("name_eu")} required />
            <Field label="Categoría" testid="team-category" value={form.category} onChange={setF("category")} required />
            <Field label="Orden" testid="team-order" type="number" value={form.order} onChange={setF("order")} />
            <div className="sm:col-span-2">
              <Label className="text-white/70 text-xs uppercase tracking-wider">URL imagen</Label>
              <Input data-testid="team-image" value={form.image_url} onChange={setF("image_url")} className="mt-2 bg-brand-dark border-white/10 text-white" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-white/70 text-xs uppercase tracking-wider">Descripción (ES)</Label>
              <Textarea data-testid="team-desc-es" rows={2} value={form.description_es} onChange={setF("description_es")} className="mt-2 bg-brand-dark border-white/10 text-white resize-none" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-white/70 text-xs uppercase tracking-wider">Descripción (EU)</Label>
              <Textarea data-testid="team-desc-eu" rows={2} value={form.description_eu} onChange={setF("description_eu")} className="mt-2 bg-brand-dark border-white/10 text-white resize-none" />
            </div>
            <DialogFooter className="sm:col-span-2 mt-2">
              <button data-testid="save-team-btn" type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 bg-brand-sky hover:bg-brand-skyhover text-brand-dark font-bold uppercase tracking-wider px-6 py-3 rounded-lg transition-all disabled:opacity-60">
                {saving && <Loader2 size={16} className="animate-spin" />} Guardar
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const Field = ({ label, testid, value, onChange, type = "text", required }) => (
  <div>
    <Label className="text-white/70 text-xs uppercase tracking-wider">{label}</Label>
    <Input data-testid={testid} type={type} required={required} value={value} onChange={onChange} className="mt-2 bg-brand-dark border-white/10 text-white" />
  </div>
);
