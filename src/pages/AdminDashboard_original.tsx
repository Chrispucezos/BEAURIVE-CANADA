import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Users, FileText, Calendar, BarChart3, Send, Plus, CheckCircle,
  Clock, AlertCircle, TrendingUp, ClipboardList, Briefcase, Home, Star, ThumbsUp, ThumbsDown, Trash2, DollarSign, Calculator, CreditCard, Inbox, MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import AdminBilling from "./AdminBilling";
import AdminServices from "./AdminServices";
import ComptabiliteAdmin from "./ComptabiliteAdmin";
import StripeSettings from "./StripeSettings";
import { printContractAsPDF } from "@/components/ContractPDF";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  converted: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
  prospect: "bg-purple-100 text-purple-800",
  negociation: "bg-orange-100 text-orange-800",
  actif: "bg-green-100 text-green-800",
  suspendu: "bg-red-100 text-red-800",
  termine: "bg-gray-100 text-gray-800",
  brouillon: "bg-gray-100 text-gray-800",
  envoye: "bg-blue-100 text-blue-800",
  "signe-client": "bg-yellow-100 text-yellow-800",
  "signe-admin": "bg-orange-100 text-orange-800",
  complet: "bg-green-100 text-green-800",
  annule: "bg-red-100 text-red-800",
  planifie: "bg-blue-100 text-blue-800",
  "en-cours": "bg-yellow-100 text-yellow-800",
  "en-pause": "bg-orange-100 text-orange-800",
  confirme: "bg-teal-100 text-teal-800",
  complete: "bg-green-100 text-green-800",
  reporte: "bg-purple-100 text-purple-800",
};

