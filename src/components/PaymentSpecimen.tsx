import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, CheckCircle, CreditCard, Smartphone, Building2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentSpecimenProps {
  invoiceNumber?: string;
  amount?: number; // en cents
}

function fmt(cents: number) {
  return (cents / 100).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
}

function CopyBtn({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          toast.success(`${label} copié !`);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors ml-2 flex-shrink-0"
      title={`Copier ${label}`}
    >
      {copied ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copié" : "Copier"}
    </button>
  );
}

function Row({ label, value, copyLabel }: { label: string; value: string; copyLabel?: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <div className="flex items-center">
        <span className="font-semibold text-gray-800 text-sm text-right">{value}</span>
        {copyLabel && <CopyBtn value={value} label={copyLabel} />}
      </div>
    </div>
  );
}

export default function PaymentSpecimen({ invoiceNumber, amount }: PaymentSpecimenProps) {
  // ─── Coordonnées officielles BeauRive ───────────────────────────────────────
  const INTERAC_EMAIL   = "info@beaurive.ca";
  const INTERAC_MSG     = invoiceNumber ? `Paiement facture ${invoiceNumber}` : "Paiement BeauRive Solutions";
  const CHEQUE_PAYABLE  = "BeauRive Solutions";
  const DEPOT_NOM       = "BeauRive Solutions";
  const DEPOT_INSTITUTION = "815";
  const DEPOT_TRANSIT   = "20439";
  const DEPOT_COMPTE    = "051393-7";
  const DEPOT_FORMAT    = `${DEPOT_INSTITUTION}–${DEPOT_TRANSIT}–${DEPOT_COMPTE}`;

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-teal-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-blue-900">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Modes de Paiement Acceptés
          {amount && (
            <Badge className="ml-auto bg-blue-600 text-white text-sm font-bold">
              {fmt(amount)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="interac">
          <TabsList className="w-full mb-4 grid grid-cols-3">
            <TabsTrigger value="interac" className="gap-1 text-xs">
              <Smartphone className="w-3 h-3" /> Interac
            </TabsTrigger>
            <TabsTrigger value="depot" className="gap-1 text-xs">
              <Building2 className="w-3 h-3" /> Dépôt direct
            </TabsTrigger>
            <TabsTrigger value="cheque" className="gap-1 text-xs">
              <CreditCard className="w-3 h-3" /> Chèque
            </TabsTrigger>
          </TabsList>

          {/* ─── VIREMENT INTERAC ─── */}
          <TabsContent value="interac">
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-yellow-300 bg-white shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-2 flex items-center justify-between">
                  <span className="font-bold text-yellow-900 text-sm tracking-wide">VIREMENT INTERAC®</span>
                  <span className="text-yellow-900 text-xs font-medium">e-Transfer</span>
                </div>
                <div className="p-4">
                  <Row label="Envoyer à" value={INTERAC_EMAIL} copyLabel="courriel" />
                  <Row label="Bénéficiaire" value="BeauRive Solutions" />
                  {amount && <Row label="Montant" value={fmt(amount)} />}
                  <div className="flex justify-between items-start py-1.5">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Message obligatoire</span>
                    <div className="flex items-center">
                      <span className="font-mono text-xs bg-yellow-50 border border-yellow-200 px-2 py-1 rounded text-yellow-800">
                        {INTERAC_MSG}
                      </span>
                      <CopyBtn value={INTERAC_MSG} label="message" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-center">
                  Virement instantané · Accepté 24h/7j · Aucuns frais pour le client
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800 space-y-1">
                <p className="font-semibold text-sm">Instructions :</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Connectez-vous à votre application bancaire</li>
                  <li>Sélectionnez <strong>Virement Interac</strong></li>
                  <li>Entrez l'adresse : <strong>{INTERAC_EMAIL}</strong></li>
                  <li>Message obligatoire : <strong>{INTERAC_MSG}</strong></li>
                  {amount && <li>Montant : <strong>{fmt(amount)}</strong></li>}
                  <li>Confirmez — aucun mot de passe requis</li>
                </ol>
              </div>
            </div>
          </TabsContent>

          {/* ─── DÉPÔT DIRECT ─── */}
          <TabsContent value="depot">
            <div className="space-y-4">
              {/* Spécimen visuel dépôt direct */}
              <div className="rounded-xl border-2 border-green-300 bg-white shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-2 flex items-center justify-between">
                  <span className="font-bold text-white text-sm tracking-wide">DÉPÔT DIRECT</span>
                  <span className="text-green-100 text-xs font-medium">Virement bancaire</span>
                </div>
                <div className="p-4">
                  <Row label="Nom du compte" value={DEPOT_NOM} />
                  <Row label="Numéro d'institution" value={DEPOT_INSTITUTION} copyLabel="institution" />
                  <Row label="Numéro de transit" value={DEPOT_TRANSIT} copyLabel="transit" />
                  <Row label="Numéro de compte" value={DEPOT_COMPTE} copyLabel="compte" />
                  {amount && <Row label="Montant" value={fmt(amount)} />}
                </div>
                {/* Format complet */}
                <div className="bg-green-50 px-4 py-3 border-t border-green-100">
                  <p className="text-xs text-gray-500 mb-1">Format complet :</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-green-800 text-base tracking-widest">{DEPOT_FORMAT}</span>
                    <CopyBtn value={DEPOT_FORMAT} label="format complet" />
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-center">
                  Institution 815 = Caisse Desjardins · Délai : 1–2 jours ouvrables
                </div>
              </div>

              {/* Spécimen de chèque visuel */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden font-mono text-xs">
                <div className="bg-slate-700 px-3 py-1.5 flex justify-between">
                  <span className="text-white font-bold tracking-widest text-xs">SPÉCIMEN DE CHÈQUE</span>
                  <span className="text-slate-300 text-xs">VOID · ANNULÉ</span>
                </div>
                <div className="p-3 bg-gradient-to-br from-gray-50 to-blue-50/20 space-y-2">
                  <div className="flex gap-2 text-gray-600">
                    <span className="text-gray-400">Payable à :</span>
                    <span className="font-bold">{CHEQUE_PAYABLE}</span>
                  </div>
                  <div className="border-t border-dashed border-gray-300 pt-2 flex gap-6 text-gray-500">
                    <span>Transit : <strong className="text-gray-700">{DEPOT_TRANSIT}</strong></span>
                    <span>Institution : <strong className="text-gray-700">{DEPOT_INSTITUTION}</strong></span>
                    <span>Compte : <strong className="text-gray-700">{DEPOT_COMPTE}</strong></span>
                  </div>
                  <div className="text-center text-xs text-red-400 font-bold tracking-widest">
                    ⚠ SPÉCIMEN — NE PAS ENCAISSER
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 text-xs text-green-800 space-y-1">
                <p className="font-semibold text-sm">Instructions :</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Accédez à votre service de virement bancaire</li>
                  <li>Entrez les coordonnées ci-dessus</li>
                  <li>Indiquez en référence : <strong>{invoiceNumber ? `Facture ${invoiceNumber}` : "BeauRive Solutions"}</strong></li>
                  {amount && <li>Montant : <strong>{fmt(amount)}</strong></li>}
                  <li>Délai de traitement : 1 à 2 jours ouvrables</li>
                </ol>
              </div>
            </div>
          </TabsContent>

          {/* ─── CHÈQUE ─── */}
          <TabsContent value="cheque">
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-gray-300 bg-white shadow-sm overflow-hidden font-mono">
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2 flex items-center justify-between">
                  <span className="text-white font-bold text-sm tracking-widest">SPÉCIMEN DE CHÈQUE</span>
                  <span className="text-slate-300 text-xs">VOID · ANNULÉ</span>
                </div>
                <div className="p-4 space-y-3 bg-gradient-to-br from-gray-50 to-blue-50/30">
                  <div className="flex items-end gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Payable à l'ordre de :</span>
                    <div className="flex-1 border-b border-gray-400 pb-0.5 flex items-center justify-between">
                      <span className="font-bold text-gray-800 text-sm">{CHEQUE_PAYABLE}</span>
                      <CopyBtn value={CHEQUE_PAYABLE} label="nom" />
                    </div>
                  </div>
                  {amount && (
                    <div className="flex items-end gap-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">Montant :</span>
                      <div className="flex-1 border-b border-gray-400 pb-0.5">
                        <span className="font-bold text-green-700 text-base">{fmt(amount)}</span>
                      </div>
                    </div>
                  )}
                  {invoiceNumber && (
                    <div className="flex items-end gap-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">Mémo :</span>
                      <div className="flex-1 border-b border-gray-400 pb-0.5">
                        <span className="text-sm text-gray-700">Facture {invoiceNumber}</span>
                      </div>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-dashed border-gray-300">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Transit : <strong className="text-gray-600">{DEPOT_TRANSIT}</strong></span>
                      <span>Institution : <strong className="text-gray-600">{DEPOT_INSTITUTION}</strong></span>
                      <span>Compte : <strong className="text-gray-600">{DEPOT_COMPTE}</strong></span>
                    </div>
                    <div className="mt-2 text-center text-xs text-red-400 font-bold tracking-widest">
                      ⚠ SPÉCIMEN — NE PAS ENCAISSER
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-800 space-y-1">
                <p className="font-semibold text-sm">Instructions :</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Libeller le chèque à : <strong>{CHEQUE_PAYABLE}</strong></li>
                  {invoiceNumber && <li>Inscrire au mémo : <strong>Facture {invoiceNumber}</strong></li>}
                  {amount && <li>Montant : <strong>{fmt(amount)}</strong></li>}
                  <li>Envoyer par courrier ou remettre en mains propres</li>
                  <li>Délai de traitement : 3 à 5 jours ouvrables</li>
                </ol>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-gray-400 text-center mt-3">
          Questions ?{" "}
          <a href="mailto:info@beaurive.ca" className="text-blue-500 hover:underline">info@beaurive.ca</a>
          {" "}·{" "}
          <a href="tel:5813492323" className="text-blue-500 hover:underline">581-349-2323</a>
        </p>
      </CardContent>
    </Card>
  );
}
