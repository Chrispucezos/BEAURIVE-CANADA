import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calculator, CheckCircle2, Loader2, MapPin, Building2, Home, HardHat, Wrench, Star, User, LogIn, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

// Tarification réaliste du Québec (2026)
const PRICING_QC = {
  laborRate: 35,
  baseRates: {
    "menage-commercial": 0.264,
    "menage-residentiel": 0.36,
    "post-construction": 0.641,
    "post-renovation": 0.641,
  } as Record<string, number>,
  commercialVenueRates: {
    "bureau": 0.264,
    "clinique": 0.336,
    "restaurant": 0.40,
    "entrepot": 0.176,
    "garderie": 0.368,
    "gym": 0.32,
    "commerce": 0.28,
    "autre": 0.28,
  } as Record<string, number>,
  minimumClientPrice: 90,
  productCosts: { "beaurive-provides": 0.20, "client-provides": 0.00 } as Record<string, number>,
  bathroomCost: 18,
  additionalServices: {
    windowPerUnit: 10,
    carpetSmall: 15, carpetMedium: 30, carpetLarge: 50, carpetXLarge: 80,
    disinfection: 0.40, specialSurfaces: 0.60, floorWaxing: 0.80, deepCleaning: 0.90,
  },
  travelCost: 10,
  equipmentCost: 5,
};

const DISCOUNT_QC = {
  once: { discount: 0 }, biweekly: { discount: 0.05 },
  weekly: { discount: 0.10 }, daily: { discount: 0.10 }, custom: { discount: 0.05 },
} as Record<string, { discount: number }>;

function MonEspaceBtn() {
  const { user, loading } = useAuth();
  if (loading) return <div className="w-28" />;
  return user ? (
    <Link
      href="/mon-espace"
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#003d7a] text-white text-sm font-bold hover:bg-[#002d5a] transition-all shadow-sm no-underline"
    >
      <User className="w-4 h-4" />
      Mon Espace
    </Link>
  ) : (
    <a
      href={getLoginUrl()}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#003d7a] text-white text-sm font-bold hover:bg-[#002d5a] transition-all shadow-sm no-underline"
    >
      <LogIn className="w-4 h-4" />
      Se connecter
    </a>
  );
}

