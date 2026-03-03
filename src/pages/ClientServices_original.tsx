import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, ClipboardList, FileText, CheckCircle, XCircle,
  Clock, TrendingUp, DollarSign, Star, ChevronRight,
  Building2, Home, Sparkles, BarChart3, Eye
} from "lucide-react";
import { InvoiceCard } from "@/components/InvoiceView";

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceItem = {
  id: string; category: string; label: string; icon: string; description: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  nouvelle: "Nouvelle", "en-revue": "En révision", "devis-envoye": "Devis envoyé",
  acceptee: "Acceptée", refusee: "Refusée", annulee: "Annulée",
};
const STATUS_COLORS: Record<string, string> = {
  nouvelle: "bg-blue-100 text-blue-800", "en-revue": "bg-yellow-100 text-yellow-800",
  "devis-envoye": "bg-purple-100 text-purple-800", acceptee: "bg-green-100 text-green-800",
  refusee: "bg-red-100 text-red-800", annulee: "bg-gray-100 text-gray-800",
};
const QUOTE_STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon", envoye: "Reçu", accepte: "Accepté",
  refuse: "Refusé", expire: "Expiré", converti: "Converti en contrat",
};
const QUOTE_STATUS_COLORS: Record<string, string> = {
  brouillon: "bg-gray-100 text-gray-700", envoye: "bg-blue-100 text-blue-800",
  accepte: "bg-green-100 text-green-800", refuse: "bg-red-100 text-red-800",
  expire: "bg-orange-100 text-orange-800", converti: "bg-teal-100 text-teal-800",
};
const fmt = (cents: number) => (cents / 100).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });

// ─── Composant principal ──────────────────────────────────────────────────────

