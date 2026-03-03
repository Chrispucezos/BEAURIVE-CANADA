import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calculator, TrendingDown, DollarSign, Zap, Send, CheckCircle2, FileDown, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useSearch } from "wouter";

// Tarification réaliste du Québec (2026) — Grille marché officielle
const PRICING_QUEBEC = {
  // Tarif horaire main-d'œuvre (incluant charges sociales ~30%)
  laborRate: 35, // $/heure (salaire + charges)
  
  // Tarifs de base par m² — valeurs minimales de la grille du marché québécois 2026
  baseRates: {
    "menage-commercial": 0.264, // $/m² — bureau simple
    "menage-residentiel": 0.36, // $/m² — entretien standard résidentiel
    "post-construction": 0.641, // $/m² — après construction
    "post-renovation": 0.641, // $/m² — après rénovation
  },

  // Tarifs spécifiques par type de lieu commercial ($/m²/visite)
  // Calibrés pour 5 620 $/mois sur 400 m² / 20 visites / produits inclus
  commercialVenueRates: {
    "bureau": 0.264,       // Bureau simple — référence marché
    "clinique": 0.336,     // Clinique / Pharmacie — risque + désinfection
    "restaurant": 0.40,    // Restaurant — cuisine + salle
    "entrepot": 0.176,     // Entrepôt simple — faible intensité
    "garderie": 0.368,     // Garderie — hygiène renforcée
    "gym": 0.32,           // Gym / Centre sportif
    "commerce": 0.28,      // Commerce de détail
    "autre": 0.28,         // Autre : tarif standard
  },

  // Prix minimum garanti par visite (couvre déplacement + main-d'œuvre minimale)
  minimumClientPrice: 90, // $ minimum affiché au client par visite (standard marché québécois)

  // Coûts des produits de nettoyage (pour services commerciaux)
  productCosts: {
    "beaurive-provides": 0.20, // $/m² si BeauRive fournit les produits (résidentiel)
    "client-provides": 0.00, // $/m² si client fournit les produits
  },

  // Tarif fixe par salle de bain (~20 min/sdb, main-d'œuvre incluse)
  bathroomCost: 18, // $ par salle de bain

  // Coûts additionnels (en $)
  additionalServices: {
    // Fenêtres : tarif fixe par fenêtre (taille moyenne maison québécoise ~1,2 m²)
    // Nettoyage intérieur + extérieur : ~8-12 $ / fenêtre standard
    windowPerUnit: 10, // $ par fenêtre (intérieur + extérieur)
    // Tapis : tarif fixe selon taille
    carpetSmall: 15,   // $ petit tapis (< 5 m², ex. entrée, salle de bain)
    carpetMedium: 30,  // $ tapis moyen (5-15 m², ex. salon)
    carpetLarge: 50,   // $ grand tapis (15-30 m², ex. salon + couloir)
    carpetXLarge: 80,  // $ très grand tapis (> 30 m², ex. moquette complète)
    disinfection: 0.40, // $/m² désinfection
    specialSurfaces: 0.60, // $/m² surfaces spéciales
    floorWaxing: 0.80, // $/m² cirage de plancher
    deepCleaning: 0.90, // $/m² nettoyage en profondeur
  },

  // Coûts de déplacement
  travelCost: 10, // $ par visite (essence, usure véhicule)
  
  // Coûts d'équipement et produits (par visite)
  equipmentCost: 5, // $ produits de nettoyage par visite
  
  // Machines à laver
  washingMachines: {
    rental: {
      monthly: 150, // $ par mois
      quarterly: 400, // $ par 3 mois
      annual: 1400, // $ par année
    },
    purchase: {
      cost: 2500, // $ coût d'achat
      lifespan: 7, // années
      maintenancePerYear: 200, // $ maintenance annuelle
    },
  },
};

// Rabais progressifs selon contrat (réduits à 10% max)
const DISCOUNT_STRUCTURE = {
  once: { label: "Une seule fois", discount: 0 },
  biweekly: { label: "Aux deux semaines", discount: 0.05 }, // 5% rabais
  weekly: { label: "Hebdomadaire", discount: 0.10 }, // 10% rabais
  daily: { label: "Quotidien (5/7)", discount: 0.10 }, // 10% rabais — 7/7 via entrée manuelle
  custom: { label: "Entrée manuelle", discount: 0.05 }, // 5% rabais pour contrat régulier personnalisé
};

// Machines Kärcher avec marge pour BeauRive (marge 30%)
const KARCHER_MACHINES = {
  none: { label: "Aucune", description: "", monthly: 0, annual: 0 },
  "bd50-rental-monthly": { label: "Kärcher BD 50/50 C - Autolaveuse compacte", description: "Machine de nettoyage compacte idéale pour petits espaces (50L réservoir). Location mensuelle", monthly: 930, annual: 11160 },
  "bd50-rental-annual": { label: "Kärcher BD 50/50 C - Autolaveuse compacte", description: "Machine de nettoyage compacte idéale pour petits espaces (50L réservoir). Location annuelle", monthly: 775, annual: 9300 },
  "bd50-purchase": { label: "Kärcher BD 50/50 C - Autolaveuse compacte", description: "Machine de nettoyage compacte idéale pour petits espaces (50L réservoir). Achat amorti 24 mois", monthly: 298, annual: 3580 },
  "b50-rental-monthly": { label: "Kärcher B 50 W BP - Autolaveuse grande", description: "Autolaveuse professionnelle haute performance pour grands espaces (50L réservoir, moteur puissant). Location mensuelle", monthly: 2220, annual: 26640 },
  "b50-rental-annual": { label: "Kärcher B 50 W BP - Autolaveuse grande", description: "Autolaveuse professionnelle haute performance pour grands espaces (50L réservoir, moteur puissant). Location annuelle", monthly: 1850, annual: 22200 },
  "b50-purchase": { label: "Kärcher B 50 W BP - Autolaveuse grande", description: "Autolaveuse professionnelle haute performance pour grands espaces (50L réservoir, moteur puissant). Achat amorti 24 mois", monthly: 712, annual: 8544 },
};

