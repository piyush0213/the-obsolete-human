import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Uses DOMPurify with a strict configuration.
 */
export function sanitizeHTML(dirty: string): string {
  if (typeof window === "undefined") {
    // Server-side: strip all HTML tags
    return dirty.replace(/<[^>]*>/g, "");
  }
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "br", "p", "span"],
    ALLOWED_ATTR: ["class"],
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitize user input for plain text fields.
 * Strips all HTML and trims whitespace.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim();
}

/**
 * Sanitize a URL to prevent javascript: and data: protocol attacks
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  const normalized = trimmed.toLowerCase();

  if (
    normalized.startsWith("javascript:") ||
    normalized.startsWith("data:") ||
    normalized.startsWith("vbscript:")
  ) {
    return "#";
  }

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("/") ||
    normalized.startsWith("#")
  ) {
    return trimmed;
  }

  return "#";
}

/**
 * Sanitize catalog number input to match expected format
 */
export function sanitizeCatalogNumber(input: string): string {
  return input.replace(/[^A-Z0-9-]/gi, "").toUpperCase();
}
