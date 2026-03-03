import { format } from "date-fns";
import { fr } from "date-fns/locale";

export interface ContractPDFData {
  contractNumber: string;
  title: string;
  content: string;
  type: string;
  status: string;
  monthlyAmount?: number | null;
  durationMonths?: number | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  clientName?: string | null;
  clientCompany?: string | null;
  clientEmail?: string | null;
  clientSignedAt?: string | Date | null;
  clientSignedName?: string | null;
  adminSignedAt?: string | Date | null;
  adminSignedName?: string | null;
  clientSignedIp?: string | null;
  createdAt?: string | Date | null;
}

const TYPE_LABELS: Record<string, string> = {
  menage: "Entretien ménager",
  "menage-commercial": "Entretien ménager commercial",
  "menage-residentiel": "Entretien ménager résidentiel",
  "apres-construction": "Nettoyage après construction",
  "apres-renovation": "Nettoyage après rénovation",
  strategie: "Stratégie d’affaires",
  "strategie-affaires": "Stratégie d’affaires",
  ia: "Intelligence Artificielle",
  autre: "Services Divers",
};

const STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé",
  "signe-client": "Signé par le client",
  "signe-admin": "Signé par les deux parties",
  actif: "Actif",
  annule: "Annulé",
  complet: "Complété",
};

function fmt(cents: number) {
  return (cents / 100).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
}

/**
 * Ouvre une fenêtre d'impression avec le contrat formaté en HTML professionnel.
 * Le navigateur propose ensuite "Enregistrer en PDF".
 */
