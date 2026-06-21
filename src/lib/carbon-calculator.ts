/**
 * @file carbon-calculator.ts
 * @description Implements lib/carbon-calculator.ts for The Obsolete Human Museum.
 */
import type {
  ExtinctionClockData,
  Specimen,
  ConservationStatus,
  HabitsInput,
  ConservationStatusLevel,
  EmissionsKg,
} from '@/types';
import { toEmissionsKg } from '@/types';

// ═══════════════════════════════════════════════════════════════
// Emission Factors (tonnes CO₂-eq per year)
// Simplified model — based on IPCC (Intergovernmental Panel on
// Climate Change) average global emission factors and lifecycle
// assessments for a museum exhibit context.
// ═══════════════════════════════════════════════════════════════

/**
 * kg CO₂ per km by transport mode.
 * Based on IPCC WGIII AR6 and standard EPA transportation emission factors.
 * - public: 0.089 kg CO₂/km (average for bus/metro)
 * - private: 0.21 kg CO₂/km (average for petrol/diesel passenger car)
 * - aviation_heavy: 0.255 kg CO₂/km (accounts for high altitude radiative forcing)
 */
const TRANSPORT_FACTORS: Record<HabitsInput['transport'], number> = {
  none: 0,
  public: 0.089,
  private: 0.21,
  mixed: 0.14,
  aviation_heavy: 0.255,
};

/** 
 * Annual baseline kg CO₂ by diet.
 * Based on IPCC AR6 Special Report on Climate Change and Land, capturing agricultural emissions.
 * - carnivore: 3,300 kg (high emission factors from beef/lamb methane)
 * - omnivore: 2,500 kg (standard global average)
 * - herbivore: 1,200 kg (plant-based diets drastically reduce land use emissions)
 */
const DIET_FACTORS: Record<HabitsInput['diet'], number> = {
  herbivore: 1_200,
  omnivore: 2_500,
  carnivore: 3_300,
  opportunistic: 2_800,
};

/** 
 * Annual baseline kg CO₂ by energy source.
 * Global average standard emission factors (IPCC grid carbon intensity).
 * - fossil: 3,500 kg CO₂ (coal/gas heavy grid)
 * - renewable: 200 kg CO₂ (lifecycle emissions of solar/wind)
 */
const ENERGY_FACTORS: Record<HabitsInput['energySource'], number> = {
  renewable: 200,
  mixed: 1_800,
  fossil: 3_500,
  unknown: 2_400,
};

/** Multiplier for housing type */
const HOUSING_MULTIPLIERS: Record<HabitsInput['housingType'], number> = {
  apartment: 0.7,
  shared: 0.5,
  house: 1.0,
  nomadic: 0.3,
};

/** Annual AC addition in kg CO₂ */
const AC_FACTORS: Record<HabitsInput['acUsage'], number> = {
  none: 0,
  occasional: 300,
  regular: 900,
  constant: 1_800,
};

/** Annual electronics replacement footprint in kg CO₂ */
const ELECTRONICS_FACTORS: Record<
  HabitsInput['electronicsReplacement'],
  number
> = {
  rarely: 50,
  bi_yearly: 180,
  yearly: 350,
  obsessively: 700,
};

/** 
 * kg CO₂ per delivery.
 * Estimates logistics footprint (last-mile delivery trucks and packaging lifecycle) based on standard emission factors.
 */
const KG_PER_DELIVERY = 2.1;

// ═══════════════════════════════════════════════════════════════
// Core Calculation Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate annual CO₂ emissions from a visitor's lifestyle habits.
 *
 * Algorithm:
 *   transport  = weeklyKm × 52 × factor(mode)
 *   diet       = baseline(diet)
 *   energy     = baseline(source) × housing_multiplier
 *   ac         = baseline(acUsage)
 *   deliveries = deliveriesPerWeek × 52 × KG_PER_DELIVERY
 *   electronics = baseline(replacement)
 *
 * Returns kg CO₂ per year as a branded EmissionsKg.
 */
