'use client';
/**
 * @file page.tsx
 * @description Implements app/specimen/page.tsx for The Obsolete Human Museum.
 */

import Link from 'next/link';
import { useOnboardingSpecimen } from '@/hooks/useCarbonSpecimen';
import { ExtinctionClock } from '@/components/museum/ExtinctionClock';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatNumber } from '@/lib/utils';
import React from 'react';

import { CarbonReport } from '@/components/museum/CarbonReport';
import { CarbonMetaphors } from '@/components/museum/CarbonMetaphors';
import { STATUS_COLORS } from '@/lib/constants';

/**
 * @description Displays the detailed breakdown of a generated specimen's habits and conservation status.
 * @returns {JSX.Element} The specimen profile layout.
 */
function SpecimenPageComponent(): JSX.Element {
  const { specimen, isLoading } = useOnboardingSpecimen();

  if (isLoading) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton variant="text" lines={2} />
          <Skeleton variant="card" />
          <Skeleton variant="rect" />
        </div>
      </div>
    );
  }

  // No specimen → redirect back
  if (!specimen) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-2xl px-4 text-center space-y-6">
          <div className="text-6xl" aria-hidden="true">
            🔬
          </div>
          <h1 className="font-serif text-3xl text-museum-text">
            No Specimen on File
          </h1>
          <p className="text-museum-text-muted leading-relaxed">
            Our records show no classified specimen for your session. Please
            proceed to the Classification wing to submit your behavioral data
            for analysis.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-museum-accent text-museum-bg font-sans font-medium text-sm shadow-accent-glow hover:bg-museum-accent-hover transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-museum-text focus-visible:ring-offset-2 focus-visible:ring-offset-museum-bg"
          >
            Begin Classification
          </Link>
        </div>
      </div>
    );
  }

  const statusColors = STATUS_COLORS[specimen.conservationStatus] ?? {
    text: 'text-museum-secondary',
    bg: 'bg-museum-secondary/20',
    border: 'border-museum-secondary/30',
  };

  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ── Specimen Article ── */}
        <article aria-labelledby="specimen-heading">
          <header className="text-center space-y-4 mb-10">
            <p className="font-mono text-xs text-museum-accent uppercase tracking-[0.3em]">
              Specimen Profile — Catalog #
              {specimen.id.slice(0, 8).toUpperCase()}
            </p>
            <h1
              id="specimen-heading"
              className="font-serif text-4xl sm:text-5xl text-museum-text tracking-tight"
            >
              {specimen.commonName}
            </h1>
            <p className="font-mono text-sm text-museum-accent italic">
              {specimen.speciesName}
            </p>
          </header>

          <CarbonReport specimen={specimen} />

          {/* ── Status + Core Data ── */}
          <section
            className="glass-panel p-6 sm:p-8"
            aria-label="Specimen classification data"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Conservation Status */}
              <div className="text-center p-4 rounded-lg border border-museum-border bg-museum-bg/50">
                <p className="font-mono text-[10px] text-museum-text-muted uppercase tracking-widest mb-2">
                  Conservation Status
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border ${statusColors.text} ${statusColors.bg} ${statusColors.border}`}
                  role="status"
                  aria-label={`Conservation status: ${specimen.conservationStatus}`}
                >
                  {specimen.conservationStatus}
                </span>
              </div>

              {/* Annual Emissions */}
              <div className="text-center p-4 rounded-lg border border-museum-border bg-museum-bg/50">
                <p className="font-mono text-[10px] text-museum-text-muted uppercase tracking-widest mb-2">
                  Annual Emissions
                </p>
                <p className="font-mono text-2xl text-museum-accent">
                  {formatNumber(specimen.emissions)}
                </p>
                <p className="text-[10px] text-museum-text-muted mt-1">
                  kg CO₂ per year
                </p>
              </div>

              {/* Habitat */}
              <div className="text-center p-4 rounded-lg border border-museum-border bg-museum-bg/50">
                <p className="font-mono text-[10px] text-museum-text-muted uppercase tracking-widest mb-2">
                  Primary Habitat
                </p>
                <p className="font-sans text-sm text-museum-text capitalize">
                  {specimen.habitat}
                </p>
              </div>

              {/* Extinction Date */}
              <div className="text-center p-4 rounded-lg border border-museum-border bg-museum-bg/50">
                <p className="font-mono text-[10px] text-museum-text-muted uppercase tracking-widest mb-2">
                  Est. Extinction
                </p>
                <p className="font-mono text-sm text-museum-danger">
                  {specimen.extinctionDate
                    ? new Intl.DateTimeFormat('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }).format(specimen.extinctionDate)
                    : 'Unknown'}
                </p>
              </div>
            </div>
          </section>

          {/* ── Carbon Translation (Relatable Metaphors) ── */}
          <CarbonMetaphors specimen={specimen} />
        </article>

        {/* ── Extinction Clock ── */}
        <ExtinctionClock expiryDate={specimen.extinctionDate} />

        {/* ── Navigation Buttons ── */}
        <section className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/habitat">
            <Button variant="default" size="lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Enter Habitat Cam
            </Button>
          </Link>
          <Link href="/taxidermy">
            <Button variant="outline" size="lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              View Taxidermy Room
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}

export default React.memo(SpecimenPageComponent);
