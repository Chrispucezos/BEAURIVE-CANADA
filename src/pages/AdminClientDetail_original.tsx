import { useParams, Link } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, FileText, Calendar, Briefcase, Printer, CheckCircle, Clock, AlertCircle, ExternalLink, FilePlus, CalendarPlus, Receipt, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { printContractAsPDF, type ContractPDFData } from "@/components/ContractPDF";
import { useState } from "react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(cents: number) {
  return (cents / 100).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
}

function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  try { return format(new Date(d), "d MMMM yyyy", { locale: fr }); } catch { return "—"; }
}

const CONTRACT_STATUS: Record<string, { label: string; color: string }> = {
  brouillon:    { label: "Brouillon",        color: "bg-gray-100 text-gray-700" },
  envoye:       { label: "Envoyé",           color: "bg-blue-100 text-blue-700" },
  signe_client: { label: "Signé (client)",   color: "bg-yellow-100 text-yellow-700" },
  actif:        { label: "Actif",            color: "bg-green-100 text-green-700" },
  expire:       { label: "Expiré",           color: "bg-red-100 text-red-700" },
  resilie:      { label: "Résilié",          color: "bg-red-200 text-red-800" },
};

const PROJECT_STATUS: Record<string, { label: string; icon: React.ReactNode }> = {
  planifie:  { label: "Planifié",  icon: <Clock className="w-3 h-3" /> },
  en_cours:  { label: "En cours", icon: <AlertCircle className="w-3 h-3 text-blue-500" /> },
  termine:   { label: "Terminé",  icon: <CheckCircle className="w-3 h-3 text-green-500" /> },
  suspendu:  { label: "Suspendu", icon: <AlertCircle className="w-3 h-3 text-orange-500" /> },
};

const QUOTE_STATUS: Record<string, { label: string; color: string }> = {
  new:       { label: "Nouvelle",   color: "bg-blue-100 text-blue-700" },
  contacted: { label: "Contacté",   color: "bg-yellow-100 text-yellow-700" },
  converted: { label: "Converti",   color: "bg-green-100 text-green-700" },
  archived:  { label: "Archivée",   color: "bg-gray-100 text-gray-500" },
};

function downloadContract(contract: any, clientName: string) {
  printContractAsPDF({ ...contract, clientName } as ContractPDFData);
}

// ─── Modale Créer Contrat depuis Soumission ───────────────────────────────────

