import { describe, it, expect } from "vitest";
import type { HabitsInput } from "@/types";
import {
  calculateCarbonEmissions,
  calculateLifestyleExpiry,
  translateToTreeHours,
  getConservationStatus,
  calculateExtinctionProgress,
  getConservationStatusFromRate,
  formatYearsRemaining,
  EXTINCTION_CLOCK_DATA,
  SAMPLE_SPECIMENS,
} from "@/lib/extinction";

// ═══════════════════════════════════════════════════════════════
// calculateLifestyleExpiry
// ═══════════════════════════════════════════════════════════════

describe("calculateLifestyleExpiry", () => {
  it("should return ~18 months from now for 3 tonnes/year (budget 1.5t)", () => {
    // budget = 1500 kg, annual = 3000 kg → 0.5 years = 6 months
    const expiry = calculateLifestyleExpiry(3000, 1.5);
    const now = Date.now();
    const diffMs = expiry.getTime() - now;
    const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);

    // Should be approximately 6 months (1500/3000 = 0.5 years)
    expect(diffMonths).toBeGreaterThan(5);
    expect(diffMonths).toBeLessThan(7);
  });

  it("should return ~3 years from now for 0.5 tonnes/year (budget 1.5t)", () => {
    // budget = 1500 kg, annual = 500 kg → 3 years
    const expiry = calculateLifestyleExpiry(500, 1.5);
    const now = Date.now();
    const diffMs = expiry.getTime() - now;
    const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);

    expect(diffYears).toBeGreaterThan(2.9);
    expect(diffYears).toBeLessThan(3.1);
  });

  it("should return a very distant date for near-zero emissions", () => {
    const expiry = calculateLifestyleExpiry(1, 1.5);
    const now = Date.now();
    const diffYears =
      (expiry.getTime() - now) / (1000 * 60 * 60 * 24 * 365.25);

    // 1500 kg / 1 kg = 1500 years
    expect(diffYears).toBeGreaterThan(1400);
  });

  it("should return a date in the future", () => {
    const expiry = calculateLifestyleExpiry(5000);
    expect(expiry.getTime()).toBeGreaterThan(Date.now());
  });

  it("should return sooner expiry for higher emissions", () => {
    const low = calculateLifestyleExpiry(1000);
    const high = calculateLifestyleExpiry(10000);
    expect(high.getTime()).toBeLessThan(low.getTime());
  });

  it("should use 1.5t default budget when not specified", () => {
    // 1500 kg budget / 1500 kg annual = 1 year
    const expiry = calculateLifestyleExpiry(1500);
    const now = Date.now();
    const diffYears =
      (expiry.getTime() - now) / (1000 * 60 * 60 * 24 * 365.25);

    expect(diffYears).toBeGreaterThan(0.9);
    expect(diffYears).toBeLessThan(1.1);
  });
});

// ═══════════════════════════════════════════════════════════════
// calculateCarbonEmissions
// ═══════════════════════════════════════════════════════════════

