import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  DollarSign, TrendingUp, TrendingDown, Clock, AlertTriangle,
  CheckCircle2, FileText, Users, BarChart3, RefreshCw,
  ChevronDown, ChevronUp, ArrowUpRight, Banknote, CalendarCheck,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// ── Utilitaires ────────────────────────────────────────────────────────────────
const cad = (cents: number) =>
  (cents / 100).toLocaleString("fr-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2 });

const statutFactureLabel: Record<string, string> = {
  brouillon: "Brouillon", envoyee: "Envoyée", vue: "Vue", payee: "Payée", annulee: "Annulée",
};
const statutFactureCouleur: Record<string, string> = {
  brouillon: "bg-gray-100 text-gray-700",
  envoyee: "bg-blue-100 text-blue-700",
  vue: "bg-purple-100 text-purple-700",
  payee: "bg-green-100 text-green-700",
  annulee: "bg-red-100 text-red-700",
};
const contractStatusLabel: Record<string, string> = {
  prospect: "Prospect", negociation: "Négociation", actif: "Actif",
  suspendu: "Suspendu", termine: "Terminé",
};
const contractStatusColor: Record<string, string> = {
  prospect: "bg-gray-100 text-gray-600",
  negociation: "bg-yellow-100 text-yellow-700",
  actif: "bg-green-100 text-green-700",
  suspendu: "bg-orange-100 text-orange-700",
  termine: "bg-red-100 text-red-700",
};

// ── Composant KPI Card ─────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon, label, value, sub, color, trend,
}: {
  icon: any; label: string; value: string; sub?: string; color: string; trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"}`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Tooltip graphique ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name} : {p.name === "Factures" ? p.value : cad(p.value)}
        </p>
      ))}
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────────
export default function ComptabiliteAdmin() {
  const { data, isLoading, isFetching, refetch } = trpc.comptabilite.getStats.useQuery();
  const updateStatus = trpc.comptabilite.updateInvoiceStatus.useMutation({
    onSuccess: () => { refetch(); toast.success("Statut mis à jour"); },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
  const [refreshed, setRefreshed] = useState(false);
  const handleRefresh = async () => {
    await refetch();
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 2500);
  };

  const [filtreFacture, setFiltreFacture] = useState<"tous" | "envoyee" | "payee" | "annulee" | "retard">("tous");
  const [filtreClient, setFiltreClient] = useState<"tous" | "actif" | "retard" | "prospect">("tous");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [sortClient, setSortClient] = useState<"nom" | "totalPaye" | "totalDu">("nom");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedClient, setExpandedClient] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-[#003d7a]" />
        <span className="ml-3 text-gray-600">Chargement des données comptables…</span>
      </div>
    );
  }

  if (!data) return <p className="text-center text-gray-500 py-10">Aucune donnée disponible.</p>;

  const { kpis, caParMois, clients, facturesRecentes } = data;
  const now = new Date();

  // ── Filtrage factures ──────────────────────────────────────────────────────
  const facturesFiltrees = facturesRecentes.filter(f => {
    if (filtreFacture === "tous") return true;
    if (filtreFacture === "retard") {
      return ["envoyee", "vue"].includes(f.statut) && f.dateEcheance && new Date(f.dateEcheance) < now;
    }
    return f.statut === filtreFacture;
  });

  // ── Filtrage clients ───────────────────────────────────────────────────────
  const clientsFiltres = clients.filter(c => {
    if (filtreClient === "tous") return true;
    if (filtreClient === "actif") return c.contratActif;
    if (filtreClient === "retard") return c.facturesEnRetard > 0;
    if (filtreClient === "prospect") return c.contractStatus === "prospect";
    return true;
  }).sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortClient === "nom") return a.nom.localeCompare(b.nom) * dir;
    if (sortClient === "totalPaye") return (a.totalPaye - b.totalPaye) * dir;
    if (sortClient === "totalDu") return (a.totalDu - b.totalDu) * dir;
    return 0;
  });

  const toggleSort = (col: typeof sortClient) => {
    if (sortClient === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortClient(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: typeof sortClient }) =>
    sortClient === col
      ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />
      : null;

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003d7a]">Comptabilité</h2>
          <p className="text-sm text-gray-500 mt-0.5">Suivi financier, chiffre d'affaires et paiements clients</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          className={`gap-2 transition-all duration-300 ${
            refreshed ? "border-green-500 text-green-600 bg-green-50" : ""
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Actualisation…" : refreshed ? "✓ Actualisé" : "Actualiser"}
        </Button>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={DollarSign} label="CA total encaissé" value={cad(kpis.totalCA)} sub="Toutes périodes confondues" color="bg-green-100 text-green-700" trend="up" />
        <KpiCard icon={TrendingUp} label="CA ce mois-ci" value={cad(kpis.caThisMonth)} sub={`Année en cours : ${cad(kpis.caThisYear)}`} color="bg-blue-100 text-blue-700" />
        <KpiCard icon={Clock} label="En attente de paiement" value={cad(kpis.totalPending)} sub={`${kpis.nbFacturesPendantes} facture(s)`} color="bg-yellow-100 text-yellow-700" />
        <KpiCard icon={AlertTriangle} label="En retard" value={cad(kpis.totalOverdue)} sub={`${kpis.nbFacturesEnRetard} facture(s) échues`} color="bg-red-100 text-red-700" trend="down" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Banknote} label="Revenu mensuel récurrent" value={cad(kpis.mrr)} sub={`ARR : ${cad(kpis.arr)}`} color="bg-indigo-100 text-indigo-700" />
        <KpiCard icon={Users} label="Clients actifs" value={String(kpis.nbClientsActifs)} sub={`${kpis.nbContratsEnAttente} contrat(s) en attente`} color="bg-teal-100 text-teal-700" />
        <KpiCard icon={CalendarCheck} label="Contrats signés" value={String(kpis.nbContratsSigne)} sub="Signés ou actifs" color="bg-purple-100 text-purple-700" />
        <KpiCard icon={ArrowUpRight} label="Taux de conversion" value={`${kpis.tauxConversion}%`} sub={`Taux de paiement : ${kpis.tauxPaiement}%`} color="bg-orange-100 text-orange-700" />
      </div>

      {/* ── Graphique CA mensuel ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-[#003d7a] flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Chiffre d'affaires mensuel (12 derniers mois)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {caParMois.every(m => m.ca === 0) ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <BarChart3 className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Aucune facture payée pour l'instant. Les données apparaîtront ici dès le premier paiement.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={caParMois} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => `${(v / 100).toLocaleString("fr-CA", { notation: "compact" })}$`} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="ca" name="CA ($)" fill="#003d7a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="factures" name="Factures" fill="#00a896" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Tableau des clients ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base font-semibold text-[#003d7a] flex items-center gap-2">
              <Users className="w-4 h-4" /> Suivi par client ({clientsFiltres.length})
            </CardTitle>
            <Select value={filtreClient} onValueChange={v => setFiltreClient(v as any)}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les clients</SelectItem>
                <SelectItem value="actif">Contrat actif</SelectItem>
                <SelectItem value="retard">Paiement en retard</SelectItem>
                <SelectItem value="prospect">Prospects</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-[#003d7a]" onClick={() => toggleSort("nom")}>
                    Client <SortIcon col="nom" />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Contrat</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-[#003d7a]" onClick={() => toggleSort("totalPaye")}>
                    Total payé <SortIcon col="totalPaye" />
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-[#003d7a]" onClick={() => toggleSort("totalDu")}>
                    Solde dû <SortIcon col="totalDu" />
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Retard</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Dernière facture</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {clientsFiltres.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400">Aucun client trouvé.</td></tr>
                ) : clientsFiltres.map(c => (
                  <>
                    <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50 transition ${expandedClient === c.id ? "bg-blue-50/30" : ""}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{c.nom}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${contractStatusColor[c.contractStatus] ?? "bg-gray-100 text-gray-600"}`}>
                          {contractStatusLabel[c.contractStatus] ?? c.contractStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {c.contratSigne ? (
                          <div className="flex items-center gap-1 text-green-700">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-medium">Signé</span>
                            {c.contratNumero && <span className="text-xs text-gray-400 ml-1">{c.contratNumero}</span>}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Non signé</span>
                        )}
                        {c.montantMensuel ? (
                          <p className="text-xs text-gray-500 mt-0.5">{cad(c.montantMensuel)}/mois</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">{cad(c.totalPaye)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-yellow-700">{c.totalDu > 0 ? cad(c.totalDu) : <span className="text-gray-400 font-normal">—</span>}</td>
                      <td className="px-4 py-3 text-center">
                        {c.facturesEnRetard > 0 ? (
                          <Badge className="bg-red-100 text-red-700 text-xs">{c.facturesEnRetard} en retard</Badge>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {c.derniereFacture ? (
                          <div>
                            <p className="text-xs font-medium text-gray-700">{c.derniereFacture.numero}</p>
                            <Badge className={`text-xs mt-0.5 ${statutFactureCouleur[c.derniereFacture.statut] ?? ""}`}>
                              {statutFactureLabel[c.derniereFacture.statut]}
                            </Badge>
                          </div>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setExpandedClient(expandedClient === c.id ? null : c.id)}
                        >
                          {expandedClient === c.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </td>
                    </tr>
                    {expandedClient === c.id && (
                      <tr key={`${c.id}-detail`} className="bg-blue-50/20">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-700 mb-1">Informations financières</p>
                              <p className="text-gray-600">Nombre de factures : <span className="font-semibold">{c.nbFactures}</span></p>
                              <p className="text-gray-600">Total encaissé : <span className="font-semibold text-green-700">{cad(c.totalPaye)}</span></p>
                              <p className="text-gray-600">Solde en attente : <span className="font-semibold text-yellow-700">{cad(c.totalDu)}</span></p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700 mb-1">Contrat</p>
                              {c.contratSigne ? (
                                <>
                                  <p className="text-gray-600">Numéro : <span className="font-semibold">{c.contratNumero ?? "—"}</span></p>
                                  <p className="text-gray-600">Montant mensuel : <span className="font-semibold">{c.montantMensuel ? cad(c.montantMensuel) : "—"}</span></p>
                                  <p className="text-green-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Contrat signé</p>
                                </>
                              ) : (
                                <p className="text-gray-400">Aucun contrat signé</p>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-700 mb-1">Service</p>
                              <p className="text-gray-600 capitalize">{c.serviceType?.replace(/-/g, " ") ?? "—"}</p>
                              <p className="text-gray-600">Client depuis : <span className="font-semibold">
                                {c.createdAt ? format(new Date(c.createdAt), "d MMM yyyy", { locale: fr }) : "—"}
                              </span></p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Tableau des factures ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base font-semibold text-[#003d7a] flex items-center gap-2">
              <FileText className="w-4 h-4" /> Factures récentes ({facturesFiltrees.length})
            </CardTitle>
            <Select value={filtreFacture} onValueChange={v => setFiltreFacture(v as any)}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Toutes les factures</SelectItem>
                <SelectItem value="envoyee">Envoyées</SelectItem>
                <SelectItem value="payee">Payées</SelectItem>
                <SelectItem value="retard">En retard</SelectItem>
                <SelectItem value="annulee">Annulées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Numéro</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Catégorie</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Montant</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Échéance</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Paiement</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {facturesFiltrees.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400">Aucune facture trouvée.</td></tr>
                ) : facturesFiltrees.map(f => {
                  const isOverdue = ["envoyee", "vue"].includes(f.statut) && f.dateEcheance && new Date(f.dateEcheance) < now;
                  return (
                    <tr key={f.id} className={`border-b border-gray-50 hover:bg-gray-50 transition ${isOverdue ? "bg-red-50/30" : ""}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{f.numero}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{f.clientNom}</td>
                      <td className="px-4 py-3 capitalize text-gray-600">{f.categorie}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{cad(f.montant)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Badge className={`text-xs ${statutFactureCouleur[f.statut] ?? ""}`}>
                            {statutFactureLabel[f.statut]}
                          </Badge>
                          {isOverdue && <Badge className="text-xs bg-red-100 text-red-700">En retard</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {f.dateEcheance ? format(new Date(f.dateEcheance), "d MMM yyyy", { locale: fr }) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {f.datePaiement ? (
                          <span className="text-green-700 font-medium">{format(new Date(f.datePaiement), "d MMM yyyy", { locale: fr })}</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {f.statut !== "payee" && f.statut !== "annulee" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() => setSelectedInvoice(f)}
                          >
                            Modifier
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Dialog mise à jour statut facture ── */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Mettre à jour la facture</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-sm text-gray-600 mb-1">Facture : <span className="font-semibold">{selectedInvoice.numero}</span></p>
                <p className="text-sm text-gray-600 mb-1">Client : <span className="font-semibold">{selectedInvoice.clientNom}</span></p>
                <p className="text-sm text-gray-600">Montant : <span className="font-semibold">{cad(selectedInvoice.montant)}</span></p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Nouveau statut :</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["envoyee", "vue", "payee", "annulee"] as const).map(s => (
                    <Button
                      key={s}
                      variant={selectedInvoice.statut === s ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      disabled={updateStatus.isPending}
                      onClick={() => {
                        updateStatus.mutate({ invoiceId: selectedInvoice.id, status: s });
                        setSelectedInvoice(null);
                      }}
                    >
                      {statutFactureLabel[s]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