const statusLabels: Record<string, string> = {
  new: "Nouveau", contacted: "Contacté", converted: "Converti", archived: "Archivé",
  prospect: "Prospect", negociation: "Négociation", actif: "Actif", suspendu: "Suspendu", termine: "Terminé",
  brouillon: "Brouillon", envoye: "Envoyé", "signe-client": "Signé (client)", "signe-admin": "Signé (admin)",
  complet: "Complet", annule: "Annulé", planifie: "Planifié", "en-cours": "En cours",
  "en-pause": "En pause", confirme: "Confirmé", complete: "Complété", reporte: "Reporté",
};

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: number; sub?: string; color: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── TAB: SOUMISSIONS ─────────────────────────────────────────────────────────
function QuotesTab() {
  const [filter, setFilter] = useState<"all" | "new" | "contacted" | "converted" | "archived">("all");
  const { data: quotes, refetch } = trpc.admin.getQuoteSubmissions.useQuery({ status: filter });
  const updateStatus = trpc.admin.updateQuoteStatus.useMutation({ onSuccess: () => { refetch(); toast.success("Statut mis à jour"); } });
  const createClient = trpc.admin.createClientFromQuote.useMutation({
    onSuccess: () => { refetch(); toast.success("Dossier client créé !"); }
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(["all", "new", "contacted", "converted", "archived"] as const).map(s => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>
            {s === "all" ? "Toutes" : statusLabels[s]}
          </Button>
        ))}
      </div>
      <div className="space-y-3">
        {(quotes ?? []).map(q => (
          <Card key={q.id} className="border-l-4 border-l-teal-500">
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{q.clientName}</span>
                    <Badge className={statusColors[q.status]}>{statusLabels[q.status]}</Badge>
                    <span className="text-xs text-muted-foreground font-mono">{q.invoiceNumber}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{q.clientEmail}{q.clientPhone && ` · ${q.clientPhone}`}{q.clientCompany && ` · ${q.clientCompany}`}</p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">{q.serviceType}</span>
                    {q.squareMeters ? ` · ${q.squareMeters} m²` : ""}
                    {q.frequency ? ` · ${q.frequency}` : ""}
                    {q.visitsPerMonth ? ` · ${q.visitsPerMonth} visite${q.visitsPerMonth > 1 ? "s" : ""}/mois` : ""}
                  </p>
                  {q.additionalServices && (
                    <p className="text-xs text-muted-foreground mt-0.5">Services additionnels : {q.additionalServices}</p>
                  )}
                  {/* Bloc financier */}
                  <div className="mt-2 p-2 bg-muted/50 rounded-md grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                    <div><span className="text-muted-foreground">Prix client/mois :</span> <span className="font-bold text-teal-700">{q.clientPriceMonthly} $</span></div>
                    <div><span className="text-muted-foreground">Prix client/an :</span> <span className="font-semibold">{q.clientPriceAnnual} $</span></div>
                    {q.hasTaxes ? (
                      <>
                        <div><span className="text-muted-foreground">TPS (5%) :</span> <span>{q.tpsAmount} $</span></div>
                        <div><span className="text-muted-foreground">TVQ (9,975%) :</span> <span>{q.tvqAmount} $</span></div>
                        <div className="col-span-2"><span className="text-muted-foreground">Total avec taxes/mois :</span> <span className="font-bold text-blue-700">{q.totalWithTaxes} $</span></div>
                      </>
                    ) : (
                      <div><span className="text-muted-foreground">Taxes :</span> <span>Non applicable (résidentiel)</span></div>
                    )}
                    {q.costMonthly ? <div><span className="text-muted-foreground">Coût BeauRive/mois :</span> <span>{q.costMonthly} $</span></div> : null}
                    {q.profitMonthly ? <div><span className="text-muted-foreground">Profit mensuel :</span> <span className="font-bold text-green-700">{q.profitMonthly} $</span></div> : null}
                    {q.profitAnnual ? <div><span className="text-muted-foreground">Profit annuel :</span> <span className="font-bold text-green-700">{q.profitAnnual} $</span></div> : null}
                  </div>
                  {(q as any).budgetPropose && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                      <span className="font-semibold text-amber-800">💬 Proposition client : </span>
                      <span className="font-bold text-amber-700">
                        {Number((q as any).budgetPropose).toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}
                      </span>
                      <span className="ml-1 text-amber-600">
                        {(q as any).budgetType === "par-mois" ? "/ mois" :
                         (q as any).budgetType === "par-annee" ? "/ an" :
                         (q as any).budgetType === "total-projet" ? "total projet" :
                         (q as any).budgetType === "a-negocier" ? "à négocier" : (q as any).budgetType}
                      </span>
                    </div>
                  )}
                  {q.message && (
                    <p className="text-xs mt-2 italic text-muted-foreground border-l-2 border-muted pl-2">{q.message}</p>
                  )}
                  {q.pdfUrl && (
                    <a href={q.pdfUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                      📄 Voir le PDF pro-forma
                    </a>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{format(new Date(q.createdAt), "d MMM yyyy HH:mm", { locale: fr })}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select value={q.status} onValueChange={(v) => updateStatus.mutate({ id: q.id, status: v as any })}>
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["new", "contacted", "converted", "archived"].map(s => (
                        <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {q.status !== "converted" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs"
                      onClick={() => createClient.mutate({ quoteId: q.id, serviceType: "menage-residentiel" })}>
                      <Users className="w-3 h-3 mr-1" /> Créer dossier
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(quotes ?? []).length === 0 && (
          <p className="text-center text-muted-foreground py-8">Aucune soumission</p>
        )}
      </div>
    </div>
  );
}

// ─── TAB: CLIENTS ─────────────────────────────────────────────────────────────
function ClientsTab() {
  const { data: clients, refetch } = trpc.admin.getClients.useQuery();
  const sendInvitation = trpc.admin.sendInvitation.useMutation({
    onSuccess: (data) => {
      toast.success(`Invitation envoyée ! Lien : ${data.inviteUrl}`);
      refetch();
    }
  });
  const updateClient = trpc.admin.updateClient.useMutation({ onSuccess: () => { refetch(); toast.success("Client mis à jour"); } });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Dossiers clients ({(clients ?? []).length})</h3>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button size="sm"><Send className="w-4 h-4 mr-2" /> Envoyer invitation</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Envoyer une invitation client</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nom du client</Label><Input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Jean Tremblay" /></div>
              <div><Label>Courriel</Label><Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="client@email.com" /></div>
              <Button className="w-full" onClick={() => {
                if (!inviteEmail || !inviteName) return;
                sendInvitation.mutate({ email: inviteEmail, clientName: inviteName });
                setShowInviteDialog(false);
                setInviteEmail(""); setInviteName("");
              }}>
                <Send className="w-4 h-4 mr-2" /> Envoyer le lien d'accès
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {(clients ?? []).map(c => (
          <Card key={c.id}>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{c.user?.name ?? "Client"}</span>
                    <Badge className={statusColors[c.contractStatus]}>{statusLabels[c.contractStatus]}</Badge>
                    <Badge variant="outline" className="text-xs">{c.serviceType}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.user?.email}</p>
                  {c.company && <p className="text-sm">{c.company}</p>}
                  {c.notes && <p className="text-xs text-muted-foreground mt-1 italic">{c.notes}</p>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select value={c.contractStatus} onValueChange={(v) => updateClient.mutate({ id: c.id, contractStatus: v as any })}>
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["prospect", "negociation", "actif", "suspendu", "termine"].map(s => (
                        <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Link href={`/admin/client/${c.id}`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      <FileText className="w-3 h-3 mr-1" /> Dossier
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(clients ?? []).length === 0 && (
          <p className="text-center text-muted-foreground py-8">Aucun client. Créez un dossier depuis une soumission.</p>
        )}
      </div>
    </div>
  );
}

// ─── TAB: CALENDRIER ──────────────────────────────────────────────────────────
function CalendarTab() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { data: schedules, refetch } = trpc.admin.getCleaningSchedules.useQuery({ month, year });
  const { data: clients } = trpc.admin.getClients.useQuery();
  const createSchedule = trpc.admin.createCleaningSchedule.useMutation({ onSuccess: () => { refetch(); toast.success("Visite planifiée !"); } });
  const updateSchedule = trpc.admin.updateCleaningSchedule.useMutation({ onSuccess: () => { refetch(); toast.success("Statut mis à jour"); } });

  const [form, setForm] = useState({ clientProfileId: "", scheduledDate: "", duration: "120", serviceType: "", technicianName: "", notes: "" });
  const [showDialog, setShowDialog] = useState(false);

  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); }}>‹</Button>
          <span className="font-semibold w-36 text-center">{months[month - 1]} {year}</span>
          <Button variant="outline" size="sm" onClick={() => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); }}>›</Button>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Planifier une visite</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Planifier une visite de ménage</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Client</Label>
                <Select value={form.clientProfileId} onValueChange={v => setForm(f => ({ ...f, clientProfileId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                  <SelectContent>
                    {(clients ?? []).map(c => <SelectItem key={c.id} value={String(c.id)}>{c.user?.name ?? "Client"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Date et heure</Label><Input type="datetime-local" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} /></div>
              <div><Label>Durée (minutes)</Label><Input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} /></div>
              <div><Label>Service</Label><Input value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))} placeholder="Ménage résidentiel" /></div>
              <div><Label>Technicien</Label><Input value={form.technicianName} onChange={e => setForm(f => ({ ...f, technicianName: e.target.value }))} placeholder="Nom du technicien" /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <Button className="w-full" onClick={() => {
                if (!form.clientProfileId || !form.scheduledDate) return;
                createSchedule.mutate({ ...form, clientProfileId: Number(form.clientProfileId), duration: Number(form.duration) });
                setShowDialog(false);
              }}>
                <Calendar className="w-4 h-4 mr-2" /> Planifier
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {(schedules ?? []).map(s => (
          <Card key={s.id} className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{format(new Date(s.scheduledDate), "EEEE d MMM yyyy 'à' HH:mm", { locale: fr })}</span>
                    <Badge className={statusColors[s.status]}>{statusLabels[s.status]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Client #{s.clientProfileId} · {s.duration} min
                    {s.serviceType && ` · ${s.serviceType}`}
                    {s.technicianName && ` · ${s.technicianName}`}
                  </p>
                  {s.notes && <p className="text-xs text-muted-foreground italic">{s.notes}</p>}
                </div>
                <Select value={s.status} onValueChange={(v) => updateSchedule.mutate({ id: s.id, status: v as any })}>
                  <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["planifie", "confirme", "en-cours", "complete", "annule", "reporte"].map(st => (
                      <SelectItem key={st} value={st}>{statusLabels[st]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
        {(schedules ?? []).length === 0 && (
          <p className="text-center text-muted-foreground py-8">Aucune visite planifiée pour ce mois</p>
        )}
      </div>
    </div>
  );
}

// ─── TAB: CONTRATS SOURCE-TO-PAY ─────────────────────────────────────────────
function ContractsTab() {
  const { data: contracts, refetch } = trpc.admin.getContracts.useQuery({});
  const { data: clients } = trpc.admin.getClients.useQuery();
  const createContract = trpc.admin.createContract.useMutation({ onSuccess: () => { refetch(); toast.success("Contrat créé !"); setShowCreateDialog(false); resetForm(); } });
  const sendContract = trpc.admin.sendContractToClient.useMutation({ onSuccess: () => { refetch(); toast.success("📤 Contrat envoyé au client !"); } });
  const adminSign = trpc.admin.adminSignContract.useMutation({
    onSuccess: (data) => {
      refetch();
      toast.success("✅ Contrat approuvé ! Le client recevra la facture dans son portail.");
      setShowSignDialog(false);
      // Générer automatiquement une facture officielle
      if (data?.contract?.monthlyAmount) {
        generateInvoice.mutate({
          contractId: data.contract.id,
          clientProfileId: data.contract.clientProfileId,
          monthlyAmount: data.contract.monthlyAmount,
          title: data.contract.title,
          serviceCategory: data.contract.type ?? "menage",
        });
      }
    }
  });
  const generateInvoice = trpc.billing.generateInvoiceFromContract.useMutation({
    onSuccess: () => { toast.success("💳 Facture officielle générée et envoyée au client !"); }
  });
  const cancelContract = trpc.admin.cancelContract.useMutation({ onSuccess: () => { refetch(); toast.success("Contrat annulé"); } });

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

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [adminSig, setAdminSig] = useState("");
  const [form, setForm] = useState({ clientProfileId: "", title: "", type: "menage" as "menage" | "strategie" | "mixte", content: "", monthlyAmount: "", annualAmount: "", durationMonths: "12", startDate: "", endDate: "" });
  const resetForm = () => setForm({ clientProfileId: "", title: "", type: "menage", content: "", monthlyAmount: "", annualAmount: "", durationMonths: "12", startDate: "", endDate: "" });

  const buildDefaultContent = (type: string, clientName: string, monthly: number, duration: number) => {
    const serviceLabel = type === "menage" ? "Entretien ménager commercial/résidentiel" : type === "strategie" ? "Stratégie d'affaires et marketing" : "Services mixtes";
    const amountStr = monthly ? monthly.toLocaleString("fr-CA", { style: "currency", currency: "CAD" }) + " + taxes" : "à définir";
    return `CONTRAT DE SERVICES — BEAURIVE SOLUTIONS\nNuméro de contrat : [Généré automatiquement]\n\nENTRE :\nBeauRive Solutions Multi-Service\n581-349-2323 | info@beaurive.ca\n(ci-après "le Prestataire")\n\nET :\n${clientName}\n(ci-après "le Client")\n\nTYPE DE SERVICE : ${serviceLabel}\n\nMONTANT MENSUEL : ${amountStr}\nDURÉE : ${duration} mois renouvelable\n\nMODALITÉS :\n- Fréquence des services : selon soumission approuvée\n- Tarification : fixée dans la soumission jointe\n- Paiement : net 30 jours sur réception de facture\n\nOBLIGATIONS DU PRESTATAIRE :\n- Fournir les services convenus avec professionnalisme et ponctualité\n- Utiliser des produits écologiques certifiés\n- Former et superviser le personnel assigné\n\nOBLIGATIONS DU CLIENT :\n- Faciliter l'accès aux lieux aux heures convenues\n- Régler les factures dans les délais convenus\n- Signaler tout problème dans les 24h suivant la prestation\n\nRÉSILIATION :\nUn préavis de 30 jours par écrit est requis pour toute résiliation.\n\nCONFIDENTIALITÉ :\nLes deux parties s'engagent à garder confidentielles toutes informations sensibles.\n\nQuébec, Canada\nBeauRive Solutions | info@beaurive.ca | 581-349-2323`;
  };

  const contractStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      brouillon: "bg-gray-100 text-gray-700 border-gray-300",
      envoye: "bg-blue-100 text-blue-700 border-blue-300",
      "signe-client": "bg-yellow-100 text-yellow-700 border-yellow-300",
      "signe-admin": "bg-orange-100 text-orange-700 border-orange-300",
      actif: "bg-green-100 text-green-700 border-green-300",
      expire: "bg-gray-100 text-gray-500 border-gray-300",
      annule: "bg-red-100 text-red-700 border-red-300",
    };
    const labels: Record<string, string> = {
      brouillon: "📄 Brouillon", envoye: "📤 Envoyé", "signe-client": "✏️ Signé (client)",
      "signe-admin": "✏️ Signé (admin)", actif: "✅ Actif", expire: "⏰ Expiré", annule: "❌ Annulé",
    };
    return <Badge className={`border ${colors[status] ?? "bg-gray-100"}`}>{labels[status] ?? status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Contrats ({(contracts ?? []).length})</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Nouveau contrat</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Créer un contrat</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Client *</Label>
                  <Select value={form.clientProfileId} onValueChange={v => setForm(f => ({ ...f, clientProfileId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                    <SelectContent>
                      {(clients ?? []).map(c => <SelectItem key={c.id} value={String(c.id)}>{c.user?.name ?? `Client #${c.id}`}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type *</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="menage">Ménage</SelectItem>
                      <SelectItem value="strategie">Stratégie</SelectItem>
                      <SelectItem value="mixte">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Titre du contrat *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Contrat entretien ménager 2026 — Nom Entreprise" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Montant mensuel ($)</Label><Input type="number" value={form.monthlyAmount} onChange={e => setForm(f => ({ ...f, monthlyAmount: e.target.value }))} placeholder="1500" /></div>
                <div><Label>Montant annuel ($)</Label><Input type="number" value={form.annualAmount} onChange={e => setForm(f => ({ ...f, annualAmount: e.target.value }))} placeholder="18000" /></div>
                <div><Label>Durée (mois)</Label><Input type="number" value={form.durationMonths} onChange={e => setForm(f => ({ ...f, durationMonths: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date de début</Label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
                <div><Label>Date de fin</Label><Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label>Contenu du contrat</Label>
                  <Button variant="outline" size="sm" onClick={() => {
                    const clientName = (clients ?? []).find(c => String(c.id) === form.clientProfileId)?.user?.name ?? "[NOM DU CLIENT]";
                    setForm(f => ({ ...f, content: buildDefaultContent(f.type, clientName, Number(f.monthlyAmount), Number(f.durationMonths) || 12) }));
                  }}>Utiliser modèle</Button>
                </div>
                <Textarea value={form.content || buildDefaultContent(form.type, "[NOM DU CLIENT]", 0, 12)} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={12} className="font-mono text-xs" />
              </div>
              <Button className="w-full" onClick={() => {
                if (!form.clientProfileId || !form.title) { toast.error("Client et titre requis"); return; }
                createContract.mutate({
                  clientProfileId: Number(form.clientProfileId), title: form.title, type: form.type,
                  content: form.content || buildDefaultContent(form.type, "[NOM DU CLIENT]", 0, 12),
                  monthlyAmount: form.monthlyAmount ? Number(form.monthlyAmount) : undefined,
                  annualAmount: form.annualAmount ? Number(form.annualAmount) : undefined,
                  durationMonths: Number(form.durationMonths) || 12,
                  startDate: form.startDate || undefined, endDate: form.endDate || undefined,
                });
              }} disabled={createContract.isPending}>
                {createContract.isPending ? "Création..." : <><FileText className="w-4 h-4 mr-2" /> Créer le contrat</>}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {(contracts ?? []).map(c => (
          <Card key={c.id} className={`border-l-4 ${c.status === "actif" ? "border-l-green-500" : c.status === "envoye" || c.status === "signe-client" ? "border-l-blue-500" : c.status === "annule" ? "border-l-red-400" : "border-l-gray-300"}`}>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{c.contractNumber}</span>
                    <span className="font-medium">{c.title}</span>
                    {contractStatusBadge(c.status)}
                    <Badge variant="outline" className="text-xs capitalize">{c.type}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>Client #{c.clientProfileId}</span>
                    {c.monthlyAmount && <span className="font-medium text-green-700">{c.monthlyAmount.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}/mois</span>}
                    {c.durationMonths && <span>{c.durationMonths} mois</span>}
                    {c.startDate && <span>Début : {format(new Date(c.startDate), "d MMM yyyy", { locale: fr })}</span>}
                  </div>
                  {c.clientSignedAt && <p className="text-xs text-green-600 mt-1">✓ Signé client : {c.clientSignedName} — {format(new Date(c.clientSignedAt), "d MMM yyyy HH:mm", { locale: fr })}</p>}
                  {c.adminSignedAt && <p className="text-xs text-blue-600">✓ Signé admin : {c.adminSignedName} — {format(new Date(c.adminSignedAt), "d MMM yyyy HH:mm", { locale: fr })}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedContract(c); setShowViewDialog(true); }}>
                    <FileText className="w-3 h-3 mr-1" /> Voir
                  </Button>
                  {c.status === "brouillon" && (
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-300" onClick={() => sendContract.mutate({ id: c.id })} disabled={sendContract.isPending}>
                      <Send className="w-3 h-3 mr-1" /> Envoyer
                    </Button>
                  )}
                  {(c.status === "envoye" || c.status === "signe-client") && (
                    <Button size="sm" className="bg-[#003d7a] text-white" onClick={() => { setSelectedContract(c); setAdminSig(""); setShowSignDialog(true); }}>
                      ✏️ Signer
                    </Button>
                  )}
                  {c.status !== "annule" && c.status !== "actif" && (
                    <Button size="sm" variant="outline" className="text-red-500 border-red-300" onClick={() => { if (confirm("Annuler ce contrat ?")) cancelContract.mutate({ id: c.id }); }}>
                      Annuler
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-[#003d7a] border-[#003d7a]/40 hover:bg-[#003d7a]/5"
                    title="Télécharger / Imprimer le contrat en PDF"
                    onClick={() => {
                      const clientName = (clients ?? []).find((cl: any) => cl.id === c.clientProfileId)?.user?.name ?? `Client #${c.clientProfileId}`;
                      printContractAsPDF({ ...c, clientName });
                    }}
                  >
                    📄 PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(contracts ?? []).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun contrat. Créez votre premier contrat ci-dessus.</p>
          </div>
        )}
      </div>
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedContract?.contractNumber} — {selectedContract?.title}</DialogTitle></DialogHeader>
          {selectedContract && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {contractStatusBadge(selectedContract.status)}
                {selectedContract.monthlyAmount && <Badge variant="outline" className="text-green-700">{selectedContract.monthlyAmount.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}/mois</Badge>}
                {selectedContract.durationMonths && <Badge variant="outline">{selectedContract.durationMonths} mois</Badge>}
              </div>
              <pre className="bg-gray-50 rounded-lg p-4 text-xs font-mono whitespace-pre-wrap border max-h-80 overflow-y-auto">{selectedContract.content}</pre>
              {selectedContract.clientSignedAt && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-green-700">✓ Signé par le client</p>
                  <p className="text-xs text-green-600">{selectedContract.clientSignedName} — {format(new Date(selectedContract.clientSignedAt), "d MMMM yyyy à HH:mm", { locale: fr })}</p>
                  {selectedContract.clientSignedIp && <p className="text-xs text-gray-400">IP : {selectedContract.clientSignedIp}</p>}
                </div>
              )}
              {selectedContract.adminSignedAt && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-blue-700">✓ Signé par l'admin</p>
                  <p className="text-xs text-blue-600">{selectedContract.adminSignedName} — {format(new Date(selectedContract.adminSignedAt), "d MMMM yyyy à HH:mm", { locale: fr })}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Signer le contrat (Admin)</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Contrat : <strong>{selectedContract?.contractNumber} — {selectedContract?.title}</strong></p>
            <div><Label>Votre nom complet *</Label><Input value={adminSig} onChange={e => setAdminSig(e.target.value)} placeholder="Prénom Nom" /></div>
            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              En cliquant sur "Signer", vous confirmez avoir lu et accepté les termes du contrat et apposez votre signature électronique légalement valide conformément à la Loi concernant le cadre juridique des technologies de l'information (LCCJTI) du Québec.
            </p>
            <Button className="w-full bg-[#003d7a] text-white" onClick={() => {
              if (!adminSig.trim()) { toast.error("Votre nom est requis"); return; }
              adminSign.mutate({ id: selectedContract.id, signature: `sig_admin_${Date.now()}`, signerName: adminSig });
            }} disabled={adminSign.isPending}>
              {adminSign.isPending ? "Signature en cours..." : "✏️ Apposer ma signature"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── TAB: CARRIÈRES ────────────────────────────────────────────────────────
function CareersTab() {
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", department: "", location: "Québec, QC", type: "temps-plein" as const, description: "", requirements: "", salary: "" });

  const { data: jobPostings = [], refetch: refetchJobs } = trpc.careers.getJobPostings.useQuery();
  const { data: applications = [], refetch: refetchApps } = trpc.careers.getApplications.useQuery();

  const createJob = trpc.careers.createJobPosting.useMutation({ onSuccess: () => { refetchJobs(); setShowNewJobForm(false); setNewJob({ title: "", department: "", location: "Québec, QC", type: "temps-plein", description: "", requirements: "", salary: "" }); toast.success("Offre publiée !"); } });
  const toggleJob = trpc.careers.updateJobPosting.useMutation({ onSuccess: () => { refetchJobs(); toast.success("Offre mise à jour"); } });
  const deleteJob = trpc.careers.deleteJobPosting.useMutation({ onSuccess: () => { refetchJobs(); toast.success("Offre supprimée"); } });
  const updateAppStatus = trpc.careers.updateApplicationStatus.useMutation({ onSuccess: () => { refetchApps(); toast.success("Statut mis à jour"); } });

  const appStatusColors: Record<string, string> = {
    nouvelle: "bg-blue-100 text-blue-800",
    "en-revue": "bg-yellow-100 text-yellow-800",
    entretien: "bg-purple-100 text-purple-800",
    acceptee: "bg-green-100 text-green-800",
    refusee: "bg-red-100 text-red-800",
  };
  const appStatusLabels: Record<string, string> = {
    nouvelle: "Nouvelle", "en-revue": "En revue", entretien: "Entretien", acceptee: "Acceptée", refusee: "Refusée",
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Offres d'emploi ({jobPostings.length})</h3>
          <div className="flex gap-2">
            <a href="/carrieres" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">Voir la page publique</Button>
            </a>
            <Button size="sm" onClick={() => setShowNewJobForm(!showNewJobForm)}>
              <Plus className="w-4 h-4 mr-1" /> Nouvelle offre
            </Button>
          </div>
        </div>
        {showNewJobForm && (
          <Card className="mb-4 border-2 border-dashed border-teal-300">
            <CardHeader><CardTitle className="text-base">Publier une nouvelle offre</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Titre du poste *</Label><Input value={newJob.title} onChange={e => setNewJob(j => ({ ...j, title: e.target.value }))} placeholder="Agent de conciergerie" /></div>
                <div><Label>Département *</Label><Input value={newJob.department} onChange={e => setNewJob(j => ({ ...j, department: e.target.value }))} placeholder="Conciergerie" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Lieu *</Label><Input value={newJob.location} onChange={e => setNewJob(j => ({ ...j, location: e.target.value }))} /></div>
                <div>
                  <Label>Type de poste *</Label>
                  <Select value={newJob.type} onValueChange={v => setNewJob(j => ({ ...j, type: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temps-plein">Temps plein</SelectItem>
                      <SelectItem value="temps-partiel">Temps partiel</SelectItem>
                      <SelectItem value="contrat">Contrat</SelectItem>
                      <SelectItem value="stage">Stage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Salaire (optionnel)</Label><Input value={newJob.salary} onChange={e => setNewJob(j => ({ ...j, salary: e.target.value }))} placeholder="20-25$/h ou 45 000-55 000$/an" /></div>
              <div><Label>Description *</Label><Textarea value={newJob.description} onChange={e => setNewJob(j => ({ ...j, description: e.target.value }))} placeholder="Décrivez le rôle, les responsabilités..." className="min-h-[100px]" /></div>
              <div><Label>Exigences</Label><Textarea value={newJob.requirements} onChange={e => setNewJob(j => ({ ...j, requirements: e.target.value }))} placeholder="Expérience requise, compétences, certifications..." /></div>
              <div className="flex gap-2">
                <Button onClick={() => createJob.mutate(newJob)} disabled={!newJob.title || !newJob.department || !newJob.description || createJob.isPending}>
                  {createJob.isPending ? "Publication..." : "Publier l'offre"}
                </Button>
                <Button variant="outline" onClick={() => setShowNewJobForm(false)}>Annuler</Button>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="space-y-3">
          {jobPostings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
              <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Aucune offre publiée. Cliquez sur "Nouvelle offre" pour commencer.</p>
            </div>
          ) : jobPostings.map(job => (
            <Card key={job.id} className={`border-l-4 ${job.isActive ? "border-l-green-500" : "border-l-gray-300"}`}>
              <CardContent className="pt-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{job.title}</span>
                      <Badge className={job.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>{job.isActive ? "Publiée" : "Archivée"}</Badge>
                      <Badge variant="outline" className="text-xs">{job.department}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{job.location} · {job.type.replace("-", " ")} {job.salary && `· ${job.salary}`}</p>
                    <p className="text-xs text-muted-foreground mt-1">Publiée le {format(new Date(job.createdAt), "d MMM yyyy", { locale: fr })}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toggleJob.mutate({ id: job.id, isActive: job.isActive ? 0 : 1 })}>
                      {job.isActive ? "Archiver" : "Réactiver"}
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 hover:text-red-700" onClick={() => { if (confirm("Supprimer cette offre ?")) deleteJob.mutate({ id: job.id }); }}>
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-4">Candidatures reçues ({applications.length})</h3>
        <div className="space-y-3">
          {applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
              <p>Aucune candidature reçue pour le moment.</p>
            </div>
          ) : applications.map(app => (
            <Card key={app.id} className="border-l-4 border-l-blue-400">
              <CardContent className="pt-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{app.firstName} {app.lastName}</span>
                      <Badge className={appStatusColors[app.status]}>{appStatusLabels[app.status]}</Badge>
                      {!app.jobPostingId && <Badge variant="outline" className="text-xs">Spontanée</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{app.email} {app.phone && `· ${app.phone}`}</p>
                    {app.positionDesired && <p className="text-sm">Poste visé : {app.positionDesired}</p>}
                    {app.coverLetter && <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">{app.coverLetter}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(app.createdAt), "d MMM yyyy HH:mm", { locale: fr })}</p>
                  </div>
                  <Select value={app.status} onValueChange={v => updateAppStatus.mutate({ id: app.id, status: v as any })}>
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["nouvelle", "en-revue", "entretien", "acceptee", "refusee"].map(s => (
                        <SelectItem key={s} value={s}>{appStatusLabels[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ONGLET AVIS ────────────────────────────────────────────────────────────────────────
function ReviewsTab() {
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const { data: reviews, refetch } = trpc.reviews.getAllReviews.useQuery({ status: filter });
  const approveReview = trpc.reviews.approveReview.useMutation({ onSuccess: () => { toast.success("Avis approuvé et publié sur le site !"); refetch(); } });
  const rejectReview = trpc.reviews.rejectReview.useMutation({ onSuccess: () => { toast.success("Avis rejeté."); refetch(); } });
  const deleteReview = trpc.reviews.deleteReview.useMutation({ onSuccess: () => { toast.success("Avis supprimé."); refetch(); } });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  const statusLabels: Record<string, string> = {
    pending: "En attente",
    approved: "Approuvé",
    rejected: "Rejeté",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#003d7a]">Gestion des avis clients</h2>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                filter === f ? "bg-[#003d7a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {f === "all" ? "Tous" : statusLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {!reviews || reviews.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Aucun avis {filter !== "all" ? statusLabels[filter]?.toLowerCase() : ""}</p>
          <p className="text-sm mt-1">Les avis soumis par les clients apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review: { id: number; name: string; service: string; rating: number; comment: string; status: string; createdAt: Date | string }) => (
            <Card key={review.id} className="border-l-4 " style={{ borderLeftColor: review.status === "approved" ? "#22c55e" : review.status === "rejected" ? "#ef4444" : "#f59e0b" }}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-[#003d7a]">{review.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[review.status]}`}>
                        {statusLabels[review.status]}
                      </span>
                      <span className="text-xs text-gray-400">{review.service}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`w-4 h-4 ${j < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">{review.rating}/5</span>
                    </div>
                    <p className="text-gray-700 italic text-sm">"{review.comment}"</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Reçu le {new Date(review.createdAt).toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {review.status !== "approved" && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1"
                        onClick={() => approveReview.mutate({ id: review.id })}>
                        <ThumbsUp className="w-3.5 h-3.5" /> Approuver
                      </Button>
                    )}
                    {review.status !== "rejected" && (
                      <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 gap-1"
                        onClick={() => rejectReview.mutate({ id: review.id })}>
                        <ThumbsDown className="w-3.5 h-3.5" /> Rejeter
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="border-gray-200 text-gray-500 hover:bg-gray-50 gap-1"
                      onClick={() => { if (confirm("Supprimer cet avis définitivement ?")) deleteReview.mutate({ id: review.id }); }}>
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
// ─── ONGLET DEMANDES (portail client + soumissions publiques) ───────────────────────────────
function DemandesCount() {
  const { data: clientReqs } = trpc.admin.getAllClientQuoteRequests.useQuery();
  const { data: publicQuotes } = trpc.admin.getQuoteSubmissions.useQuery({ status: "new" });
  const total = ((clientReqs ?? []).filter(r => r.status === "nouvelle").length) + ((publicQuotes ?? []).length);
  if (total === 0) return null;
  return (
    <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
      {total > 9 ? "9+" : total}
    </span>
  );
}

const clientQuoteStatusColors: Record<string, string> = {
  nouvelle: "bg-blue-100 text-blue-800",
  "en-revue": "bg-yellow-100 text-yellow-800",
  "devis-envoye": "bg-orange-100 text-orange-800",
  acceptee: "bg-green-100 text-green-800",
  refusee: "bg-red-100 text-red-800",
  annulee: "bg-gray-100 text-gray-800",
};
const clientQuoteStatusLabels: Record<string, string> = {
  nouvelle: "Nouvelle",
  "en-revue": "En révision",
  "devis-envoye": "Devis envoyé",
  acceptee: "Acceptée",
  refusee: "Refusée",
  annulee: "Annulée",
};

function DemandesTab() {
  const [activeSection, setActiveSection] = useState<"portail" | "public">("portail");
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: clientReqs, refetch: refetchClient } = trpc.admin.getAllClientQuoteRequests.useQuery();
  const { data: publicQuotes, refetch: refetchPublic } = trpc.admin.getQuoteSubmissions.useQuery({ status: "all" });
  const updateClientStatus = trpc.admin.updateClientQuoteRequestStatus.useMutation({
    onSuccess: () => { refetchClient(); toast.success("Statut mis à jour"); setSelectedReq(null); }
  });
  const updatePublicStatus = trpc.admin.updateQuoteStatus.useMutation({
    onSuccess: () => { refetchPublic(); toast.success("Statut mis à jour"); }
  });
  const createClient = trpc.admin.createClientFromQuote.useMutation({
    onSuccess: () => { refetchPublic(); toast.success("Dossier client créé !"); }
  });

  const newClientCount = (clientReqs ?? []).filter(r => r.status === "nouvelle").length;
  const newPublicCount = (publicQuotes ?? []).filter(q => q.status === "new").length;

  return (
    <div className="space-y-4">
      {/* Sélecteur de section */}
      <div className="flex gap-2">
        <Button
          variant={activeSection === "portail" ? "default" : "outline"}
          onClick={() => setActiveSection("portail")}
          className="relative"
        >
          <Users className="w-4 h-4 mr-2" /> Demandes portail client
          {newClientCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {newClientCount}
            </span>
          )}
        </Button>
        <Button
          variant={activeSection === "public" ? "default" : "outline"}
          onClick={() => setActiveSection("public")}
          className="relative"
        >
          <MessageSquare className="w-4 h-4 mr-2" /> Soumissions publiques
          {newPublicCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {newPublicCount}
            </span>
          )}
        </Button>
      </div>

      {/* SECTION : Demandes portail client (clientQuoteRequests) */}
      {activeSection === "portail" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Demandes de soumission soumises par les clients connectés via leur espace client.
          </p>
          {(clientReqs ?? []).length === 0 && (
            <p className="text-center text-muted-foreground py-8">Aucune demande pour l’instant</p>
          )}
          {(clientReqs ?? []).map(req => (
            <Card key={req.id} className={`border-l-4 ${
              req.status === "nouvelle" ? "border-l-blue-500" :
              req.status === "en-revue" ? "border-l-yellow-500" :
              req.status === "acceptee" ? "border-l-green-500" : "border-l-gray-300"
            }`}>
              <CardContent className="pt-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold">{req.clientName ?? `Client #${req.clientProfileId}`}</span>
                      <Badge className={clientQuoteStatusColors[req.status]}>{clientQuoteStatusLabels[req.status]}</Badge>
                      <Badge variant="outline" className="text-xs">{req.serviceCategory === "conciergerie" ? "Conciergerie" : "Stratégie"}</Badge>
                      <span className="text-xs text-muted-foreground font-mono">{req.requestNumber}</span>
                    </div>
                    {req.clientEmail && <p className="text-sm text-muted-foreground">{req.clientEmail}</p>}
                    {req.serviceCategory === "conciergerie" && (
                      <div className="text-sm mt-1 space-y-0.5">
                        {req.serviceType && <p><span className="font-medium">Service :</span> {req.serviceType}</p>}
                        {req.squareMeters && <p><span className="font-medium">Superficie :</span> {req.squareMeters} m²</p>}
                        {req.frequency && <p><span className="font-medium">Fréquence :</span> {req.frequency}</p>}
                        {req.estimatedMonthly && (
                          <p className="font-semibold text-teal-700">
                            Estimation : {(req.estimatedMonthly / 100).toFixed(2)} $/mois
                          </p>
                        )}
                      </div>
                    )}
                    {req.serviceCategory === "strategie" && (
                      <div className="text-sm mt-1 space-y-0.5">
                        {req.projectTitle && <p><span className="font-medium">Projet :</span> {req.projectTitle}</p>}
                        {req.budget && <p><span className="font-medium">Budget :</span> {req.budget}</p>}
                        {req.timeline && <p><span className="font-medium">Délai :</span> {req.timeline}</p>}
                        {req.projectDescription && <p className="text-muted-foreground text-xs mt-1">{req.projectDescription}</p>}
                      </div>
                    )}
                    {req.notes && <p className="text-xs text-muted-foreground mt-1 italic">Note client : {req.notes}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(req.createdAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap items-start">
                    <Select
                      value={req.status}
                      onValueChange={(v) => updateClientStatus.mutate({ id: req.id, status: v as any })}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(clientQuoteStatusLabels).map(([val, label]) => (
                          <SelectItem key={val} value={val}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={selectedReq?.id === req.id} onOpenChange={open => { if (!open) setSelectedReq(null); }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 text-xs"
                          onClick={() => { setSelectedReq(req); setAdminNotes(req.adminNotes ?? ""); }}>
                          <FileText className="w-3 h-3 mr-1" /> Notes admin
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Notes administrateur — {req.requestNumber}</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <Textarea
                            value={adminNotes}
                            onChange={e => setAdminNotes(e.target.value)}
                            placeholder="Notes internes, suivi, commentaires..."
                            rows={5}
                          />
                          <Button className="w-full" onClick={() =>
                            updateClientStatus.mutate({ id: req.id, status: req.status, adminNotes })
                          }>
                            Sauvegarder les notes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* SECTION : Soumissions publiques (formulaire site web) */}
      {activeSection === "public" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Soumissions reçues via le formulaire public du site (visiteurs non connectés).
          </p>
          {(publicQuotes ?? []).length === 0 && (
            <p className="text-center text-muted-foreground py-8">Aucune soumission publique</p>
          )}
          {(publicQuotes ?? []).map(q => (
            <Card key={q.id} className={`border-l-4 ${
              q.status === "new" ? "border-l-blue-500" :
              q.status === "contacted" ? "border-l-yellow-500" :
              q.status === "converted" ? "border-l-green-500" : "border-l-gray-300"
            }`}>
              <CardContent className="pt-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold">{q.clientName}</span>
                      <Badge className={statusColors[q.status]}>{statusLabels[q.status]}</Badge>
                      <span className="text-xs text-muted-foreground font-mono">{q.invoiceNumber}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{q.clientEmail}{q.clientPhone && ` · ${q.clientPhone}`}{q.clientCompany && ` · ${q.clientCompany}`}</p>
                    {/* Détails service */}
                    <p className="text-sm mt-1">
                      <span className="font-medium">{q.serviceType}</span>
                      {q.squareMeters ? ` · ${q.squareMeters} m²` : ""}
                      {q.frequency ? ` · ${q.frequency}` : ""}
                      {q.visitsPerMonth ? ` · ${q.visitsPerMonth} visite${q.visitsPerMonth > 1 ? "s" : ""}/mois` : ""}
                    </p>
                    {q.additionalServices && (
                      <p className="text-xs text-muted-foreground mt-0.5">Services additionnels : {q.additionalServices}</p>
                    )}
                    {q.productOption && (
                      <p className="text-xs text-muted-foreground mt-0.5">Produits : {q.productOption === "client-provides" ? "Client fournit" : "BeauRive fournit"}</p>
                    )}
                    {/* Bloc financier */}
                    <div className="mt-2 p-2 bg-muted/50 rounded-md grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                      <div><span className="text-muted-foreground">Prix client/mois :</span> <span className="font-bold text-teal-700">{q.clientPriceMonthly} $</span></div>
                      <div><span className="text-muted-foreground">Prix client/an :</span> <span className="font-semibold">{q.clientPriceAnnual} $</span></div>
                      {q.hasTaxes ? (
                        <>
                          <div><span className="text-muted-foreground">TPS (5%) :</span> <span>{q.tpsAmount} $</span></div>
                          <div><span className="text-muted-foreground">TVQ (9,975%) :</span> <span>{q.tvqAmount} $</span></div>
                          <div className="col-span-2"><span className="text-muted-foreground">Total avec taxes/mois :</span> <span className="font-bold text-blue-700">{q.totalWithTaxes} $</span></div>
                        </>
                      ) : (
                        <div><span className="text-muted-foreground">Taxes :</span> <span>Non applicable (résidentiel)</span></div>
                      )}
                      {q.costMonthly ? <div><span className="text-muted-foreground">Coût BeauRive/mois :</span> <span>{q.costMonthly} $</span></div> : null}
                      {q.profitMonthly ? <div><span className="text-muted-foreground">Profit mensuel :</span> <span className="font-bold text-green-700">{q.profitMonthly} $</span></div> : null}
                      {q.profitAnnual ? <div><span className="text-muted-foreground">Profit annuel :</span> <span className="font-bold text-green-700">{q.profitAnnual} $</span></div> : null}
                    </div>
                    {(q as any).budgetPropose && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                        <span className="font-semibold text-amber-800">💬 Proposition client : </span>
                        <span className="font-bold text-amber-700">
                          {Number((q as any).budgetPropose).toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}
                        </span>
                        <span className="ml-1 text-amber-600">
                          {(q as any).budgetType === "par-mois" ? "/ mois" :
                           (q as any).budgetType === "par-annee" ? "/ an" :
                           (q as any).budgetType === "total-projet" ? "total projet" :
                           (q as any).budgetType === "a-negocier" ? "à négocier" : (q as any).budgetType}
                        </span>
                      </div>
                    )}
                    {q.message && (
                      <p className="text-xs mt-2 italic text-muted-foreground border-l-2 border-muted pl-2">{q.message}</p>
                    )}
                    {q.pdfUrl && (
                      <a href={q.pdfUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                        📄 Voir le PDF pro-forma
                      </a>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(q.createdAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={q.status} onValueChange={(v) => updatePublicStatus.mutate({ id: q.id, status: v as any })}>
                      <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["new", "contacted", "converted", "archived"].map(s => (
                          <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {q.status !== "converted" && (
                      <Button size="sm" variant="outline" className="h-8 text-xs"
                        onClick={() => createClient.mutate({ quoteId: q.id, serviceType: "menage-residentiel" })}>
                        <Users className="w-3 h-3 mr-1" /> Créer dossier
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ────────────────────────────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const { user, loading: isLoading } = useAuth();
  // Tous les hooks AVANT tout return conditionnel (règle des hooks React)
  const { data: stats } = trpc.admin.getDashboardStats.useQuery(
    undefined,
    { enabled: !isLoading && !!user && user.role === "admin" }
  );

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
    </div>
  );

  if (!user || user.role !== "admin") return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
          <p className="text-muted-foreground mb-4">Cette section est réservée aux administrateurs BeauRive.</p>
          <Link to="/"><Button variant="outline"><Home className="w-4 h-4 mr-2" /> Retour à l'accueil</Button></Link>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0a2540] text-white py-6 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tableau de bord admin</h1>
            <p className="text-blue-200 text-sm">BeauRive Solutions — Gestion opérationnelle</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-200">Bonjour, {user.name}</span>
            <Link to="/"><Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10 bg-transparent">← Site</Button></Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={ClipboardList} label="Soumissions" value={stats.quotes.total} sub={`${stats.quotes.new} nouveaux`} color="bg-blue-500" />
            <StatCard icon={Users} label="Clients" value={stats.clients.total} sub={`${stats.clients.actif} actifs`} color="bg-teal-500" />
            <StatCard icon={FileText} label="Contrats" value={stats.contracts.total} sub={`${stats.contracts.pending} en attente`} color="bg-purple-500" />
            <StatCard icon={Briefcase} label="Projets" value={stats.projects.total} sub={`${stats.projects.active} en cours`} color="bg-orange-500" />
          </div>
        )}

        {/* Prochaines visites */}
        {stats && stats.upcomingSchedules.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-teal-600" /> Prochaines visites</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.upcomingSchedules.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <span className="font-medium">{format(new Date(s.scheduledDate), "EEEE d MMM 'à' HH:mm", { locale: fr })}</span>
                      <span className="text-sm text-muted-foreground ml-2">· Client #{s.clientProfileId} · {s.duration} min</span>
                    </div>
                    <Badge className={statusColors[s.status]}>{statusLabels[s.status]}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Onglets principaux */}
        <Tabs defaultValue="comptabilite">
          <TabsList className="flex flex-wrap w-full max-w-5xl h-auto gap-1">
            <TabsTrigger value="comptabilite"><Calculator className="w-4 h-4 mr-1" /> Comptabilité</TabsTrigger>
            <TabsTrigger value="billing"><DollarSign className="w-4 h-4 mr-1" /> Facturation</TabsTrigger>
            <TabsTrigger value="services"><ClipboardList className="w-4 h-4 mr-1" /> Services</TabsTrigger>
            <TabsTrigger value="clients"><Users className="w-4 h-4 mr-1" /> Clients</TabsTrigger>
            <TabsTrigger value="calendar"><Calendar className="w-4 h-4 mr-1" /> Calendrier</TabsTrigger>
            <TabsTrigger value="contracts"><FileText className="w-4 h-4 mr-1" /> Contrats</TabsTrigger>
            <TabsTrigger value="careers"><Briefcase className="w-4 h-4 mr-1" /> Carrières</TabsTrigger>
            <TabsTrigger value="reviews"><Star className="w-4 h-4 mr-1" /> Avis</TabsTrigger>
            <TabsTrigger value="stripe"><CreditCard className="w-4 h-4 mr-1" /> Stripe</TabsTrigger>
            <TabsTrigger value="demandes" className="relative">
              <Inbox className="w-4 h-4 mr-1" /> Demandes
              <DemandesCount />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="comptabilite" className="mt-6"><ComptabiliteAdmin /></TabsContent>
          <TabsContent value="billing" className="mt-6"><AdminBilling /></TabsContent>
          <TabsContent value="services" className="mt-6"><AdminServices /></TabsContent>
          <TabsContent value="clients" className="mt-6"><ClientsTab /></TabsContent>
          <TabsContent value="calendar" className="mt-6"><CalendarTab /></TabsContent>
          <TabsContent value="contracts" className="mt-6"><ContractsTab /></TabsContent>
          <TabsContent value="careers" className="mt-6"><CareersTab /></TabsContent>
          <TabsContent value="reviews" className="mt-6"><ReviewsTab /></TabsContent>
          <TabsContent value="stripe" className="mt-6"><StripeSettings /></TabsContent>
          <TabsContent value="demandes" className="mt-6"><DemandesTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AdminDashboard;
