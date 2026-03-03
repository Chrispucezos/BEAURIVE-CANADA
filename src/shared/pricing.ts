/**
 * Logique de tarification BeauRive Solutions — partagée client/serveur
 * Tarifs calibrés pour 5 620 $/mois sur 400 m² / 20 visites / produits inclus
 */

export const PRICING_QUEBEC = {
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
  productCosts: {
    "beaurive-provides": 0.20,
    "client-provides": 0.00,
  } as Record<string, number>,
  bathroomCost: 18,
  additionalServices: {
    windowPerUnit: 10,
    carpetSmall: 15,
    carpetMedium: 30,
    carpetLarge: 50,
    carpetXLarge: 80,
    disinfection: 0.40,
    specialSurfaces: 0.60,
    floorWaxing: 0.80,
    deepCleaning: 0.90,
  } as Record<string, number>,
  travelCost: 10,
  equipmentCost: 5,
};

export const DISCOUNT_STRUCTURE = {
  once: { label: "Une seule fois", discount: 0 },
  biweekly: { label: "Aux deux semaines", discount: 0.05 },
  weekly: { label: "Hebdomadaire", discount: 0.10 },
  daily: { label: "Quotidien (5/7)", discount: 0.10 },
  custom: { label: "Entrée manuelle", discount: 0.05 },
} as Record<string, { label: string; discount: number }>;

export const PROFIT_MARGIN = 0.40;

export interface ConciergeCalcInput {
  serviceType: string;
  squareMeters: number;
  frequency: string;
  customFrequencyDays?: number;
  commercialVenueType?: string;
  productOption?: string;
  numberOfWindows?: number;
  numberOfBathrooms?: number;
  carpetSize?: string;
  additionalServices?: string[];
}

export interface ConciergeCalcResult {
  visitsPerMonth: number;
  baseRate: number;
  pricePerVisit: number;
  clientPriceMonthly: number;
  clientPriceAnnual: number;
  hasTaxes: boolean;
  tpsAmount: number;
  tvqAmount: number;
  totalWithTaxes: number;
  lineItems: LineItem[];
}

export interface LineItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export function calculateConciergePrice(input: ConciergeCalcInput): ConciergeCalcResult {
  const {
    serviceType, squareMeters, frequency, customFrequencyDays = 7,
    commercialVenueType = "bureau", productOption = "beaurive-provides",
    numberOfWindows = 0, numberOfBathrooms = 0, carpetSize = "none",
    additionalServices: addSvcs = [],
  } = input;

  // Tarif de base
  let baseRate = PRICING_QUEBEC.baseRates[serviceType] || 0.264;
  if (serviceType === "menage-commercial") {
    baseRate = PRICING_QUEBEC.commercialVenueRates[commercialVenueType] || 0.264;
  }

  // Coût de base par visite
  let baseCostPerVisit = baseRate * squareMeters;

  // Produits
  const productRate = PRICING_QUEBEC.productCosts[productOption] || 0;
  const productCostPerVisit = productRate * squareMeters;

  // Services additionnels par visite
  let additionalCostPerVisit = 0;
  if (numberOfWindows > 0) additionalCostPerVisit += numberOfWindows * PRICING_QUEBEC.additionalServices.windowPerUnit;
  if (numberOfBathrooms > 0) additionalCostPerVisit += numberOfBathrooms * PRICING_QUEBEC.bathroomCost;
  if (carpetSize && carpetSize !== "none") {
    const carpetMap: Record<string, number> = {
      small: PRICING_QUEBEC.additionalServices.carpetSmall,
      medium: PRICING_QUEBEC.additionalServices.carpetMedium,
      large: PRICING_QUEBEC.additionalServices.carpetLarge,
      xlarge: PRICING_QUEBEC.additionalServices.carpetXLarge,
    };
    additionalCostPerVisit += carpetMap[carpetSize] || 0;
  }
  for (const svc of addSvcs) {
    const rate = PRICING_QUEBEC.additionalServices[svc] as number || 0;
    if (typeof rate === "number" && rate < 5) {
      additionalCostPerVisit += rate * squareMeters;
    }
  }

  // Coût total par visite (avant marge)
  const rawVariableCost = baseCostPerVisit + productCostPerVisit + additionalCostPerVisit + PRICING_QUEBEC.travelCost + PRICING_QUEBEC.equipmentCost;
  const variableCostPerVisit = rawVariableCost / (1 - PROFIT_MARGIN);