export function calculateCarbonFootprint(habits: HabitsInput): EmissionsKg {
  const transportKg =
    habits.weeklyKm * 52 * TRANSPORT_FACTORS[habits.transport];
  const dietKg = DIET_FACTORS[habits.diet];
  const energyKg =
    ENERGY_FACTORS[habits.energySource] *
    HOUSING_MULTIPLIERS[habits.housingType];
  const acKg = AC_FACTORS[habits.acUsage];
  const deliveryKg = habits.deliveriesPerWeek * 52 * KG_PER_DELIVERY;
  const electronicsKg = ELECTRONICS_FACTORS[habits.electronicsReplacement];

  const total =
    transportKg + dietKg + energyKg + acKg + deliveryKg + electronicsKg;
  return toEmissionsKg(Math.round(total));
}

export const calculateAnnualEmissions = calculateCarbonFootprint;

/**
 * Calculate the date at which a person's remaining carbon
 * budget is exhausted, given their annual emissions.
 *
 * globalBudgetPerCapita: remaining tonnes CO₂ per person.
 * Default 1.5 t (≈ 1,500 kg) represents a 1.5 °C pathway share.
 *
 * Formula: months = (budgetKg / annualKg) × 12
 */
export function calculateLifestyleExpiry(
  annualEmissions: number,
  globalBudgetPerCapita: number = 1.5
): Date {
  const budgetKg = globalBudgetPerCapita * 1000; // convert tonnes → kg
  const yearsRemaining = budgetKg / Math.max(annualEmissions, 0.001);
  const msRemaining = yearsRemaining * 365.25 * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + msRemaining);
}

/**
 * Translate kg CO₂ into a human-readable "tree-hours"
 * equivalence string.
 *
 * A mature tree absorbs ≈ 22 kg CO₂ per year (≈ 1.83 kg/month).
 * We express the result as "N trees working for M months".
 */
export function translateToTreeHours(emissionsKg: number): string {
  const KG_PER_TREE_PER_MONTH = 22 / 12; // ≈ 1.833

  if (emissionsKg <= 0) return '0 trees working for 0 months';

  // Find the most readable combination of trees × months
  // Target: keep months between 1 and 12 for readability
  let bestTrees = 1;
  let bestMonths = Math.round(emissionsKg / KG_PER_TREE_PER_MONTH);

  // Scale up trees to keep months in a readable range
  if (bestMonths > 12) {
    bestTrees = Math.ceil(bestMonths / 12);
    bestMonths = Math.round(emissionsKg / (KG_PER_TREE_PER_MONTH * bestTrees));
  }

  // Clamp months to at least 1
  bestMonths = Math.max(bestMonths, 1);

  const treePlural = bestTrees === 1 ? 'tree' : 'trees';
  const monthPlural = bestMonths === 1 ? 'month' : 'months';

  return `${bestTrees} ${treePlural} working for ${bestMonths} ${monthPlural}`;
}

/**
 * Map annual emissions (kg CO₂) to a conservation status label.
 *
 * Thresholds based on global per-capita targets:
 *   ≤ 1,500 kg  → Least Concern         (1.5 °C pathway)
 *   ≤ 4,000 kg  → Vulnerable             (2 °C pathway)
 *   ≤ 8,000 kg  → Endangered             (world average ≈ 4.7 t)
 *   ≤ 16,000 kg → Critically Endangered  (US/Australia average)
 *   > 16,000 kg → Extinct in the Wild    (extreme outliers)
 */
export function getConservationStatus(
  emissions: number
): ConservationStatusLevel {
  if (emissions <= 1_500) return 'Least Concern';
  if (emissions <= 4_000) return 'Vulnerable';
  if (emissions <= 8_000) return 'Endangered';
  if (emissions <= 16_000) return 'Critically Endangered';
  return 'Extinct in the Wild';
}