export function printContractAsPDF(contract: ContractPDFData) {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    alert("Veuillez autoriser les fenêtres popup pour télécharger le PDF.");
    return;
  }

  const today = format(new Date(), "d MMMM yyyy", { locale: fr });
  const typeLabel = TYPE_LABELS[contract.type] ?? contract.type ?? "Services";
  const statusLabel = STATUS_LABELS[contract.status] ?? contract.status;
  const isSigned = !!contract.clientSignedAt && !!contract.adminSignedAt;

  // Formater le contenu du contrat (remplacer les sauts de ligne par <br>)
  const formattedContent = (contract.content ?? "")
    .split("\n")
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return "<br/>";
      // Titres de section (tout en majuscules ou commençant par des chiffres)
      if (/^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ\s\-–:]{5,}$/.test(trimmed) || /^\d+\./.test(trimmed)) {
        return `<p class="section-title">${trimmed}</p>`;
      }
      if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
        return `<p class="bullet">${trimmed}</p>`;
      }
      return `<p>${trimmed}</p>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Contrat ${contract.contractNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; font-size: 11pt; color: #1a1a2e; background: #fff; }
    .page { max-width: 800px; margin: 0 auto; padding: 40px 50px; }

    /* EN-TÊTE */
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 3px solid #003d7a; margin-bottom: 24px; }
    .header-left .company-name { font-size: 22pt; font-weight: 700; color: #003d7a; letter-spacing: -0.5px; }
    .header-left .company-sub { font-size: 10pt; color: #00a896; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .header-left .company-info { font-size: 9pt; color: #666; margin-top: 4px; }
    .header-right { text-align: right; }
    .header-right .doc-type { font-size: 14pt; font-weight: 700; color: #003d7a; text-transform: uppercase; }
    .header-right .doc-number { font-size: 11pt; font-weight: 600; color: #444; margin-top: 4px; font-family: monospace; }
    .header-right .doc-date { font-size: 9pt; color: #888; margin-top: 2px; }
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 9pt; font-weight: 600; margin-top: 6px;
      background: ${isSigned ? "#d1fae5" : "#dbeafe"}; color: ${isSigned ? "#065f46" : "#1e40af"}; }

    /* TITRE DU CONTRAT */
    .contract-title { font-size: 16pt; font-weight: 700; color: #003d7a; text-align: center; margin: 20px 0 8px; }
    .contract-type { font-size: 10pt; color: #00a896; text-align: center; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 24px; }

    /* PARTIES */
    .parties-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .party-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; background: #f9fafb; }
    .party-box.highlight { border-color: #003d7a; background: #eff6ff; }
    .party-label { font-size: 8pt; font-weight: 700; color: #003d7a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .party-name { font-size: 11pt; font-weight: 700; color: #1a1a2e; }
    .party-detail { font-size: 9pt; color: #555; margin-top: 2px; }

    /* RÉSUMÉ FINANCIER */
    .financial-summary { background: linear-gradient(135deg, #003d7a 0%, #00a896 100%); color: white; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .financial-summary .amount { font-size: 20pt; font-weight: 700; }
    .financial-summary .amount-label { font-size: 9pt; opacity: 0.85; }
    .financial-summary .details { text-align: right; font-size: 9pt; opacity: 0.9; }

    /* CONTENU */
    .content-section { margin-bottom: 24px; }
    .content-section p { margin-bottom: 6px; line-height: 1.6; color: #333; }
    .content-section .section-title { font-size: 10pt; font-weight: 700; color: #003d7a; text-transform: uppercase; letter-spacing: 0.5px; margin: 14px 0 6px; padding-bottom: 3px; border-bottom: 1px solid #e5e7eb; }
    .content-section .bullet { padding-left: 16px; color: #444; }
    .content-section .bullet::before { content: ""; }

    /* SIGNATURES */
    .signatures-section { margin-top: 30px; padding-top: 20px; border-top: 2px solid #003d7a; }
    .signatures-title { font-size: 12pt; font-weight: 700; color: #003d7a; margin-bottom: 16px; text-align: center; }
    .signatures-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .sig-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
    .sig-box.signed { border-color: #10b981; background: #f0fdf4; }
    .sig-box.unsigned { border-color: #d1d5db; background: #f9fafb; }
    .sig-label { font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #666; margin-bottom: 8px; }
    .sig-name { font-size: 11pt; font-weight: 600; color: #1a1a2e; }
    .sig-date { font-size: 9pt; color: #555; margin-top: 3px; }
    .sig-ip { font-size: 8pt; color: #999; margin-top: 2px; font-family: monospace; }
    .sig-line { border-top: 1px solid #ccc; margin-top: 30px; padding-top: 6px; }
    .sig-pending { font-size: 10pt; color: #9ca3af; font-style: italic; }
    .sig-check { color: #10b981; font-size: 12pt; font-weight: 700; }

    /* PIED DE PAGE */
    .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 8pt; color: #9ca3af; }

    /* IMPRESSION */
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 20px 30px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- EN-TÊTE -->
    <div class="header">
      <div class="header-left">
        <div class="company-name">BeauRive Solutions</div>
        <div class="company-sub">Multi-Service</div>
        <div class="company-info">Québec, Canada &nbsp;|&nbsp; 581-349-2323 &nbsp;|&nbsp; info@beaurive.ca</div>
      </div>
      <div class="header-right">
        <div class="doc-type">Contrat de Services</div>
        <div class="doc-number">${contract.contractNumber}</div>
        <div class="doc-date">Émis le ${today}</div>
        <div class="status-badge">${statusLabel}</div>
      </div>
    </div>

    <!-- TITRE -->
    <div class="contract-title">${contract.title}</div>
    <div class="contract-type">${typeLabel}</div>

    <!-- PARTIES -->
    <div class="parties-grid">
      <div class="party-box highlight">
        <div class="party-label">Le Prestataire</div>
        <div class="party-name">BeauRive Solutions Multi-Service</div>
        <div class="party-detail">581-349-2323</div>
        <div class="party-detail">info@beaurive.ca</div>
        <div class="party-detail">Québec, Canada</div>
        <div class="party-detail" style="margin-top:6px; font-size:8pt; color:#003d7a;">NEQ : [Numéro d'entreprise]</div>
      </div>
      <div class="party-box">
        <div class="party-label">Le Client</div>
        <div class="party-name">${contract.clientName ?? "—"}</div>
        ${contract.clientCompany ? `<div class="party-detail">${contract.clientCompany}</div>` : ""}
        ${contract.clientEmail ? `<div class="party-detail">${contract.clientEmail}</div>` : ""}
      </div>
    </div>

    <!-- RÉSUMÉ FINANCIER -->
    ${contract.monthlyAmount ? `
    <div class="financial-summary">
      <div>
        <div class="amount-label">Montant mensuel convenu</div>
        <div class="amount">${fmt(contract.monthlyAmount * 100)}</div>
      </div>
      <div class="details">
        ${contract.durationMonths ? `<div>Durée : ${contract.durationMonths} mois</div>` : ""}
        ${contract.startDate ? `<div>Début : ${format(new Date(contract.startDate), "d MMMM yyyy", { locale: fr })}</div>` : ""}
        ${contract.endDate ? `<div>Fin : ${format(new Date(contract.endDate), "d MMMM yyyy", { locale: fr })}</div>` : ""}
        <div>Paiement : Net 30 jours</div>
      </div>
    </div>
    ` : ""}

    <!-- CONTENU DU CONTRAT -->
    <div class="content-section">
      ${formattedContent}
    </div>

    <!-- SIGNATURES -->
    <div class="signatures-section">
      <div class="signatures-title">Signatures électroniques</div>
      <div class="signatures-grid">
        <div class="sig-box ${contract.clientSignedAt ? "signed" : "unsigned"}">
          <div class="sig-label">Signature du client</div>
          ${contract.clientSignedAt ? `
            <div class="sig-check">✓ Signé électroniquement</div>
            <div class="sig-name">${contract.clientSignedName ?? "Client"}</div>
            <div class="sig-date">${format(new Date(contract.clientSignedAt), "d MMMM yyyy à HH:mm", { locale: fr })}</div>
            ${contract.clientSignedIp ? `<div class="sig-ip">IP : ${contract.clientSignedIp}</div>` : ""}
          ` : `
            <div class="sig-line"><div class="sig-pending">En attente de signature</div></div>
          `}
        </div>
        <div class="sig-box ${contract.adminSignedAt ? "signed" : "unsigned"}">
          <div class="sig-label">Signature de BeauRive Solutions</div>
          ${contract.adminSignedAt ? `
            <div class="sig-check">✓ Signé électroniquement</div>
            <div class="sig-name">${contract.adminSignedName ?? "BeauRive Solutions"}</div>
            <div class="sig-date">${format(new Date(contract.adminSignedAt), "d MMMM yyyy à HH:mm", { locale: fr })}</div>
          ` : `
            <div class="sig-line"><div class="sig-pending">En attente de signature</div></div>
          `}
        </div>
      </div>
      <p style="font-size:8pt; color:#9ca3af; text-align:center; margin-top:12px;">
        Les signatures électroniques apposées sur ce document sont légalement valides conformément à la Loi concernant le cadre juridique des technologies de l'information (LCCJTI) du Québec.
      </p>
    </div>

    <!-- PIED DE PAGE -->
    <div class="footer">
      <span>BeauRive Solutions Multi-Service &nbsp;|&nbsp; Québec, Canada &nbsp;|&nbsp; info@beaurive.ca &nbsp;|&nbsp; 581-349-2323</span>
      <span>Document généré le ${today}</span>
    </div>

    <!-- BOUTON IMPRESSION (masqué à l'impression) -->
    <div class="no-print" style="text-align:center; margin-top:30px;">
      <button onclick="window.print()" style="background:#003d7a; color:white; border:none; padding:12px 32px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer;">
        🖨️ Télécharger / Imprimer en PDF
      </button>
    </div>
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
  // Lancer l'impression automatiquement après chargement
  printWindow.onload = () => {
    setTimeout(() => printWindow.print(), 500);
  };
}
