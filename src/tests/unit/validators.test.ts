/**
 * @file validators.test.ts
 * @description Implements tests/unit/validators.test.ts for The Obsolete Human Museum.
 */
import { describe, it, expect } from 'vitest';
import {
  onboardingSchema,
  containsXSS,
  sanitizeServerSide,
  specimenSchema,
  fieldNoteSchema,
  curationRequestSchema,
  isValidEmail,
  isValidISODate,
  isValidCatalogNumber,
} from '@/lib/validators';

// ═══════════════════════════════════════════════════════════════
// XSS / Injection Detection
// ═══════════════════════════════════════════════════════════════

describe('containsXSS', () => {
  it('should detect <script> tags', () => {
    expect(containsXSS('<script>alert("xss")</script>')).toBe(true);
    expect(containsXSS('<SCRIPT>alert(1)</SCRIPT>')).toBe(true);
    expect(containsXSS('<script src="evil.js">')).toBe(true);
  });

  it('should detect javascript: protocol', () => {
    expect(containsXSS('javascript:alert(1)')).toBe(true);
    expect(containsXSS('JAVASCRIPT:void(0)')).toBe(true);
  });

  it('should detect inline event handlers', () => {
    expect(containsXSS('onerror=alert(1)')).toBe(true);
    expect(containsXSS('onload=malicious()')).toBe(true);
    expect(containsXSS('onmouseover = steal()')).toBe(true);
    expect(containsXSS('ONERROR=alert(1)')).toBe(true);
  });

  it('should detect <iframe> tags', () => {
    expect(containsXSS('<iframe src="evil.com">')).toBe(true);
    expect(containsXSS('<IFRAME>')).toBe(true);
  });

  it('should detect <object> tags', () => {
    expect(containsXSS('<object data="evil.swf">')).toBe(true);
  });

  it('should NOT flag clean strings', () => {
    expect(containsXSS("John O'Brien")).toBe(false);
    expect(containsXSS('Mary-Jane Watson')).toBe(false);
    expect(containsXSS('A perfectly normal name')).toBe(false);
    expect(containsXSS('')).toBe(false);
  });
});

describe('sanitizeServerSide', () => {
  it('should strip HTML tags', () => {
    expect(sanitizeServerSide('<b>bold</b>')).toBe('bold');
    expect(sanitizeServerSide('<p>paragraph</p>')).toBe('paragraph');
  });

  it('should strip HTML entities', () => {
    expect(sanitizeServerSide('hello&amp;world')).toBe('helloworld');
    expect(sanitizeServerSide('&#60;script&#62;')).toBe('script');
  });

  it('should trim whitespace', () => {
    expect(sanitizeServerSide('  hello  ')).toBe('hello');
  });

  it('should handle clean strings unchanged', () => {
    expect(sanitizeServerSide('Clean text')).toBe('Clean text');
  });
});

// ═══════════════════════════════════════════════════════════════
// Onboarding Schema
// ═══════════════════════════════════════════════════════════════