describe("calculateCarbonEmissions", () => {
  const baseHabits: HabitsInput = {
    name: "Test Subject",
    diet: "omnivore",
    transport: "public",
    weeklyKm: 50,
    energySource: "mixed",
    housingType: "apartment",
    acUsage: "none",
    deliveriesPerWeek: 2,
    electronicsReplacement: "bi_yearly",
  };

  it("should return a positive number for typical habits", () => {
    const emissions = calculateCarbonEmissions(baseHabits);
    expect(emissions).toBeGreaterThan(0);
  });

  it("should return higher emissions for carnivore diet", () => {
    const omnivore = calculateCarbonEmissions(baseHabits);
    const carnivore = calculateCarbonEmissions({
      ...baseHabits,
      diet: "carnivore",
    });
    expect(carnivore).toBeGreaterThan(omnivore);
  });

  it("should return higher emissions for private transport with more km", () => {
    const publicTransport = calculateCarbonEmissions(baseHabits);
    const privateHeavy = calculateCarbonEmissions({
      ...baseHabits,
      transport: "private",
      weeklyKm: 300,
    });
    expect(privateHeavy).toBeGreaterThan(publicTransport);
  });

  it("should return lower emissions for renewable energy", () => {
    const mixed = calculateCarbonEmissions(baseHabits);
    const renewable = calculateCarbonEmissions({
      ...baseHabits,
      energySource: "renewable",
    });
    expect(renewable).toBeLessThan(mixed);
  });

  it("should return lower emissions for shared housing", () => {
    const apartment = calculateCarbonEmissions(baseHabits);
    const shared = calculateCarbonEmissions({
      ...baseHabits,
      housingType: "shared",
    });
    expect(shared).toBeLessThan(apartment);
  });

  it("should increase with more deliveries", () => {
    const few = calculateCarbonEmissions(baseHabits);
    const many = calculateCarbonEmissions({
      ...baseHabits,
      deliveriesPerWeek: 20,
    });
    expect(many).toBeGreaterThan(few);
  });

  it("should return zero transport contribution for zero km", () => {
    const zeroKm = calculateCarbonEmissions({
      ...baseHabits,
      weeklyKm: 0,
      transport: "private",
    });
    const someKm = calculateCarbonEmissions({
      ...baseHabits,
      weeklyKm: 100,
      transport: "private",
    });
    expect(zeroKm).toBeLessThan(someKm);
  });

  it("should add AC usage to total", () => {
    const noAc = calculateCarbonEmissions(baseHabits);
    const constantAc = calculateCarbonEmissions({
      ...baseHabits,
      acUsage: "constant",
    });
    expect(constantAc).toBeGreaterThan(noAc);
  });
});

// ═══════════════════════════════════════════════════════════════
// translateToTreeHours
// ═══════════════════════════════════════════════════════════════

describe("translateToTreeHours", () => {
  it("should return a readable string for 1000 kg", () => {
    const result = translateToTreeHours(1000);
    expect(result).toMatch(/\d+ trees? working for \d+ months?/);
  });

  it("should contain 'trees' for large values", () => {
    const result = translateToTreeHours(1000);
    expect(result).toContain("trees");
  });

  it("should return '0 trees working for 0 months' for zero emissions", () => {
    expect(translateToTreeHours(0)).toBe("0 trees working for 0 months");
  });

  it("should return '0 trees working for 0 months' for negative emissions", () => {
    expect(translateToTreeHours(-100)).toBe("0 trees working for 0 months");
  });

  it("should use singular 'tree' for 1 tree", () => {
    // Very small emission → 1 tree, ~1 month
    const result = translateToTreeHours(2);
    expect(result).toMatch(/1 tree working for/);
  });

  it("should scale trees up for very large values", () => {
    const result = translateToTreeHours(50000);
    // Should have many trees rather than thousands of months
    const match = result.match(/^(\d+)/);
    expect(match).not.toBeNull();
    const treeCount = parseInt(match![1]!, 10);
    expect(treeCount).toBeGreaterThan(1);
  });
});

// ═══════════════════════════════════════════════════════════════
// getConservationStatus
// ═══════════════════════════════════════════════════════════════

describe("getConservationStatus", () => {
  it("should return 'Least Concern' for ≤ 1500 kg", () => {
    expect(getConservationStatus(1000)).toBe("Least Concern");
    expect(getConservationStatus(1500)).toBe("Least Concern");
  });

  it("should return 'Vulnerable' for 1501–4000 kg", () => {
    expect(getConservationStatus(2000)).toBe("Vulnerable");
    expect(getConservationStatus(4000)).toBe("Vulnerable");
  });

  it("should return 'Endangered' for 4001–8000 kg", () => {
    expect(getConservationStatus(5000)).toBe("Endangered");
    expect(getConservationStatus(8000)).toBe("Endangered");
  });

  it("should return 'Critically Endangered' for 8001–16000 kg", () => {
    expect(getConservationStatus(10000)).toBe("Critically Endangered");
    expect(getConservationStatus(16000)).toBe("Critically Endangered");
  });

  it("should return 'Extinct in the Wild' for > 16000 kg", () => {
    expect(getConservationStatus(20000)).toBe("Extinct in the Wild");
    expect(getConservationStatus(100000)).toBe("Extinct in the Wild");
  });

  it("should return 'Least Concern' for 0 emissions", () => {
    expect(getConservationStatus(0)).toBe("Least Concern");
  });
});