// ═══════════════════════════════════════════════════════════════
// Legacy Data & Functions — used by existing gallery components
// ═══════════════════════════════════════════════════════════════

/**
 * Sample extinction clock data for human behaviors.
 * Each entry represents a once-common behavior now in decline.
 */
export const EXTINCTION_CLOCK_DATA: readonly ExtinctionClockData[] = [
  {
    behavior: 'Manual Automobile Operation',
    estimatedExtinctionYear: 2085,
    currentAdoptionRate: 34.2,
    peakAdoptionYear: 2020,
    peakAdoptionRate: 78.5,
    declineRatePerYear: 2.1,
  },
  {
    behavior: 'Physical Currency Exchange',
    estimatedExtinctionYear: 2058,
    currentAdoptionRate: 12.7,
    peakAdoptionYear: 1995,
    peakAdoptionRate: 97.3,
    declineRatePerYear: 3.8,
  },
  {
    behavior: 'Handwritten Correspondence',
    estimatedExtinctionYear: 2045,
    currentAdoptionRate: 3.1,
    peakAdoptionYear: 1960,
    peakAdoptionRate: 89.0,
    declineRatePerYear: 1.2,
  },
  {
    behavior: 'Terrestrial Television Viewing',
    estimatedExtinctionYear: 2052,
    currentAdoptionRate: 8.4,
    peakAdoptionYear: 2005,
    peakAdoptionRate: 92.6,
    declineRatePerYear: 4.1,
  },
  {
    behavior: 'In-Person Grocery Procurement',
    estimatedExtinctionYear: 2072,
    currentAdoptionRate: 45.3,
    peakAdoptionYear: 2019,
    peakAdoptionRate: 85.0,
    declineRatePerYear: 1.9,
  },
  {
    behavior: 'Physical Key Operation',
    estimatedExtinctionYear: 2061,
    currentAdoptionRate: 22.8,
    peakAdoptionYear: 2010,
    peakAdoptionRate: 99.1,
    declineRatePerYear: 2.7,
  },
] as const;

/**
 * Sample specimen data for the museum collection.
 */
