/**
 * @file utils.test.ts
 * @description Implements tests/unit/utils.test.ts for The Obsolete Human Museum.
 */
import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatMuseumDate,
  generateCatalogNumber,
  yearsUntilExtinction,
  kgCO2ToTrees,
  truncateText,
} from '@/lib/utils';

describe('formatNumber', () => {
  it('should format numbers with thousand separators', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(42)).toBe('42');
  });
});

describe('formatMuseumDate', () => {
  it('should format valid ISO dates in museum style', () => {
    const result = formatMuseumDate('2024-03-15T00:00:00.000Z');
    expect(result).toContain('2024');
    expect(result).toContain('March');
  });

  it("should return 'Date Unknown' for invalid dates", () => {
    expect(formatMuseumDate('not-a-date')).toBe('Date Unknown');
  });
});

describe('generateCatalogNumber', () => {
  it('should generate a catalog number with TOH prefix', () => {
    const catalogNumber = generateCatalogNumber();
    expect(catalogNumber).toMatch(/^TOH-/);
  });

  it('should generate unique catalog numbers', () => {
    const a = generateCatalogNumber();
    const b = generateCatalogNumber();
    expect(a).not.toBe(b);
  });
});

describe('yearsUntilExtinction', () => {
  it('should calculate years correctly', () => {
    expect(yearsUntilExtinction(100, 10)).toBe(10);
    expect(yearsUntilExtinction(50, 5)).toBe(10);
  });

  it('should return 0 for already extinct behaviors', () => {
    expect(yearsUntilExtinction(0, 5)).toBe(0);
  });

  it('should return Infinity for stable behaviors', () => {
    expect(yearsUntilExtinction(100, 0)).toBe(Infinity);
    expect(yearsUntilExtinction(100, -1)).toBe(Infinity);
  });
});

describe('kgCO2ToTrees', () => {
  it('should convert kg CO2 to number of trees', () => {
    expect(kgCO2ToTrees(22)).toBe(1);
    expect(kgCO2ToTrees(44)).toBe(2);
    expect(kgCO2ToTrees(4600)).toBe(210);
  });

  it('should round up', () => {
    expect(kgCO2ToTrees(1)).toBe(1);
    expect(kgCO2ToTrees(23)).toBe(2);
  });
});

describe('truncateText', () => {
  it('should not truncate short text', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('should truncate at word boundary', () => {
    const result = truncateText('The quick brown fox jumps', 15);
    expect(result).toContain('…');
    expect(result.length).toBeLessThanOrEqual(16);
  });

  it('should handle exact length', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });
});
