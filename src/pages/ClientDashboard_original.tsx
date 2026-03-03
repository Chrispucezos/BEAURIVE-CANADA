import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  User, FileText, Calendar, CheckCircle, Clock, AlertCircle,
  Home, BarChart3, PenLine, Sparkles, LogOut, Lock, Phone, Briefcase, DollarSign, CreditCard
} from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import SignatureCanvas from "react-signature-canvas";
import ClientBilling from "./ClientBilling";
import ClientServices from "./ClientServices";
import PaymentModal from "@/components/PaymentModal";
import { printContractAsPDF } from "@/components/ContractPDF";

// ─── TYPES ────────────────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  "non-commence": "bg-gray-100 text-gray-700",
  "en-cours": "bg-blue-100 text-blue-700",
  "en-attente": "bg-yellow-100 text-yellow-700",
  complete: "bg-green-100 text-green-700",
  annule: "bg-red-100 text-red-700",
  planifie: "bg-blue-100 text-blue-700",
  confirme: "bg-teal-100 text-teal-700",
  "en-pause": "bg-orange-100 text-orange-700",
  reporte: "bg-purple-100 text-purple-700",
  brouillon: "bg-gray-100 text-gray-700",
  envoye: "bg-blue-100 text-blue-700",
  "signe-client": "bg-yellow-100 text-yellow-700",
  "signe-admin": "bg-orange-100 text-orange-700",
  complet: "bg-green-100 text-green-700",
};

const statusLabels: Record<string, string> = {
  "non-commence": "Non commencé", "en-cours": "En cours", "en-attente": "En attente",
  complete: "Complété", annule: "Annulé", planifie: "Planifié", confirme: "Confirmé",
  "en-pause": "En pause", reporte: "Reporté", brouillon: "Brouillon",
  envoye: "Envoyé", "signe-client": "Signé (vous)", "signe-admin": "Signé (BeauRive)",
  complet: "Complet",
};

