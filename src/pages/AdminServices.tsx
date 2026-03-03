import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ClipboardList, FileText, CheckCircle, XCircle, Plus, Trash2,
  Send, Eye, DollarSign, Clock, TrendingUp, Users
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type LineItem = { description: string; qty: number; unitPrice: number; total: number };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const REQ_STATUS_LABELS: Record<string, string> = {
  nouvelle: "Nouvelle", "en-revue": "En révision", "devis-envoye": "Devis envoyé",
  acceptee: "Acceptée", refusee: "Refusée", annulee: "Annulée",
};
const REQ_STATUS_COLORS: Record<string, string> = {
  nouvelle: "bg-blue-100 text-blue-800", "en-revue": "bg-yellow-100 text-yellow-800",
  "devis-envoye": "bg-purple-100 text-purple-800", acceptee: "bg-green-100 text-green-800",
  refusee: "bg-red-100 text-red-800", annulee: "bg-gray-100 text-gray-800",
};
const Q_STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon", envoye: "Envoyé", accepte: "Accepté",
  refuse: "Refusé", expire: "Expiré", converti: "Converti",
};
const Q_STATUS_COLORS: Record<string, string> = {
  brouillon: "bg-gray-100 text-gray-700", envoye: "bg-blue-100 text-blue-800",
  accepte: "bg-green-100 text-green-800", refuse: "bg-red-100 text-red-800",
  expire: "bg-orange-100 text-orange-800", converti: "bg-teal-100 text-teal-800",
};
const fmt = (cents: number) => (cents / 100).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AdminServices() {
  const [activeTab, setActiveTab] = useState("demandes");
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showQuoteBuilder, setShowQuoteBuilder] = useState<any | null>(null);
  const [showQuoteDetail, setShowQuoteDetail] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Données
  const { data: allRequests = [], refetch: refetchRequests } = trpc.services.adminGetServiceRequests.useQuery({});
  const { data: allQuotes = [], refetch: refetchQuotes } = trpc.services.adminGetQuotes.useQuery({});

  // Mutations
  const updateRequestStatus = trpc.services.adminUpdateRequestStatus.useMutation({
    onSuccess: () => { toast.success("Statut mis à jour"); refetchRequests(); },
    onError: (e) => toast.error(e.message),
  });

  const sendQuote = trpc.services.adminSendQuote.useMutation({
    onSuccess: () => { toast.success("Devis envoyé au client !"); refetchQuotes(); refetchRequests(); setShowQuoteDetail(null); },
    onError: (e) => toast.error(e.message),
  });

  const convertToContract = trpc.services.adminConvertQuote.useMutation({
    onSuccess: () => { toast.success("Devis converti en contrat et facture générée !"); refetchQuotes(); },
    onError: (e) => toast.error(e.message),
  });

  const filteredRequests = statusFilter === "all"
    ? allRequests
    : (allRequests as any[]).filter((r: any) => r.status === statusFilter);

  const newCount = allRequests.filter((r: any) => r.status === "nouvelle").length;
  const pendingQuotes = allQuotes.filter((q: any) => q.status === "envoye").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestion des services</h2>
        <p className="text-gray-500 mt-1">Gérez les demandes clients, créez des devis et convertissez-les en contrats.</p>
      </div>

      {/* Métriques rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Nouvelles demandes", value: newCount, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50", urgent: newCount > 0 },
          { label: "Devis en attente", value: pendingQuotes, icon: FileText, color: "text-purple-600", bg: "bg-purple-50", urgent: false },
          { label: "Total demandes", value: allRequests.length, icon: Users, color: "text-gray-600", bg: "bg-gray-50", urgent: false },
          { label: "Devis acceptés", value: allQuotes.filter((q: any) => q.status === "accepte").length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", urgent: false },
        ].map((m, i) => (
          <Card key={i} className={`border-0 shadow-sm ${m.urgent ? "ring-2 ring-blue-400" : ""}`}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center mb-3`}>
                <m.icon className={`w-5 h-5 ${m.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{m.value}</div>
              <div className="text-xs text-gray-500 mt-1">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="demandes">
            Demandes
            {newCount > 0 && <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-1.5">{newCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="devis">
            Devis
            {pendingQuotes > 0 && <span className="ml-1 bg-purple-600 text-white text-xs rounded-full px-1.5">{pendingQuotes}</span>}
          </TabsTrigger>
        </TabsList>

        {/* ─── DEMANDES ──────────────────────────────────────────────────── */}
        <TabsContent value="demandes" className="mt-4 space-y-4">
          {/* Filtre */}
          <div className="flex gap-2 flex-wrap">
            {["all", "nouvelle", "en-revue", "devis-envoye", "acceptee", "refusee"].map(s => (
              <button key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${statusFilter === s ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {s === "all" ? "Toutes" : REQ_STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune demande dans cette catégorie.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req: any) => (
                <div key={req.id} className={`bg-white border rounded-xl p-4 ${req.status === "nouvelle" ? "border-blue-300 shadow-sm" : "border-gray-200"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{req.requestNumber}</span>
                        <Badge className={`text-xs ${REQ_STATUS_COLORS[req.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {REQ_STATUS_LABELS[req.status] ?? req.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {req.serviceCategory === "conciergerie" ? "🏢 Conciergerie" : "📊 Stratégie"}
                        </Badge>
                        {req.status === "nouvelle" && (
                          <span className="text-xs text-blue-600 font-medium animate-pulse">● Nouveau</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800 mt-1">{req.projectTitle ?? req.serviceLabel}</p>
                      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                        <p>Client : <span className="font-medium text-gray-700">{req.userName ?? req.userEmail ?? "—"}</span></p>
                        {req.squareMeters && <p>Surface : {req.squareMeters} m²</p>}
                        {req.frequency && <p>Fréquence : {req.frequency}</p>}
                        {req.estimatedMonthly && (
                          <p className="text-teal-600 font-medium">Estimation BeauRive : {fmt(req.estimatedMonthly)}/mois</p>
                        )}
                        {req.notes && <p className="italic text-gray-400">"{req.notes}"</p>}
                      </div>

                      {/* Budget proposé par le client — mis en valeur */}
                      {req.budget && (
                        <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          <span className="text-base">💰</span>
                          <div className="flex-1">
                            <span className="text-xs font-semibold text-amber-800">Proposition du client : </span>
                            <span className="text-sm font-bold text-amber-900">
                              {isNaN(Number(req.budget)) ? req.budget : `${Number(req.budget).toLocaleString("fr-CA")} $`}
                              {req.timeline && (
                                <span className="ml-1 text-xs font-normal text-amber-700">
                                  ({req.timeline === "par-visite" ? "par visite" : req.timeline === "par-mois" ? "/mois" : req.timeline === "par-annee" ? "/année" : req.timeline === "total-projet" ? "total projet" : "à négocier"})
                                </span>
                              )}
                            </span>
                          </div>
                          {req.estimatedMonthly && !isNaN(Number(req.budget)) && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              Number(req.budget) * 100 >= req.estimatedMonthly
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {Number(req.budget) * 100 >= req.estimatedMonthly ? "✓ Dans la fourchette" : "⚠ Sous l'estimation"}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(req.createdAt).toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {req.status === "nouvelle" && (
                        <Button size="sm" variant="outline" className="text-xs"
                          onClick={() => updateRequestStatus.mutate({ requestId: req.id, status: "en-revue" })}>
                          <Eye className="w-3 h-3 mr-1" /> Prendre en charge
                        </Button>
                      )}
                      {(req.status === "nouvelle" || req.status === "en-revue") && (
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                          onClick={() => setShowQuoteBuilder(req)}>
                          <FileText className="w-3 h-3 mr-1" /> Créer un devis
                        </Button>
                      )}
                      {req.status !== "refusee" && req.status !== "annulee" && (
                        <Button size="sm" variant="outline" className="border-red-200 text-red-500 text-xs"
                          onClick={() => updateRequestStatus.mutate({ requestId: req.id, status: "refusee" })}>
                          <XCircle className="w-3 h-3 mr-1" /> Refuser
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── DEVIS ─────────────────────────────────────────────────────── */}
        <TabsContent value="devis" className="mt-4">
          {allQuotes.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun devis créé pour l'instant.</p>
              <p className="text-sm mt-1">Créez un devis depuis une demande client.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allQuotes.map((q: any) => (
                <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{q.quoteNumber}</span>
                        <Badge className={`text-xs ${Q_STATUS_COLORS[q.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {Q_STATUS_LABELS[q.status] ?? q.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-800 mt-1">{q.title}</p>
                      <p className="text-xs text-gray-500">Client : {q.userName ?? q.userEmail ?? "—"}</p>
                      <div className="mt-2 flex items-center gap-3 text-sm">
                        <span className="font-bold text-teal-700">{fmt(q.totalAmount)}</span>
                        {q.validUntil && (
                          <span className="text-xs text-gray-400">
                            Valide jusqu'au {new Date(q.validUntil).toLocaleDateString("fr-CA")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowQuoteDetail(q)}>
                        <Eye className="w-3 h-3 mr-1" /> Détails
                      </Button>
                      {q.status === "brouillon" && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          onClick={() => sendQuote.mutate({ quoteId: q.id })} disabled={sendQuote.isPending}>
                          <Send className="w-3 h-3 mr-1" /> Envoyer au client
                        </Button>
                      )}
                      {q.status === "accepte" && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs"
                          onClick={() => convertToContract.mutate({ quoteId: q.id, contractTitle: q.title, contractContent: q.description ?? q.title, contractType: "menage" })} disabled={convertToContract.isPending}>
                          <CheckCircle className="w-3 h-3 mr-1" /> Convertir en contrat
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── DIALOG : Créateur de devis ───────────────────────────────────── */}
      {showQuoteBuilder && (
        <QuoteBuilderDialog
          request={showQuoteBuilder}
          onClose={() => setShowQuoteBuilder(null)}
          onCreated={() => { refetchQuotes(); refetchRequests(); setShowQuoteBuilder(null); setActiveTab("devis"); }}
        />
      )}

      {/* ─── DIALOG : Détail devis ────────────────────────────────────────── */}
      {showQuoteDetail && (
        <Dialog open={!!showQuoteDetail} onOpenChange={() => setShowQuoteDetail(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{showQuoteDetail.quoteNumber} — {showQuoteDetail.title}</DialogTitle>
              <DialogDescription>
                Client : {showQuoteDetail.userName ?? showQuoteDetail.userEmail ?? "—"} ·
                Statut : {Q_STATUS_LABELS[showQuoteDetail.status] ?? showQuoteDetail.status}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {showQuoteDetail.description && (
                <p className="text-sm text-gray-700">{showQuoteDetail.description}</p>
              )}
              {(() => {
                const items: LineItem[] = JSON.parse(showQuoteDetail.lineItems ?? "[]");
                return items.length > 0 ? (
                  <table className="w-full text-xs text-gray-600 border rounded-lg overflow-hidden">
                    <thead className="bg-gray-50"><tr>
                      <th className="text-left p-2">Description</th>
                      <th className="text-right p-2">Qté</th>
                      <th className="text-right p-2">Unitaire</th>
                      <th className="text-right p-2">Total</th>
                    </tr></thead>
                    <tbody>
                      {items.map((li, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">{li.description}</td>
                          <td className="text-right p-2">{li.qty}</td>
                          <td className="text-right p-2">{li.unitPrice?.toFixed(2)} $</td>
                          <td className="text-right p-2 font-medium">{li.total?.toFixed(2)} $</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : null;
              })()}
              <div className="flex justify-between font-bold text-lg border-t pt-3">
                <span>Total</span>
                <span className="text-teal-700">{fmt(showQuoteDetail.totalAmount)}</span>
              </div>
              {showQuoteDetail.notes && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">{showQuoteDetail.notes}</div>
              )}
              {showQuoteDetail.clientNote && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                  <strong>Note du client :</strong> {showQuoteDetail.clientNote}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {showQuoteDetail.status === "brouillon" && (
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => sendQuote.mutate({ quoteId: showQuoteDetail.id })} disabled={sendQuote.isPending}>
                    <Send className="w-4 h-4 mr-2" /> Envoyer au client
                  </Button>
                )}
                {showQuoteDetail.status === "accepte" && (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => convertToContract.mutate({ quoteId: showQuoteDetail.id, contractTitle: showQuoteDetail.title, contractContent: showQuoteDetail.description ?? showQuoteDetail.title, contractType: "menage" })} disabled={convertToContract.isPending}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Convertir en contrat + facture
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Créateur de devis ────────────────────────────────────────────────────────

function QuoteBuilderDialog({ request, onClose, onCreated }: {
  request: any; onClose: () => void; onCreated: () => void;
}) {
  const [title, setTitle] = useState(request.projectTitle ?? request.serviceLabel ?? "");
  const [description, setDescription] = useState(request.projectDescription ?? "");
  const [notes, setNotes] = useState("");
  const [validDays, setValidDays] = useState("30");
  const [hasTaxes, setHasTaxes] = useState(request.serviceCategory === "conciergerie");
  const [lineItems, setLineItems] = useState<LineItem[]>(() => {
    // Pré-remplir avec l'estimation si disponible
    if (request.estimatedMonthly) {
      const base = request.estimatedMonthly / 100;
      return [{ description: `${request.serviceLabel} — ${request.squareMeters ?? "—"} m² × ${request.visitsPerMonth ?? "—"} visites/mois`, qty: 1, unitPrice: base, total: base }];
    }
    return [{ description: "", qty: 1, unitPrice: 0, total: 0 }];
  });

  const createQuote = trpc.services.adminCreateQuote.useMutation({
    onSuccess: () => { toast.success("Devis créé avec succès !"); onCreated(); },
    onError: (e) => toast.error(e.message),
  });

  const addLine = () => setLineItems(prev => [...prev, { description: "", qty: 1, unitPrice: 0, total: 0 }]);
  const removeLine = (i: number) => setLineItems(prev => prev.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => prev.map((li, idx) => {
      if (idx !== i) return li;
      const updated = { ...li, [field]: value };
      if (field === "qty" || field === "unitPrice") {
        updated.total = Number(updated.qty) * Number(updated.unitPrice);
      }
      return updated;
    }));
  };

  const subtotal = lineItems.reduce((s, li) => s + li.total, 0);
  const tps = hasTaxes ? subtotal * 0.05 : 0;
  const tvq = hasTaxes ? subtotal * 0.09975 : 0;
  const total = subtotal + tps + tvq;

  const handleSubmit = () => {
    if (!title.trim()) { toast.error("Le titre est requis"); return; }
    if (lineItems.some(li => !li.description.trim())) { toast.error("Toutes les lignes doivent avoir une description"); return; }

    createQuote.mutate({
      serviceRequestId: request.id,
      clientProfileId: request.clientProfileId,
      title,
      description: description || undefined,
      notes: notes || undefined,
      lineItems,
      hasTaxes,
      validDays: parseInt(validDays) || 30,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un devis</DialogTitle>
          <DialogDescription>
            Demande {request.requestNumber} · {request.userName ?? request.userEmail ?? "Client"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Titre du devis *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="ex: Ménage commercial hebdomadaire" />
          </div>
          <div>
            <Label>Description (facultatif)</Label>
            <Textarea rows={2} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Détails supplémentaires sur le service proposé..." />
          </div>

          {/* Lignes de devis */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Lignes du devis</Label>
              <Button size="sm" variant="outline" onClick={addLine}>
                <Plus className="w-3 h-3 mr-1" /> Ajouter une ligne
              </Button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-1 text-xs text-gray-500 px-1">
                <span className="col-span-5">Description</span>
                <span className="col-span-2 text-right">Qté</span>
                <span className="col-span-2 text-right">Prix unit. $</span>
                <span className="col-span-2 text-right">Total $</span>
                <span className="col-span-1"></span>
              </div>
              {lineItems.map((li, i) => (
                <div key={i} className="grid grid-cols-12 gap-1 items-center">
                  <Input className="col-span-5 text-xs h-8" placeholder="Description du service"
                    value={li.description} onChange={e => updateLine(i, "description", e.target.value)} />
                  <Input className="col-span-2 text-xs h-8 text-right" type="number" min="1"
                    value={li.qty} onChange={e => updateLine(i, "qty", parseFloat(e.target.value) || 1)} />
                  <Input className="col-span-2 text-xs h-8 text-right" type="number" min="0" step="0.01"
                    value={li.unitPrice} onChange={e => updateLine(i, "unitPrice", parseFloat(e.target.value) || 0)} />
                  <div className="col-span-2 text-right text-xs font-medium text-gray-700 pr-1">
                    {li.total.toFixed(2)} $
                  </div>
                  <button onClick={() => removeLine(i)} disabled={lineItems.length === 1}
                    className="col-span-1 text-red-400 hover:text-red-600 disabled:opacity-20 flex justify-center">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Taxes et total */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="taxes" checked={hasTaxes} onChange={e => setHasTaxes(e.target.checked)}
                className="rounded" />
              <label htmlFor="taxes" className="text-sm text-gray-700">Appliquer les taxes (TPS 5% + TVQ 9,975%)</label>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-600"><span>Sous-total</span><span>{subtotal.toFixed(2)} $</span></div>
              {hasTaxes && <>
                <div className="flex justify-between text-gray-500 text-xs"><span>TPS (5%)</span><span>{tps.toFixed(2)} $</span></div>
                <div className="flex justify-between text-gray-500 text-xs"><span>TVQ (9,975%)</span><span>{tvq.toFixed(2)} $</span></div>
              </>}
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>TOTAL</span><span className="text-teal-700">{total.toFixed(2)} $</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Validité du devis</Label>
              <Select value={validDays} onValueChange={setValidDays}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="45">45 jours</SelectItem>
                  <SelectItem value="60">60 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Notes internes (facultatif)</Label>
            <Textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Notes visibles par le client dans le devis..." />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button onClick={handleSubmit} disabled={createQuote.isPending}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
              {createQuote.isPending ? "Création..." : "Créer le devis (brouillon)"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
