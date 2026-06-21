/**
 * Simplified class value type for className merging
 */
export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassValue[]
  | Record<string, unknown>;

/**
 * clsx - lightweight classname concatenation
 */
function clsx(...args: ClassValue[]): string {
  const classes: string[] = [];

  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === "string") {
      classes.push(arg);
    } else if (typeof arg === "number") {
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      const inner = clsx(...arg);
      if (inner) classes.push(inner);
    } else if (typeof arg === "object") {
      for (const [key, value] of Object.entries(arg)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(" ");
}

/**
 * Merge class names utility (cn).
 * In production, consider adding tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}

/**
 * Format a number with locale-specific thousand separators
 */
export function formatNumber(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format a date string into a museum-style display format
 */
export function formatMuseumDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Date Unknown";
  }
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    era: "short",
  }).format(date);
}

/**
 * Generate a unique catalog number in museum format
 */
export function generateCatalogNumber(): string {
  const prefix = "TOH";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Calculate years until estimated extinction of a behavior
 */
export function yearsUntilExtinction(
  currentRate: number,
  declinePerYear: number,
): number {
  if (declinePerYear <= 0) return Infinity;
  if (currentRate <= 0) return 0;
  return Math.ceil(currentRate / declinePerYear);
}

/**
 * Convert kg CO₂ to equivalent number of trees needed to offset
 */
export function kgCO2ToTrees(kgCO2: number): number {
  const KG_PER_TREE_PER_YEAR = 22;
  return Math.ceil(kgCO2 / KG_PER_TREE_PER_YEAR);
}

/**
 * Truncate text with ellipsis at word boundary
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "…";
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