export default function ConciergerieDept() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [costCalculation, setCostCalculation] = useState({
    serviceType: "menage-commercial",
    squareMeters: 200,
    frequency: "weekly",
    customFrequencyDays: 7,
    additionalServices: [] as string[],
    productOption: "beaurive-provides" as "beaurive-provides" | "client-provides",
    commercialVenueType: "bureau" as string,
  });
  const [numberOfWindows, setNumberOfWindows] = useState(0);
  const [carpetSize, setCarpetSize] = useState<"none"|"small"|"medium"|"large"|"xlarge">("none");
  const [numberOfBathrooms, setNumberOfBathrooms] = useState(0);
  const [customVenueLabel, setCustomVenueLabel] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    budgetPropose: "",
    budgetType: "par-mois",
  });

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Merci ! Votre demande a été reçue. Nous vous contacterons bientôt.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: "",
        budgetPropose: "",
        budgetType: "par-mois",
      });
    },
    onError: () => {
      toast.error("Une erreur s'est produite. Veuillez réessayer.");
    },
  });

  const services = [
    {
      id: "menage-commercial",
      title: "Ménage commercial",
      description: "Nettoyage professionnel d'espaces commerciaux",
      details: "Nettoyage complet des bureaux, salles de réunion, espaces communs avec équipes formées et équipement professionnel.",
      basePrice: 0.75, // par m²
    },
    {
      id: "menage-residentiel",
      title: "Ménage résidentiel",
      description: "Nettoyage de maisons et appartements",
      details: "Service de nettoyage résidentiel complet adapté à vos besoins spécifiques avec attention aux détails.",
      basePrice: 0.60, // par m²
    },
    {
      id: "post-construction",
      title: "Ménage après construction",
      description: "Nettoyage post-chantier professionnel",
      details: "Intervention après fin de chantier pour préparer le bâtiment à sa livraison. Nettoyage complet des murs, planchers, vitres et surfaces. Nettoyage des débris, désinfection des surfaces et mise en valeur du chantier terminé.",
      basePrice: 1.50, // par m²
      isSpecial: true,
    },
    {
      id: "post-renovation",
      title: "Ménage après rénovation",
      description: "Nettoyage post-rénovation complet",
      details: "Enlèvement des gravats, nettoyage des zones critiques (cuisine, salle de bain), désinfection des espaces pour un environnement sain et accueillant.",
      basePrice: 1.25, // par m²
      isSpecial: true,
    },
  ];

  const costBreakdown = useMemo(() => {
    let baseRate = PRICING_QC.baseRates[costCalculation.serviceType] || 0.33;
    if (costCalculation.serviceType === "menage-commercial") {
      baseRate = PRICING_QC.commercialVenueRates[costCalculation.commercialVenueType] || 0.33;
    }
    let baseCostPerVisit = baseRate * costCalculation.squareMeters;
    const productRate = PRICING_QC.productCosts[costCalculation.productOption] || 0;
    const productCostPerVisit = productRate * costCalculation.squareMeters;
    let additionalCostPerVisit = 0;
    if (numberOfWindows > 0) additionalCostPerVisit += numberOfWindows * PRICING_QC.additionalServices.windowPerUnit;
    if (numberOfBathrooms > 0) additionalCostPerVisit += numberOfBathrooms * PRICING_QC.bathroomCost;
    const carpetCosts = { none: 0, small: PRICING_QC.additionalServices.carpetSmall, medium: PRICING_QC.additionalServices.carpetMedium, large: PRICING_QC.additionalServices.carpetLarge, xlarge: PRICING_QC.additionalServices.carpetXLarge };
    additionalCostPerVisit += carpetCosts[carpetSize] || 0;
    ["disinfection", "specialSurfaces", "floorWaxing", "deepCleaning"].forEach((svc) => {
      if (costCalculation.additionalServices.includes(svc)) {
        additionalCostPerVisit += (PRICING_QC.additionalServices[svc as keyof typeof PRICING_QC.additionalServices] as number) * costCalculation.squareMeters;
      }
    });
    const variableCostPerVisit = baseCostPerVisit + productCostPerVisit + additionalCostPerVisit + PRICING_QC.travelCost + PRICING_QC.equipmentCost;
    let visitsPerMonth = 1;
    if (costCalculation.frequency === "biweekly") visitsPerMonth = 2;
    else if (costCalculation.frequency === "weekly") visitsPerMonth = 4;
    else if (costCalculation.frequency === "daily") visitsPerMonth = 20;
    else if (costCalculation.frequency === "custom") visitsPerMonth = Math.max(1, Math.round(30 / Math.max(1, costCalculation.customFrequencyDays)));
    const discountRate = DISCOUNT_QC[costCalculation.frequency]?.discount || 0;
    const monthlyCostAfterDiscount = variableCostPerVisit * visitsPerMonth * (1 - discountRate);
    const calculatedPricePerVisit = variableCostPerVisit * 1.40;
    const clientPricePerVisit = calculatedPricePerVisit >= PRICING_QC.minimumClientPrice ? calculatedPricePerVisit : Math.max(50, calculatedPricePerVisit);
    const clientPriceMonthly = clientPricePerVisit * visitsPerMonth;
    const fmt = (n: number) => Math.round(n).toLocaleString('fr-CA');
    return { visitsPerMonth, discountRate: (discountRate * 100).toFixed(0), clientPriceMonthly: fmt(clientPriceMonthly), clientPriceAnnual: fmt(clientPriceMonthly * 12) };
  }, [costCalculation, numberOfWindows, carpetSize, numberOfBathrooms]);

  const handleServiceClick = (serviceId: string) => {
    setSelectedService(selectedService === serviceId ? null : serviceId);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    submitMutation.mutate({
      ...formData,
      serviceType: "conciergerie",
      company: formData.company || "",
      phone: formData.phone || "",
    });
  };

  return (
    <div className="w-full">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-[#003d7a]">Département conciergerie</h1>
          <MonEspaceBtn />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#003d7a] to-[#00a896] text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Services de conciergerie professionnels</h2>
          <p className="text-lg opacity-95 mb-3">
            Nous offrons des services de nettoyage commercial et résidentiel de qualité supérieure dans les régions de Québec et Chaudière-Appalaches.
          </p>
          <p className="text-base opacity-90 flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span>Nous utilisons exclusivement des <strong>produits biodégradables et écologiques</strong> pour prendre soin de vos espaces tout en respectant l’environnement.</span>
          </p>
        </div>
      </section>

      {/* Engagement Écologique */}
      <section className="py-8 bg-green-50 border-b border-green-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto">
            <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
              🌱
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-800 mb-1">Notre engagement environnemental</h3>
              <p className="text-green-700 leading-relaxed">
                Chez BeauRive Solutions, chaque intervention est pensée pour minimiser son impact sur l’environnement. Nous privilégions des <strong>produits de nettoyage biodégradables, sans substances toxiques</strong>, réduisons les emballages à usage unique et optimisons nos déplacements pour limiter notre empreinte carbone. Prendre soin de vos espaces, c’est aussi prendre soin de la planète.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-[#003d7a] mb-8">Nos Services</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className={`cursor-pointer transition hover:shadow-lg ${
                  selectedService === service.id ? "ring-2 ring-[#00a896]" : ""
                }`}
                onClick={() => handleServiceClick(service.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{service.title}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </div>
                    {service.isSpecial && (
                      <span className="bg-[#00a896] text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Spécial
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{service.details}</p>
                  <p className="text-sm text-gray-500">
                    À partir de <strong>${service.basePrice.toFixed(2)}/m²</strong>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Calculator */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Calculator className="w-8 h-8 text-[#00a896]" />
              <h3 className="text-2xl font-bold text-[#003d7a]">Calculateur de coût</h3>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#00a896]" />
                  Paramètres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Type de Service */}
                <div>
                  <Label className="font-semibold">Type de Service</Label>
                  <Select value={costCalculation.serviceType} onValueChange={(v) => setCostCalculation(p => ({ ...p, serviceType: v }))}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="menage-commercial">Ménage Commercial</SelectItem>
                      <SelectItem value="menage-residentiel">Ménage Résidentiel</SelectItem>
                      <SelectItem value="post-construction">Après Construction</SelectItem>
                      <SelectItem value="post-renovation">Après Rénovation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type de Lieu Commercial */}
                {costCalculation.serviceType === "menage-commercial" && (
                  <div>
                    <Label className="font-semibold">Type de Lieu Commercial</Label>
                    <Select value={costCalculation.commercialVenueType} onValueChange={(v) => setCostCalculation(p => ({ ...p, commercialVenueType: v }))}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
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
                    {costCalculation.commercialVenueType === "autre" && (
                      <div className="mt-2">
                        <Input placeholder="Ex. : Église, école, spa..." value={customVenueLabel} onChange={(e) => setCustomVenueLabel(e.target.value)} maxLength={80} />
                        <p className="text-xs text-gray-400 mt-1">Tarif standard appliqué automatiquement</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Le tarif varie selon les exigences spécifiques du lieu</p>
                  </div>
                )}

                {/* Fourniture des Produits */}
                <div>
                  <Label className="font-semibold">Fourniture des Produits</Label>
                  <Select value={costCalculation.productOption} onValueChange={(v) => setCostCalculation(p => ({ ...p, productOption: v as "beaurive-provides" | "client-provides" }))}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beaurive-provides">BeauRive fournit les produits (+0.20$/m²)</SelectItem>
                      <SelectItem value="client-provides">Client fournit les produits (inclus)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-2">Choisissez qui fournit les produits de nettoyage (détergents, désinfectants, etc.)</p>
                </div>

                {/* Surface */}
                <div>
                  <Label className="font-semibold">
                    Surface : {costCalculation.squareMeters} m²
                    <span className="text-gray-400 font-normal ml-2 text-sm">({Math.round(costCalculation.squareMeters * 10.7639).toLocaleString()} pi²)</span>
                  </Label>
                  <Slider
                    value={[costCalculation.squareMeters]}
                    onValueChange={(v) => setCostCalculation(p => ({ ...p, squareMeters: v[0] || 50 }))}
                    min={50} max={1500} step={25} className="mt-4"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>50 m² (538 pi²)</span>
                    <span>1 500 m² (16 145 pi²)</span>
                  </div>
                </div>

                {/* Fréquence */}
                <div>
                  <Label className="font-semibold">Fréquence</Label>
                  <Select value={costCalculation.frequency} onValueChange={(v) => setCostCalculation(p => ({ ...p, frequency: v }))}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Une seule fois (1 visite)</SelectItem>
                      <SelectItem value="biweekly">Aux deux semaines (2 visites/mois) — 5% rabais</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire (4 visites/mois) — 10% rabais</SelectItem>
                      <SelectItem value="daily">Quotidien 5/7 (20 visites/mois) — 10% rabais</SelectItem>
                      <SelectItem value="custom">✏️ Entrée manuelle — Intervalle libre</SelectItem>
                    </SelectContent>
                  </Select>
                  {costCalculation.frequency === "custom" && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Label className="text-sm font-semibold text-blue-800 block mb-2">Intervalle personnalisé</Label>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Tous les</span>
                        <input type="number" min={1} max={30} value={costCalculation.customFrequencyDays}
                          onChange={(e) => setCostCalculation(p => ({ ...p, customFrequencyDays: Math.max(1, Math.min(30, parseInt(e.target.value) || 1)) }))}
                          className="w-16 border-2 border-blue-300 rounded-lg px-2 py-2 text-center font-bold text-[#003d7a] text-lg focus:outline-none focus:border-[#003d7a]"
                        />
                        <span className="text-sm text-gray-600">jours</span>
                      </div>
                      <p className="text-xs text-blue-700 font-medium mt-2">→ Environ {Math.max(1, Math.round(30 / Math.max(1, costCalculation.customFrequencyDays)))} visite(s)/mois • Rabais 5%</p>
                    </div>
                  )}
                  <div className={`mt-3 p-3 rounded-lg border ${costCalculation.frequency === 'once' ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Visites/mois :</span>
                      <span className="font-bold text-[#003d7a]">{costBreakdown.visitsPerMonth}</span>
                    </div>
                    {costCalculation.frequency !== "once" && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-green-800">Rabais contrat :</span>
                        <span className="font-bold text-green-700">{costBreakdown.discountRate}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Services Additionnels */}
                <div>
                  <Label className="font-semibold mb-3 block">Services Additionnels</Label>
                  <div className="space-y-4">
                    {/* Fenêtres */}
                    <div>
                      <Label className="text-sm text-gray-700 mb-1 block">Fenêtres <span className="text-gray-400 font-normal">(10 $/fenêtre — int. + ext.)</span></Label>
                      <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" size="sm" className="w-8 h-8 p-0 text-lg" onClick={() => setNumberOfWindows(Math.max(0, numberOfWindows - 1))}>-</Button>
                        <span className="w-12 text-center font-semibold text-[#003d7a]">{numberOfWindows}</span>
                        <Button type="button" variant="outline" size="sm" className="w-8 h-8 p-0 text-lg" onClick={() => setNumberOfWindows(numberOfWindows + 1)}>+</Button>
                        {numberOfWindows > 0 && <span className="text-xs text-green-600 font-medium">+{numberOfWindows * 10} $/visite</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Taille moyenne fenêtre maison québécoise : ~1,2 m²</p>
                    </div>
                    {/* Salles de bain */}
                    <div>
                      <Label className="font-semibold">Salles de Bain (18 $/sdb)</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Button type="button" variant="outline" size="sm" className="w-8 h-8 p-0" onClick={() => setNumberOfBathrooms(Math.max(0, numberOfBathrooms - 1))}>-</Button>
                        <span className="text-lg font-semibold w-8 text-center">{numberOfBathrooms}</span>
                        <Button type="button" variant="outline" size="sm" className="w-8 h-8 p-0" onClick={() => setNumberOfBathrooms(Math.min(10, numberOfBathrooms + 1))}>+</Button>
                        {numberOfBathrooms > 0 && <span className="text-sm text-[#00a896] font-medium">+{numberOfBathrooms * 18} $/visite</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Nettoyage complet : toilette, lavabo, douche/bain (~20 min/sdb)</p>
                    </div>
                    {/* Tapis */}
                    <div>
                      <Label className="text-sm text-gray-700 mb-1 block">Tapis / Moquette</Label>
                      <Select value={carpetSize} onValueChange={(v) => setCarpetSize(v as typeof carpetSize)}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Aucun tapis" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun tapis</SelectItem>
                          <SelectItem value="small">Petit (&lt; 5 m² — entrée, sdb) — +15 $/visite</SelectItem>
                          <SelectItem value="medium">Moyen (5-15 m² — salon) — +30 $/visite</SelectItem>
                          <SelectItem value="large">Grand (15-30 m² — salon + couloir) — +50 $/visite</SelectItem>
                          <SelectItem value="xlarge">Très grand (&gt; 30 m² — moquette) — +80 $/visite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Options au m² */}
                    <div className="space-y-2">
                      {[
                        { id: "disinfection", label: "Désinfection (+0.40$/m²)" },
                        { id: "specialSurfaces", label: "Surfaces spéciales (+0.60$/m²)" },
                        { id: "floorWaxing", label: "Cirage plancher (+0.80$/m²)" },
                      ].map((svc) => (
                        <label key={svc.id} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={costCalculation.additionalServices.includes(svc.id)}
                            onChange={() => setCostCalculation(p => ({
                              ...p,
                              additionalServices: p.additionalServices.includes(svc.id)
                                ? p.additionalServices.filter(s => s !== svc.id)
                                : [...p.additionalServices, svc.id]
                            }))}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">{svc.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Affichage du prix */}
                <div className="bg-gradient-to-r from-[#003d7a] to-[#00a896] rounded-lg p-6 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5" />
                    <p className="text-sm font-medium opacity-90">Prix estimé pour le client</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs opacity-75">Par mois</p>
                      <p className="text-3xl font-bold">${costBreakdown.clientPriceMonthly}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75">Par année</p>
                      <p className="text-3xl font-bold">${costBreakdown.clientPriceAnnual}</p>
                    </div>
                  </div>
                  <p className="text-xs opacity-75 mb-3">*Estimation basée sur les paramètres sélectionnés — tarification marché québécois 2026</p>
                  <Button
                    className="w-full bg-white text-[#003d7a] hover:bg-gray-100"
                    onClick={() => {
                      const params = new URLSearchParams({
                        serviceType: costCalculation.serviceType,
                        squareMeters: String(costCalculation.squareMeters),
                        frequency: costCalculation.frequency,
                        productOption: costCalculation.productOption,
                        commercialVenueType: costCalculation.commercialVenueType,
                      });
                      window.location.href = `/calculateur-cout?${params.toString()}`;
                    }}
                  >
                    Voir le calculateur détaillé avec PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[#003d7a] mb-4 text-center">Demander une soumission</h3>
            <div className="flex justify-center gap-6 mb-8">
              <a href="tel:5813492323" className="flex items-center gap-2 text-[#003d7a] font-semibold hover:text-[#00a896] transition">
                <span className="text-lg">📞</span> 581-349-2323
              </a>
              <a href="mailto:info@beaurive.ca" className="flex items-center gap-2 text-[#003d7a] font-semibold hover:text-[#00a896] transition">
                <span className="text-lg">✉️</span> info@beaurive.ca
              </a>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 shadow-lg">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="name" className="text-gray-700">Nom *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Votre nom"
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="votre@email.com"
                    required
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="phone" className="text-gray-700">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="(418) 555-0123"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="company" className="text-gray-700">Entreprise</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleFormChange}
                    placeholder="Nom de votre entreprise"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="message" className="text-gray-700">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleFormChange}
                  placeholder="Décrivez votre demande..."
                  rows={5}
                  required
                  className="mt-2"
                />
              </div>

              {/* ─── BUDGET PROPOSÉ ─── */}
              <div className="mb-6 rounded-xl border-2 border-dashed border-[#00a896]/40 bg-[#00a896]/5 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">💰</span>
                  <Label className="text-[#003d7a] font-semibold text-sm">Votre proposition de prix (optionnel)</Label>
                </div>
                <p className="text-xs text-gray-500 mb-3">Indiquez le budget que vous souhaitez investir. Nous en tiendrons compte pour adapter notre offre.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">Montant proposé ($)</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">$</span>
                      <Input
                        type="number"
                        name="budgetPropose"
                        placeholder="ex: 2 500"
                        value={formData.budgetPropose}
                        onChange={handleFormChange}
                        className="pl-7 border-[#00a896]/30 focus:border-[#00a896]"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Type de budget</Label>
                    <Select
                      value={formData.budgetType}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, budgetType: v }))}
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
                {formData.budgetPropose && !isNaN(Number(formData.budgetPropose)) && (() => {
                  const monthly = Math.round(parseFloat(costBreakdown.clientPriceMonthly.replace(/\s/g, "").replace(",", ".")));
                  const proposed = Number(formData.budgetPropose);
                  const isInRange = formData.budgetType === "par-mois" ? proposed >= monthly * 0.9 : true;
                  return (
                    <div className={`mt-2 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                      isInRange ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      <span>{isInRange ? "✓" : "⚠"}</span>
                      {formData.budgetType === "par-mois"
                        ? isInRange
                          ? `Votre budget (${proposed.toLocaleString("fr-CA")} $/mois) est dans la fourchette de notre estimation.`
                          : `Notre estimation est ${monthly.toLocaleString("fr-CA")} $/mois. Nous discuterons des options pour nous adapter à votre budget.`
                        : `Budget noté : ${proposed.toLocaleString("fr-CA")} $ (${formData.budgetType.replace("par-", "/").replace("total-projet", "total").replace("a-negocier", "à négocier")}). Nous en tiendrons compte.`
                      }
                    </div>
                  );
                })()}
              </div>

              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full bg-[#003d7a] hover:bg-[#002d5a] text-white py-3"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Envoyer ma demande
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Detailed Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-[#003d7a] mb-2 text-center">Nos spécialités</h3>
          <p className="text-gray-500 text-center mb-10">Des solutions adaptées à chaque type d'espace</p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Ménage Commercial */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#003d7a] to-[#00a896] flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-[#003d7a]">Ménage commercial et industriel</h4>
              </div>
              <p className="text-gray-600 mb-4">BeauRive Solutions se spécialise dans l'entretien ménager des espaces commerciaux et industriels. Que vous soyez une entreprise, une institution ou un organisme, nous adaptons nos services selon vos besoins pour vous garantir des locaux propres et sécurisés. Nos équipes interviennent quotidiennement ou selon un calendrier personnalisé.</p>
              <ul className="space-y-2">
                {["Expertise professionnelle adaptée aux grandes surfaces", "Flexibilité selon votre horaire (quotidien, hebdomadaire, mensuel)", "Produits et équipements de qualité pour un entretien en profondeur", "Autolaveuse Kärcher BD 50/50 C pour les grands espaces"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-[#00a896] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Ménage Résidentiel */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#003d7a] to-[#00a896] flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-[#003d7a]">Conciergerie résidentielle</h4>
              </div>
              <p className="text-gray-600 mb-4">Service de nettoyage résidentiel haut de gamme adapté à vos besoins spécifiques. Nos professionnels en uniforme interviennent avec attention aux détails pour que votre maison ou appartement soit impeccable chaque semaine.</p>
              <ul className="space-y-2">
                {["Nettoyage complet : cuisine, salles de bain, pièces de vie", "Professionnels en uniforme, ponctuels et fiables", "200 heures d'entretien par semaine dans la région de Québec", "Produits écologiques disponibles sur demande"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-[#00a896] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Après Construction */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#003d7a] to-[#00a896] flex items-center justify-center">
                  <HardHat className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-[#003d7a]">Ménage après construction</h4>
              </div>
              <p className="text-gray-600 mb-4">Après la fin d'un chantier, nous intervenons pour préparer votre bâtiment à sa livraison. Notre équipe assure un nettoyage complet des murs, planchers, vitres et autres surfaces pour un résultat impeccable.</p>
              <ul className="space-y-2">
                {["Nettoyage complet des murs, planchers et vitres", "Enlèvement des débris de construction", "Désinfection complète des surfaces", "Mise en valeur de votre chantier terminé"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-[#00a896] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Après Rénovation */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#003d7a] to-[#00a896] flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-[#003d7a]">Ménage après rénovation</h4>
              </div>
              <p className="text-gray-600 mb-4">Vous venez de finaliser des rénovations ? Notre service de ménage après rénovation vous assure un environnement propre et sain. Nous nous occupons de tout pour que votre espace soit prêt à accueillir clients et employés.</p>
              <ul className="space-y-2">
                {["Enlèvement des gravats et résidus de rénovation", "Nettoyage des zones critiques (cuisine, salle de bain)", "Désinfection complète des espaces", "Service rapide et efficace pour respecter vos délais"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-[#00a896] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-[#003d7a] mb-2 text-center">Zones desservies</h3>
          <p className="text-gray-500 text-center mb-8">Régions de Québec et Chaudière-Appalaches</p>
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              "Ville de Québec",
              "Sainte-Marie",
              "Beauceville",
              "Tring-Jonction",
              "Lévis",
              "Saint-Nicolas",
              "Charny",
              "Donnacona",
              "Saint-Augustin",
              "Beauport",
              "Charlesbourg",
              "Et bien d'autres !",
            ].map((zone) => (
              <div key={zone} className="flex items-center gap-2 text-gray-700 bg-gray-50 rounded-lg px-4 py-3">
                <MapPin className="w-4 h-4 text-[#00a896] shrink-0" />
                <span className="text-sm font-medium">{zone}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-gradient-to-r from-[#003d7a] to-[#00a896] rounded-2xl p-8 text-white text-center max-w-2xl mx-auto">
            <Star className="w-8 h-8 mx-auto mb-3 fill-yellow-300 text-yellow-300" />
            <p className="text-lg font-semibold mb-2">Pourquoi choisir BeauRive Solutions ?</p>
            <p className="opacity-90">Avec plus de 200 heures d'entretien ménager effectuées chaque semaine dans les régions de Québec et Chaudière-Appalaches, BeauRive Solutions est votre partenaire idéal pour des espaces impeccables.</p>
            <Link to="/conciergerie#contact">
              <Button className="mt-4 bg-white text-[#003d7a] hover:bg-gray-100 font-semibold">Obtenir une soumission gratuite</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