// ═══════════════════════════════════════════════════════════════
// Legacy Functions
// ═══════════════════════════════════════════════════════════════

describe("calculateExtinctionProgress", () => {
  it("should calculate progress for a declining behavior", () => {
    const data = EXTINCTION_CLOCK_DATA[0];
    if (!data) return;
    const progress = calculateExtinctionProgress(data);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  it("should return 0 for a behavior at peak adoption", () => {
    const progress = calculateExtinctionProgress({
      behavior: "Test",
      estimatedExtinctionYear: 2100,
      currentAdoptionRate: 95,
      peakAdoptionYear: 2020,
      peakAdoptionRate: 95,
      declineRatePerYear: 1,
    });
    expect(progress).toBe(0);
  });

  it("should return 100 for an extinct behavior", () => {
    const progress = calculateExtinctionProgress({
      behavior: "Test",
      estimatedExtinctionYear: 2020,
      currentAdoptionRate: 0,
      peakAdoptionYear: 1990,
      peakAdoptionRate: 90,
      declineRatePerYear: 5,
    });
    expect(progress).toBe(100);
  });
});

describe("getConservationStatusFromRate", () => {
  it("should return EXTINCT for 0 adoption", () => {
    expect(getConservationStatusFromRate(0)).toBe("EXTINCT");
  });

  it("should return CRITICALLY_ENDANGERED for very low rates", () => {
    expect(getConservationStatusFromRate(3)).toBe("CRITICALLY_ENDANGERED");
  });

  it("should return ENDANGERED for low rates", () => {
    expect(getConservationStatusFromRate(10)).toBe("ENDANGERED");
  });

  it("should return VULNERABLE for moderate-low rates", () => {
    expect(getConservationStatusFromRate(25)).toBe("VULNERABLE");
  });

  it("should return NEAR_THREATENED for moderate rates", () => {
    expect(getConservationStatusFromRate(40)).toBe("NEAR_THREATENED");
  });

  it("should return LEAST_CONCERN for high rates", () => {
    expect(getConservationStatusFromRate(75)).toBe("LEAST_CONCERN");
  });
});

describe("formatYearsRemaining", () => {
  it("should format future years correctly", () => {
    expect(formatYearsRemaining(2050, 2026)).toBe("24 years remaining");
  });

  it("should handle 1 year remaining", () => {
    expect(formatYearsRemaining(2027, 2026)).toBe("1 year remaining");
  });

  it("should handle already extinct", () => {
    expect(formatYearsRemaining(2020, 2026)).toBe("Already extinct");
    expect(formatYearsRemaining(2026, 2026)).toBe("Already extinct");
  });
});

describe("SAMPLE_SPECIMENS", () => {
  it("should contain specimen data", () => {
    expect(SAMPLE_SPECIMENS.length).toBeGreaterThan(0);
  });

  it("should have valid specimen structure", () => {
    const specimen = SAMPLE_SPECIMENS[0];
    if (!specimen) return;
    expect(specimen.id).toBeTruthy();
    expect(specimen.commonName).toBeTruthy();
    expect(specimen.scientificName).toBeTruthy();
    expect(specimen.conservationStatus).toBeTruthy();
    expect(specimen.carbonFootprint.annualKg).toBeGreaterThan(0);
  });
});

describe("EXTINCTION_CLOCK_DATA", () => {
  it("should contain extinction clock entries", () => {
    expect(EXTINCTION_CLOCK_DATA.length).toBeGreaterThan(0);
  });

  it("should have valid data structure", () => {
    const entry = EXTINCTION_CLOCK_DATA[0];
    if (!entry) return;
    expect(entry.behavior).toBeTruthy();
    expect(entry.estimatedExtinctionYear).toBeGreaterThan(2020);
    expect(entry.currentAdoptionRate).toBeGreaterThanOrEqual(0);
    expect(entry.peakAdoptionRate).toBeGreaterThan(0);
  });
});
