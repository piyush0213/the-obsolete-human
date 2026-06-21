/**
 * @file page.tsx
 * @description Implements app/page.tsx for The Obsolete Human Museum.
 */
import React from 'react';
import Link from 'next/link';

/**
 * @description The main entrance page for the museum, introducing the concept.
 * @returns {JSX.Element} The rendered hero section and features.
 */
function EntrancePageComponent(): JSX.Element {
  return (
    <div className="relative">
      {/* ── Hero Section ── */}
      <section
        className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-museum-accent/5 rounded-full blur-3xl motion-safe:animate-float" />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-museum-secondary/5 rounded-full blur-3xl motion-safe:animate-float"
            style={{ animationDelay: '3s' }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-museum-accent/[0.02] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8">
          <div className="space-y-6">
            <p className="font-mono text-xs text-museum-accent uppercase tracking-[0.4em] motion-safe:animate-fade-in">
              A Carbon Footprint Awareness Platform
            </p>

            <h1
              id="hero-heading"
              className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold text-museum-text tracking-tight motion-safe:animate-slide-up"
              style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}
            >
              The Museum of the Obsolete Human
            </h1>

            <div className="museum-divider">
              <span className="font-mono text-xs text-museum-text-muted">
                Est. 3026
              </span>
            </div>

            <p
              className="text-lg sm:text-xl text-museum-text-muted max-w-2xl mx-auto leading-relaxed motion-safe:animate-fade-in font-sans"
              style={{ animationDelay: '0.3s' }}
            >
              Calculate your environmental impact. Classified by AI.
            </p>
            <p
              className="text-md sm:text-lg text-museum-text-muted/80 max-w-xl mx-auto leading-relaxed motion-safe:animate-fade-in font-sans"
              style={{ animationDelay: '0.4s' }}
            >
              This museum calculates your carbon emissions and translates them
              into a species conservation status.
            </p>
          </div>

          <div
            className="motion-safe:animate-fade-in"
            style={{ animationDelay: '0.6s' }}
          >
            <Link
              href="/onboarding"
              className="group inline-flex items-center justify-center gap-3 h-14 px-10 rounded-lg bg-museum-accent text-museum-bg font-sans font-semibold text-base shadow-accent-glow hover:bg-museum-accent-hover transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-museum-text focus-visible:ring-offset-2 focus-visible:ring-offset-museum-bg"
              aria-label="Enter the exhibit and begin classification"
            >
              Enter the Exhibit
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="motion-safe:group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Scroll indicator — decorative */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          aria-hidden="true"
        >
          <span className="text-[10px] font-mono text-museum-text-muted/40 uppercase tracking-[0.3em]">
            Scroll
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-museum-text-muted/30"
            style={{ animation: 'scroll-indicator 2s ease-in-out infinite' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section
        className="py-20 border-t border-museum-border"
        aria-labelledby="stats-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="stats-heading" className="sr-only">
            Museum Statistics
          </h2>
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            role="list"
            aria-label="Museum collection statistics"
          >
            {[
              { value: '4,219', label: 'Documented Behaviors', icon: '📋' },
              { value: '847', label: 'Confirmed Extinct', icon: '🦴' },
              { value: '1,203', label: 'Critically Endangered', icon: '⚠' },
              { value: '156', label: 'Active Field Studies', icon: '🔬' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-xl border border-museum-border bg-museum-bg-glass backdrop-blur-md"
                role="listitem"
              >
                <span className="text-2xl" aria-hidden="true">
                  {stat.icon}
                </span>
                <p className="font-mono text-3xl text-museum-accent mt-2">
                  {stat.value}
                </p>
                <p className="text-xs text-museum-text-muted uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call to action ── */}
      <section
        className="py-20 border-t border-museum-border"
        aria-labelledby="cta-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-mono text-xs text-museum-secondary uppercase tracking-[0.3em]">
            Begin Your Study
          </p>
          <h2
            id="cta-heading"
            className="font-serif text-3xl sm:text-4xl text-museum-text mt-2"
          >
            Are You Already Obsolete?
          </h2>
          <p className="text-sm text-museum-text-muted mt-3 max-w-lg mx-auto">
            Submit your habits for classification. Discover your species name,
            conservation status, and carbon extinction timeline.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-museum-accent text-museum-bg font-sans font-medium text-sm shadow-accent-glow hover:bg-museum-accent-hover transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-museum-text focus-visible:ring-offset-2 focus-visible:ring-offset-museum-bg"
              aria-label="Begin the specimen classification process"
            >
              Classify Yourself
            </Link>
            <Link
              href="/taxidermy"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-transparent text-museum-accent border border-museum-border hover:border-museum-border-hover hover:bg-museum-accent/5 font-sans font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-museum-accent focus-visible:ring-offset-2 focus-visible:ring-offset-museum-bg"
              aria-label="Browse the taxidermy archives"
            >
              Browse Archives
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default React.memo(EntrancePageComponent);
