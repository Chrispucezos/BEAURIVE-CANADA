import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceView, InvoiceCard, type InvoiceData } from "@/components/InvoiceView";
import { calculateConciergePrice } from "@/shared/pricing";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Plus, Send, Download, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// ─── STATUTS DEMANDES ─────────────────────────────────────────────────────────
const REQ_STATUS_COLORS: Record<string, string> = {
  nouvelle: "bg-blue-100 text-blue-700",
  "en-revue": "bg-yellow-100 text-yellow-700",
  "devis-envoye": "bg-purple-100 text-purple-700",
  acceptee: "bg-green-100 text-green-700",
  refusee: "bg-red-100 text-red-600",
  annulee: "bg-gray-100 text-gray-500",
};
const REQ_STATUS_LABELS: Record<string, string> = {
  nouvelle: "Nouvelle",
  "en-revue": "En révision",
  "devis-envoye": "Devis envoyé",
  acceptee: "Acceptée",
  refusee: "Refusée",
  annulee: "Annulée",
};

// ─── FORMULAIRE SOUMISSION CONCIERGERIE ───────────────────────────────────────
function ConciergeQuoteForm({ onSuccess }: { onSuccess: () => void }) {
  
  const [form, setForm] = useState({
    serviceType: "menage-commercial",
    squareMeters: 200,
    frequency: "weekly",
    commercialVenueType: "bureau",
    productOption: "beaurive-provides",
    numberOfWindows: 0,
    numberOfBathrooms: 0,
    notes: "",
  });

  const calc = useMemo(() => calculateConciergePrice({
    serviceType: form.serviceType,
    squareMeters: form.squareMeters,
    frequency: form.frequency,
    commercialVenueType: form.commercialVenueType,
    productOption: form.productOption,
    numberOfWindows: form.numberOfWindows,
    numberOfBathrooms: form.numberOfBathrooms,
  }), [form]);

  const submit = trpc.billing.submitQuoteRequest.useMutation({
    onSuccess: (data) => {
      toast.success(`Demande envoyée ! Référence : ${data.requestNumber}`);
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  const FREQ_LABELS: Record<string, string> = {
    once: "Une seule fois",
    biweekly: "Aux deux semaines",
    weekly: "Hebdomadaire (1×/semaine)",
    daily: "Quotidien (5 jours/semaine)",
  };

  return (
    <div className="space-y-6">
      {/* Aperçu estimé */}
      <div className="bg-[#003d7a]/5 border border-[#003d7a]/20 rounded-xl p-4">
        <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Estimation automatique</p>
        <div className="flex items-end gap-4">
          <div>
            <span className="text-3xl font-bold text-[#003d7a]">{calc.clientPriceMonthly.toLocaleString("fr-CA")} $</span>
            <span className="text-muted-foreground text-sm ml-1">/mois</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <div>{calc.visitsPerMonth} visites/mois</div>
            {calc.hasTaxes && <div>+ TPS/TVQ : {(calc.tpsAmount + calc.tvqAmount).toLocaleString("fr-CA")} $</div>}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">* Estimation indicative. Le devis final sera confirmé par notre équipe.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Type de service</Label>
          <Select value={form.serviceType} onValueChange={v => setForm(f => ({ ...f, serviceType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="menage-commercial">Ménage commercial</SelectItem>
              <SelectItem value="menage-residentiel">Ménage résidentiel</SelectItem>
              <SelectItem value="post-construction">Post-construction</SelectItem>
              <SelectItem value="post-renovation">Post-rénovation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {form.serviceType === "menage-commercial" && (
          <div>
            <Label>Type de local</Label>
            <Select value={form.commercialVenueType} onValueChange={v => setForm(f => ({ ...f, commercialVenueType: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bureau">Bureau</SelectItem>
                <SelectItem value="clinique">Clinique / Pharmacie</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="entrepot">Entrepôt</SelectItem>
                <SelectItem value="garderie">Garderie</SelectItem>
                <SelectItem value="gym">Gym / Centre sportif</SelectItem>
                <SelectItem value="commerce">Commerce de détail</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <Label>Surface (m²)</Label>
          <Input type="number" min={10} max={5000} value={form.squareMeters}
            onChange={e => setForm(f => ({ ...f, squareMeters: parseInt(e.target.value) || 0 }))} />
        </div>
        <div>
          <Label>Fréquence</Label>
          <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(FREQ_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Produits de nettoyage</Label>
          <Select value={form.productOption} onValueChange={v => setForm(f => ({ ...f, productOption: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="beaurive-provides">BeauRive fournit (+0,20 $/m²)</SelectItem>
              <SelectItem value="client-provides">Client fournit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Nombre de fenêtres</Label>
          <Input type="number" min={0} value={form.numberOfWindows}
            onChange={e => setForm(f => ({ ...f, numberOfWindows: parseInt(e.target.value) || 0 }))} />
        </div>
        <div>
          <Label>Nombre de salles de bain</Label>
          <Input type="number" min={0} value={form.numberOfBathrooms}
            onChange={e => setForm(f => ({ ...f, numberOfBathrooms: parseInt(e.target.value) || 0 }))} />
        </div>
      </div>

      <div>
        <Label>Notes ou précisions</Label>
        <Textarea placeholder="Décrivez vos besoins spécifiques, horaires préférés, accès au local..." rows={3}
          value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>

      <Button className="w-full bg-[#003d7a] hover:bg-[#002d5a]"
        onClick={() => submit.mutate({ serviceCategory: "conciergerie", ...form, additionalServices: [] })}
        disabled={submit.isPending}>
        <Send className="w-4 h-4 mr-2" />
        {submit.isPending ? "Envoi en cours..." : "Soumettre ma demande de soumission"}
      </Button>
    </div>
  );
}

// ─── FORMULAIRE SOUMISSION STRATÉGIE ─────────────────────────────────────────
function StrategyQuoteForm({ onSuccess }: { onSuccess: () => void }) {
  
  const [form, setForm] = useState({
    projectTitle: "",
    projectDescription: "",
    budget: "",
    timeline: "",
    notes: "",
  });

  const submit = trpc.billing.submitQuoteRequest.useMutation({
    onSuccess: (data) => {
      toast.success(`Demande envoyée ! Référence : ${data.requestNumber}. Notre équipe vous contactera sous 48h.`);
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        Les demandes de stratégie d'affaires sont traitées manuellement par notre équipe. Vous recevrez un devis personnalisé sous 48h ouvrables.
      </div>
      <div>
        <Label>Titre du projet *</Label>
        <Input placeholder="Ex : Stratégie de développement pour mon restaurant" value={form.projectTitle}
          onChange={e => setForm(f => ({ ...f, projectTitle: e.target.value }))} />
      </div>
      <div>
        <Label>Description du projet *</Label>
        <Textarea placeholder="Décrivez vos objectifs, votre situation actuelle, vos défis..." rows={4}
          value={form.projectDescription} onChange={e => setForm(f => ({ ...f, projectDescription: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Budget approximatif</Label>
          <Select value={form.budget} onValueChange={v => setForm(f => ({ ...f, budget: v }))}>
            <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="moins-1000">Moins de 1 000 $</SelectItem>
              <SelectItem value="1000-5000">1 000 $ – 5 000 $</SelectItem>
              <SelectItem value="5000-15000">5 000 $ – 15 000 $</SelectItem>
              <SelectItem value="15000-50000">15 000 $ – 50 000 $</SelectItem>
              <SelectItem value="plus-50000">Plus de 50 000 $</SelectItem>
              <SelectItem value="a-discuter">À discuter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Échéancier souhaité</Label>
          <Select value={form.timeline} onValueChange={v => setForm(f => ({ ...f, timeline: v }))}>
            <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">Urgent (moins d'1 mois)</SelectItem>
              <SelectItem value="1-3-mois">1 à 3 mois</SelectItem>
              <SelectItem value="3-6-mois">3 à 6 mois</SelectItem>
              <SelectItem value="6-12-mois">6 à 12 mois</SelectItem>
              <SelectItem value="long-terme">Long terme (1 an+)</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Notes additionnelles</Label>
        <Textarea placeholder="Toute information utile pour préparer votre devis..." rows={2}
          value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>
      <Button className="w-full bg-[#003d7a] hover:bg-[#002d5a]"
        onClick={() => submit.mutate({ serviceCategory: "strategie", ...form })}
        disabled={submit.isPending || !form.projectTitle || !form.projectDescription}>
        <Send className="w-4 h-4 mr-2" />
        {submit.isPending ? "Envoi en cours..." : "Soumettre ma demande"}
      </Button>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function ClientBilling() {
  const { user } = useAuth();
  
  const [showNewQuote, setShowNewQuote] = useState(false);
  const [quoteCategory, setQuoteCategory] = useState<"conciergerie" | "strategie">("conciergerie");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [selectedInvoiceClient, setSelectedInvoiceClient] = useState<{ name?: string; company?: string; email?: string } | null>(null);

  const { data: quoteRequests = [], refetch: refetchQuotes } = trpc.billing.getMyQuoteRequests.useQuery();
  const { data: myInvoices = [], refetch: refetchInvoices } = trpc.billing.getMyInvoices.useQuery();

  const markViewed = trpc.billing.markInvoiceViewed.useMutation();

  const handleViewInvoice = (inv: InvoiceData) => {
    setSelectedInvoice(inv);
    setSelectedInvoiceClient({ name: user?.name || undefined, email: user?.email || undefined });
    markViewed.mutate({ invoiceId: (inv as any).id });
    refetchInvoices();
  };

  const handleDownloadInvoice = (inv: InvoiceData) => {
    // Génération PDF côté client via impression navigateur
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const lineItems = Array.isArray(inv.lineItems) ? inv.lineItems : [];
    const fmt = (cents: number) => (cents / 100).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>${inv.invoiceNumber}</title>
    <style>body{font-family:Arial,sans-serif;margin:40px;color:#1a1a1a}h1{color:#003d7a}table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;border-bottom:1px solid #eee;text-align:left}th{background:#f5f5f5;font-size:12px;color:#666}tr:last-child td{border-bottom:none}.total-row{font-weight:bold;font-size:16px;color:#003d7a}.header{display:flex;justify-content:space-between;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #003d7a}.conditions{margin-top:30px;padding-top:15px;border-top:1px solid #eee;font-size:11px;color:#888}@media print{button{display:none}}</style></head>
    <body>
    <div class="header"><div><h1>BeauRive Solutions</h1><p style="color:#666;margin:0">Multi-Service | Québec, Canada</p><p style="color:#666;margin:0;font-size:12px">581-349-2323 | info@beaurive.ca</p></div>
    <div style="text-align:right"><h2 style="color:#003d7a;margin:0">${inv.type === "pro-forma" ? "Facture Pro-Forma" : inv.type === "finale" ? "Facture Finale" : "Note de Crédit"}</h2><p style="font-family:monospace;margin:4px 0">${inv.invoiceNumber}</p><p style="margin:0;font-size:12px;color:#666">${format(new Date(inv.createdAt), "d MMMM yyyy", { locale: fr })}</p></div></div>
    <div style="margin-bottom:20px"><p style="margin:0;font-size:12px;color:#666">Facturé à</p><p style="margin:4px 0;font-weight:bold">${user?.name || "—"}</p>${user?.email ? `<p style="margin:0;font-size:12px;color:#666">${user.email}</p>` : ""}</div>
    <table><thead><tr><th>Description</th><th style="text-align:right">Qté</th><th style="text-align:right">Prix unit.</th><th style="text-align:right">Total</th></tr></thead><tbody>
    ${lineItems.map(l => `<tr><td>${l.description}</td><td style="text-align:right">${l.qty}</td><td style="text-align:right">${fmt(l.unitPrice)}</td><td style="text-align:right">${fmt(l.total)}</td></tr>`).join("")}
    </tbody></table>
    <div style="display:flex;justify-content:flex-end;margin-top:16px"><div style="width:260px">
    <div style="display:flex;justify-content:space-between;padding:4px 0"><span style="color:#666">Sous-total</span><span>${fmt(inv.subtotal)}</span></div>
    ${inv.hasTaxes ? `<div style="display:flex;justify-content:space-between;padding:4px 0"><span style="color:#666">TPS (5%)</span><span>${fmt(inv.tpsAmount)}</span></div><div style="display:flex;justify-content:space-between;padding:4px 0"><span style="color:#666">TVQ (9,975%)</span><span>${fmt(inv.tvqAmount)}</span></div>` : ""}
    <div class="total-row" style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid #003d7a;margin-top:8px"><span>Total</span><span>${fmt(inv.totalAmount)}</span></div>
    </div></div>
    ${inv.notes ? `<div style="margin-top:16px;padding:12px;background:#f9f9f9;border-radius:6px;font-size:13px"><strong>Notes : </strong>${inv.notes}</div>` : ""}
    <div class="conditions"><p>• Les prix sont en dollars canadiens (CAD). Taxes calculées selon les règles fiscales du Québec.</p><p>• Pour toute question : info@beaurive.ca | 581-349-2323</p></div>
    <script>window.onload=function(){window.print();}</script></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const newInvoicesCount = myInvoices.filter((inv: any) => inv.status === "envoyee").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003d7a]">Soumissions & Facturation</h2>
          <p className="text-muted-foreground text-sm">Gérez vos demandes de soumission et consultez vos factures</p>
        </div>
        <Button className="bg-[#003d7a] hover:bg-[#002d5a]" onClick={() => setShowNewQuote(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nouvelle demande
        </Button>
      </div>

      {newInvoicesCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
          <p className="text-blue-800 text-sm font-medium">
            Vous avez {newInvoicesCount} nouvelle{newInvoicesCount > 1 ? "s" : ""} facture{newInvoicesCount > 1 ? "s" : ""} à consulter.
          </p>
        </div>
      )}

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">
            Factures {newInvoicesCount > 0 && <Badge className="ml-1 bg-blue-600 text-white text-xs">{newInvoicesCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="quotes">Demandes de soumission</TabsTrigger>
        </TabsList>

        {/* ── FACTURES ── */}
        <TabsContent value="invoices" className="space-y-3 mt-4">
          {myInvoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune facture pour le moment.</p>
              <p className="text-sm">Vos factures apparaîtront ici une fois émises par notre équipe.</p>
            </div>
          ) : (
            myInvoices.map((inv: any) => (
              <InvoiceCard key={inv.id} invoice={inv}
                onClick={() => handleViewInvoice(inv)}
                onDownload={() => handleDownloadInvoice(inv)} />
            ))
          )}
        </TabsContent>

        {/* ── DEMANDES ── */}
        <TabsContent value="quotes" className="space-y-3 mt-4">
          {quoteRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune demande de soumission.</p>
              <Button variant="outline" className="mt-3" onClick={() => setShowNewQuote(true)}>
                <Plus className="w-4 h-4 mr-2" /> Faire une demande
              </Button>
            </div>
          ) : (
            quoteRequests.map((req: any) => (
              <div key={req.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold">{req.requestNumber}</span>
                      <Badge className={`${REQ_STATUS_COLORS[req.status]} border-0 text-xs`}>{REQ_STATUS_LABELS[req.status]}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{req.serviceCategory}</Badge>
                    </div>
                    {req.serviceCategory === "conciergerie" ? (
                      <p className="text-sm text-muted-foreground mt-1">
                        {req.serviceType} — {req.squareMeters} m² — {req.frequency}
                        {req.estimatedMonthly && ` — ~${Math.round(req.estimatedMonthly / 100).toLocaleString("fr-CA")} $/mois`}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{req.projectTitle}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(req.createdAt), "d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="text-right">
                    {req.status === "nouvelle" && <Clock className="w-5 h-5 text-blue-500" />}
                    {req.status === "acceptee" && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                </div>
                {req.adminNotes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-muted-foreground">
                    <strong>Note de l'équipe : </strong>{req.adminNotes}
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* ── DIALOG NOUVELLE DEMANDE ── */}
      <Dialog open={showNewQuote} onOpenChange={setShowNewQuote}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle demande de soumission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant={quoteCategory === "conciergerie" ? "default" : "outline"}
                className={quoteCategory === "conciergerie" ? "bg-[#003d7a]" : ""}
                onClick={() => setQuoteCategory("conciergerie")}>
                Services de Conciergerie
              </Button>
              <Button variant={quoteCategory === "strategie" ? "default" : "outline"}
                className={quoteCategory === "strategie" ? "bg-[#003d7a]" : ""}
                onClick={() => setQuoteCategory("strategie")}>
                Stratégie d'Affaires
              </Button>
            </div>
            {quoteCategory === "conciergerie"
              ? <ConciergeQuoteForm onSuccess={() => { setShowNewQuote(false); refetchQuotes(); }} />
              : <StrategyQuoteForm onSuccess={() => { setShowNewQuote(false); refetchQuotes(); }} />
            }
          </div>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG FACTURE DÉTAIL ── */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Facture {selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <InvoiceView
              invoice={selectedInvoice}
              clientName={selectedInvoiceClient?.name}
              clientCompany={selectedInvoiceClient?.company}
              clientEmail={selectedInvoiceClient?.email}
              onDownload={() => handleDownloadInvoice(selectedInvoice)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