export default function ClientServices() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("catalogue");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showQuoteDetail, setShowQuoteDetail] = useState<any | null>(null);
  const [showRefuseDialog, setShowRefuseDialog] = useState<any | null>(null);
  const [refuseNote, setRefuseNote] = useState("");

  // Données
  const { data: catalogue = [] } = trpc.services.getCatalogue.useQuery();
  const { data: myRequests = [], refetch: refetchRequests } = trpc.services.getMyServiceRequests.useQuery();
  const { data: myQuotes = [], refetch: refetchQuotes } = trpc.services.getMyQuotes.useQuery();
  const { data: summary } = trpc.services.getCollaborationSummary.useQuery();

  // Mutations
  const createRequest = trpc.services.createServiceRequest.useMutation({
    onSuccess: (data) => {
      toast.success(`Demande ${data.requestNumber} soumise avec succès ! Nous vous répondrons sous 24h.`);
      setShowRequestForm(false);
      setSelectedService(null);
      refetchRequests();
      setActiveTab("demandes");
    },
    onError: (e) => toast.error(e.message),
  });

  const respondToQuote = trpc.services.respondToQuote.useMutation({
    onSuccess: (_, vars) => {
      toast.success(vars.response === "accepte" ? "Devis accepté ! BeauRive Solutions va vous contacter." : "Devis refusé.");
      refetchQuotes();
      setShowQuoteDetail(null);
      setShowRefuseDialog(null);
    },
    onError: (e) => toast.error(e.message),
  });

  // Grouper le catalogue
  const conciergerie = catalogue.filter((s: ServiceItem) => s.category === "conciergerie");
  const strategie = catalogue.filter((s: ServiceItem) => s.category === "strategie");

  const pendingQuotes = myQuotes.filter((q: any) => q.status === "envoye");

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes Services</h2>
          <p className="text-gray-500 mt-1">Demandez un service, suivez vos devis et consultez votre historique de collaboration.</p>
        </div>
        <Button
          onClick={() => { setSelectedService(null); setShowRequestForm(true); }}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle demande
        </Button>
      </div>

      {/* Alertes devis en attente */}
      {pendingQuotes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-blue-900">
              {pendingQuotes.length === 1 ? "1 devis en attente de votre réponse" : `${pendingQuotes.length} devis en attente de votre réponse`}
            </p>
            <p className="text-sm text-blue-700">Consultez l'onglet Devis pour accepter ou refuser.</p>
          </div>
          <Button size="sm" variant="outline" className="border-blue-300 text-blue-700" onClick={() => setActiveTab("devis")}>
            Voir les devis
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
          <TabsTrigger value="demandes">
            Demandes
            {myRequests.filter((r: any) => r.status === "nouvelle").length > 0 && (
              <span className="ml-1 bg-teal-600 text-white text-xs rounded-full px-1.5">
                {myRequests.filter((r: any) => r.status === "nouvelle").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="devis">
            Devis
            {pendingQuotes.length > 0 && (
              <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-1.5">{pendingQuotes.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="collaboration">Bilan</TabsTrigger>
        </TabsList>

        {/* ─── CATALOGUE ─────────────────────────────────────────────────── */}
        <TabsContent value="catalogue" className="space-y-6 mt-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-800">Services de Conciergerie</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {conciergerie.map((svc: ServiceItem) => (
                <button
                  key={svc.id}
                  onClick={() => { setSelectedService(svc); setShowRequestForm(true); }}
                  className="text-left p-4 rounded-xl border border-gray-200 hover:border-teal-400 hover:shadow-md transition-all group bg-white"
                >
                  <div className="text-2xl mb-2">{svc.icon}</div>
                  <div className="font-medium text-gray-900 group-hover:text-teal-700 text-sm">{svc.label}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{svc.description}</div>
                  <div className="mt-3 flex items-center text-xs text-teal-600 font-medium">
                    Demander <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-800">Stratégie d'Affaires</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {strategie.map((svc: ServiceItem) => (
                <button
                  key={svc.id}
                  onClick={() => { setSelectedService(svc); setShowRequestForm(true); }}
                  className="text-left p-4 rounded-xl border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all group bg-white"
                >
                  <div className="text-2xl mb-2">{svc.icon}</div>
                  <div className="font-medium text-gray-900 group-hover:text-indigo-700 text-sm">{svc.label}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{svc.description}</div>
                  <div className="mt-3 flex items-center text-xs text-indigo-600 font-medium">
                    Demander <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ─── DEMANDES ──────────────────────────────────────────────────── */}
        <TabsContent value="demandes" className="mt-4">
          {myRequests.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucune demande pour l'instant</p>
              <p className="text-sm mt-1">Cliquez sur "Nouvelle demande" pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req: any) => (
                <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{req.requestNumber}</span>
                      <Badge className={`text-xs ${STATUS_COLORS[req.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {STATUS_LABELS[req.status] ?? req.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {req.serviceCategory === "conciergerie" ? "🏢 Conciergerie" : "📊 Stratégie"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {req.projectTitle ?? req.serviceType ?? "Service demandé"}
                    </p>
                    {req.estimatedMonthly && (
                      <p className="text-xs text-teal-600 mt-1">Estimation : {fmt(req.estimatedMonthly)}/mois</p>
                    )}
                    {req.notes && <p className="text-xs text-gray-400 mt-1 italic">"{req.notes}"</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(req.createdAt).toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── DEVIS ─────────────────────────────────────────────────────── */}
        <TabsContent value="devis" className="mt-4">
          {myQuotes.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun devis reçu pour l'instant</p>
              <p className="text-sm mt-1">Vos devis apparaîtront ici dès que BeauRive Solutions en créera un.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myQuotes.map((q: any) => {
                const lineItems = JSON.parse(q.lineItems ?? "[]");
                return (
                  <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">{q.quoteNumber}</span>
                          <Badge className={`text-xs ${QUOTE_STATUS_COLORS[q.status] ?? "bg-gray-100 text-gray-700"}`}>
                            {QUOTE_STATUS_LABELS[q.status] ?? q.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 font-medium">{q.title}</p>
                        {q.description && <p className="text-xs text-gray-500 mt-1">{q.description}</p>}
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="font-bold text-teal-700">{fmt(q.totalAmount)}</span>
                          {q.hasTaxes ? <span className="text-xs text-gray-400">taxes incluses</span> : <span className="text-xs text-gray-400">sans taxes</span>}
                        </div>
                        {q.validUntil && (
                          <p className="text-xs text-gray-400 mt-1">
                            Valide jusqu'au {new Date(q.validUntil).toLocaleDateString("fr-CA")}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline" onClick={() => setShowQuoteDetail(q)}>
                          <Eye className="w-3 h-3 mr-1" /> Voir
                        </Button>
                        {q.status === "envoye" && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => respondToQuote.mutate({ quoteId: q.id, response: "accepte" })}>
                              <CheckCircle className="w-3 h-3 mr-1" /> Accepter
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-300 text-red-600"
                              onClick={() => { setShowRefuseDialog(q); setRefuseNote(""); }}>
                              <XCircle className="w-3 h-3 mr-1" /> Refuser
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Lignes du devis */}
                    {lineItems.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <table className="w-full text-xs text-gray-600">
                          <thead><tr className="text-gray-400"><th className="text-left pb-1">Description</th><th className="text-right pb-1">Qté</th><th className="text-right pb-1">Unitaire</th><th className="text-right pb-1">Total</th></tr></thead>
                          <tbody>
                            {lineItems.map((li: any, i: number) => (
                              <tr key={i} className="border-t border-gray-50">
                                <td className="py-1">{li.description}</td>
                                <td className="text-right">{li.qty}</td>
                                <td className="text-right">{li.unitPrice?.toFixed(2)} $</td>
                                <td className="text-right font-medium">{li.total?.toFixed(2)} $</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── BILAN DE COLLABORATION ────────────────────────────────────── */}
        <TabsContent value="collaboration" className="mt-4">
          {!summary ? (
            <div className="text-center py-16 text-gray-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Votre bilan de collaboration apparaîtra ici.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Métriques */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Demandes soumises", value: summary.totalRequests, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Devis reçus", value: summary.totalQuotes, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
                  { label: "Contrats actifs", value: summary.activeContracts, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
                  { label: "Total facturé payé", value: fmt(summary.totalPaid), icon: DollarSign, color: "text-teal-600", bg: "bg-teal-50" },
                ].map((m, i) => (
                  <Card key={i} className="border-0 shadow-sm">
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

              {/* Contrats actifs */}
              {summary.activeContractsList.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" /> Contrats actifs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {summary.activeContractsList.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{c.title}</p>
                          <p className="text-xs text-gray-500">{c.contractNumber} · {c.durationMonths} mois</p>
                        </div>
                        {c.monthlyAmount && (
                          <span className="text-sm font-bold text-green-700">{fmt(c.monthlyAmount)}/mois</span>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Dernières factures */}
              {summary.recentInvoices.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-teal-600" /> Dernières factures
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {summary.recentInvoices.map((inv: any) => (
                      <InvoiceCard key={inv.id} invoice={inv} />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Dernières demandes */}
              {summary.recentRequests.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-blue-600" /> Activité récente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {summary.recentRequests.map((r: any) => (
                      <div key={r.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                        <span className="text-gray-700">{r.projectTitle ?? r.serviceType ?? r.requestNumber}</span>
                        <Badge className={`text-xs ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {STATUS_LABELS[r.status] ?? r.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── DIALOG : Formulaire de demande ──────────────────────────────── */}
      <ServiceRequestDialog
        open={showRequestForm}
        onClose={() => { setShowRequestForm(false); setSelectedService(null); }}
        preselected={selectedService}
        catalogue={catalogue as ServiceItem[]}
        onSubmit={(data) => createRequest.mutate(data)}
        loading={createRequest.isPending}
      />

      {/* ─── DIALOG : Détail devis ────────────────────────────────────────── */}
      {showQuoteDetail && (
        <Dialog open={!!showQuoteDetail} onOpenChange={() => setShowQuoteDetail(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{showQuoteDetail.quoteNumber} — {showQuoteDetail.title}</DialogTitle>
              <DialogDescription>{showQuoteDetail.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {showQuoteDetail.notes && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">{showQuoteDetail.notes}</div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-3">
                <span>Total</span>
                <span className="text-teal-700">{fmt(showQuoteDetail.totalAmount)}</span>
              </div>
              {showQuoteDetail.status === "envoye" && (
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => respondToQuote.mutate({ quoteId: showQuoteDetail.id, response: "accepte" })}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Accepter ce devis
                  </Button>
                  <Button variant="outline" className="flex-1 border-red-300 text-red-600"
                    onClick={() => { setShowRefuseDialog(showQuoteDetail); setShowQuoteDetail(null); }}>
                    <XCircle className="w-4 h-4 mr-2" /> Refuser
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── DIALOG : Refus devis ─────────────────────────────────────────── */}
      {showRefuseDialog && (
        <Dialog open={!!showRefuseDialog} onOpenChange={() => setShowRefuseDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Refuser le devis</DialogTitle>
              <DialogDescription>Vous pouvez laisser une note pour expliquer votre décision (facultatif).</DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Raison du refus (facultatif)..."
              value={refuseNote}
              onChange={(e) => setRefuseNote(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowRefuseDialog(null)}>Annuler</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => respondToQuote.mutate({ quoteId: showRefuseDialog.id, response: "refuse", note: refuseNote || undefined })}
                disabled={respondToQuote.isPending}>
                Confirmer le refus
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Formulaire de demande de service ────────────────────────────────────────

function ServiceRequestDialog({
  open, onClose, preselected, catalogue, onSubmit, loading
}: {
  open: boolean;
  onClose: () => void;
  preselected: ServiceItem | null;
  catalogue: ServiceItem[];
  onSubmit: (data: any) => void;
  loading: boolean;
}) {
  const [step, setStep] = useState<"select" | "details">(preselected ? "details" : "select");
  const [selected, setSelected] = useState<ServiceItem | null>(preselected);

  // Réinitialiser l'état quand le dialog s'ouvre avec un service présélectionné
  useEffect(() => {
    if (open) {
      if (preselected) {
        setSelected(preselected);
        setStep("details");
      } else {
        setSelected(null);
        setStep("select");
      }
      setForm({
        squareMeters: "", frequency: "weekly", visitsPerMonth: "4",
        commercialVenueType: "bureau", productOption: "beaurive-provides",
        projectTitle: "", projectDescription: "", budget: "", timeline: "",
        notes: "",
      });
    }
  }, [open, preselected]);
  const [form, setForm] = useState({
    squareMeters: "", frequency: "weekly", visitsPerMonth: "4",
    commercialVenueType: "bureau", productOption: "beaurive-provides",
    projectTitle: "", projectDescription: "", budget: "", timeline: "",
    notes: "",
  });

  const handleSelectService = (svc: ServiceItem) => {
    setSelected(svc);
    setStep("details");
  };

  const handleSubmit = () => {
    if (!selected) return;
    const isConciergerie = selected.category === "conciergerie";
    const visitsPerMonth = parseInt(form.visitsPerMonth) || 4;
    const squareMeters = parseInt(form.squareMeters) || 0;

    // Estimation rapide pour conciergerie
    let estimatedMonthly: number | undefined;
    if (isConciergerie && squareMeters > 0) {
      const baseRate = 0.29; // $/m²/visite
      const travelCost = 15;
      const equipCost = 5;
      const productCost = form.productOption === "beaurive-provides" ? squareMeters * 0.20 : 0;
      const costPerVisit = squareMeters * baseRate + travelCost + equipCost + productCost;
      estimatedMonthly = Math.round(costPerVisit * visitsPerMonth / (1 - 0.40));
    }

    onSubmit({
      serviceId: selected.id,
      serviceLabel: selected.label,
      serviceCategory: selected.category as "conciergerie" | "strategie",
      squareMeters: squareMeters || undefined,
      frequency: form.frequency || undefined,
      visitsPerMonth: visitsPerMonth || undefined,
      commercialVenueType: form.commercialVenueType || undefined,
      productOption: form.productOption || undefined,
      estimatedMonthly,
      projectTitle: form.projectTitle || selected.label,
      projectDescription: form.projectDescription || undefined,
      budget: form.budget || undefined,
      timeline: form.timeline || undefined,
      notes: form.notes || undefined,
    });
  };

  const conciergerie = catalogue.filter(s => s.category === "conciergerie");
  const strategie = catalogue.filter(s => s.category === "strategie");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "select" ? "Choisir un service" : `Demande — ${selected?.label}`}
          </DialogTitle>
          <DialogDescription>
            {step === "select"
              ? "Sélectionnez le service pour lequel vous souhaitez une soumission."
              : "Remplissez les informations pour que nous puissions vous préparer un devis précis."}
          </DialogDescription>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"><Building2 className="w-4 h-4" /> Conciergerie</p>
              <div className="grid grid-cols-2 gap-2">
                {conciergerie.map(svc => (
                  <button key={svc.id} onClick={() => handleSelectService(svc)}
                    className="text-left p-3 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-all">
                    <span className="text-lg">{svc.icon}</span>
                    <p className="text-sm font-medium mt-1">{svc.label}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"><BarChart3 className="w-4 h-4" /> Stratégie d'Affaires</p>
              <div className="grid grid-cols-2 gap-2">
                {strategie.map(svc => (
                  <button key={svc.id} onClick={() => handleSelectService(svc)}
                    className="text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                    <span className="text-lg">{svc.icon}</span>
                    <p className="text-sm font-medium mt-1">{svc.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "details" && selected && (
          <div className="space-y-4">
            {selected.category === "conciergerie" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Surface (m²)</Label>
                    <Input type="number" placeholder="ex: 200" value={form.squareMeters}
                      onChange={e => setForm(f => ({ ...f, squareMeters: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Type de local</Label>
                    <Select value={form.commercialVenueType} onValueChange={v => setForm(f => ({ ...f, commercialVenueType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bureau">Bureau</SelectItem>
                        <SelectItem value="commerce">Commerce de détail</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="clinique">Clinique / Pharmacie</SelectItem>
                        <SelectItem value="entrepot">Entrepôt</SelectItem>
                        <SelectItem value="garderie">Garderie</SelectItem>
                        <SelectItem value="gym">Gym / Centre sportif</SelectItem>
                        <SelectItem value="residentiel">Résidentiel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fréquence souhaitée</Label>
                    <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Ponctuel (1 fois)</SelectItem>
                        <SelectItem value="biweekly">Aux 2 semaines</SelectItem>
                        <SelectItem value="weekly">1 fois/semaine</SelectItem>
                        <SelectItem value="2x-week">2 fois/semaine</SelectItem>
                        <SelectItem value="3x-week">3 fois/semaine</SelectItem>
                        <SelectItem value="daily">5 jours/semaine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Produits d'entretien</Label>
                    <Select value={form.productOption} onValueChange={v => setForm(f => ({ ...f, productOption: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beaurive-provides">BeauRive fournit</SelectItem>
                        <SelectItem value="client-provides">Je fournis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Titre du projet</Label>
                  <Input placeholder="ex: Création site web pour ma boutique" value={form.projectTitle}
                    onChange={e => setForm(f => ({ ...f, projectTitle: e.target.value }))} />
                </div>
                <div>
                  <Label>Description du projet</Label>
                  <Textarea placeholder="Décrivez votre projet, vos objectifs, votre clientèle cible..." rows={3}
                    value={form.projectDescription}
                    onChange={e => setForm(f => ({ ...f, projectDescription: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Budget approximatif</Label>
                    <Input placeholder="ex: 2 000 $ – 5 000 $" value={form.budget}
                      onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Délai souhaité</Label>
                    <Input placeholder="ex: 4 à 6 semaines" value={form.timeline}
                      onChange={e => setForm(f => ({ ...f, timeline: e.target.value }))} />
                  </div>
                </div>
              </>
            )}

            {/* ─── BUDGET PROPOSÉ ─────────────────────────────────────────── */}
            <div className="rounded-xl border-2 border-dashed border-teal-300 bg-teal-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💰</span>
                <Label className="text-teal-800 font-semibold text-sm">
                  Votre proposition de prix (facultatif)
                </Label>
              </div>
              <p className="text-xs text-teal-700 mb-3">
                Indiquez le budget mensuel ou total que vous souhaitez investir. Nous en tiendrons compte pour adapter notre offre.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-600">Montant proposé ($)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <Input
                      type="number"
                      placeholder="ex: 1 500"
                      value={form.budget}
                      onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                      className="pl-7 border-teal-200 focus:border-teal-400"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Type de budget</Label>
                  <Select
                    value={form.timeline}
                    onValueChange={v => setForm(f => ({ ...f, timeline: v }))}
                  >
                    <SelectTrigger className="border-teal-200">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="par-visite">Par visite</SelectItem>
                      <SelectItem value="par-mois">Par mois</SelectItem>
                      <SelectItem value="par-annee">Par année</SelectItem>
                      <SelectItem value="total-projet">Total du projet</SelectItem>
                      <SelectItem value="a-negocier">À négocier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label>Notes supplémentaires (facultatif)</Label>
              <Textarea placeholder="Informations complémentaires, contraintes particulières..." rows={2}
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("select")} className="flex-1">← Retour</Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
                {loading ? "Envoi en cours..." : "Soumettre la demande"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
