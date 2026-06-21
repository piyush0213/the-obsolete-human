/**
 * @file validators.ts
 * @description Implements lib/validators.ts for The Obsolete Human Museum.
 */
import { z } from 'zod';
import type { ConservationStatus, CarbonCategory } from '@/types';

// ═══════════════════════════════════════════════════════════════
// XSS / Injection Protection
// ═══════════════════════════════════════════════════════════════

/** Patterns that indicate XSS or injection attempts */
const XSS_PATTERNS: readonly RegExp[] = [
  /<script/i,
  /javascript:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /<iframe/i,
  /<object/i,
  /on\w+\s*=/i, // Catch all inline event handlers
  /data:\s*text\/html/i,
  /vbscript:/i,
  /<embed/i,
  /<form/i,
];

/**
 * Check whether a string contains XSS/injection patterns.
 * Returns true if the string is DANGEROUS.
 */
export function containsXSS(input: string): boolean {
  return XSS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Server-safe HTML sanitizer.
 * Strips all HTML tags using regex (DOMPurify requires a DOM
 * and is therefore client-only).
 */
export function sanitizeServerSide(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/&#?\w+;/g, '') // Strip HTML entities
    .trim();
}

/**
 * Zod refinement: reject strings containing XSS payloads.
 * Attach to any z.string() with `.refine(noXSS.check, noXSS.message)`.
 */
export const noXSS = {
  check: (val: string) => !containsXSS(val),
  message: 'Input contains potentially dangerous content',
} as const;

// ═══════════════════════════════════════════════════════════════
// Onboarding Form Schema
// ═══════════════════════════════════════════════════════════════

/** Dietary classification of the specimen */
export const dietEnum = z.enum(
  ['herbivore', 'omnivore', 'carnivore', 'opportunistic'],
  { errorMap: () => ({ message: 'Select a valid dietary classification' }) }
);

/** Primary mode of transport */
export const transportEnum = z.enum(
  ['none', 'public', 'private', 'mixed', 'aviation_heavy'],
  { errorMap: () => ({ message: 'Select a valid transport mode' }) }
);

/** Domestic energy source */
export const energySourceEnum = z.enum(
  ['renewable', 'mixed', 'fossil', 'unknown'],
  { errorMap: () => ({ message: 'Select a valid energy source' }) }
);

/** Housing type */
export const housingTypeEnum = z.enum(
  ['apartment', 'house', 'shared', 'nomadic'],
  { errorMap: () => ({ message: 'Select a valid housing type' }) }
);

/** Air-conditioning usage frequency */
export const acUsageEnum = z.enum(
  ['none', 'occasional', 'regular', 'constant'],
  { errorMap: () => ({ message: 'Select a valid AC usage level' }) }
);

/** Electronics replacement cadence */
export const electronicsReplacementEnum = z.enum(
  ['rarely', 'yearly', 'bi_yearly', 'obsessively'],
  { errorMap: () => ({ message: 'Select a valid replacement frequency' }) }
);

/**
 * Complete onboarding form schema.
 *
 * Every string field is:
 * 1. Trimmed of leading/trailing whitespace
 * 2. Checked against XSS patterns
 * 3. Sanitized to strip residual HTML
 */
export const onboardingSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(
      /^[a-zA-Z\s\-']+$/,
      'Name may only contain letters, spaces, hyphens, and apostrophes'
    )
    .refine(noXSS.check, noXSS.message)
    .transform(sanitizeServerSide),

  diet: dietEnum,

  transport: transportEnum,

  weeklyKm: z
    .number({ invalid_type_error: 'Weekly km must be a number' })
    .min(0, 'Weekly km cannot be negative')
    .max(5000, 'Weekly km cannot exceed 5,000'),

  energySource: energySourceEnum,

  housingType: housingTypeEnum,

  acUsage: acUsageEnum,

  deliveriesPerWeek: z
    .number({ invalid_type_error: 'Deliveries must be a number' })
    .int('Deliveries must be a whole number')
    .min(0, 'Deliveries cannot be negative')
    .max(50, 'Deliveries cannot exceed 50 per week'),

  electronicsReplacement: electronicsReplacementEnum,
});

/** Inferred type from the onboarding schema (post-transform) */
export type OnboardingInput = z.infer<typeof onboardingSchema>;

/** Raw input shape (pre-transform, for form binding) */
export type OnboardingRaw = z.input<typeof onboardingSchema>;

// ═══════════════════════════════════════════════════════════════
// Legacy Schemas — used by existing gallery components
// ═══════════════════════════════════════════════════════════════

/** Valid conservation statuses */
const CONSERVATION_STATUSES: ConservationStatus[] = [
  'EXTINCT',
  'CRITICALLY_ENDANGERED',
  'ENDANGERED',
  'VULNERABLE',
  'NEAR_THREATENED',
  'LEAST_CONCERN',
];

/** Valid carbon categories */
const CARBON_CATEGORIES: CarbonCategory[] = [
  'TRANSPORT',
  'DIET',
  'HOUSING',
  'CONSUMPTION',
  'DIGITAL',
  'RECREATION',
];

/** Schema for specimen creation/validation */
export const specimenSchema = z.object({
  commonName: z
    .string()
    .min(3, 'Common name must be at least 3 characters')
    .max(100, 'Common name must not exceed 100 characters')
    .trim(),
  scientificName: z
    .string()
    .min(3, 'Scientific name must be at least 3 characters')
    .max(150, 'Scientific name must not exceed 150 characters')
    .trim(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .trim(),
  conservationStatus: z.enum(CONSERVATION_STATUSES as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid conservation status' }),
  }),
  habitat: z
    .string()
    .min(3, 'Habitat must be at least 3 characters')
    .max(200, 'Habitat must not exceed 200 characters')
    .trim(),
  carbonCategory: z.enum(CARBON_CATEGORIES as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid carbon category' }),
  }),
});

/** Schema for field note creation */
export const fieldNoteSchema = z.object({
  specimenId: z.string().uuid('Invalid specimen ID format'),
  content: z
    .string()
    .min(10, 'Field note must be at least 10 characters')
    .max(2000, 'Field note must not exceed 2000 characters')
    .trim(),
  classification: z.enum(['OBSERVATION', 'HYPOTHESIS', 'CONCLUSION'], {
    errorMap: () => ({ message: 'Invalid classification type' }),
  }),
});

/** Schema for curation API request */
export const curationRequestSchema = z.object({
  specimenId: z.string().min(1, 'Specimen ID is required'),
  action: z.enum(['CLASSIFY', 'ANNOTATE', 'ARCHIVE'], {
    errorMap: () => ({ message: 'Invalid curation action' }),
  }),
  notes: z
    .string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),
});

/** Validate email format */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/** Validate that a string is a valid ISO date */
export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.toISOString() === dateString;
}

/** Validate catalog number format (TOH-XXXXX-XXXX) */
export function isValidCatalogNumber(catalogNumber: string): boolean {
  const pattern = /^TOH-[A-Z0-9]{5,10}-[A-Z0-9]{4}$/;
  return pattern.test(catalogNumber);
}

export type SpecimenInput = z.infer<typeof specimenSchema>;
export type FieldNoteInput = z.infer<typeof fieldNoteSchema>;
export type CurationRequestInput = z.infer<typeof curationRequestSchema>;