describe('onboardingSchema', () => {
  const validInput = {
    name: 'Jane Goodall',
    diet: 'omnivore' as const,
    transport: 'public' as const,
    weeklyKm: 50,
    energySource: 'mixed' as const,
    housingType: 'apartment' as const,
    acUsage: 'occasional' as const,
    deliveriesPerWeek: 3,
    electronicsReplacement: 'bi_yearly' as const,
  };

  it('should accept valid input', () => {
    const result = onboardingSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should transform name by stripping whitespace', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      name: '  Jane Goodall  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Jane Goodall');
    }
  });

  // ── Name validation ──

  it('should reject names shorter than 2 characters', () => {
    const result = onboardingSchema.safeParse({ ...validInput, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('should reject names longer than 50 characters', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      name: 'A'.repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it('should reject names with numbers', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      name: 'Jane123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject names with special characters beyond hyphens/apostrophes', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      name: 'Jane@Goodall',
    });
    expect(result.success).toBe(false);
  });

  it('should accept names with hyphens and apostrophes', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      name: "Mary-Jane O'Brien",
    });
    expect(result.success).toBe(true);
  });

  // ── XSS in name field ──

  it('should reject XSS in name: <script> tag', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      name: '<script>alert("xss")</script>',
    });
    expect(result.success).toBe(false);
  });

  it('should reject XSS in name: javascript: protocol', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      name: 'javascript:alert(1)',
    });
    expect(result.success).toBe(false);
  });

  it('should reject XSS in name: onerror handler', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      name: 'onerror=alert(1)',
    });
    expect(result.success).toBe(false);
  });

  it('should reject XSS in name: iframe', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      name: '<iframe src="evil">',
    });
    expect(result.success).toBe(false);
  });

  // ── Numeric fields ──

  it('should reject negative weeklyKm', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      weeklyKm: -10,
    });
    expect(result.success).toBe(false);
  });

  it('should reject weeklyKm over 5000', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      weeklyKm: 5001,
    });
    expect(result.success).toBe(false);
  });

  it('should accept weeklyKm of 0', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      weeklyKm: 0,
    });
    expect(result.success).toBe(true);
  });

  it('should reject negative deliveries', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      deliveriesPerWeek: -1,
    });
    expect(result.success).toBe(false);
  });

  it('should reject deliveries over 50', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      deliveriesPerWeek: 51,
    });
    expect(result.success).toBe(false);
  });

  it('should reject non-integer deliveries', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      deliveriesPerWeek: 3.5,
    });
    expect(result.success).toBe(false);
  });

  // ── Enum fields ──

  it('should reject invalid diet value', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      diet: 'breatharian',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid transport value', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      transport: 'teleportation',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid energySource value', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      energySource: 'antimatter',
    });
    expect(result.success).toBe(false);
  });

  it('should accept all valid diet values', () => {
    for (const diet of [
      'herbivore',
      'omnivore',
      'carnivore',
      'opportunistic',
    ]) {
      const result = onboardingSchema.safeParse({ ...validInput, diet });
      expect(result.success).toBe(true);
    }
  });

  it('should accept all valid transport values', () => {
    for (const transport of [
      'none',
      'public',
      'private',
      'mixed',
      'aviation_heavy',
    ]) {
      const result = onboardingSchema.safeParse({ ...validInput, transport });
      expect(result.success).toBe(true);
    }
  });

  // ── Empty / missing fields ──

  it('should reject an empty name', () => {
    const result = onboardingSchema.safeParse({ ...validInput, name: '' });
    expect(result.success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const result = onboardingSchema.safeParse({ name: 'Jane' });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// Legacy Schemas
// ═══════════════════════════════════════════════════════════════

describe('specimenSchema', () => {
  it('should validate a valid specimen', () => {
    const result = specimenSchema.safeParse({
      commonName: 'The Manual Automobile Operator',
      scientificName: 'Homo conducentis manualis',
      description:
        'Once the dominant form of personal transportation involving physical vehicle control.',
      conservationStatus: 'ENDANGERED',
      habitat: 'Suburban sprawl zones',
      carbonCategory: 'TRANSPORT',
    });
    expect(result.success).toBe(true);
  });

  it('should reject a specimen with too-short common name', () => {
    const result = specimenSchema.safeParse({
      commonName: 'Hi',
      scientificName: 'Homo test',
      description:
        'A sufficiently long description for validation purposes here.',
      conservationStatus: 'EXTINCT',
      habitat: 'Test habitat',
      carbonCategory: 'DIET',
    });
    expect(result.success).toBe(false);
  });

  it('should reject an invalid conservation status', () => {
    const result = specimenSchema.safeParse({
      commonName: 'Valid Name Here',
      scientificName: 'Homo validus',
      description:
        'A sufficiently long description for validation purposes here.',
      conservationStatus: 'INVALID_STATUS',
      habitat: 'Test habitat',
      carbonCategory: 'DIET',
    });
    expect(result.success).toBe(false);
  });
});

describe('fieldNoteSchema', () => {
  it('should validate a valid field note', () => {
    const result = fieldNoteSchema.safeParse({
      specimenId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      content:
        'Observed the specimen engaging in remarkable behavior patterns.',
      classification: 'OBSERVATION',
    });
    expect(result.success).toBe(true);
  });

  it('should reject a field note with invalid UUID', () => {
    const result = fieldNoteSchema.safeParse({
      specimenId: 'not-a-uuid',
      content: 'Some valid content here for testing.',
      classification: 'OBSERVATION',
    });
    expect(result.success).toBe(false);
  });
});

describe('curationRequestSchema', () => {
  it('should validate a valid curation request', () => {
    const result = curationRequestSchema.safeParse({
      specimenId: 'TOH-K7R2M-A4B9',
      action: 'CLASSIFY',
      notes: 'Needs reclassification based on new data.',
    });
    expect(result.success).toBe(true);
  });

  it('should allow curation request without notes', () => {
    const result = curationRequestSchema.safeParse({
      specimenId: 'TOH-K7R2M-A4B9',
      action: 'ARCHIVE',
    });
    expect(result.success).toBe(true);
  });
});

describe('isValidEmail', () => {
  it('should accept valid emails', () => {
    expect(isValidEmail('curator@museum.org')).toBe(true);
    expect(isValidEmail('field.researcher@obsolete-human.com')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@museum.org')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidISODate', () => {
  it('should accept valid ISO dates', () => {
    expect(isValidISODate('2024-03-15T00:00:00.000Z')).toBe(true);
  });

  it('should reject invalid dates', () => {
    expect(isValidISODate('not-a-date')).toBe(false);
    expect(isValidISODate('2024-13-45')).toBe(false);
  });
});

describe('isValidCatalogNumber', () => {
  it('should accept valid catalog numbers', () => {
    expect(isValidCatalogNumber('TOH-K7R2M-A4B9')).toBe(true);
    expect(isValidCatalogNumber('TOH-ABCDEFGHIJ-XY12')).toBe(true);
  });

  it('should reject invalid catalog numbers', () => {
    expect(isValidCatalogNumber('INVALID')).toBe(false);
    expect(isValidCatalogNumber('TOH-AB-CD')).toBe(false);
    expect(isValidCatalogNumber('')).toBe(false);
  });
});
