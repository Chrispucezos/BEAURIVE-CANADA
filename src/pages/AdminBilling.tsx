import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceView, InvoiceCard, type InvoiceData } from "@/components/InvoiceView";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Plus, Send, CheckCircle, Clock, AlertCircle, Wrench, DollarSign, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

// ─── STATUTS ──────────────────────────────────────────────────────────────────
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
const INV_STATUS_COLORS: Record<string, string> = {
  brouillon: "bg-gray-100 text-gray-600",
  envoyee: "bg-blue-100 text-blue-700",
  vue: "bg-yellow-100 text-yellow-700",
  payee: "bg-green-100 text-green-700",
  annulee: "bg-red-100 text-red-600",
};
const INV_STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  envoyee: "Envoyée",
  vue: "Vue",
  payee: "Payée",
  annulee: "Annulée",
};

function fmt(cents: number) {
  return (cents / 100).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
}

// ─── FORMULAIRE ENREGISTREMENT SERVICE ───────────────────────────────────────
function ServiceRecordForm({ clients, onSuccess }: { clients: any[]; onSuccess: () => void }) {
  const [form, setForm] = useState({
    clientProfileId: "",
    serviceDate: format(new Date(), "yyyy-MM-dd"),
    serviceType: "menage-commercial",
    description: "",
    duration: "",
    squareMeters: "",
    technicianName: "",
    amount: "",
    notes: "",
  });

  const create = trpc.billing.adminCreateServiceRecord.useMutation({
    onSuccess: () => { toast.success("Service enregistré !"); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Client *</Label>
          <Select value={form.clientProfileId} onValueChange={v => setForm(f => ({ ...f, clientProfileId: v }))}>
            <SelectTrigger><SelectValue placeholder="Sélectionner un client..." /></SelectTrigger>
            <SelectContent>
              {clients.map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.user?.name || c.company || `Client #${c.id}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Date du service *</Label>
          <Input type="date" value={form.serviceDate} onChange={e => setForm(f => ({ ...f, serviceDate: e.target.value }))} />
        </div>
        <div>
          <Label>Type de service *</Label>
          <Select value={form.serviceType} onValueChange={v => setForm(f => ({ ...f, serviceType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="menage-commercial">Ménage commercial</SelectItem>
              <SelectItem value="menage-residentiel">Ménage résidentiel</SelectItem>
              <SelectItem value="post-construction">Post-construction</SelectItem>
              <SelectItem value="post-renovation">Post-rénovation</SelectItem>
              <SelectItem value="strategie">Stratégie d'affaires</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Montant ($ CAD) *</Label>
          <Input type="number" min={0} step={0.01} placeholder="0.00" value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        </div>
        <div>
          <Label>Durée (minutes)</Label>
          <Input type="number" min={0} placeholder="120" value={form.duration}
            onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
        </div>
        <div>
          <Label>Surface (m²)</Label>
          <Input type="number" min={0} placeholder="200" value={form.squareMeters}
            onChange={e => setForm(f => ({ ...f, squareMeters: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <Label>Technicien(ne)</Label>
          <Input placeholder="Nom du technicien" value={form.technicianName}
            onChange={e => setForm(f => ({ ...f, technicianName: e.target.value }))} />
        </div>
      </div>
      <div>
        <Label>Description *</Label>
        <Textarea placeholder="Décrivez le service rendu..." rows={2} value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div>
        <Label>Notes internes</Label>
        <Textarea placeholder="Notes internes (non visibles par le client)..." rows={2} value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>
      <Button className="w-full bg-[#003d7a] hover:bg-[#002d5a]"
        onClick={() => create.mutate({
          clientProfileId: parseInt(form.clientProfileId),
          serviceDate: form.serviceDate,
          serviceType: form.serviceType,
          description: form.description,
          duration: form.duration ? parseInt(form.duration) : undefined,
          squareMeters: form.squareMeters ? parseInt(form.squareMeters) : undefined,
          technicianName: form.technicianName || undefined,
          amount: parseFloat(form.amount) || 0,
          notes: form.notes || undefined,
        })}
        disabled={create.isPending || !form.clientProfileId || !form.description || !form.amount}>
        <Wrench className="w-4 h-4 mr-2" />
        {create.isPending ? "Enregistrement..." : "Enregistrer le service"}
      </Button>
    </div>
  );
}

// ─── FORMULAIRE ÉMISSION FACTURE MANUELLE ─────────────────────────────────────
function CreateInvoiceForm({ clients, onSuccess }: { clients: any[]; onSuccess: () => void }) {
  const [form, setForm] = useState({
    clientProfileId: "",
    type: "pro-forma" as "pro-forma" | "finale" | "avoir",
    serviceCategory: "conciergerie" as "conciergerie" | "strategie" | "mixte",
    hasTaxes: true,
    dueDate: "",
    notes: "",
  });
  const [lineItems, setLineItems] = useState([{ description: "", qty: 1, unitPrice: 0, total: 0 }]);

  const addLine = () => setLineItems(l => [...l, { description: "", qty: 1, unitPrice: 0, total: 0 }]);
  const removeLine = (i: number) => setLineItems(l => l.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: string, value: any) => {
    setLineItems(l => l.map((item, idx) => {
      if (idx !== i) return item;
      const updated = { ...item, [field]: value };
      if (field === "qty" || field === "unitPrice") {
        updated.total = parseFloat(String(updated.qty)) * parseFloat(String(updated.unitPrice)) || 0;
      }
      return updated;
    }));
  };

  const subtotal = lineItems.reduce((s, l) => s + (l.total || 0), 0);
  const tps = form.hasTaxes ? subtotal * 0.05 : 0;
  const tvq = form.hasTaxes ? subtotal * 0.09975 : 0;
  const total = subtotal + tps + tvq;

  const create = trpc.billing.adminCreateInvoice.useMutation({
    onSuccess: (data) => { toast.success(`Facture ${data.invoiceNumber} créée !`); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Client *</Label>
          <Select value={form.clientProfileId} onValueChange={v => setForm(f => ({ ...f, clientProfileId: v }))}>
            <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
            <SelectContent>
              {clients.map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.user?.name || c.company || `Client #${c.id}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Type de facture</Label>
          <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as any }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pro-forma">Pro-Forma</SelectItem>
              <SelectItem value="finale">Finale</SelectItem>
              <SelectItem value="avoir">Note de crédit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Catégorie</Label>
          <Select value={form.serviceCategory} onValueChange={v => setForm(f => ({ ...f, serviceCategory: v as any }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="conciergerie">Conciergerie</SelectItem>
              <SelectItem value="strategie">Stratégie d'affaires</SelectItem>
              <SelectItem value="mixte">Mixte</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Date d'échéance</Label>
          <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input type="checkbox" id="hasTaxes" checked={form.hasTaxes}
            onChange={e => setForm(f => ({ ...f, hasTaxes: e.target.checked }))} className="w-4 h-4" />
          <Label htmlFor="hasTaxes">Appliquer TPS/TVQ (commercial)</Label>
        </div>
      </div>

      {/* Lignes */}
      <div>
        <Label className="mb-2 block">Lignes de facturation</Label>
        <div className="space-y-2">
          {lineItems.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <Input placeholder="Description" value={line.description}
                  onChange={e => updateLine(i, "description", e.target.value)} />
              </div>
              <div className="col-span-2">
                <Input type="number" min={1} placeholder="Qté" value={line.qty}
                  onChange={e => updateLine(i, "qty", parseFloat(e.target.value) || 1)} />
              </div>
              <div className="col-span-2">
                <Input type="number" min={0} step={0.01} placeholder="Prix unit." value={line.unitPrice}
                  onChange={e => updateLine(i, "unitPrice", parseFloat(e.target.value) || 0)} />
              </div>
              <div className="col-span-2 text-right text-sm font-medium">
                {line.total.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}
              </div>
              <div className="col-span-1">
                {lineItems.length > 1 && (
                  <Button size="sm" variant="ghost" onClick={() => removeLine(i)} className="h-8 w-8 p-0 text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-2" onClick={addLine}>
          <Plus className="w-3 h-3 mr-1" /> Ajouter une ligne
        </Button>
      </div>

      {/* Totaux */}
      <div className="flex justify-end">
        <div className="w-56 space-y-1 text-sm border-t pt-2">
          <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span>{subtotal.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}</span></div>
          {form.hasTaxes && <>
            <div className="flex justify-between"><span className="text-muted-foreground">TPS (5%)</span><span>{tps.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">TVQ (9,975%)</span><span>{tvq.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}</span></div>
          </>}
          <div className="flex justify-between font-bold text-[#003d7a] border-t pt-1"><span>Total</span><span>{total.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}</span></div>
        </div>
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea placeholder="Notes visibles sur la facture..." rows={2} value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>

      <Button className="w-full bg-[#003d7a] hover:bg-[#002d5a]"
        onClick={() => create.mutate({
          clientProfileId: parseInt(form.clientProfileId),
          type: form.type,
          serviceCategory: form.serviceCategory,
          lineItems,
          hasTaxes: form.hasTaxes,
          dueDate: form.dueDate || undefined,
          notes: form.notes || undefined,
        })}
        disabled={create.isPending || !form.clientProfileId || lineItems.every(l => !l.description)}>
        <FileText className="w-4 h-4 mr-2" />
        {create.isPending ? "Création..." : "Créer la facture"}
      </Button>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function AdminBilling() {
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [selectedInvoiceClient, setSelectedInvoiceClient] = useState<{ name?: string; company?: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: quoteRequests = [], refetch: refetchQuotes } = trpc.billing.adminGetQuoteRequests.useQuery({});
  const { data: invoicesData = [], refetch: refetchInvoices } = trpc.billing.adminGetInvoices.useQuery({});
  const { data: serviceRecordsData = [], refetch: refetchServices } = trpc.billing.adminGetServiceRecords.useQuery({});
  const { data: clients = [] } = trpc.admin.getClients.useQuery();

  const updateQuoteStatus = trpc.billing.adminUpdateQuoteRequest.useMutation({
    onSuccess: () => { toast.success("Statut mis à jour"); refetchQuotes(); },
    onError: (e) => toast.error(e.message),
  });

  const generateFromQuote = trpc.billing.adminGenerateInvoiceFromQuote.useMutation({
    onSuccess: (data) => { toast.success(`Facture ${data.invoiceNumber} générée !`); refetchInvoices(); refetchQuotes(); },
    onError: (e) => toast.error(e.message),
  });

  const sendInvoice = trpc.billing.adminSendInvoice.useMutation({
    onSuccess: () => { toast.success("Facture envoyée au client !"); refetchInvoices(); },
    onError: (e) => toast.error(e.message),
  });

  const updateInvoiceStatus = trpc.billing.adminUpdateInvoiceStatus.useMutation({
    onSuccess: () => { toast.success("Statut mis à jour"); refetchInvoices(); },
    onError: (e) => toast.error(e.message),
  });

  const handleViewInvoice = (inv: any) => {
    setSelectedInvoice(inv.inv || inv);
    setSelectedInvoiceClient({ name: inv.user?.name, company: inv.profile?.company });
  };

  const handleDownloadInvoice = (inv: InvoiceData, clientName?: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const lineItems = Array.isArray(inv.lineItems) ? inv.lineItems : [];
    const fmtCents = (cents: number) => (cents / 100).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>${inv.invoiceNumber}</title>
    <style>body{font-family:Arial,sans-serif;margin:40px;color:#1a1a1a}h1{color:#003d7a}table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;border-bottom:1px solid #eee;text-align:left}th{background:#f5f5f5;font-size:12px;color:#666}.header{display:flex;justify-content:space-between;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #003d7a}.conditions{margin-top:30px;padding-top:15px;border-top:1px solid #eee;font-size:11px;color:#888}@media print{button{display:none}}</style></head>
    <body>
    <div class="header"><div><h1>BeauRive Solutions</h1><p style="color:#666;margin:0">Multi-Service | Québec, Canada</p><p style="color:#666;margin:0;font-size:12px">581-349-2323 | info@beaurive.ca</p></div>
    <div style="text-align:right"><h2 style="color:#003d7a;margin:0">${inv.type === "pro-forma" ? "Facture Pro-Forma" : inv.type === "finale" ? "Facture Finale" : "Note de crédit"}</h2><p style="font-family:monospace;margin:4px 0">${inv.invoiceNumber}</p><p style="margin:0;font-size:12px;color:#666">${format(new Date(inv.createdAt), "d MMMM yyyy", { locale: fr })}</p></div></div>
    <div style="margin-bottom:20px"><p style="margin:0;font-size:12px;color:#666">Facturé à</p><p style="margin:4px 0;font-weight:bold">${clientName || "—"}</p></div>
    <table><thead><tr><th>Description</th><th style="text-align:right">Qté</th><th style="text-align:right">Prix unit.</th><th style="text-align:right">Total</th></tr></thead><tbody>
    ${lineItems.map((l: any) => `<tr><td>${l.description}</td><td style="text-align:right">${l.qty}</td><td style="text-align:right">${fmtCents(l.unitPrice)}</td><td style="text-align:right">${fmtCents(l.total)}</td></tr>`).join("")}
    </tbody></table>
    <div style="display:flex;justify-content:flex-end;margin-top:16px"><div style="width:260px">
    <div style="display:flex;justify-content:space-between;padding:4px 0"><span style="color:#666">Sous-total</span><span>${fmtCents(inv.subtotal)}</span></div>
    ${inv.hasTaxes ? `<div style="display:flex;justify-content:space-between;padding:4px 0"><span style="color:#666">TPS (5%)</span><span>${fmtCents(inv.tpsAmount)}</span></div><div style="display:flex;justify-content:space-between;padding:4px 0"><span style="color:#666">TVQ (9,975%)</span><span>${fmtCents(inv.tvqAmount)}</span></div>` : ""}
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid #003d7a;margin-top:8px;font-weight:bold;font-size:16px;color:#003d7a"><span>Total</span><span>${fmtCents(inv.totalAmount)}</span></div>
    </div></div>
    ${inv.notes ? `<div style="margin-top:16px;padding:12px;background:#f9f9f9;border-radius:6px;font-size:13px"><strong>Notes : </strong>${inv.notes}</div>` : ""}
    <div class="conditions"><p>• Les prix sont en dollars canadiens (CAD). Taxes calculées selon les règles fiscales du Québec.</p><p>• Pour toute question : info@beaurive.ca | 581-349-2323</p></div>
    <script>window.onload=function(){window.print();}</script></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const newQuotes = quoteRequests.filter((r: any) => r.req?.status === "nouvelle").length;
  const pendingInvoices = invoicesData.filter((r: any) => r.inv?.status === "brouillon").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003d7a]">Soumissions et facturation</h2>
          <p className="text-muted-foreground text-sm">Gérez les demandes clients, enregistrez les services et émettez les factures</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowServiceForm(true)}>
            <Wrench className="w-4 h-4 mr-2" /> Enregistrer un service
          </Button>
          <Button className="bg-[#003d7a] hover:bg-[#002d5a]" onClick={() => setShowInvoiceForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nouvelle facture
          </Button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Demandes nouvelles", value: newQuotes, icon: AlertCircle, color: "text-blue-600" },
          { label: "Factures en attente", value: pendingInvoices, icon: Clock, color: "text-yellow-600" },
          { label: "Services enregistrés", value: serviceRecordsData.length, icon: Wrench, color: "text-green-600" },
          { label: "Total factures", value: invoicesData.length, icon: FileText, color: "text-[#003d7a]" },
        ].map((stat, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="quotes">
        <TabsList>
          <TabsTrigger value="quotes">
            Demandes {newQuotes > 0 && <Badge className="ml-1 bg-blue-600 text-white text-xs">{newQuotes}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="invoices">
            Factures {pendingInvoices > 0 && <Badge className="ml-1 bg-yellow-600 text-white text-xs">{pendingInvoices}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="services">Services rendus</TabsTrigger>
        </TabsList>

        {/* ── DEMANDES ── */}
        <TabsContent value="quotes" className="space-y-3 mt-4">
          {quoteRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune demande de soumission.</p>
            </div>
          ) : (
            quoteRequests.map((row: any) => {
              const req = row.req;
              const user = row.user;
              const profile = row.profile;
              return (
                <div key={req.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold">{req.requestNumber}</span>
                        <Badge className={`${REQ_STATUS_COLORS[req.status]} border-0 text-xs`}>{REQ_STATUS_LABELS[req.status]}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{req.serviceCategory}</Badge>
                      </div>
                      <p className="font-medium mt-1">{user?.name || "—"} {profile?.company ? `(${profile.company})` : ""}</p>
                      {req.serviceCategory === "conciergerie" ? (
                        <p className="text-sm text-muted-foreground">
                          {req.serviceType} — {req.squareMeters} m² — {req.frequency}
                          {req.estimatedMonthly && ` — ~${Math.round(req.estimatedMonthly / 100).toLocaleString("fr-CA")} $/mois`}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">{req.projectTitle} — Budget: {req.budget || "non précisé"}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(req.createdAt), "d MMM yyyy", { locale: fr })}
                      </p>
                      {req.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{req.notes}"</p>}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Select value={req.status} onValueChange={v => updateQuoteStatus.mutate({ id: req.id, status: v as any })}>
                        <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(REQ_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {req.serviceCategory === "conciergerie" && (
                        <Button size="sm" variant="outline" className="h-8 text-xs"
                          onClick={() => generateFromQuote.mutate({ quoteRequestId: req.id, type: "pro-forma" })}
                          disabled={generateFromQuote.isPending}>
                          <FileText className="w-3 h-3 mr-1" /> Générer facture
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        {/* ── FACTURES ── */}
        <TabsContent value="invoices" className="space-y-3 mt-4">
          {invoicesData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune facture.</p>
            </div>
          ) : (
            invoicesData.map((row: any) => {
              const inv = row.inv;
              const clientName = row.user?.name || row.profile?.company || `Client #${inv.clientProfileId}`;
              return (
                <div key={inv.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold">{inv.invoiceNumber}</span>
                        <Badge className={`${INV_STATUS_COLORS[inv.status]} border-0 text-xs`}>{INV_STATUS_LABELS[inv.status]}</Badge>
                        <Badge variant="outline" className="text-xs">{inv.type}</Badge>
                      </div>
                      <p className="font-medium mt-1">{clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {fmt(inv.totalAmount)} {inv.hasTaxes ? "(taxes incluses)" : "(sans taxes)"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(inv.createdAt), "d MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Select value={inv.status} onValueChange={v => updateInvoiceStatus.mutate({ invoiceId: inv.id, status: v as any })}>
                        <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(INV_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-8 text-xs flex-1"
                          onClick={() => handleViewInvoice(row)}>
                          <Eye className="w-3 h-3 mr-1" /> Voir
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs flex-1"
                          onClick={() => handleDownloadInvoice(inv, clientName)}>
                          PDF
                        </Button>
                      </div>
                      {inv.status === "brouillon" && (
                        <Button size="sm" className="h-8 text-xs bg-[#003d7a] hover:bg-[#002d5a]"
                          onClick={() => sendInvoice.mutate({ invoiceId: inv.id })}
                          disabled={sendInvoice.isPending}>
                          <Send className="w-3 h-3 mr-1" /> Envoyer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        {/* ── SERVICES RENDUS ── */}
        <TabsContent value="services" className="space-y-3 mt-4">
          {serviceRecordsData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun service enregistré.</p>
              <Button variant="outline" className="mt-3" onClick={() => setShowServiceForm(true)}>
                <Plus className="w-4 h-4 mr-2" /> Enregistrer un service
              </Button>
            </div>
          ) : (
            serviceRecordsData.map((svc: any) => (
              <div key={svc.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{svc.serviceType}</span>
                      <Badge variant="outline" className="text-xs capitalize">{svc.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{svc.description}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>{format(new Date(svc.serviceDate), "d MMM yyyy", { locale: fr })}</span>
                      {svc.squareMeters && <span>{svc.squareMeters} m²</span>}
                      {svc.duration && <span>{svc.duration} min</span>}
                      {svc.technicianName && <span>Tech: {svc.technicianName}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#003d7a]">{fmt(svc.amount)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* ── DIALOGS ── */}
      <Dialog open={showServiceForm} onOpenChange={setShowServiceForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Enregistrer un service rendu</DialogTitle></DialogHeader>
          <ServiceRecordForm clients={clients as any[]} onSuccess={() => { setShowServiceForm(false); refetchServices(); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={showInvoiceForm} onOpenChange={setShowInvoiceForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nouvelle facture manuelle</DialogTitle></DialogHeader>
          <CreateInvoiceForm clients={clients as any[]} onSuccess={() => { setShowInvoiceForm(false); refetchInvoices(); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Facture {selectedInvoice?.invoiceNumber}</DialogTitle></DialogHeader>
          {selectedInvoice && (
            <InvoiceView
              invoice={selectedInvoice}
              clientName={selectedInvoiceClient?.name}
              clientCompany={selectedInvoiceClient?.company}
              onDownload={() => handleDownloadInvoice(selectedInvoice, selectedInvoiceClient?.name)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