export const SAMPLE_SPECIMENS: readonly Specimen[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    catalogNumber: 'TOH-K7R2M-A4B9',
    commonName: 'The Manual Automobile Operator',
    scientificName: 'Homo conducentis manualis',
    description:
      'Once the dominant form of personal transportation, the manual automobile operator physically controlled a combustion-powered vehicle through congested roadways. Specimens were observed gripping a circular steering apparatus while simultaneously operating pedals with their lower extremities — a feat of coordination that modern citizens find bewildering.',
    conservationStatus: 'ENDANGERED',
    lastObserved: '2024-03-15T00:00:00.000Z',
    habitat: 'Suburban sprawl zones, multi-lane highway corridors',
    carbonFootprint: {
      annualKg: 4600,
      equivalentTrees: 209,
      category: 'TRANSPORT',
      trend: 'DECREASING',
    },
    fieldNotes: [
      'Subject exhibited heightened stress responses during peak congestion periods.',
      "Remarkably, many operators appeared to derive pleasure from the activity, referring to it as 'driving for fun.'",
    ],
    tags: ['transportation', 'combustion', 'manual-control', 'fossil-fuel'],
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    catalogNumber: 'TOH-P3Q8N-C5D2',
    commonName: 'The Paper Currency Handler',
    scientificName: 'Homo pecuniae tactilis',
    description:
      'This remarkable specimen exchanged thin sheets of processed cellulose fiber — adorned with portraits of deceased leaders — as a primary medium of value transfer. The behavior required physical proximity between trading partners and often involved elaborate counting rituals.',
    conservationStatus: 'CRITICALLY_ENDANGERED',
    lastObserved: '2023-11-20T00:00:00.000Z',
    habitat: 'Retail establishments, street markets, ceremonial gift exchanges',
    carbonFootprint: {
      annualKg: 48,
      equivalentTrees: 3,
      category: 'CONSUMPTION',
      trend: 'DECREASING',
    },
    fieldNotes: [
      'Currency specimens showed significant bacterial colonization — a disease vector the operators appeared to accept without concern.',
      "The phrase 'keep the change' appears to have been a micro-philanthropic ritual.",
    ],
    tags: ['commerce', 'physical-exchange', 'paper', 'tradition'],
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    catalogNumber: 'TOH-L9M4K-E7F3',
    commonName: 'The Cubicle Dweller',
    scientificName: 'Homo laborans sedentarius',
    description:
      'Perhaps the most architecturally confined of all specimens, the cubicle dweller inhabited a partitioned workspace of approximately 2.4 by 2.4 meters, performing repetitive cognitive tasks on luminous rectangular screens for periods of eight hours or more. The behavior was distinguished by its remarkable monotony.',
    conservationStatus: 'VULNERABLE',
    lastObserved: '2024-06-01T00:00:00.000Z',
    habitat:
      'Corporate office towers, business parks, converted industrial spaces',
    carbonFootprint: {
      annualKg: 3200,
      equivalentTrees: 146,
      category: 'HOUSING',
      trend: 'DECREASING',
    },
    fieldNotes: [
      'Territorial marking behaviors were observed, including personal photographs and small decorative plants.',
      "The 'water cooler' served as a communal gathering point for oral information exchange.",
    ],
    tags: ['labor', 'office', 'sedentary', 'corporate'],
  },
  {
    id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    catalogNumber: 'TOH-R5S1T-G8H4',
    commonName: 'The Supermarket Forager',
    scientificName: 'Homo colligens alimentarius',
    description:
      'An astonishing behavioral pattern in which individuals physically traveled to large, artificially illuminated warehouses to select sustenance from thousands of packaged options. Specimens pushed wheeled metal cages through organized aisles, engaging in complex cost-benefit analyses at remarkable speed.',
    conservationStatus: 'NEAR_THREATENED',
    lastObserved: '2024-08-10T00:00:00.000Z',
    habitat: 'Retail food centers, suburban shopping complexes',
    carbonFootprint: {
      annualKg: 1800,
      equivalentTrees: 82,
      category: 'DIET',
      trend: 'STABLE',
    },
    fieldNotes: [
      "The 'impulse purchase' phenomenon suggests limited rational control over acquisition behaviors near checkout zones.",
      'Seasonal variations in foraging patterns were correlated with cultural celebration cycles.',
    ],
    tags: ['food', 'retail', 'physical-commerce', 'consumption'],
  },
] as const;

/**
 * Calculate the percentage of time elapsed toward extinction
 */
export function calculateExtinctionProgress(data: ExtinctionClockData): number {
  const totalDecline = data.peakAdoptionRate;
  const currentDecline = data.peakAdoptionRate - data.currentAdoptionRate;
  const progress = (currentDecline / totalDecline) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

/**
 * Get the conservation status based on adoption rate (legacy enum format)
 */
export function getConservationStatusFromRate(
  adoptionRate: number
): ConservationStatus {
  if (adoptionRate <= 0) return 'EXTINCT';
  if (adoptionRate <= 5) return 'CRITICALLY_ENDANGERED';
  if (adoptionRate <= 15) return 'ENDANGERED';
  if (adoptionRate <= 30) return 'VULNERABLE';
  if (adoptionRate <= 50) return 'NEAR_THREATENED';
  return 'LEAST_CONCERN';
}

/**
 * Format years remaining until extinction for display
 */
export function formatYearsRemaining(
  estimatedYear: number,
  currentYear: number = new Date().getFullYear()
): string {
  const years = estimatedYear - currentYear;
  if (years <= 0) return 'Already extinct';
  if (years === 1) return '1 year remaining';
  return `${years} years remaining`;
}