export default function CostCalculator() {
  const searchString = useSearch();

  // Lire les paramètres URL transmis depuis la page Conciergerie
  const urlParams = new URLSearchParams(searchString);
  const initServiceType = urlParams.get("serviceType") || "menage-commercial";
  const initSquareMeters = parseInt(urlParams.get("squareMeters") || "200", 10);
  const initFrequency = urlParams.get("frequency") || "weekly";
  const initProductOption = (urlParams.get("productOption") || "beaurive-provides") as "beaurive-provides" | "client-provides";
  const initVenueType = urlParams.get("commercialVenueType") || "bureau";

  const [calculation, setCalculation] = useState({
    serviceType: initServiceType,
    squareMeters: initSquareMeters,
    frequency: initFrequency,
    customFrequencyDays: 7,
    additionalServices: [] as string[],
    washingMachineOption: "none" as "none" | "rental-monthly" | "rental-annual" | "purchase",
    karcherMachineOption: "none" as string,
    numberOfVisitsPerMonth: 4,
    productOption: initProductOption,
    commercialVenueType: initVenueType as keyof typeof PRICING_QUEBEC.commercialVenueRates,
  });

  // Scroller en haut de page à l'arrivée
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // États pour fenêtres, tapis et salles de bain
  const [numberOfWindows, setNumberOfWindows] = useState(0);
  const [carpetSize, setCarpetSize] = useState<"none" | "small" | "medium" | "large" | "xlarge">("none");
  const [numberOfBathrooms, setNumberOfBathrooms] = useState(0);
  const [customVenueLabel, setCustomVenueLabel] = useState("");

  const [showDetails, setShowDetails] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    budgetPropose: "",
    budgetType: "par-mois",
  });

  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>("BeauRive-ProForma.pdf");

  // Mini-formulaire modal pour téléchargement PDF rapide
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfForm, setPdfForm] = useState({ name: "", email: "", phone: "" });
  const [pdfFormSubmitting, setPdfFormSubmitting] = useState(false);

  // Convertit un prix formaté fr-CA (ex: "1 551" ou "1 551") en entier
  const parsePrice = (s: string) => Math.round(parseFloat(s.replace(/[\s\u00a0\u202f\u2009]/g, "").replace(",", "."))) || 0;

  const handleQuickPdfDownload = async () => {
    if (!pdfForm.name.trim() || !pdfForm.email.trim()) return;
    setPdfFormSubmitting(true);
    try {
      // Générer un numéro de référence temporaire pour le PDF rapide
      const tempRef = `EST-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      generatePdfMutation.mutate({
        invoiceNumber: tempRef,
        clientName: pdfForm.name,
        clientEmail: pdfForm.email,
        clientPhone: pdfForm.phone,
        clientCompany: "",
        serviceType: calculation.serviceType,
        squareMeters: calculation.squareMeters,
        frequency: calculation.frequency,
        visitsPerMonth: costBreakdown.visitsPerMonth,
        additionalServices: calculation.additionalServices,
        productOption: calculation.productOption,
        clientPriceMonthly: parsePrice(costBreakdown.clientPriceMonthly),
        clientPriceAnnual: parsePrice(costBreakdown.clientPriceAnnual),
        profitMonthly: parsePrice(costBreakdown.monthlyProfit),
        profitAnnual: parsePrice(costBreakdown.annualProfit),
        costMonthly: parsePrice(costBreakdown.totalMonthlyCost),
      });
      setShowPdfModal(false);
      setPdfForm({ name: "", email: "", phone: "" });
    } finally {
      setPdfFormSubmitting(false);
    }
  };

  // Ancienne mutation contact (non utilisée mais conservée)
  const submitMutation = trpc.contact.submit.useMutation({ onSuccess: () => {}, onError: () => {} });

  const quoteSubmitMutation = trpc.quote.submit.useMutation({
    onSuccess: (data) => {
      setInvoiceNumber(data.invoiceNumber);
      setSubmitSuccess(true);
      setSubmitForm({ name: "", email: "", phone: "", company: "", message: "", budgetPropose: "", budgetType: "par-mois" });
      toast.success("✅ Votre demande a été envoyée ! Nous vous contacterons sous 24h.");
    },
    onError: () => {
      toast.error("Une erreur s'est produite. Veuillez réessayer.");
    },
  });

  const generatePdfMutation = trpc.quote.generatePdf.useMutation({
    onSuccess: (data) => {
      setPdfFilename(data.filename);
      // Utiliser l'URL S3 directe pour éviter les plantages avec les data URL base64 volumineuses
      const link = document.createElement("a");
      link.href = data.pdfUrl;
      link.download = data.filename;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("📄 Votre facture pro-forma a été téléchargée !");
    },
    onError: (err) => {
      console.error("PDF generation error:", err);
      toast.error("Erreur lors de la génération du PDF. Veuillez réessayer.");
    },
  });

  // Calcul détaillé des coûts
  const costBreakdown = useMemo(() => {
    // Pour le commercial, utiliser le tarif spécifique au type de lieu
    let baseRate = PRICING_QUEBEC.baseRates[calculation.serviceType as keyof typeof PRICING_QUEBEC.baseRates] || 0.33;
    if (calculation.serviceType === "menage-commercial" && calculation.commercialVenueType) {
      baseRate = PRICING_QUEBEC.commercialVenueRates[calculation.commercialVenueType] || 0.33;
    }
    
    // Coût de base par visite
    let baseCostPerVisit = baseRate * calculation.squareMeters;

    // Coûts des produits (pour tous les types de service)
    let productCostPerVisit = 0;
    const productRate = PRICING_QUEBEC.productCosts[calculation.productOption as keyof typeof PRICING_QUEBEC.productCosts] || 0;
    productCostPerVisit = productRate * calculation.squareMeters;

    // Services additionnels
    let additionalCostPerVisit = 0;

    // Fenêtres : tarif fixe par unité
    if (numberOfWindows > 0) {
      additionalCostPerVisit += numberOfWindows * PRICING_QUEBEC.additionalServices.windowPerUnit;
    }

    // Salles de bain : tarif fixe par salle de bain (~20 min/sdb)
    if (numberOfBathrooms > 0) {
      additionalCostPerVisit += numberOfBathrooms * PRICING_QUEBEC.bathroomCost;
    }

    // Tapis : tarif fixe selon taille
    const carpetCosts = {
      none: 0,
      small: PRICING_QUEBEC.additionalServices.carpetSmall,
      medium: PRICING_QUEBEC.additionalServices.carpetMedium,
      large: PRICING_QUEBEC.additionalServices.carpetLarge,
      xlarge: PRICING_QUEBEC.additionalServices.carpetXLarge,
    };
    additionalCostPerVisit += carpetCosts[carpetSize] || 0;

    // Autres services au m²
    const perSqmServices = ["disinfection", "specialSurfaces", "floorWaxing", "deepCleaning"];
    calculation.additionalServices.forEach((service) => {
      if (perSqmServices.includes(service)) {
        const rate = PRICING_QUEBEC.additionalServices[service as keyof typeof PRICING_QUEBEC.additionalServices] as number || 0;
        additionalCostPerVisit += rate * calculation.squareMeters;
      }
    });

    // Coûts variables par visite
    const rawVariableCost = baseCostPerVisit + productCostPerVisit + additionalCostPerVisit + PRICING_QUEBEC.travelCost + PRICING_QUEBEC.equipmentCost;
    // Le prix client minimum est 30$ par visite
    const variableCostPerVisit = rawVariableCost;

    // Nombre de visites par mois
    let visitsPerMonth = 1; // défaut : 1 visite
    if (calculation.frequency === "once") visitsPerMonth = 1;
    if (calculation.frequency === "biweekly") visitsPerMonth = 2;
    if (calculation.frequency === "weekly") visitsPerMonth = 4;
    if (calculation.frequency === "daily") visitsPerMonth = 20; // 5/7 jours = ~20 jours/mois (lundi-vendredi)
    if (calculation.frequency === "custom") {
      // Calcul pour fréquence personnalisée : tous les X jours
      const days = Math.max(1, calculation.customFrequencyDays);
      visitsPerMonth = Math.max(1, Math.round(30 / days));
    }

    // Coût mensuel avant rabais
    const monthlyCostBeforeDiscount = variableCostPerVisit * visitsPerMonth;

    // Rabais
    const discountRate = DISCOUNT_STRUCTURE[calculation.frequency as keyof typeof DISCOUNT_STRUCTURE]?.discount || 0;
    const discountAmount = monthlyCostBeforeDiscount * discountRate;
    const monthlyCostAfterDiscount = monthlyCostBeforeDiscount - discountAmount;

    // Coûts de machines à laver
    let washingMachineCostMonthly = 0;
    let washingMachineDetails = "";

    if (calculation.washingMachineOption === "rental-monthly") {
      washingMachineCostMonthly = PRICING_QUEBEC.washingMachines.rental.monthly;
      washingMachineDetails = "Location mensuelle";
    } else if (calculation.washingMachineOption === "rental-annual") {
      washingMachineCostMonthly = PRICING_QUEBEC.washingMachines.rental.annual / 12;
      washingMachineDetails = "Location annuelle (amortie mensuellement)";
    } else if (calculation.washingMachineOption === "purchase") {
      const monthlyCost = PRICING_QUEBEC.washingMachines.purchase.cost / (PRICING_QUEBEC.washingMachines.purchase.lifespan * 12);
      const maintenanceMonthly = PRICING_QUEBEC.washingMachines.purchase.maintenancePerYear / 12;
      washingMachineCostMonthly = monthlyCost + maintenanceMonthly;
      washingMachineDetails = `Achat amortis sur ${PRICING_QUEBEC.washingMachines.purchase.lifespan} ans + maintenance`;
    }

    // Coûts de machines Kärcher
    let karcherCostMonthly = 0;
    let karcherDetails = "";
    if (calculation.karcherMachineOption !== "none") {
      const machine = KARCHER_MACHINES[calculation.karcherMachineOption as keyof typeof KARCHER_MACHINES];
      if (machine) {
        karcherCostMonthly = machine.monthly;
        karcherDetails = machine.label;
      }
    }

    // Total mensuel
    const totalMonthlyCost = monthlyCostAfterDiscount + washingMachineCostMonthly + karcherCostMonthly;

    // Coût annuel
    const annualCost = totalMonthlyCost * 12;

    // Marge de profit (markup 40% — standard marché nettoyage Québec)
    const profitMargin = 0.40;
    // Prix client par visite :
    // - Si le prix calculé (coût + marge) >= 90$, on garde le prix calculé
    // - Si le prix calculé < 90$, on applique un minimum de 50$
    const calculatedPricePerVisit = variableCostPerVisit * (1 + profitMargin);
    const clientPricePerVisit = calculatedPricePerVisit >= PRICING_QUEBEC.minimumClientPrice
      ? calculatedPricePerVisit
      : Math.max(50, calculatedPricePerVisit);
    const clientPriceMonthly = (clientPricePerVisit * visitsPerMonth) + (washingMachineCostMonthly * (1 + profitMargin)) + (karcherCostMonthly * (1 + profitMargin));
    const clientPriceAnnual = clientPriceMonthly * 12;

    // Profit mensuel et annuel
    const monthlyProfit = clientPriceMonthly - totalMonthlyCost;
    const annualProfit = monthlyProfit * 12;

    // Fonction pour formater les prix sans décimales
    const fmt = (n: number) => Math.round(n).toLocaleString('fr-CA');

    return {
      baseRate,
      baseCostPerVisit,
      productCostPerVisit,
      additionalCostPerVisit,
      variableCostPerVisit,
      visitsPerMonth,
      monthlyCostBeforeDiscount,
      discountRate: (discountRate * 100).toFixed(0),
      discountAmount: fmt(discountAmount),
      monthlyCostAfterDiscount: fmt(monthlyCostAfterDiscount),
      washingMachineCostMonthly: fmt(washingMachineCostMonthly),
      washingMachineDetails,
      karcherCostMonthly: fmt(karcherCostMonthly),
      karcherDetails,
      totalMonthlyCost: fmt(totalMonthlyCost),
      annualCost: fmt(annualCost),
      clientPriceMonthly: fmt(clientPriceMonthly),
      clientPriceAnnual: fmt(clientPriceAnnual),
      monthlyProfit: fmt(monthlyProfit),
      annualProfit: fmt(annualProfit),
      profitMarginPercent: (profitMargin * 100).toFixed(0),
    };
  }, [calculation, numberOfWindows, carpetSize, numberOfBathrooms]); // calculation inclut commercialVenueType

  const handleServiceChange = (service: string) => {
    setCalculation((prev) => {
      const services = prev.additionalServices.includes(service)
        ? prev.additionalServices.filter((s) => s !== service)
        : [...prev.additionalServices, service];
      return { ...prev, additionalServices: services };
    });
  };

  return (
    <div className="w-full">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/conciergerie">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-[#003d7a]">Calculateur de coût professionnel</h1>
          <div className="w-20" />
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#003d7a] to-[#00a896] text-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2">Estimez votre coût de nettoyage</h2>
          <p className="text-lg opacity-90">Tarification réaliste du Québec avec rabais progressifs et options de machines</p>
        </div>
      </section>

      {/* Main Calculator */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Inputs */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Paramètres
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Service Type */}
                  <div>
                    <Label className="font-semibold">Type de Service</Label>
                    <Select
                      value={calculation.serviceType}
                      onValueChange={(value) =>
                        setCalculation((prev) => ({ ...prev, serviceType: value }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="menage-commercial">Ménage Commercial</SelectItem>
                        <SelectItem value="menage-residentiel">Ménage Résidentiel</SelectItem>
                        <SelectItem value="post-construction">Après Construction</SelectItem>
                        <SelectItem value="post-renovation">Après Rénovation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type de lieu commercial - visible uniquement pour le service commercial */}
                  {calculation.serviceType === "menage-commercial" && (
                    <div>
                      <Label className="font-semibold">Type de Lieu Commercial</Label>
                      <Select
                        value={calculation.commercialVenueType}
                        onValueChange={(value) =>
                          setCalculation((prev) => ({ ...prev, commercialVenueType: value as keyof typeof PRICING_QUEBEC.commercialVenueRates }))
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bureau">Bureau simple</SelectItem>
                          <SelectItem value="clinique">Clinique / Pharmacie</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="entrepot">Entrepôt simple</SelectItem>
                          <SelectItem value="garderie">Garderie</SelectItem>
                          <SelectItem value="gym">Gym / Centre sportif</SelectItem>
                          <SelectItem value="commerce">Commerce de détail</SelectItem>
                          <SelectItem value="autre">Autre...</SelectItem>
                        </SelectContent>
                      </Select>
                      {calculation.commercialVenueType === "autre" && (
                        <div className="mt-3">
                          <Label className="text-sm text-gray-600">Décrivez votre type de lieu</Label>
                          <Input
                            className="mt-1"
                            placeholder="Ex. : Église, école, spa, salle de spectacle..."
                            value={customVenueLabel}
                            onChange={(e) => setCustomVenueLabel(e.target.value)}
                            maxLength={80}
                          />
                          <p className="text-xs text-gray-400 mt-1">Tarif standard appliqué automatiquement</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Le tarif varie selon les exigences spécifiques du lieu
                      </p>
                    </div>
                  )}

                  {/* Product Option - Commercial et Résidentiel */}
                  <div>
                    <Label className="font-semibold">Fourniture des Produits</Label>
                    <Select
                      value={calculation.productOption}
                      onValueChange={(value) =>
                        setCalculation((prev) => ({ ...prev, productOption: value as "beaurive-provides" | "client-provides" }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beaurive-provides">BeauRive fournit les produits (+0.20$/m²)</SelectItem>
                        <SelectItem value="client-provides">Client fournit les produits (inclus)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">
                      Choisissez qui fournit les produits de nettoyage (détergents, désinfectants, etc.)
                    </p>
                  </div>

                  {/* Square Meters */}
                  <div>
                    <Label className="font-semibold">
                      Surface : {calculation.squareMeters} m²
                      <span className="text-gray-400 font-normal ml-2 text-sm">
                        ({Math.round(calculation.squareMeters * 10.7639).toLocaleString()} pi²)
                      </span>
                    </Label>
                    <Slider
                      value={[calculation.squareMeters]}
                      onValueChange={(value: number[]) =>
                        setCalculation((prev) => ({ ...prev, squareMeters: value[0] || 50 }))
                      }
                      min={50}
                      max={1500}
                      step={25}
                      className="mt-4"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>50 m² (538 pi²)</span>
                      <span>1 500 m² (16 145 pi²)</span>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div>
                    <Label className="font-semibold">Fréquence</Label>
                    <Select
                      value={calculation.frequency}
                      onValueChange={(value) =>
                        setCalculation((prev) => ({ ...prev, frequency: value }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Une seule fois (1 visite)</SelectItem>
                        <SelectItem value="biweekly">Aux deux semaines (2 visites/mois) — 5% rabais</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire (4 visites/mois) — 10% rabais</SelectItem>
                        <SelectItem value="daily">Quotidien 5/7 (20 visites/mois) — 10% rabais</SelectItem>
                        <SelectItem value="custom">✏️ Entrée manuelle — Intervalle libre (ex: 7/7 = 1 jour)</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Champ personnalisé - visible pour TOUS les types de services */}
                    {calculation.frequency === "custom" && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <Label className="text-sm font-semibold text-blue-800 block mb-2">
                          Intervalle personnalisé
                        </Label>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">Tous les</span>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            value={calculation.customFrequencyDays}
                            onChange={(e) =>
                              setCalculation((prev) => ({
                                ...prev,
                                customFrequencyDays: Math.max(1, Math.min(30, parseInt(e.target.value) || 1))
                              }))
                            }
                            className="w-16 border-2 border-blue-300 rounded-lg px-2 py-2 text-center font-bold text-[#003d7a] text-lg focus:outline-none focus:border-[#003d7a]"
                          />
                          <span className="text-sm text-gray-600">jours</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-blue-700 font-medium">
                            → Environ {Math.max(1, Math.round(30 / Math.max(1, calculation.customFrequencyDays)))} visite(s)/mois
                          </span>
                          <span className="text-xs text-green-700 font-medium ml-2">• Rabais 5%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Exemples : 3 jours = 10 visites/mois • 7 jours = 4 visites/mois • 14 jours = 2 visites/mois
                        </p>
                      </div>
                    )}

                    {/* Résumé des visites pour toutes les fréquences */}
                    <div className={`mt-3 p-3 rounded-lg border ${calculation.frequency === 'once' ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Visites/mois :</span>
                        <span className="font-bold text-[#003d7a]">{costBreakdown.visitsPerMonth}</span>
                      </div>
                      {calculation.frequency !== "once" && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-green-800">Rabais contrat :</span>
                          <span className="font-bold text-green-700">{costBreakdown.discountRate}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Services */}
                  <div>
                    <Label className="font-semibold mb-3 block">Services Additionnels</Label>
                    <div className="space-y-4">

                      {/* Fenêtres - Nombre */}
                      <div>
                        <Label className="text-sm text-gray-700 mb-1 block">
                          Fenêtres <span className="text-gray-400 font-normal">(10 $/fenêtre — int. + ext.)</span>
                        </Label>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 p-0 text-lg"
                            onClick={() => setNumberOfWindows(Math.max(0, numberOfWindows - 1))}
                          >-</Button>
                          <span className="w-12 text-center font-semibold text-[#003d7a]">{numberOfWindows}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 p-0 text-lg"
                            onClick={() => setNumberOfWindows(numberOfWindows + 1)}
                          >+</Button>
                          {numberOfWindows > 0 && (
                            <span className="text-xs text-green-600 font-medium">+{numberOfWindows * 10} $/visite</span>
                          )}
                        </div>
                    <p className="text-xs text-gray-400 mt-1">Taille moyenne fenêtre maison québécoise : ~1,2 m²</p>
                  </div>

                  {/* Salles de bain */}
                  <div>
                    <Label className="font-semibold">Salles de Bain (18 $/sdb)</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNumberOfBathrooms(Math.max(0, numberOfBathrooms - 1))}
                        className="w-8 h-8 p-0"
                      >
                        -
                      </Button>
                      <span className="text-lg font-semibold w-8 text-center">{numberOfBathrooms}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNumberOfBathrooms(Math.min(10, numberOfBathrooms + 1))}
                        className="w-8 h-8 p-0"
                      >
                        +
                      </Button>
                      {numberOfBathrooms > 0 && (
                        <span className="text-sm text-[#00a896] font-medium">
                          +{numberOfBathrooms * 18} $/visite
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Nettoyage complet : toilette, lavabo, douche/bain (~20 min/sdb)</p>
                  </div>

                      {/* Tapis - Taille */}
                      <div>
                        <Label className="text-sm text-gray-700 mb-1 block">Tapis / Moquette</Label>
                        <Select value={carpetSize} onValueChange={(v) => setCarpetSize(v as typeof carpetSize)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Aucun tapis" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucun tapis</SelectItem>
                            <SelectItem value="small">Petit (&lt; 5 m² — entrée, sdb) — +15 $/visite</SelectItem>
                            <SelectItem value="medium">Moyen (5-15 m² — salon) — +30 $/visite</SelectItem>
                            <SelectItem value="large">Grand (15-30 m² — salon + couloir) — +50 $/visite</SelectItem>
                            <SelectItem value="xlarge">Très grand (&gt; 30 m² — moquette) — +80 $/visite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Autres services au m² */}
                      <div className="space-y-2">
                        {[
                          { id: "disinfection", label: "Désinfection (+0.40$/m²)" },
                          { id: "specialSurfaces", label: "Surfaces spéciales (+0.60$/m²)" },
                          { id: "floorWaxing", label: "Cirage plancher (+0.80$/m²)" },
                          { id: "deepCleaning", label: "Nettoyage profond (+0.90$/m²)" },
                        ].map((service) => (
                          <label key={service.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={calculation.additionalServices.includes(service.id)}
                              onChange={() => handleServiceChange(service.id)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">{service.label}</span>
                          </label>
                        ))}
                      </div>

                    </div>
                  </div>

                  {/* Autolaveuse Kärcher - Sur demande */}
                  <div>
                    <Label className="font-semibold">Autolaveuse Kärcher (Services Commerciaux)</Label>
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <span className="text-amber-500 font-bold text-base">ⓘ</span>
                      <div>
                        <p className="text-sm font-medium text-amber-800">Disponible sur demande</p>
                        <p className="text-xs text-amber-700 mt-0.5">L&apos;autolaveuse Kärcher BD 50/50 C est disponible pour les contrats commerciaux. Contactez-nous pour un devis personnalisé incluant la machine.</p>
                      </div>
                    </div>
                  </div>
                  {/* Machine à laver - Sur demande */}
                  <div>
                    <Label className="font-semibold">Machine à Laver</Label>
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <span className="text-amber-500 font-bold text-base">ⓘ</span>
                      <div>
                        <p className="text-sm font-medium text-amber-800">Disponible sur demande</p>
                        <p className="text-xs text-amber-700 mt-0.5">L&apos;équipement de lavage professionnel (ex. Kärcher B 50 W BP) est disponible selon les besoins du contrat. Contactez-nous pour inclure cette option dans votre soumission.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Right Panel - Results */}
            <div className="lg:col-span-2">
              {/* Price Display */}
              <Card className="mb-6 bg-gradient-to-br from-[#003d7a] to-[#00a896] text-white border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-6 h-6" />
                    Prix pour le Client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Par Mois</p>
                      <p className="text-4xl font-bold">${costBreakdown.clientPriceMonthly}</p>
                      <p className="text-xs opacity-75 mt-1">({costBreakdown.visitsPerMonth} visites/mois)</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90 mb-1">Par Année</p>
                      <p className="text-4xl font-bold">${costBreakdown.clientPriceAnnual}</p>
                      <p className="text-xs opacity-75 mt-1">Contrat annuel</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profit Breakdown */}
              <Card className="mb-6 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <TrendingDown className="w-5 h-5" />
                    Votre Profit (Marge 40%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-white rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Profit Mensuel</p>
                      <p className="text-3xl font-bold text-green-700">${costBreakdown.monthlyProfit}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Profit Annuel</p>
                      <p className="text-3xl font-bold text-green-700">${costBreakdown.annualProfit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bouton PDF Rapide - Emplacement 1 */}
              <div className="mb-4 p-4 bg-[#003d7a]/5 border border-[#003d7a]/20 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#003d7a] text-sm">Obtenez votre estimation en PDF</p>
                  <p className="text-gray-500 text-xs">Facture pro-forma avec vos paramètres actuels</p>
                </div>
                <Button
                  onClick={() => setShowPdfModal(true)}
                  className="bg-[#003d7a] hover:bg-[#002d5a] text-white shrink-0"
                  size="sm"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Télécharger PDF
                </Button>
              </div>

              {/* Details Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full mb-6"
              >
                {showDetails ? "Masquer" : "Afficher"} les détails de calcul
              </Button>

              {/* Detailed Breakdown */}
              {showDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle>Détails du calcul</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="costs" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="costs">Coûts</TabsTrigger>
                        <TabsTrigger value="pricing">Tarification</TabsTrigger>
                      </TabsList>

                      <TabsContent value="costs" className="space-y-4 mt-4">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between p-3 bg-gray-50 rounded">
                            <span>Tarif de base ({costBreakdown.baseRate.toFixed(2)} $/m²)</span>
                            <span className="font-semibold">${Math.round(costBreakdown.baseCostPerVisit).toLocaleString('fr-CA')}</span>
                          </div>

                          {costBreakdown.productCostPerVisit > 0 && (
                            <div className="flex justify-between p-3 bg-blue-50 rounded border border-blue-200">
                              <span>Produits de nettoyage</span>
                              <span className="font-semibold text-blue-900">${Math.round(costBreakdown.productCostPerVisit).toLocaleString('fr-CA')}</span>
                            </div>
                          )}
                          {costBreakdown.additionalCostPerVisit > 0 && (
                            <div className="flex justify-between p-3 bg-gray-50 rounded">
                              <span>Services additionnels</span>
                              <span className="font-semibold">${Math.round(costBreakdown.additionalCostPerVisit).toLocaleString('fr-CA')}</span>
                            </div>
                          )}
                          {parseFloat(costBreakdown.karcherCostMonthly) > 0 && (
                            <div className="flex justify-between p-3 bg-purple-50 rounded border border-purple-200">
                              <span>Machine Kärcher</span>
                              <span className="font-semibold text-purple-900">${costBreakdown.karcherCostMonthly}</span>
                            </div>
                          )}
                          <div className="flex justify-between p-3 bg-gray-50 rounded">
                            <span>Déplacement + équipement</span>
                            <span className="font-semibold">${Math.round(PRICING_QUEBEC.travelCost + PRICING_QUEBEC.equipmentCost).toLocaleString('fr-CA')}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-blue-50 rounded border border-blue-200">
                            <span>Coût par visite</span>
                            <span className="font-semibold text-blue-900">${Math.round(costBreakdown.variableCostPerVisit).toLocaleString('fr-CA')}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-gray-50 rounded">
                            <span>Visites par mois</span>
                            <span className="font-semibold">{costBreakdown.visitsPerMonth}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-gray-50 rounded">
                            <span>Coût mensuel (avant rabais)</span>
                            <span className="font-semibold">${Math.round(costBreakdown.monthlyCostBeforeDiscount).toLocaleString('fr-CA')}</span>
                          </div>
                          {parseFloat(costBreakdown.discountAmount) > 0 && (
                            <div className="flex justify-between p-3 bg-green-50 rounded border border-green-200">
                              <span>Rabais ({costBreakdown.discountRate}%)</span>
                              <span className="font-semibold text-green-700">-${costBreakdown.discountAmount}</span>
                            </div>
                          )}
                          <div className="flex justify-between p-3 bg-blue-50 rounded border border-blue-200">
                            <span>Coût mensuel (après rabais)</span>
                            <span className="font-semibold text-blue-900">${costBreakdown.monthlyCostAfterDiscount}</span>
                          </div>
                          {parseFloat(costBreakdown.washingMachineCostMonthly) > 0 && (
                            <div className="flex justify-between p-3 bg-gray-50 rounded">
                              <span>Machine à laver</span>
                              <span className="font-semibold">${costBreakdown.washingMachineCostMonthly}</span>
                            </div>
                          )}
                          <div className="flex justify-between p-3 bg-purple-50 rounded border border-purple-200 font-bold">
                            <span>Coût total mensuel</span>
                            <span className="text-purple-900">${costBreakdown.totalMonthlyCost}</span>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="pricing" className="space-y-4 mt-4">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between p-3 bg-gray-50 rounded">
                            <span>Coût total mensuel</span>
                            <span className="font-semibold">${costBreakdown.totalMonthlyCost}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-gray-50 rounded">
                            <span>Marge de profit</span>
                            <span className="font-semibold">{costBreakdown.profitMarginPercent}%</span>
                          </div>
                          <div className="flex justify-between p-3 bg-green-50 rounded border border-green-200">
                            <span>Prix pour le client (mensuel)</span>
                            <span className="font-semibold text-green-700">${costBreakdown.clientPriceMonthly}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-green-50 rounded border border-green-200">
                            <span>Prix pour le client (annuel)</span>
                            <span className="font-semibold text-green-700">${costBreakdown.clientPriceAnnual}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-blue-50 rounded border border-blue-200">
                            <span>Votre profit mensuel</span>
                            <span className="font-semibold text-blue-900">${costBreakdown.monthlyProfit}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-blue-50 rounded border border-blue-200">
                            <span>Votre profit annuel</span>
                            <span className="font-semibold text-blue-900">${costBreakdown.annualProfit}</span>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Formulaire de Soumission Gratuite */}
      <section className="py-16 bg-gradient-to-br from-[#003d7a] to-[#005a9e]" id="soumission">
        <div className="container mx-auto px-4 max-w-3xl">
          {!submitSuccess ? (
            <>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Send className="w-4 h-4" />
                  Soumission Gratuite
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Obtenez votre soumission officielle</h2>
                <p className="text-white/80 text-lg">Basée sur votre estimation, nous vous préparerons une soumission détaillée et personnalisée sous 24h.</p>
              </div>

              {/* Résumé de l'estimation */}
              <div className="bg-white/10 border border-white/20 rounded-xl p-5 mb-8">
                <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Résumé de votre estimation</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-white/60 text-xs mb-1">Type de service</p>
                    <p className="text-white font-semibold text-sm">
                      {calculation.serviceType === "menage-commercial" && "Commercial"}
                      {calculation.serviceType === "menage-residentiel" && "Résidentiel"}
                      {calculation.serviceType === "post-construction" && "Après construction"}
                      {calculation.serviceType === "post-renovation" && "Après rénovation"}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-white/60 text-xs mb-1">Surface</p>
                    <p className="text-white font-semibold text-sm">{calculation.squareMeters} m²</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-white/60 text-xs mb-1">Fréquence</p>
                    <p className="text-white font-semibold text-sm">
                      {calculation.frequency === "once" && "Une fois"}
                      {calculation.frequency === "biweekly" && "2x/mois"}
                      {calculation.frequency === "weekly" && "4x/mois"}
                      {calculation.frequency === "daily" && "5/7 jours"}
                      {calculation.frequency === "custom" && `Tous les ${calculation.customFrequencyDays}j`}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-white/60 text-xs mb-1">Estimation client</p>
                    <p className="text-white font-bold text-lg">${costBreakdown.clientPriceMonthly}<span className="text-sm font-normal">/mois</span></p>
                  </div>
                </div>
              </div>

              {/* Formulaire */}
              {!showSubmitForm ? (
                <div className="text-center">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => setShowSubmitForm(true)}
                      size="lg"
                      className="bg-[#00a896] hover:bg-[#008f80] text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Demander ma soumission gratuite
                    </Button>
                    {/* Bouton PDF Rapide - Emplacement 2 */}
                    <Button
                      onClick={() => setShowPdfModal(true)}
                      size="lg"
                      variant="outline"
                      className="border-white/50 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl"
                    >
                      <FileDown className="w-5 h-5 mr-2" />
                      Télécharger PDF
                    </Button>
                  </div>
                  <p className="text-white/60 text-sm mt-3">Aucun engagement • Réponse sous 24h • 100% gratuit</p>
                </div>
              ) : (
                <Card className="bg-white shadow-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-[#003d7a] text-xl flex items-center gap-2">
                      <Send className="w-5 h-5 text-[#00a896]" />
                      Vos coordonnées
                    </CardTitle>
                    <CardDescription>Nous vous contacterons sous 24 heures avec votre soumission personnalisée.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        quoteSubmitMutation.mutate({
                          clientName: submitForm.name,
                          clientEmail: submitForm.email,
                          clientPhone: submitForm.phone,
                          clientCompany: submitForm.company,
                          message: submitForm.message,
                          serviceType: calculation.serviceType,
                          squareMeters: calculation.squareMeters,
                          frequency: calculation.frequency,
                          visitsPerMonth: costBreakdown.visitsPerMonth,
                          additionalServices: calculation.additionalServices,
                          productOption: calculation.productOption,
                          clientPriceMonthly: parsePrice(costBreakdown.clientPriceMonthly),
                          clientPriceAnnual: parsePrice(costBreakdown.clientPriceAnnual),
                          budgetPropose: submitForm.budgetPropose,
                          budgetType: submitForm.budgetType,
                        });
                      }}
                      className="space-y-4"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="font-semibold text-gray-700">Nom complet *</Label>
                          <Input
                            required
                            placeholder="Jean Tremblay"
                            value={submitForm.name}
                            onChange={(e) => setSubmitForm(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="font-semibold text-gray-700">Courriel *</Label>
                          <Input
                            required
                            type="email"
                            placeholder="jean@exemple.com"
                            value={submitForm.email}
                            onChange={(e) => setSubmitForm(prev => ({ ...prev, email: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="font-semibold text-gray-700">Téléphone</Label>
                          <Input
                            placeholder="418-555-0000"
                            value={submitForm.phone}
                            onChange={(e) => setSubmitForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="font-semibold text-gray-700">Entreprise / Adresse</Label>
                          <Input
                            placeholder="Nom de l'entreprise ou adresse"
                            value={submitForm.company}
                            onChange={(e) => setSubmitForm(prev => ({ ...prev, company: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      {/* ─── BUDGET PROPOSÉ ─────────────────────────────────────────── */}
                      <div className="rounded-xl border-2 border-dashed border-[#00a896]/40 bg-[#00a896]/5 p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">💰</span>
                          <Label className="text-[#003d7a] font-semibold text-sm">
                            Votre proposition de prix (optionnel)
                          </Label>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                          Indiquez le budget que vous souhaitez investir. Nous en tiendrons compte pour adapter notre offre.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-600">Montant proposé ($)</Label>
                            <div className="relative mt-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">$</span>
                              <Input
                                type="number"
                                placeholder="ex: 2 500"
                                value={submitForm.budgetPropose}
                                onChange={(e) => setSubmitForm(prev => ({ ...prev, budgetPropose: e.target.value }))}
                                className="pl-7 border-[#00a896]/30 focus:border-[#00a896]"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Type de budget</Label>
                            <Select
                              value={submitForm.budgetType}
                              onValueChange={(v) => setSubmitForm(prev => ({ ...prev, budgetType: v }))}
                            >
                              <SelectTrigger className="mt-1 border-[#00a896]/30">
                                <SelectValue />
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
                        {submitForm.budgetPropose && !isNaN(Number(submitForm.budgetPropose)) && (() => {
                          const monthly = parsePrice(costBreakdown.clientPriceMonthly);
                          const proposed = Number(submitForm.budgetPropose);
                          const isInRange = submitForm.budgetType === "par-mois" ? proposed >= monthly * 0.9 : true;
                          return (
                            <div className={`mt-2 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                              isInRange ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              <span>{isInRange ? "✓" : "⚠"}</span>
                              {submitForm.budgetType === "par-mois"
                                ? isInRange
                                  ? `Votre budget (${proposed.toLocaleString("fr-CA")} $/mois) est dans la fourchette de notre estimation.`
                                  : `Notre estimation est ${monthly.toLocaleString("fr-CA")} $/mois. Nous discuterons des options pour nous adapter à votre budget.`
                                : `Budget noté : ${proposed.toLocaleString("fr-CA")} $ (${submitForm.budgetType.replace("par-", "/").replace("total-projet", "total").replace("a-negocier", "à négocier")}). Nous en tiendrons compte.`
                              }
                            </div>
                          );
                        })()}
                      </div>

                      <div>
                        <Label className="font-semibold text-gray-700">Informations supplémentaires (optionnel)</Label>
                        <Textarea
                          placeholder="Précisez vos besoins, contraintes d'horaire, ou toute autre information utile..."
                          value={submitForm.message}
                          onChange={(e) => setSubmitForm(prev => ({ ...prev, message: e.target.value }))}
                          className="mt-1 resize-none"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button
                          type="submit"
                          disabled={quoteSubmitMutation.isPending}
                          className="flex-1 bg-[#003d7a] hover:bg-[#002d5a] text-white py-3 font-semibold"
                        >
                          {quoteSubmitMutation.isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi en cours...</>
                          ) : (
                            <><Send className="w-4 h-4 mr-2" /> Envoyer ma demande de soumission</>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowSubmitForm(false)}
                          className="px-6"
                        >
                          Annuler
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 text-center">Vos informations sont confidentielles et ne seront jamais partagées.</p>
                    </form>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00a896] rounded-full mb-6">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Demande envoyée !</h2>
              <p className="text-white/80 text-lg mb-6">Merci pour votre confiance. Notre équipe vous contactera sous <strong className="text-white">24 heures</strong> avec votre soumission personnalisée.</p>
              {invoiceNumber && (
                <p className="text-white/60 text-sm mb-2">Référence : <span className="text-white font-semibold">{invoiceNumber}</span></p>
              )}
              <div className="bg-white/10 rounded-xl p-6 max-w-md mx-auto mb-8">
                <p className="text-white/70 text-sm">Estimation soumise :</p>
                <p className="text-white font-bold text-2xl">${costBreakdown.clientPriceMonthly}/mois</p>
                <p className="text-white/60 text-sm">{calculation.squareMeters} m² • {costBreakdown.visitsPerMonth} visites/mois</p>
              </div>
              {/* Bouton téléchargement facture pro-forma */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Button
                  onClick={() => {
                    if (!invoiceNumber) return;
                    generatePdfMutation.mutate({
                      invoiceNumber,
                      clientName: submitForm.name || "Client",
                      clientEmail: submitForm.email || "",
                      clientPhone: submitForm.phone || "",
                      clientCompany: submitForm.company || "",
                      serviceType: calculation.serviceType,
                      squareMeters: calculation.squareMeters,
                      frequency: calculation.frequency,
                      visitsPerMonth: costBreakdown.visitsPerMonth,
                      additionalServices: calculation.additionalServices,
                      productOption: calculation.productOption,
                      clientPriceMonthly: parsePrice(costBreakdown.clientPriceMonthly),
                      clientPriceAnnual: parsePrice(costBreakdown.clientPriceAnnual),
                      profitMonthly: parsePrice(costBreakdown.monthlyProfit),
                      profitAnnual: parsePrice(costBreakdown.annualProfit),
                      costMonthly: parsePrice(costBreakdown.totalMonthlyCost),
                    });
                  }}
                  disabled={generatePdfMutation.isPending || !invoiceNumber}
                  className="bg-white text-[#003d7a] hover:bg-gray-100 font-semibold px-8 py-3"
                >
                  {generatePdfMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération en cours...</>
                  ) : (
                    <><FileDown className="w-4 h-4 mr-2" /> Télécharger ma facture pro-forma (PDF)</>
                  )}
                </Button>
                <Button
                  onClick={() => { setSubmitSuccess(false); setShowSubmitForm(false); setInvoiceNumber(null); }}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Faire une nouvelle estimation
                </Button>
              </div>
              <p className="text-white/50 text-xs">La facture pro-forma est une estimation indicative. Une soumission officielle vous sera envoyée sous 24h.</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal Mini-Formulaire PDF Rapide */}
      <Dialog open={showPdfModal} onOpenChange={setShowPdfModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#003d7a] flex items-center gap-2">
              <FileDown className="w-5 h-5" />
              Télécharger votre facture pro-forma
            </DialogTitle>
            <DialogDescription>
              Entrez vos coordonnées pour personnaliser votre facture. Une copie sera envoyée à BeauRive Solutions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="pdf-name" className="text-sm font-medium">Nom complet <span className="text-red-500">*</span></Label>
              <Input
                id="pdf-name"
                placeholder="Jean Tremblay"
                value={pdfForm.name}
                onChange={(e) => setPdfForm(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pdf-email" className="text-sm font-medium">Courriel <span className="text-red-500">*</span></Label>
              <Input
                id="pdf-email"
                type="email"
                placeholder="jean@exemple.com"
                value={pdfForm.email}
                onChange={(e) => setPdfForm(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pdf-phone" className="text-sm font-medium">Téléphone</Label>
              <Input
                id="pdf-phone"
                placeholder="418-555-0000"
                value={pdfForm.phone}
                onChange={(e) => setPdfForm(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="bg-[#003d7a]/5 rounded-lg p-3 text-xs text-gray-600">
              <p className="font-medium text-[#003d7a] mb-1">Estimation incluse dans le PDF :</p>
              <p>Service : {calculation.serviceType === "menage-commercial" ? "Ménage commercial" : calculation.serviceType === "menage-residentiel" ? "Ménage résidentiel" : calculation.serviceType === "post-construction" ? "Après construction" : "Après rénovation"} • {calculation.squareMeters} m² • {costBreakdown.visitsPerMonth} visites/mois</p>
              <p className="font-semibold text-[#003d7a] mt-1">${costBreakdown.clientPriceMonthly}/mois</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleQuickPdfDownload}
                disabled={!pdfForm.name.trim() || !pdfForm.email.trim() || generatePdfMutation.isPending || pdfFormSubmitting}
                className="flex-1 bg-[#003d7a] hover:bg-[#002d5a] text-white"
              >
                {generatePdfMutation.isPending || pdfFormSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération...</>
                ) : (
                  <><FileDown className="w-4 h-4 mr-2" /> Télécharger le PDF</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowPdfModal(false); setPdfForm({ name: "", email: "", phone: "" }); }}
                className="px-5"
              >
                Annuler
              </Button>
            </div>
            <p className="text-xs text-gray-400 text-center">Vos informations sont confidentielles et ne seront jamais partagées.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Information Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#003d7a] mb-8">Comment fonctionne le calculateur ?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tarification réaliste</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
Basée sur les standards du marché québécois : salaire + charges sociales, équipement, produits, déplacement. Marge 40% pour assurer votre profitabilité.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rabais progressifs</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
Plus le contrat est régulier, plus le rabais est avantageux : 5% aux 2 semaines, 10% hebdomadaire et quotidien (5/7). Pour un service 7/7, utilisez l'entrée manuelle avec 1 jour d'intervalle.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Marge saine</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Marge de 40% pour assurer profitabilité, croissance et qualité de service durable.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