// ─── DIAGRAMME DE GANTT ───────────────────────────────────────────────────────
function GanttChart({ tasks }: { tasks: any[] }) {
  if (!tasks || tasks.length === 0) return (
    <div className="text-center py-12 text-muted-foreground">
      <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>Aucune tâche planifiée pour ce projet</p>
    </div>
  );

  const validTasks = tasks.filter(t => t.startDate && t.endDate);
  if (validTasks.length === 0) return (
    <div className="text-center py-8 text-muted-foreground text-sm">Dates non définies pour les tâches</div>
  );

  const minDate = new Date(Math.min(...validTasks.map(t => new Date(t.startDate).getTime())));
  const maxDate = new Date(Math.max(...validTasks.map(t => new Date(t.endDate).getTime())));
  const totalDays = Math.max(differenceInDays(maxDate, minDate) + 1, 1);

  const today = new Date();
  const todayOffset = differenceInDays(today, minDate);
  const todayPct = Math.max(0, Math.min(100, (todayOffset / totalDays) * 100));

  const colorMap: Record<string, string> = {
    "non-commence": "bg-gray-300",
    "en-cours": "bg-blue-500",
    "en-attente": "bg-yellow-400",
    complete: "bg-green-500",
    annule: "bg-red-400",
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header dates */}
        <div className="flex mb-2 ml-40 relative">
          {[0, 0.25, 0.5, 0.75, 1].map(p => (
            <div key={p} className="text-xs text-muted-foreground" style={{ position: "absolute", left: `${p * 100}%`, transform: "translateX(-50%)" }}>
              {format(addDays(minDate, Math.round(p * totalDays)), "d MMM", { locale: fr })}
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2 relative">
          {/* Ligne aujourd'hui */}
          {todayOffset >= 0 && todayOffset <= totalDays && (
            <div className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10 ml-40" style={{ left: `calc(${todayPct}% * (100% - 10rem) / 100 + 10rem)` }}>
              <span className="absolute -top-5 -translate-x-1/2 text-xs text-red-500 font-medium">Aujourd'hui</span>
            </div>
          )}
          {validTasks.map(task => {
            const start = new Date(task.startDate);
            const end = new Date(task.endDate);
            const offsetDays = differenceInDays(start, minDate);
            const durationDays = Math.max(differenceInDays(end, start) + 1, 1);
            const leftPct = (offsetDays / totalDays) * 100;
            const widthPct = (durationDays / totalDays) * 100;
            const barColor = colorMap[task.status] ?? "bg-teal-400";

            return (
              <div key={task.id} className="flex items-center gap-2">
                <div className="w-40 shrink-0 text-sm font-medium truncate pr-2" title={task.title}>
                  {task.title}
                </div>
                <div className="flex-1 relative h-8 bg-gray-100 rounded">
                  <div
                    className={`absolute h-full rounded ${barColor} opacity-90 flex items-center px-2`}
                    style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 2)}%` }}
                  >
                    <span className="text-xs text-white font-medium truncate">{task.progressPercent ?? 0}%</span>
                  </div>
                </div>
                <Badge className={`${statusColors[task.status]} text-xs shrink-0`}>{statusLabels[task.status]}</Badge>
              </div>
            );
          })}
        </div>
        {/* Légende */}
        <div className="flex gap-4 mt-4 flex-wrap">
          {[["bg-gray-300", "Non commencé"], ["bg-blue-500", "En cours"], ["bg-yellow-400", "En attente"], ["bg-green-500", "Complété"]].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className={`w-3 h-3 rounded ${color}`} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB: PROJETS ─────────────────────────────────────────────────────────────
function ProjectsTab() {
  const { data: projects } = trpc.clientPortal.getMyProjects.useQuery();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const { data: projectDetail } = trpc.clientPortal.getProjectWithTasks.useQuery(
    { projectId: selectedProject! },
    { enabled: !!selectedProject }
  );

  return (
    <div className="space-y-4">
      {(projects ?? []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun projet actif pour le moment</p>
          <p className="text-sm mt-1">Votre chargé de compte BeauRive créera votre dossier projet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {(projects ?? []).map(p => (
            <Card key={p.id} className={`cursor-pointer transition-all ${selectedProject === p.id ? "ring-2 ring-teal-500" : "hover:shadow-md"}`}
              onClick={() => setSelectedProject(selectedProject === p.id ? null : p.id)}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className={statusColors[p.status]}>{statusLabels[p.status]}</Badge>
                      <Badge variant="outline" className="text-xs">{p.type}</Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground shrink-0">
                    {p.startDate && <p>Début : {format(new Date(p.startDate), "d MMM yyyy", { locale: fr })}</p>}
                    {p.endDate && <p>Fin : {format(new Date(p.endDate), "d MMM yyyy", { locale: fr })}</p>}
                  </div>
                </div>
                {/* Barre de progression */}
                {p.progressPercent !== null && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progression</span><span>{p.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${p.progressPercent}%` }} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Détail projet + Gantt */}
      {selectedProject && projectDetail && (
        <Card className="border-teal-200">
          <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-600" />
              Diagramme de Gantt — {projectDetail.project.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GanttChart tasks={projectDetail.tasks} />
            {projectDetail.tasks.length > 0 && (
              <div className="mt-6 space-y-2">
                <h4 className="font-semibold text-sm">Détail des tâches</h4>
                {projectDetail.tasks.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                    <div>
                      <span className="font-medium">{t.title}</span>
                      {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">{t.progressPercent ?? 0}%</span>
                      <Badge className={`${statusColors[t.status]} text-xs`}>{statusLabels[t.status]}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── TAB: CALENDRIER MÉNAGE ───────────────────────────────────────────────────
function ScheduleTab() {
  const { data: schedules } = trpc.clientPortal.getUpcomingSchedule.useQuery();

  const upcoming = (schedules ?? []).filter(s => new Date(s.scheduledDate) >= new Date());
  const past = (schedules ?? []).filter(s => new Date(s.scheduledDate) < new Date());

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-teal-600" /> Prochaines visites</h3>
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">Aucune visite planifiée</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map(s => (
              <Card key={s.id} className="border-l-4 border-l-teal-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{format(new Date(s.scheduledDate), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
                      <p className="text-sm text-muted-foreground">
                        Durée : {s.duration} min
                        {s.serviceType && ` · ${s.serviceType}`}
                        {s.technicianName && ` · Technicien : ${s.technicianName}`}
                      </p>
                      {s.notes && <p className="text-xs text-muted-foreground italic mt-1">{s.notes}</p>}
                    </div>
                    <Badge className={statusColors[s.status]}>{statusLabels[s.status]}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 text-muted-foreground flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Historique des visites
          </h3>
          <div className="space-y-2">
            {past.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b text-sm">
                <span className="text-muted-foreground">{format(new Date(s.scheduledDate), "d MMM yyyy 'à' HH:mm", { locale: fr })}</span>
                <Badge className={statusColors[s.status]}>{statusLabels[s.status]}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB: CONTRATS ──────────────────────────────────────────────────────────
function ContractsTab() {
  const { data: contracts, refetch } = trpc.clientPortal.getMyContracts.useQuery();
  const signContract = trpc.clientPortal.signContract.useMutation({
    onSuccess: () => { refetch(); toast.success("Contrat signé avec succès !"); setSignDialog(null); }
  });

  const [signDialog, setSignDialog] = useState<number | null>(null);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const sigRef = useRef<SignatureCanvas>(null);

  const contractStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      brouillon: "bg-gray-100 text-gray-600",
      envoye: "bg-blue-100 text-blue-700",
      "signe-client": "bg-yellow-100 text-yellow-700",
      "signe-admin": "bg-orange-100 text-orange-700",
      actif: "bg-green-100 text-green-700",
      expire: "bg-gray-100 text-gray-500",
      annule: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      brouillon: "📄 En préparation",
      envoye: "📤 À signer",
      "signe-client": "✏️ Signé par vous — en attente BeauRive",
      "signe-admin": "✏️ Signé par BeauRive — en attente de vous",
      actif: "✅ Actif",
      expire: "⏰ Expiré",
      annule: "❌ Annulé",
    };
    return <Badge className={`border ${colors[status] ?? "bg-gray-100"}`}>{labels[status] ?? status}</Badge>;
  };

  const downloadContractPdf = (c: any) => {
    printContractAsPDF({
      contractNumber: c.contractNumber ?? "N/A",
      title: c.title ?? "Contrat de Services",
      content: c.content ?? "",
      type: c.type ?? "autre",
      status: c.status ?? "envoye",
      monthlyAmount: c.monthlyAmount,
      durationMonths: c.durationMonths,
      startDate: c.startDate,
      endDate: c.endDate,
      clientName: c.clientName,
      clientCompany: c.clientCompany,
      clientEmail: c.clientEmail,
      clientSignedAt: c.clientSignedAt,
      clientSignedName: c.clientSignedName,
      adminSignedAt: c.adminSignedAt,
      adminSignedName: c.adminSignedName,
      clientSignedIp: c.clientSignedIp,
      createdAt: c.createdAt,
    });
    toast.success("Contrat PDF ouvert — utilisez Ctrl+P pour enregistrer en PDF");
  };

  return (
    <div className="space-y-4">
      {(contracts ?? []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun contrat pour le moment</p>
          <p className="text-xs mt-1">BeauRive Solutions vous enverra votre contrat dès que votre service sera configuré.</p>
        </div>
      ) : (
        (contracts ?? []).map(c => (
          <Card key={c.id} className={`border-l-4 ${c.status === "actif" ? "border-l-green-500" : c.status === "envoye" ? "border-l-blue-500 shadow-md" : c.status === "annule" ? "border-l-red-400" : "border-l-gray-300"}`}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {c.contractNumber && <span className="text-xs text-muted-foreground font-mono">{c.contractNumber}</span>}
                    <h3 className="font-semibold">{c.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {contractStatusBadge(c.status)}
                    <Badge variant="outline" className="text-xs capitalize">{c.type}</Badge>
                    {c.monthlyAmount && (
                      <Badge variant="outline" className="text-xs text-green-700">
                        {c.monthlyAmount.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}/mois
                      </Badge>
                    )}
                  </div>
                  {c.durationMonths && c.startDate && (
                    <p className="text-xs text-muted-foreground">
                      Durée : {c.durationMonths} mois — Début : {format(new Date(c.startDate), "d MMM yyyy", { locale: fr })}
                    </p>
                  )}
                  {c.clientSignedAt && (
                    <p className="text-xs text-green-600 mt-1">✓ Vous avez signé le {format(new Date(c.clientSignedAt), "d MMM yyyy", { locale: fr })}</p>
                  )}
                  {c.adminSignedAt && (
                    <p className="text-xs text-blue-600">✓ BeauRive a signé le {format(new Date(c.adminSignedAt), "d MMM yyyy", { locale: fr })}</p>
                  )}
                  {c.status === "envoye" && !c.clientSignedAt && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                      📋 Ce contrat attend votre signature. Cliquez sur <strong>Signer</strong> pour procéder.
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setSelectedContract(c)}>
                    <FileText className="w-3 h-3 mr-1" /> Voir
                  </Button>
                  {c.status === "envoye" && !c.clientSignedAt && (
                    <Button size="sm" className="h-8 text-xs bg-teal-600 hover:bg-teal-700"
                      onClick={() => { setSignDialog(c.id); setSelectedContract(c); }}>
                      <PenLine className="w-3 h-3 mr-1" /> Signer
                    </Button>
                  )}
                  {(c.status === "actif" || c.status === "signe-client" || c.status === "signe-admin") && (
                    <Button size="sm" variant="outline" className="h-8 text-xs text-teal-600 border-teal-300"
                      onClick={() => downloadContractPdf(c)}>
                      ⬇️ Télécharger
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Dialog voir contrat */}
      <Dialog open={!!selectedContract && signDialog === null} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedContract?.contractNumber} — {selectedContract?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedContract?.monthlyAmount && (
              <div className="flex gap-3 flex-wrap">
                <Badge variant="outline" className="text-green-700">
                  {selectedContract.monthlyAmount.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}/mois
                </Badge>
                {selectedContract.durationMonths && <Badge variant="outline">{selectedContract.durationMonths} mois</Badge>}
              </div>
            )}
            <pre className="text-sm whitespace-pre-wrap font-sans bg-gray-50 p-4 rounded border max-h-96 overflow-y-auto">{selectedContract?.content}</pre>
            {(selectedContract?.status === "actif" || selectedContract?.status === "signe-client" || selectedContract?.status === "signe-admin") && (
              <Button className="w-full" variant="outline" onClick={() => downloadContractPdf(selectedContract)}>
                ⬇️ Télécharger le contrat
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog signature */}
      <Dialog open={signDialog !== null} onOpenChange={() => setSignDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Signer le contrat</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {selectedContract && (
              <div className="bg-gray-50 p-3 rounded text-sm max-h-40 overflow-y-auto border">
                <p className="font-semibold text-xs mb-1">{selectedContract.contractNumber} — {selectedContract.title}</p>
                <pre className="whitespace-pre-wrap font-sans text-xs">{selectedContract.content?.substring(0, 600)}...</pre>
              </div>
            )}
            <div>
              <Label className="mb-2 block">Votre signature manuscrite</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white">
                <SignatureCanvas
                  ref={sigRef}
                  penColor="black"
                  canvasProps={{ width: 400, height: 150, className: "w-full rounded-lg" }}
                />
              </div>
              <Button variant="ghost" size="sm" className="mt-1 text-xs" onClick={() => sigRef.current?.clear()}>
                Effacer
              </Button>
            </div>
            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
              En cliquant sur "Confirmer", vous apposez votre signature électronique légalement valide conformément à la Loi concernant le cadre juridique des technologies de l'information (LCCJTI) du Québec.
            </p>
            <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => {
              if (!sigRef.current || sigRef.current.isEmpty()) {
                toast.error("Veuillez signer avant de confirmer");
                return;
              }
              const sig = sigRef.current.toDataURL();
              signContract.mutate({ contractId: signDialog!, signature: sig });
            }} disabled={signContract.isPending}>
              {signContract.isPending ? "Signature en cours..." : <><CheckCircle className="w-4 h-4 mr-2" /> Confirmer ma signature</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── TAB: PROFIL ──────────────────────────────────────────────────────────────
function ProfileTab({ user }: { user: any }) {
  const { data: profile } = trpc.clientPortal.getMyProfile.useQuery();
  const updateProfile = trpc.clientPortal.updateMyProfile.useMutation({
    onSuccess: () => toast.success("Profil mis à jour !")
  });
  const [form, setForm] = useState({ phone: "", company: "", address: "" });
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-4 max-w-lg">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-teal-600" /> Mon Profil</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Nom</span><p className="font-medium">{user.name}</p></div>
            <div><span className="text-muted-foreground">Courriel</span><p className="font-medium">{user.email}</p></div>
            {profile?.phone && <div><span className="text-muted-foreground">Téléphone</span><p className="font-medium">{profile.phone}</p></div>}
            {profile?.company && <div><span className="text-muted-foreground">Entreprise</span><p className="font-medium">{profile.company}</p></div>}
            {profile?.address && <div className="col-span-2"><span className="text-muted-foreground">Adresse</span><p className="font-medium">{profile.address}</p></div>}
          </div>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => {
              setForm({ phone: profile?.phone ?? "", company: profile?.company ?? "", address: profile?.address ?? "" });
              setEditing(true);
            }}>Modifier</Button>
          ) : (
            <div className="space-y-3">
              <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>Entreprise</Label><Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
              <div><Label>Adresse</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { updateProfile.mutate(form); setEditing(false); }}>Enregistrer</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Annuler</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function ClientDashboard() {
  const { user, loading, logout } = useAuth();
  const isReady = !loading && !!user;

  // Tous les hooks AVANT tout return conditionnel (règle des hooks React)
  const { data: projects } = trpc.clientPortal.getMyProjects.useQuery(undefined, { enabled: isReady });
  const { data: contracts } = trpc.clientPortal.getMyContracts.useQuery(undefined, { enabled: isReady });
  const { data: schedules } = trpc.clientPortal.getUpcomingSchedule.useQuery(undefined, { enabled: isReady });
  const { data: myProfile, isLoading: profileLoading } = trpc.clientPortal.getMyProfile.useQuery(undefined, { enabled: isReady });
  const { data: myInvoices = [] } = trpc.billing.getMyInvoices.useQuery(undefined, { enabled: isReady });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#003d7a] to-[#00a896]">
      <Card className="max-w-md w-full mx-4 shadow-2xl">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 bg-[#003d7a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[#003d7a]" />
          </div>
          <h2 className="text-2xl font-bold text-[#003d7a] mb-2">Accès réservé aux membres</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Le portail client BeauRive est réservé à nos membres actifs.
            Nous vous donnerons accès dès que vous serez membre de notre communauté.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/#contact">
              <Button className="w-full bg-[#003d7a] hover:bg-[#002d5a] text-white gap-2">
                <Phone className="w-4 h-4" />
                Nous contacter
              </Button>
            </Link>
            <Link to="/#departments">
              <Button variant="outline" className="w-full border-[#00a896] text-[#00a896] hover:bg-[#00a896] hover:text-white gap-2">
                <Briefcase className="w-4 h-4" />
                Nos services
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Utilisateur connecté mais sans profil client
  if (!profileLoading && myProfile === null) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#003d7a] to-[#00a896]">
      <Card className="max-w-md w-full mx-4 shadow-2xl">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 bg-[#003d7a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[#003d7a]" />
          </div>
          <h2 className="text-2xl font-bold text-[#003d7a] mb-1">Bonjour, {user.name?.split(" ")[0]} !</h2>
          <p className="text-sm text-gray-500 mb-4">Connecté en tant que {user.email}</p>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Votre compte est bien créé, mais votre espace client n'est pas encore configuré.
            Nous vous donnerons accès au portail dès que vous serez membre actif de BeauRive.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/#contact">
              <Button className="w-full bg-[#003d7a] hover:bg-[#002d5a] text-white gap-2">
                <Phone className="w-4 h-4" />
                Nous contacter
              </Button>
            </Link>
            <Link to="/#departments">
              <Button variant="outline" className="w-full border-[#00a896] text-[#00a896] hover:bg-[#00a896] hover:text-white gap-2">
                <Briefcase className="w-4 h-4" />
                Nos services
              </Button>
            </Link>
            <button
              onClick={() => logout()}
              className="text-sm text-gray-400 hover:text-gray-600 transition mt-2 underline"
            >
              Se déconnecter
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const pendingContracts = (contracts ?? []).filter(c => c.status === "envoye" && !c.clientSignedAt).length;
  const upcomingVisits = (schedules ?? []).filter(s => new Date(s.scheduledDate) >= new Date()).length;
  const activeProjects = (projects ?? []).filter((p: any) => p.status === "en-cours").length;
  const unpaidInvoices = (myInvoices as any[]).filter(inv => inv.status === "envoyee" || inv.status === "vue" || inv.status === "retard");
  const unpaidCount = unpaidInvoices.length;
  const unpaidTotal = unpaidInvoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount ?? 0), 0);
  const fmtCAD = (cents: number) => (cents / 100).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
  const [payModalOpen, setPayModalOpen] = useState(false);
  const firstUnpaid = unpaidInvoices[0] as any;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0a2540] text-white py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <span className="text-teal-400 text-sm font-medium">Espace Client</span>
            </div>
            <h1 className="text-2xl font-bold">Bonjour, {user.name?.split(" ")[0]} 👋</h1>
            <p className="text-blue-200 text-sm">BeauRive Solutions — Tableau de bord personnel</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/"><Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10 bg-transparent">← Accueil</Button></Link>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/30 hover:bg-red-500/20 hover:border-red-400 bg-transparent gap-1.5"
              onClick={() => logout()}
            >
              <LogOut className="w-3.5 h-3.5" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Alertes */}
        {pendingContracts > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
            <p className="text-yellow-800 text-sm font-medium">
              {pendingContracts} contrat{pendingContracts > 1 ? "s" : ""} en attente de votre signature
            </p>
          </div>
        )}
        {unpaidCount > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-red-800 text-sm font-bold">
                  {unpaidCount} facture{unpaidCount > 1 ? "s" : ""} non payée{unpaidCount > 1 ? "s" : ""}
                </p>
                <p className="text-red-700 font-semibold">{fmtCAD(unpaidTotal)} à régler</p>
                <p className="text-red-500 text-xs mt-0.5">Payez en ligne par carte de crédit en toute sécurité</p>
              </div>
            </div>
            <button
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shrink-0 transition shadow"
              onClick={() => setPayModalOpen(true)}
            >Payer maintenant →</button>
          </div>
        )}

        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-teal-600">{activeProjects}</p>
              <p className="text-sm text-muted-foreground">Projet{activeProjects !== 1 ? "s" : ""} actif{activeProjects !== 1 ? "s" : ""}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{upcomingVisits}</p>
              <p className="text-sm text-muted-foreground">Visite{upcomingVisits !== 1 ? "s" : ""} à venir</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-purple-600">{(contracts ?? []).length}</p>
              <p className="text-sm text-muted-foreground">Contrat{(contracts ?? []).length !== 1 ? "s" : ""}</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all ${unpaidCount > 0 ? "border-2 border-red-400 bg-red-50 hover:shadow-md" : "border-green-200 bg-green-50"}`}
            onClick={() => { (document.querySelector('[value="billing"]') as HTMLElement)?.click(); }}
          >
            <CardContent className="pt-4 text-center">
              {unpaidCount > 0 ? (
                <>
                  <p className="text-2xl font-bold text-red-600">{fmtCAD(unpaidTotal)}</p>
                  <p className="text-xs font-semibold text-red-500 mt-0.5">Solde dû — {unpaidCount} facture{unpaidCount > 1 ? "s" : ""}</p>
                  <p className="text-xs text-red-400 mt-1 underline cursor-pointer" onClick={() => setPayModalOpen(true)}>Cliquer pour payer</p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-green-600">✓</p>
                  <p className="text-sm text-green-700 font-medium">Compte à jour</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="services">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="services"><BarChart3 className="w-4 h-4 mr-1" /> Services</TabsTrigger>
            <TabsTrigger value="schedule"><Calendar className="w-4 h-4 mr-1" /> Calendrier</TabsTrigger>
            <TabsTrigger value="billing" className="relative">
              <DollarSign className="w-4 h-4 mr-1" /> Facturation
              {unpaidCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">{unpaidCount}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="contracts">
              <FileText className="w-4 h-4 mr-1" /> Contrats
              {pendingContracts > 0 && <span className="ml-1 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{pendingContracts}</span>}
            </TabsTrigger>
            <TabsTrigger value="profile"><User className="w-4 h-4 mr-1" /> Profil</TabsTrigger>
            <TabsTrigger value="ia" className="relative">
              <Sparkles className="w-4 h-4 mr-1 text-amber-500" />
              <span>Outils IA</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="services" className="mt-6"><ClientServices /></TabsContent>
          <TabsContent value="schedule" className="mt-6"><ScheduleTab /></TabsContent>
          <TabsContent value="billing" className="mt-6"><ClientBilling /></TabsContent>
          <TabsContent value="contracts" className="mt-6"><ContractsTab /></TabsContent>
          <TabsContent value="profile" className="mt-6"><ProfileTab user={user} /></TabsContent>
          <TabsContent value="ia" className="mt-6">
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">Nos outils IA arrivent bientôt !</h3>
              <p className="text-gray-500 text-center max-w-md leading-relaxed mb-6">
                Nous développons actuellement des outils d'intelligence artificielle spécialement conçus pour vous aider à gérer vos projets, automatiser vos tâches et prendre de meilleures décisions.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 max-w-sm w-full text-center">
                <p className="text-amber-700 font-semibold text-sm mb-1">🛠️ En cours de développement</p>
                <p className="text-amber-600/80 text-xs">Vous serez notifié dès que ces fonctionnalités seront disponibles dans votre espace.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modale de paiement */}
      {firstUnpaid && (
        <PaymentModal
          open={payModalOpen}
          onClose={() => setPayModalOpen(false)}
          invoiceNumber={firstUnpaid.invoiceNumber ?? ""}
          amount={firstUnpaid.totalAmount ?? 0}
          invoiceId={firstUnpaid.id}
        />
      )}
    </div>
  );
}
