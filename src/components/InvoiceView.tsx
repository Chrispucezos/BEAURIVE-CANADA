import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Download, FileText, CreditCard } from "lucide-react";
import { useState } from "react";
import PaymentModal from "./PaymentModal";

export interface InvoiceLineItem {
  description: string;
  qty: number;
  unitPrice: number; // en cents
  total: number;     // en cents
}

export interface InvoiceData {
  id?: number;
  invoiceNumber: string;
  type: "pro-forma" | "finale" | "avoir";
  serviceCategory: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;       // en cents
  tpsAmount: number;
  tvqAmount: number;
  totalAmount: number;
  hasTaxes: number;
  status: string;
  notes?: string | null;
  dueDate?: Date | string | null;
  createdAt: Date | string;
  clientName?: string;
  clientCompany?: string;
  clientEmail?: string;
}

const STATUS_COLORS: Record<string, string> = {
  brouillon: "bg-gray-100 text-gray-600",
  envoyee: "bg-blue-100 text-blue-700",
  vue: "bg-orange-100 text-orange-700",
  payee: "bg-green-100 text-green-700",
  retard: "bg-red-100 text-red-700",
  annulee: "bg-red-100 text-red-600",
};
const STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  envoyee: "Non payée",
  vue: "Non payée — vue",
  payee: "Payée ✓",
  retard: "En retard !",
  annulee: "Annulée",
};
const TYPE_LABELS: Record<string, string> = {
  "pro-forma": "Facture Pro-Forma",
  "finale": "Facture Finale",
  "avoir": "Note de Crédit",
};

function fmt(cents: number) {
  return (cents / 100).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
}

function PayButton({ invoice }: { invoice: InvoiceData }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        className="w-full bg-[#003d7a] hover:bg-[#002d5a] text-white gap-2 h-11 text-base font-semibold shadow"
        onClick={() => setOpen(true)}
      >
        <CreditCard className="w-5 h-5" />
        Voir les modes de paiement
      </Button>
      <PaymentModal
        open={open}
        onClose={() => setOpen(false)}
        invoiceNumber={invoice.invoiceNumber}
        amount={invoice.totalAmount}
        invoiceId={invoice.id}
      />
    </>
  );
}

