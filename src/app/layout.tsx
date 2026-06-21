/**
 * @file layout.tsx
 * @description Implements app/layout.tsx for The Obsolete Human Museum.
 */
import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { SkipToContent } from '@/components/accessibility/SkipToContent';
import { ScreenReaderAnnouncer } from '@/components/accessibility/ScreenReaderAnnouncer';
import { NAV_LINKS, MUSEUM_NAME, MUSEUM_TAGLINE } from '@/lib/constants';
import { NavigationLink } from '@/components/museum/NavigationLink';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    default: 'The Obsolete Human | Carbon Footprint Awareness',
    template: '%s | The Obsolete Human',
  },
  description:
    'Calculate your carbon footprint and visualize your environmental impact as a museum exhibit from the year 3026.',
  keywords: [
    'carbon footprint',
    'climate change',
    'environmental impact',
    'museum',
    'extinction',
    'sustainability',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a1814',
};

/**
 * @description Component RootLayout
 * @returns {JSX.Element}
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-museum-bg text-museum-text antialiased">
        <SkipToContent />
        <ScreenReaderAnnouncer />
        <div className="museum-grain" aria-hidden="true" />

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* ── Header ── */}
          <header className="sticky top-0 z-40 border-b border-museum-border bg-museum-bg/80 backdrop-blur-lg">
            <nav
              className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
              aria-label="Main navigation"
            >
              <div className="flex h-16 items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center gap-3 group"
                  aria-label="The Obsolete Human — Return to entrance"
                >
                  <div className="w-8 h-8 rounded-lg bg-museum-accent/20 border border-museum-accent/30 flex items-center justify-center group-hover:bg-museum-accent/30 transition-colors">
                    <span
                      className="font-serif text-museum-accent text-sm"
                      aria-hidden="true"
                    >
                      Ω
                    </span>
                  </div>
                  <div>
                    <p className="font-serif text-sm font-semibold text-museum-text tracking-wide">
                      {MUSEUM_NAME}
                    </p>
                    <p className="text-[9px] text-museum-text-muted uppercase tracking-[0.3em] hidden sm:block">
                      Est. 3026
                    </p>
                  </div>
                </Link>

                <ul className="flex items-center gap-1">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <NavigationLink
                        href={link.href}
                        label={link.label}
                        ariaLabel={link.ariaLabel}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </header>

          {/* ── Main ── */}
          <main id="main-content" className="flex-1" tabIndex={-1}>
            {children}
          </main>

          {/* ── Footer ── */}
          <footer className="border-t border-museum-border bg-museum-bg/50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="font-serif text-sm text-museum-text">
                    {MUSEUM_NAME}
                  </p>
                  <p className="text-xs text-museum-text-muted mt-1">
                    {MUSEUM_TAGLINE}
                  </p>
                </div>
                <p className="text-xs text-museum-text-muted/60 font-mono">
                  © 3026 Department of Anthropological Preservation
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
