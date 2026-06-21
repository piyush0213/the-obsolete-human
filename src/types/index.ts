// ═══════════════════════════════════════════════════════════════
// Domain Types: The Obsolete Human Museum
// ═══════════════════════════════════════════════════════════════

// ─── Branded Types ──────────────────────────────────────────
// Branded types prevent accidental mixing of structurally
// identical primitives (e.g. passing raw kg where tree-hours
// are expected). The __brand property exists only at the type
// level and carries zero runtime cost.

/** Kilograms of CO₂-equivalent emissions */
export type EmissionsKg = number & { readonly __brand: "EmissionsKg" };

/** Unique identifier for a specimen record */
export type SpecimenId = string & { readonly __brand: "SpecimenId" };

/** Tree-hours: a composite unit representing reforestation effort */
export type TreeHours = number & { readonly __brand: "TreeHours" };

/** Helper to cast a raw number into EmissionsKg at trust boundaries */
export function toEmissionsKg(value: number): EmissionsKg {
  return value as EmissionsKg;
}

/** Helper to cast a raw string into SpecimenId at trust boundaries */
export function toSpecimenId(value: string): SpecimenId {
  return value as SpecimenId;
}

/** Helper to cast a raw number into TreeHours */
export function toTreeHours(value: number): TreeHours {
  return value as TreeHours;
}

// ─── Onboarding Enums ───────────────────────────────────────

export type Diet =
  | "herbivore"
  | "omnivore"
  | "carnivore"
  | "opportunistic";

export type Transport =
  | "none"
  | "public"
  | "private"
  | "mixed"
  | "aviation_heavy";

export type EnergySource =
  | "renewable"
  | "mixed"
  | "fossil"
  | "unknown";

export type HousingType =
  | "apartment"
  | "house"
  | "shared"
  | "nomadic";

export type AcUsage =
  | "none"
  | "occasional"
  | "regular"
  | "constant";

export type ElectronicsReplacement =
  | "rarely"
  | "yearly"
  | "bi_yearly"
  | "obsessively";

// ─── Onboarding Input ───────────────────────────────────────

/** All fields collected during the visitor onboarding flow */
export interface HabitsInput {
  readonly name: string;
  readonly diet: Diet;
  readonly transport: Transport;
  readonly weeklyKm: number;
  readonly energySource: EnergySource;
  readonly housingType: HousingType;
  readonly acUsage: AcUsage;
  readonly deliveriesPerWeek: number;
  readonly electronicsReplacement: ElectronicsReplacement;
}

// ─── Conservation Status (display-friendly) ─────────────────

export type ConservationStatusLevel =
  | "Least Concern"
  | "Vulnerable"
  | "Endangered"
  | "Critically Endangered"
  | "Extinct in the Wild";

// ─── Onboarding Specimen ────────────────────────────────────
// The specimen created from a visitor's onboarding habits.

export interface OnboardingSpecimen {
  readonly id: SpecimenId;
  readonly name: string;
  readonly speciesName: string;
  readonly commonName: string;
  readonly habitat: string;
  readonly diet: Diet;
  readonly transport: Transport;
  readonly energy: EnergySource;
  readonly conservationStatus: ConservationStatusLevel;
  readonly extinctionDate: Date | null;
  readonly emissions: EmissionsKg;
  readonly avatarSeed: string;
  readonly createdAt: Date;
}

// ─── Field Notes (severity-based) ───────────────────────────

export type FieldNoteSeverity = "observation" | "concern" | "critical";

export interface FieldNoteEntry {
  readonly id: string;
  readonly date: string;
  readonly content: string;
  readonly severity: FieldNoteSeverity;
}

// ─── Taxidermy Item ─────────────────────────────────────────

export type TaxidermyCategory =
  | "transportation"
  | "communication"
  | "commerce"
  | "labor"
  | "recreation"
  | "sustenance";

export interface TaxidermyItem {
  readonly id: string;
  readonly name: string;
  readonly carbonCost: EmissionsKg;
  readonly dateAcquired: string;
  readonly plaqueText: string;
  readonly category: TaxidermyCategory;
}


// ═══════════════════════════════════════════════════════════════
// Legacy Types — used by existing museum components
// Kept for backward compatibility with v1 gallery UI
// ═══════════════════════════════════════════════════════════════

/** Conservation status levels for human behavioral specimens */
export type ConservationStatus =
  | "EXTINCT"
  | "CRITICALLY_ENDANGERED"
  | "ENDANGERED"
  | "VULNERABLE"
  | "NEAR_THREATENED"
  | "LEAST_CONCERN";

/** A specimen in the museum's collection (gallery display format) */
export interface Specimen {
  readonly id: string;
  readonly catalogNumber: string;
  readonly commonName: string;
  readonly scientificName: string;
  readonly description: string;
  readonly conservationStatus: ConservationStatus;
  readonly lastObserved: string;
  readonly habitat: string;
  readonly carbonFootprint: CarbonFootprint;
  readonly fieldNotes: string[];
  readonly imageUrl?: string;
  readonly tags: readonly string[];
}

/** Carbon footprint data for a specimen behavior */
export interface CarbonFootprint {
  readonly annualKg: number;
  readonly equivalentTrees: number;
  readonly category: CarbonCategory;
  readonly trend: "INCREASING" | "DECREASING" | "STABLE" | "UNKNOWN";
}

export type CarbonCategory =
  | "TRANSPORT"
  | "DIET"
  | "HOUSING"
  | "CONSUMPTION"
  | "DIGITAL"
  | "RECREATION";

/** Field note entry from museum curators (gallery format) */
export interface FieldNote {
  readonly id: string;
  readonly specimenId: string;
  readonly author: string;
  readonly date: string;
  readonly content: string;
  readonly classification: "OBSERVATION" | "HYPOTHESIS" | "CONCLUSION";
}

/** Habitat data for the HabitatCam component */
export interface HabitatData {
  readonly id: string;
  readonly name: string;
  readonly biome: string;
  readonly temperature: number;
  readonly humidity: number;
  readonly biodiversityIndex: number;
  readonly threatLevel: ConservationStatus;
  readonly coordinates: {
    readonly lat: number;
    readonly lng: number;
  };
  readonly description: string;
}

/** Museum exhibit plaque data (gallery format) */
export interface TaxidermyPlaque {
  readonly specimenId: string;
  readonly title: string;
  readonly dateOfPreservation: string;
  readonly preservationMethod: string;
  readonly curatorNotes: string;
  readonly exhibitHall: string;
  readonly donorAttribution?: string;
}

/** Onboarding step data */
export interface OnboardingStep {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

/** API response wrapper */
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly timestamp: string;
}

/** Curation request payload */
export interface CurationRequest {
  readonly specimenId: string;
  readonly action: "CLASSIFY" | "ANNOTATE" | "ARCHIVE";
  readonly notes?: string;
}

/** Extinction clock data */
export interface ExtinctionClockData {
  readonly behavior: string;
  readonly estimatedExtinctionYear: number;
  readonly currentAdoptionRate: number;
  readonly peakAdoptionYear: number;
  readonly peakAdoptionRate: number;
  readonly declineRatePerYear: number;
}