export function InvoiceView({ invoice, clientName, clientCompany, clientEmail, onDownload }: {
  invoice: InvoiceData;
  clientName?: string;
  clientCompany?: string;
  clientEmail?: string;
  onDownload?: () => void;
}) {
  const lineItems: InvoiceLineItem[] = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      {/* En-tête */}
      <div className="bg-[#003d7a] text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">BeauRive Solutions</h2>
            <p className="text-blue-200 text-sm">Multi-Service</p>
            <p className="text-blue-100 text-xs mt-1">Québec, Canada | 581-349-2323 | info@beaurive.ca</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{TYPE_LABELS[invoice.type] || invoice.type}</div>
            <div className="text-blue-200 font-mono text-sm mt-1">{invoice.invoiceNumber}</div>
            <div className="mt-2">
              <Badge className={`${STATUS_COLORS[invoice.status]} border-0`}>{STATUS_LABELS[invoice.status] || invoice.status}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Infos client + dates */}
      <div className="p-6 border-b grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Facturé à</p>
          <p className="font-semibold">{clientName || invoice.clientName || "—"}</p>
          {(clientCompany || invoice.clientCompany) && <p className="text-sm text-muted-foreground">{clientCompany || invoice.clientCompany}</p>}
          {(clientEmail || invoice.clientEmail) && <p className="text-sm text-muted-foreground">{clientEmail || invoice.clientEmail}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Dates</p>
          <p className="text-sm">
            <span className="text-muted-foreground">Émise le : </span>
            {format(new Date(invoice.createdAt), "d MMMM yyyy", { locale: fr })}
          </p>
          {invoice.dueDate && (
            <p className="text-sm">
              <span className="text-muted-foreground">Échéance : </span>
              {format(new Date(invoice.dueDate), "d MMMM yyyy", { locale: fr })}
            </p>
          )}
          <p className="text-sm mt-1">
            <span className="text-muted-foreground">Catégorie : </span>
            <span className="capitalize">{invoice.serviceCategory}</span>
          </p>
        </div>
      </div>

      {/* Lignes de facturation */}
      <div className="p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-muted-foreground font-medium">Description</th>
              <th className="text-right py-2 text-muted-foreground font-medium w-16">Qté</th>
              <th className="text-right py-2 text-muted-foreground font-medium w-28">Prix unit.</th>
              <th className="text-right py-2 text-muted-foreground font-medium w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-3 pr-4">{item.description}</td>
                <td className="py-3 text-right">{item.qty}</td>
                <td className="py-3 text-right">{fmt(item.unitPrice)}</td>
                <td className="py-3 text-right font-medium">{fmt(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totaux */}
        <div className="mt-4 flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{fmt(invoice.subtotal)}</span>
            </div>
            {invoice.hasTaxes ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TPS (5%)</span>
                  <span>{fmt(invoice.tpsAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVQ (9,975%)</span>
                  <span>{fmt(invoice.tvqAmount)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Taxes (résidentiel)</span>
                <span>Non applicable</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
              <span>Total</span>
              <span className="text-[#003d7a]">{fmt(invoice.totalAmount)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-muted-foreground">
            <strong>Notes : </strong>{invoice.notes}
          </div>
        )}

        {/* Conditions */}
        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>• Les prix sont en dollars canadiens (CAD). Les taxes applicables sont calculées selon les règles fiscales du Québec.</p>
          <p>• Cette {TYPE_LABELS[invoice.type]?.toLowerCase() || "facture"} est générée par BeauRive Solutions Multi-Service.</p>
          <p>• Pour toute question : info@beaurive.ca | 581-349-2323</p>
        </div>
      </div>

      {/* Bouton modes de paiement */}
      {invoice.status !== "payee" && invoice.status !== "annulee" && (
        <div className="px-6 pb-4">
          <PayButton invoice={invoice} />
        </div>
      )}

      {/* Bouton téléchargement */}
      {onDownload && (
        <div className="px-6 pb-6">
          <Button onClick={onDownload} className="w-full bg-[#003d7a] hover:bg-[#002d5a]">
            <Download className="w-4 h-4 mr-2" /> Télécharger en PDF
          </Button>
        </div>
      )}
    </div>
  );
}

export function InvoiceCard({ invoice, clientName, onClick, onDownload }: {
  invoice: InvoiceData;
  clientName?: string;
  onClick?: () => void;
  onDownload?: () => void;
}) {
  const isUnpaid = invoice.status !== "payee" && invoice.status !== "annulee" && invoice.status !== "brouillon";
  const isOverdue = invoice.status === "retard";
  return (
    <div className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow
      ${invoice.status === "payee" ? "border-l-4 border-l-green-500 bg-green-50/30" :
        isOverdue ? "border-l-4 border-l-red-500 bg-red-50/40" :
        isUnpaid ? "border-l-4 border-l-orange-400 bg-orange-50/30" :
        "border-l-4 border-l-gray-300"}`}
      onClick={onClick}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <FileText className="w-4 h-4 text-[#003d7a] shrink-0" />
            <span className="font-mono text-sm font-semibold">{invoice.invoiceNumber}</span>
            <Badge className={`${STATUS_COLORS[invoice.status] ?? "bg-gray-100 text-gray-600"} border-0 text-xs font-semibold`}>
              {STATUS_LABELS[invoice.status] ?? invoice.status}
            </Badge>
            {isOverdue && (
              <Badge className="bg-red-600 text-white border-0 text-xs animate-pulse">URGENT</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{TYPE_LABELS[invoice.type]} — {invoice.serviceCategory}</p>
          {clientName && <p className="text-xs text-muted-foreground">{clientName}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(invoice.createdAt), "d MMM yyyy", { locale: fr })}
            {invoice.dueDate && (
              <span className={`ml-2 font-medium ${isOverdue ? "text-red-600" : "text-orange-600"}`}>
                Échéance : {format(new Date(invoice.dueDate), "d MMM yyyy", { locale: fr })}
              </span>
            )}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className={`font-bold text-lg ${isUnpaid ? "text-orange-600" : "text-[#003d7a]"}`}>{fmt(invoice.totalAmount)}</p>
          <p className="text-xs text-muted-foreground">{invoice.hasTaxes ? "taxes incluses" : "sans taxes"}</p>
          <div className="flex flex-col gap-1 mt-2 items-end">
            {onDownload && (
              <Button size="sm" variant="outline" className="h-7 text-xs"
                onClick={e => { e.stopPropagation(); onDownload(); }}>
                <Download className="w-3 h-3 mr-1" /> PDF
              </Button>
            )}
            {isUnpaid && (
              <InvoiceCardPayButton invoice={invoice} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceCardPayButton({ invoice }: { invoice: InvoiceData }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="sm"
        className="h-8 text-xs bg-[#003d7a] hover:bg-[#002d5a] text-white gap-1 px-3 font-semibold shadow"
        onClick={e => { e.stopPropagation(); setOpen(true); }}
      >
        <CreditCard className="w-3.5 h-3.5" />
        Payer
      </Button>
      <PaymentModal
        open={open}
        onClose={() => setOpen(false)}
        invoiceNumber={invoice.invoiceNumber}
        amount={invoice.totalAmount}
        invoiceId={invoice.id}
      />
    </>
  );
}