  // Nombre de visites par mois
  let visitsPerMonth = 4;
  if (frequency === "once") visitsPerMonth = 1;
  else if (frequency === "biweekly") visitsPerMonth = 2;
  else if (frequency === "weekly") visitsPerMonth = 4;
  else if (frequency === "daily") visitsPerMonth = 20;
  else if (frequency === "custom") visitsPerMonth = Math.max(1, Math.round(30 / (customFrequencyDays || 7)));

  // Rabais
  const discountRate = DISCOUNT_STRUCTURE[frequency]?.discount || 0;
  const discountedCostPerVisit = variableCostPerVisit * (1 - discountRate);

  // Prix par visite (minimum 90 $)
  const clientPricePerVisit = discountedCostPerVisit >= PRICING_QUEBEC.minimumClientPrice
    ? discountedCostPerVisit
    : Math.max(50, discountedCostPerVisit);

  const clientPriceMonthly = Math.round(clientPricePerVisit * visitsPerMonth);
  const clientPriceAnnual = clientPriceMonthly * 12;

  // Taxes (commercial = avec taxes, résidentiel = sans taxes)
  const hasTaxes = serviceType === "menage-commercial" || serviceType === "post-construction" || serviceType === "post-renovation";
  const tpsAmount = hasTaxes ? Math.round(clientPriceMonthly * 0.05) : 0;
  const tvqAmount = hasTaxes ? Math.round(clientPriceMonthly * 0.09975) : 0;
  const totalWithTaxes = clientPriceMonthly + tpsAmount + tvqAmount;

  // Lignes de facturation
  const lineItems: LineItem[] = [];

  const serviceLabels: Record<string, string> = {
    "menage-commercial": "Ménage commercial",
    "menage-residentiel": "Ménage résidentiel",
    "post-construction": "Nettoyage post-construction",
    "post-renovation": "Nettoyage post-rénovation",
  };
  const venueLabels: Record<string, string> = {
    bureau: "Bureau", clinique: "Clinique/Pharmacie", restaurant: "Restaurant",
    entrepot: "Entrepôt", garderie: "Garderie", gym: "Gym/Centre sportif",
    commerce: "Commerce de détail", autre: "Autre",
  };
  const freqLabels: Record<string, string> = {
    once: "Visite unique", biweekly: "Aux 2 semaines", weekly: "Hebdomadaire",
    daily: "Quotidien (5/7)", custom: "Fréquence personnalisée",
  };

  const svcLabel = serviceType === "menage-commercial"
    ? `${serviceLabels[serviceType] || serviceType} — ${venueLabels[commercialVenueType] || commercialVenueType}`
    : serviceLabels[serviceType] || serviceType;

  lineItems.push({
    description: `${svcLabel} — ${squareMeters} m² — ${freqLabels[frequency] || frequency} (${visitsPerMonth} visites/mois)`,
    qty: visitsPerMonth,
    unitPrice: Math.round(clientPricePerVisit),
    total: clientPriceMonthly,
  });

  if (productOption === "beaurive-provides" && productCostPerVisit > 0) {
    lineItems.push({
      description: "Fourniture des produits de nettoyage (inclus)",
      qty: visitsPerMonth,
      unitPrice: Math.round(productCostPerVisit),
      total: Math.round(productCostPerVisit * visitsPerMonth),
    });
  }

  if (numberOfWindows > 0) {
    lineItems.push({
      description: `Nettoyage de fenêtres (${numberOfWindows} fenêtres)`,
      qty: visitsPerMonth,
      unitPrice: numberOfWindows * PRICING_QUEBEC.additionalServices.windowPerUnit,
      total: numberOfWindows * PRICING_QUEBEC.additionalServices.windowPerUnit * visitsPerMonth,
    });
  }

  if (numberOfBathrooms > 0) {
    lineItems.push({
      description: `Nettoyage salles de bain (${numberOfBathrooms} sdb)`,
      qty: visitsPerMonth,
      unitPrice: numberOfBathrooms * PRICING_QUEBEC.bathroomCost,
      total: numberOfBathrooms * PRICING_QUEBEC.bathroomCost * visitsPerMonth,
    });
  }

  return {
    visitsPerMonth,
    baseRate,
    pricePerVisit: Math.round(clientPricePerVisit),
    clientPriceMonthly,
    clientPriceAnnual,
    hasTaxes,
    tpsAmount,
    tvqAmount,
    totalWithTaxes,
    lineItems,
  };
}
