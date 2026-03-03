import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  CreditCard, Copy, Check, Zap, Building2, FileText,
  CheckCircle2, Lock,
} from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  invoiceNumber: string;
  amount: number; // en cents
  invoiceId?: number;
}

function fmt(cents: number) {
  return (cents / 100).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
}

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border transition-all font-medium
        ${copied
          ? "bg-green-50 border-green-400 text-green-700"
          : "bg-white border-gray-300 text-[#003d7a] hover:bg-blue-50 hover:border-[#003d7a]"
        }`}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copié !" : (label || "Copier")}
    </button>
  );
}

type TabId = "interac" | "depot" | "cheque";

export default function PaymentModal({ open, onClose, invoiceNumber, amount, invoiceId }: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("interac");
  const createSession = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      toast.success("Redirection vers le paiement sécurisé…");
      window.open(data.url, "_blank");
      onClose();
    },
    onError: (err) => toast.error(err.message || "Erreur lors du paiement en ligne"),
  });
  const { data: stripeConfig } = trpc.stripe.isConfigured.useQuery();

  const interacMessage = `Paiement facture ${invoiceNumber}`;

  const tabs: { id: TabId; label: string; icon: any; badge?: string }[] = [
    { id: "interac", label: "Interac", icon: Zap, badge: "Populaire" },
    { id: "depot", label: "Dépôt direct", icon: Building2 },
    { id: "cheque", label: "Chèque", icon: FileText },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* En-tête */}
        <div className="bg-[#003d7a] text-white px-6 py-5 rounded-t-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">Modes de paiement acceptés</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-blue-200 text-sm">Facture {invoiceNumber}</p>
              <p className="text-2xl font-bold mt-0.5">{fmt(amount)}</p>
            </div>
            <Badge className="bg-white/20 text-white border-0 text-sm px-3 py-1">À payer</Badge>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Paiement en ligne par carte — si Stripe configuré */}
          {stripeConfig?.configured && invoiceId && (
            <div className="border-2 border-[#00a896] rounded-xl p-4 bg-teal-50/40">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-[#00a896]" />
                <span className="font-semibold text-gray-800">Paiement en ligne par carte</span>
                <Badge className="bg-[#00a896] text-white border-0 text-xs">Instantané</Badge>
              </div>
              <Button
                className="w-full bg-[#00a896] hover:bg-[#008f7e] text-white h-11 font-semibold gap-2"
                disabled={createSession.isPending}
                onClick={() => createSession.mutate({ invoiceId })}
              >
                <CreditCard className="w-4 h-4" />
                {createSession.isPending ? "Redirection…" : "Payer par carte de crédit"}
              </Button>
              <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-gray-500">
                <Lock className="w-3 h-3 text-green-600" />
                Paiement sécurisé par Stripe — SSL 256 bits
              </div>
            </div>
          )}

          {/* Séparateur */}
          {stripeConfig?.configured && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">ou payer autrement</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}

          {/* Onglets modes de paiement */}
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border-2 text-xs font-semibold transition-all
                  ${activeTab === tab.id
                    ? "border-[#003d7a] bg-blue-50 text-[#003d7a]"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                  <span className="text-[10px] bg-[#00a896] text-white px-1.5 py-0.5 rounded-full leading-none">{tab.badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* Contenu Interac */}
          {activeTab === "interac" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Zap className="w-4 h-4 text-[#00a896]" />
                VIREMENT INTERAC® e-Transfer
                <Badge className="bg-green-100 text-green-700 border-0 text-xs">Accepté 24h/7j</Badge>
              </div>

              {/* Infos à copier */}
              <div className="bg-gray-50 rounded-xl border divide-y text-sm">
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Envoyer à</p>
                    <p className="font-semibold text-gray-900 mt-0.5">info@beaurive.ca</p>
                  </div>
                  <CopyButton value="info@beaurive.ca" label="Copier" />
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Bénéficiaire</p>
                    <p className="font-semibold text-gray-900 mt-0.5">BeauRive Solutions</p>
                  </div>
                  <CopyButton value="BeauRive Solutions" label="Copier" />
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Montant</p>
                    <p className="font-bold text-[#003d7a] text-lg mt-0.5">{fmt(amount)}</p>
                  </div>
                  <CopyButton value={(amount / 100).toFixed(2)} label="Copier" />
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-yellow-50/60">
                  <div>
                    <p className="text-xs text-orange-600 uppercase tracking-wide font-semibold">⚠ Message obligatoire</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{interacMessage}</p>
                  </div>
                  <CopyButton value={interacMessage} label="Copier" />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800 space-y-1">
                <p className="font-semibold text-blue-900 mb-1.5">Instructions :</p>
                {[
                  "Connectez-vous à votre application bancaire",
                  "Sélectionnez Virement Interac",
                  `Entrez l'adresse : info@beaurive.ca`,
                  `Message obligatoire : ${interacMessage}`,
                  `Montant : ${fmt(amount)}`,
                  "Confirmez — aucun mot de passe requis",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#003d7a] text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center">Virement instantané · Aucuns frais pour le client</p>
            </div>
          )}

          {/* Contenu Dépôt direct */}
          {activeTab === "depot" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Building2 className="w-4 h-4 text-[#003d7a]" />
                Virement bancaire (EFT / Dépôt direct)
              </div>

              {/* Spécimen visuel dépôt direct */}
              <div className="rounded-xl border-2 border-green-300 bg-white shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-2 flex items-center justify-between">
                  <span className="font-bold text-white text-sm tracking-wide">DÉPÔT DIRECT</span>
                  <span className="text-green-100 text-xs font-medium">Virement bancaire</span>
                </div>
                <div className="divide-y text-sm">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Nom du compte</p>
                      <p className="font-semibold text-gray-900 mt-0.5">BeauRive Solutions</p>
                    </div>
                    <CopyButton value="BeauRive Solutions" label="Copier" />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Numéro d’institution</p>
                      <p className="font-semibold text-gray-900 mt-0.5 font-mono">815</p>
                    </div>
                    <CopyButton value="815" label="Copier" />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Numéro de transit</p>
                      <p className="font-semibold text-gray-900 mt-0.5 font-mono">20439</p>
                    </div>
                    <CopyButton value="20439" label="Copier" />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Numéro de compte</p>
                      <p className="font-semibold text-gray-900 mt-0.5 font-mono">051393-7</p>
                    </div>
                    <CopyButton value="051393-7" label="Copier" />
                  </div>
                  {amount > 0 && (
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Montant</p>
                        <p className="font-bold text-[#003d7a] text-lg mt-0.5">{fmt(amount)}</p>
                      </div>
                      <CopyButton value={(amount / 100).toFixed(2)} label="Copier" />
                    </div>
                  )}
                </div>
                {/* Format complet */}
                <div className="bg-green-50 px-4 py-3 border-t border-green-100">
                  <p className="text-xs text-gray-500 mb-1">Format complet :</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-green-800 text-base tracking-widest">815–20439–051393-7</span>
                    <CopyButton value="815-20439-051393-7" label="Copier" />
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-center">
                  Institution 815 = Caisse Desjardins · Délai : 1–2 jours ouvrables
                </div>
              </div>

              {/* Référence facture */}
              <div className="bg-gray-50 rounded-xl border divide-y text-sm">
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Référence obligatoire</p>
                    <p className="font-semibold text-gray-900 mt-0.5">Facture {invoiceNumber}</p>
                  </div>
                  <CopyButton value={`Facture ${invoiceNumber}`} label="Copier" />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800 space-y-1">
                <p className="font-semibold text-sm">Instructions :</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Accédez à votre service de virement bancaire</li>
                  <li>Entrez les coordonnées ci-dessus</li>
                  <li>Indiquez en référence : <strong>Facture {invoiceNumber}</strong></li>
                  <li>Montant : <strong>{fmt(amount)}</strong></li>
                  <li>Délai de traitement : 1 à 2 jours ouvrables</li>
                </ol>
              </div>
            </div>
          )}

          {/* Contenu Chèque */}
          {activeTab === "cheque" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <FileText className="w-4 h-4 text-[#003d7a]" />
                Paiement par chèque
              </div>

              {/* Spécimen visuel de chèque */}
              <div className="rounded-xl border-2 border-gray-300 bg-white shadow-sm overflow-hidden font-mono">
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2 flex items-center justify-between">
                  <span className="text-white font-bold text-sm tracking-widest">SPÉCIMEN DE CHÈQUE</span>
                  <span className="text-slate-300 text-xs">VOID · ANNULÉ</span>
                </div>
                <div className="p-4 space-y-3 bg-gradient-to-br from-gray-50 to-blue-50/30">
                  <div className="flex items-end gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Payable à l’ordre de :</span>
                    <div className="flex-1 border-b border-gray-400 pb-0.5 flex items-center justify-between">
                      <span className="font-bold text-gray-800 text-sm">BeauRive Solutions</span>
                      <CopyButton value="BeauRive Solutions" label="Copier" />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Montant :</span>
                    <div className="flex-1 border-b border-gray-400 pb-0.5 flex items-center justify-between">
                      <span className="font-bold text-green-700 text-base">{fmt(amount)}</span>
                      <CopyButton value={(amount / 100).toFixed(2)} label="Copier" />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Mémo :</span>
                    <div className="flex-1 border-b border-gray-400 pb-0.5 flex items-center justify-between">
                      <span className="text-sm text-gray-700">Facture {invoiceNumber}</span>
                      <CopyButton value={`Facture ${invoiceNumber}`} label="Copier" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-dashed border-gray-300">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Transit : <strong className="text-gray-600">20439</strong></span>
                      <span>Institution : <strong className="text-gray-600">815</strong></span>
                      <span>Compte : <strong className="text-gray-600">051393-7</strong></span>
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
                  <li>Libellé le chèque à : <strong>BeauRive Solutions</strong></li>
                  <li>Inscrire au mémo : <strong>Facture {invoiceNumber}</strong></li>
                  <li>Montant : <strong>{fmt(amount)}</strong></li>
                  <li>Remettre en personne ou envoyer par courrier</li>
                  <li>Délai de traitement : 3 à 5 jours ouvrables</li>
                </ol>
              </div>
              <p className="text-xs text-gray-500 text-center">Pour l’adresse postale, contactez-nous au <strong>581-349-2323</strong></p>
            </div>
          )}

          {/* Pied de page */}
          <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-gray-400 border-t">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            Questions ? info@beaurive.ca · 581-349-2323
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