function CreateContractModal({
  open, onClose, clientProfileId, quote, clientName,
}: {
  open: boolean;
  onClose: () => void;
  clientProfileId: number;
  quote: any;
  clientName: string;
}) {
  const utils = trpc.useUtils();
  const [title, setTitle] = useState(`Contrat de services — ${clientName}`);
  const [type, setType] = useState<"menage" | "strategie" | "mixte">("menage");
  const [durationMonths, setDurationMonths] = useState(12);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [content, setContent] = useState(
    `Ce contrat de services est conclu entre BeauRive Solutions Multi-Service et ${clientName}.\n\n` +
    `SERVICE : ${quote?.serviceType ?? "—"}\n` +
    `SUPERFICIE : ${quote?.squareMeters ?? "—"} m²\n` +
    `FRÉQUENCE : ${quote?.frequency ?? "—"} (${quote?.visitsPerMonth ?? "—"} visites/mois)\n\n` +
    `MONTANT MENSUEL : ${quote?.clientPriceMonthly ? fmt(quote.clientPriceMonthly) : "—"}\n` +
    `MONTANT ANNUEL : ${quote?.clientPriceAnnual ? fmt(quote.clientPriceAnnual) : "—"}\n\n` +
    `Les deux parties s'engagent à respecter les termes définis dans ce contrat.`
  );

  const createContract = trpc.admin.createContract.useMutation({
    onSuccess: () => {
      utils.admin.getClientById.invalidate({ id: clientProfileId });
      toast.success("Contrat créé avec succès !");
      onClose();
    },
    onError: (e) => toast.error(`Erreur : ${e.message}`),
  });

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus className="w-5 h-5 text-blue-600" />
            Créer un contrat depuis la soumission
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Titre du contrat</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={v => setType(v as any)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="menage">Ménage / Conciergerie</SelectItem>
                  <SelectItem value="strategie">Stratégie d'affaires</SelectItem>
                  <SelectItem value="mixte">Mixte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Durée (mois)</Label>
              <Input type="number" min={1} max={60} value={durationMonths}
                onChange={e => setDurationMonths(Number(e.target.value))} className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date de début</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Date de fin (calculée)</Label>
              <Input value={fmtDate(endDate)} disabled className="mt-1 bg-muted" />
            </div>
          </div>
          {/* Récapitulatif financier depuis la soumission */}
          {quote && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm">
              <p className="font-semibold text-teal-800 mb-2">Récapitulatif financier (soumission #{quote.invoiceNumber})</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div><span className="text-muted-foreground">Prix client/mois :</span> <span className="font-bold text-teal-700">{fmt(quote.clientPriceMonthly)}</span></div>
                <div><span className="text-muted-foreground">Prix client/an :</span> <span className="font-semibold">{fmt(quote.clientPriceAnnual)}</span></div>
                {quote.hasTaxes ? (
                  <>
                    <div><span className="text-muted-foreground">TPS (5%) :</span> <span>{fmt(quote.tpsAmount ?? 0)}</span></div>
                    <div><span className="text-muted-foreground">TVQ (9,975%) :</span> <span>{fmt(quote.tvqAmount ?? 0)}</span></div>
                    <div className="col-span-2"><span className="text-muted-foreground">Total avec taxes/mois :</span> <span className="font-bold text-blue-700">{fmt(quote.totalWithTaxes)}</span></div>
                  </>
                ) : null}
                {quote.profitMonthly ? <div><span className="text-muted-foreground">Profit mensuel :</span> <span className="font-bold text-green-700">{fmt(quote.profitMonthly)}</span></div> : null}
                {quote.profitAnnual ? <div><span className="text-muted-foreground">Profit annuel :</span> <span className="font-bold text-green-700">{fmt(quote.profitAnnual)}</span></div> : null}
              </div>
            </div>
          )}
          <div>
            <Label>Contenu du contrat</Label>
            <Textarea value={content} onChange={e => setContent(e.target.value)}
              rows={8} className="mt-1 font-mono text-xs" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button
            className="bg-[#003d7a] hover:bg-[#002d5a]"
            disabled={createContract.isPending}
            onClick={() => createContract.mutate({
              clientProfileId,
              title,
              type,
              content,
              monthlyAmount: quote?.clientPriceMonthly,
              annualAmount: quote?.clientPriceAnnual,
              durationMonths,
              startDate,
              endDate: endDate.toISOString().split("T")[0],
            })}
          >
            {createContract.isPending ? "Création…" : "Créer le contrat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Modale Planifier Visite ──────────────────────────────────────────────────

function ScheduleVisitModal({
  open, onClose, clientProfileId, quote,
}: {
  open: boolean;
  onClose: () => void;
  clientProfileId: number;
  quote?: any;
}) {
  const utils = trpc.useUtils();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [scheduledDate, setScheduledDate] = useState(tomorrow.toISOString().slice(0, 16));
  const [duration, setDuration] = useState(120);
  const [technicianName, setTechnicianName] = useState("");
  const [notes, setNotes] = useState(quote ? `Service : ${quote.serviceType} · ${quote.squareMeters} m²` : "");

  const createSchedule = trpc.admin.createCleaningSchedule.useMutation({
    onSuccess: () => {
      utils.admin.getClientById.invalidate({ id: clientProfileId });
      toast.success("Visite planifiée !");
      onClose();
    },
    onError: (e) => toast.error(`Erreur : ${e.message}`),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-teal-600" />
            Planifier une visite
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Date et heure</Label>
            <Input type="datetime-local" value={scheduledDate}
              onChange={e => setScheduledDate(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Durée (minutes)</Label>
            <Input type="number" min={30} step={30} value={duration}
              onChange={e => setDuration(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <Label>Technicien assigné</Label>
            <Input value={technicianName} onChange={e => setTechnicianName(e.target.value)}
              placeholder="Nom du technicien (optionnel)" className="mt-1" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)}
              rows={3} className="mt-1" placeholder="Instructions, accès, équipements…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button
            className="bg-teal-600 hover:bg-teal-700"
            disabled={createSchedule.isPending}
            onClick={() => createSchedule.mutate({
              clientProfileId,
              scheduledDate,
              duration,
              serviceType: quote?.serviceType,
              technicianName: technicianName || undefined,
              notes: notes || undefined,
            })}
          >
            {createSchedule.isPending ? "Planification…" : "Planifier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Onglet Soumissions ───────────────────────────────────────────────────────

function QuotesTab({ quotes, clientProfileId, clientName }: { quotes: any[]; clientProfileId: number; clientName: string }) {
  const [contractModalQuote, setContractModalQuote] = useState<any | null>(null);
  const [scheduleModalQuote, setScheduleModalQuote] = useState<any | null>(null);

  if (quotes.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Aucune soumission liée à ce client.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Les soumissions du calculateur de coûts apparaissent ici automatiquement lorsque l'email correspond.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {quotes.map((q) => (
        <Card key={q.id} className="border-l-4 border-l-teal-500">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-teal-600" />
                  Soumission {q.invoiceNumber}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reçue le {fmtDate(q.createdAt)}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${QUOTE_STATUS[q.status]?.color ?? "bg-gray-100 text-gray-600"}`}>
                {QUOTE_STATUS[q.status]?.label ?? q.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Détails du service */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Type de service</p>
                <p className="font-semibold capitalize">{q.serviceType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Superficie</p>
                <p className="font-semibold">{q.squareMeters} m²</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fréquence</p>
                <p className="font-semibold">{q.frequency}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Visites / mois</p>
                <p className="font-semibold">{q.visitsPerMonth}</p>
              </div>
              {q.productOption && (
                <div>
                  <p className="text-xs text-muted-foreground">Produits</p>
                  <p className="font-semibold">{q.productOption === "client-provides" ? "Client fournit" : "BeauRive fournit"}</p>
                </div>
              )}
              {q.additionalServices && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Services additionnels</p>
                  <p className="font-semibold text-xs">{q.additionalServices}</p>
                </div>
              )}
            </div>

            {/* Bloc financier */}
            <div className="p-3 bg-muted/50 rounded-lg grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div><span className="text-muted-foreground">Prix client/mois :</span> <span className="font-bold text-teal-700">{fmt(q.clientPriceMonthly)}</span></div>
              <div><span className="text-muted-foreground">Prix client/an :</span> <span className="font-semibold">{fmt(q.clientPriceAnnual)}</span></div>
              {q.hasTaxes ? (
                <>
                  <div><span className="text-muted-foreground">TPS (5%) :</span> <span>{fmt(q.tpsAmount ?? 0)}</span></div>
                  <div><span className="text-muted-foreground">TVQ (9,975%) :</span> <span>{fmt(q.tvqAmount ?? 0)}</span></div>
                  <div className="col-span-2"><span className="text-muted-foreground">Total avec taxes/mois :</span> <span className="font-bold text-blue-700">{fmt(q.totalWithTaxes)}</span></div>
                </>
              ) : (
                <div><span className="text-muted-foreground">Taxes :</span> <span>Non applicable (résidentiel)</span></div>
              )}
              {q.costMonthly ? <div><span className="text-muted-foreground">Coût BeauRive/mois :</span> <span>{fmt(q.costMonthly)}</span></div> : null}
              {q.profitMonthly ? (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-muted-foreground">Profit mensuel :</span>
                  <span className="font-bold text-green-700">{fmt(q.profitMonthly)}</span>
                </div>
              ) : null}
              {q.profitAnnual ? (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-muted-foreground">Profit annuel :</span>
                  <span className="font-bold text-green-700">{fmt(q.profitAnnual)}</span>
                </div>
              ) : null}
            </div>

            {/* Proposition de prix du client */}
            {q.budgetPropose && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-semibold text-amber-800 mb-1">💬 Proposition de prix du client</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-amber-700">
                    {Number(q.budgetPropose).toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                    {q.budgetType === "par-mois" ? "/ mois" :
                     q.budgetType === "par-annee" ? "/ an" :
                     q.budgetType === "total-projet" ? "total projet" :
                     q.budgetType === "a-negocier" ? "à négocier" : q.budgetType}
                  </span>
                  {/* Comparaison avec l'estimation BeauRive */}
                  {q.budgetType === "par-mois" && q.clientPriceMonthly && (() => {
                    const proposed = Number(q.budgetPropose);
                    const estimated = q.clientPriceMonthly / 100;
                    const diff = proposed - estimated;
                    const pct = Math.round((diff / estimated) * 100);
                    return (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        diff >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {diff >= 0 ? `+${pct}%` : `${pct}%`} vs estimation BeauRive
                      </span>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Message du client */}
            {q.message && (
              <p className="text-xs italic text-muted-foreground border-l-2 border-teal-300 pl-2">{q.message}</p>
            )}

            {/* Boutons d'action */}
            <div className="flex flex-wrap gap-2 pt-1">
              {/* Voir le PDF pro-forma */}
              {q.pdfUrl && (
                <Button size="sm" variant="outline" asChild className="gap-2">
                  <a href={q.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Voir la facture pro-forma (PDF)
                  </a>
                </Button>
              )}

              {/* Créer un contrat */}
              <Button
                size="sm"
                className="bg-[#003d7a] hover:bg-[#002d5a] gap-2"
                onClick={() => setContractModalQuote(q)}
              >
                <FilePlus className="w-3.5 h-3.5" />
                Créer un contrat
              </Button>

              {/* Planifier une visite */}
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-teal-500 text-teal-700 hover:bg-teal-50"
                onClick={() => setScheduleModalQuote(q)}
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                Planifier une visite
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Modales */}
      {contractModalQuote && (
        <CreateContractModal
          open={!!contractModalQuote}
          onClose={() => setContractModalQuote(null)}
          clientProfileId={clientProfileId}
          quote={contractModalQuote}
          clientName={clientName}
        />
      )}
      {scheduleModalQuote && (
        <ScheduleVisitModal
          open={!!scheduleModalQuote}
          onClose={() => setScheduleModalQuote(null)}
          clientProfileId={clientProfileId}
          quote={scheduleModalQuote}
        />
      )}
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function AdminClientDetail() {
  const { id } = useParams<{ id: string }>();
  const clientId = Number(id);

  const { data, isLoading, error } = trpc.admin.getClientById.useQuery(
    { id: clientId },
    { enabled: !isNaN(clientId) }
  );

  if (isNaN(clientId)) return <NotFoundView />;
  if (isLoading) return <LoadingView />;
  if (error || !data) return <NotFoundView />;

  const { profile, user, contracts, projects, schedule, quotes } = data as any;
  const clientName = user?.name ?? `Client #${clientId}`;
  const clientEmail = user?.email ?? "—";
  const quotesCount = (quotes ?? []).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-[#003d7a] text-white px-6 py-4 flex items-center gap-4">
        <Link to="/admin">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour Admin
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Dossier Client — {clientName}</h1>
          <p className="text-blue-200 text-sm">{clientEmail}</p>
        </div>
        <Badge className={`ml-auto ${profile?.contractStatus === "actif" ? "bg-green-500" : "bg-yellow-500"} text-white`}>
          {profile?.contractStatus ?? "prospect"}
        </Badge>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Fiche résumé */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{clientName}</p>
                  <p className="text-xs text-muted-foreground">{clientEmail}</p>
                  {profile?.phone && <p className="text-xs text-muted-foreground">{profile.phone}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Type de service</p>
              <p className="font-semibold capitalize">{profile?.serviceType ?? "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">Client depuis {fmtDate(profile?.createdAt)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Contrats actifs</p>
              <p className="font-bold text-2xl text-green-600">
                {(contracts ?? []).filter((c: any) => c.status === "actif").length}
              </p>
              <p className="text-xs text-muted-foreground">{(contracts ?? []).length} contrat(s) · {quotesCount} soumission(s)</p>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs defaultValue={quotesCount > 0 ? "quotes" : "contracts"}>
          <TabsList>
            <TabsTrigger value="quotes">
              <Receipt className="w-4 h-4 mr-1" /> Soumissions ({quotesCount})
              {quotesCount > 0 && (
                <span className="ml-1 bg-teal-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                  {quotesCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="contracts">
              <FileText className="w-4 h-4 mr-1" /> Contrats ({(contracts ?? []).length})
            </TabsTrigger>
            <TabsTrigger value="projects">
              <Briefcase className="w-4 h-4 mr-1" /> Projets ({(projects ?? []).length})
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="w-4 h-4 mr-1" /> Calendrier ({(schedule ?? []).length})
            </TabsTrigger>
          </TabsList>

          {/* ─── SOUMISSIONS ─── */}
          <TabsContent value="quotes" className="mt-4">
            <QuotesTab
              quotes={quotes ?? []}
              clientProfileId={clientId}
              clientName={clientName}
            />
          </TabsContent>

          {/* ─── CONTRATS ─── */}
          <TabsContent value="contracts" className="space-y-4 mt-4">
            {(contracts ?? []).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>Aucun contrat pour ce client.</p>
                  <p className="text-xs mt-1">Utilisez l'onglet Soumissions pour créer un contrat depuis une soumission.</p>
                </CardContent>
              </Card>
            ) : (
              (contracts ?? []).map((c: any) => (
                <Card key={c.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{c.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          N° {c.contractNumber} · Créé le {fmtDate(c.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${CONTRACT_STATUS[c.status]?.color ?? "bg-gray-100 text-gray-600"}`}>
                          {CONTRACT_STATUS[c.status]?.label ?? c.status}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Mensuel</p>
                        <p className="font-semibold">{c.monthlyAmount ? fmt(c.monthlyAmount) : "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Durée</p>
                        <p className="font-semibold">{c.durationMonths ? `${c.durationMonths} mois` : "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Début</p>
                        <p className="font-semibold">{fmtDate(c.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Fin</p>
                        <p className="font-semibold">{fmtDate(c.endDate)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${c.clientSignedAt ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {c.clientSignedAt ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        Signé client {c.clientSignedAt ? `— ${fmtDate(c.clientSignedAt)}` : "(en attente)"}
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${c.adminSignedAt ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {c.adminSignedAt ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        Signé admin {c.adminSignedAt ? `— ${fmtDate(c.adminSignedAt)}` : "(en attente)"}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="bg-[#003d7a] hover:bg-[#002d5a] gap-2"
                        onClick={() => downloadContract(c, clientName)}
                      >
                        <Printer className="w-4 h-4" /> Imprimer / Télécharger PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* ─── PROJETS ─── */}
          <TabsContent value="projects" className="space-y-4 mt-4">
            {(projects ?? []).length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun projet pour ce client.</CardContent></Card>
            ) : (
              (projects ?? []).map((p: any) => (
                <Card key={p.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{p.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.type} · {fmtDate(p.startDate)} → {fmtDate(p.endDate)}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {PROJECT_STATUS[p.status]?.icon}
                        {PROJECT_STATUS[p.status]?.label ?? p.status}
                      </div>
                    </div>
                    {p.description && <p className="text-sm text-muted-foreground mt-2">{p.description}</p>}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* ─── CALENDRIER ─── */}
          <TabsContent value="schedule" className="space-y-3 mt-4">
            {(schedule ?? []).length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Aucune visite planifiée.</CardContent></Card>
            ) : (
              (schedule ?? []).map((s: any) => (
                <Card key={s.id}>
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{fmtDate(s.scheduledDate)}</p>
                      <p className="text-xs text-muted-foreground">{s.serviceType} · {s.duration} min · {s.technicianName ?? "Technicien à assigner"}</p>
                      {s.notes && <p className="text-xs text-muted-foreground mt-1 italic">{s.notes}</p>}
                    </div>
                    <Badge variant="outline" className="capitalize">{s.status}</Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Vues utilitaires ─────────────────────────────────────────────────────────

function LoadingView() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm">Chargement du dossier…</p>
      </div>
    </div>
  );
}

function NotFoundView() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-2xl font-bold text-gray-700">Dossier introuvable</p>
        <p className="text-muted-foreground">Ce client n'existe pas ou vous n'avez pas accès.</p>
        <Link to="/admin"><Button>← Retour au tableau de bord</Button></Link>
      </div>
    </div>
  );
}
