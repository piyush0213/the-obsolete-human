'use client';
/**
 * @file SkipToContent.tsx
 * @description Implements components/accessibility/SkipToContent.tsx for The Obsolete Human Museum.
 */

/**
 * SkipToContent — Accessibility skip-navigation link.
 *
 * Visually hidden by default. When a keyboard user presses Tab
 * the link appears with high-contrast styling and jumps focus
 * to `#main-content`.
 *
 * WCAG 2.4.1 (Bypass Blocks) — Level A
 */
/**
 * @description Component SkipToContent
 * @returns {JSX.Element}
 */
export function SkipToContent(): JSX.Element {
  return (
    <a
      href="#main-content"
      className="
        fixed top-0 left-0 z-[9999]
        -translate-y-full focus:translate-y-0
        bg-museum-accent text-museum-bg
        px-6 py-3 font-sans font-bold text-sm
        underline underline-offset-4
        transition-transform duration-200
        focus:outline-none focus:ring-4 focus:ring-museum-text
        focus:ring-offset-2 focus:ring-offset-museum-bg
        rounded-br-lg shadow-lg
      "
      id="skip-to-content"
    >
      Skip to main content
    </a>
  );
}
