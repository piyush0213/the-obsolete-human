'use client';
/**
 * @file CarbonReport.tsx
 * @description Implements components/museum/CarbonReport.tsx for The Obsolete Human Museum.
 */

import React from 'react';
import { formatNumber } from '@/lib/utils';
import dynamic from 'next/dynamic';
import type { OnboardingSpecimen, Specimen } from '@/types';

const ClimateContext = dynamic(
  () =>
    import('@/components/museum/ClimateContext').then(
      (mod) => mod.ClimateContext
    ),
  {
    ssr: false,
  }
);

/**
 * @description CarbonReport component that breaks down user emissions by category.
 */
function CarbonReportComponent({
  specimen,
}: {
  specimen: OnboardingSpecimen;
}): JSX.Element {
  const transportPct =
    specimen.transport === 'private' || specimen.transport === 'aviation_heavy'
      ? 45
      : 15;
  const dietPct =
    specimen.diet === 'carnivore' || specimen.diet === 'omnivore' ? 35 : 15;
  const energyPct = specimen.energy === 'fossil' ? 30 : 10;
  const remainder = 100 - (transportPct + dietPct + energyPct);

  return (
    <section
      className="glass-panel p-6 sm:p-8 space-y-6 border-museum-accent bg-museum-accent/10 mb-8"
      aria-label="Carbon Footprint Report"
    >
      <header className="text-center">
        <h2 className="font-serif text-2xl text-museum-accent uppercase tracking-widest">
          Carbon Footprint Report
        </h2>
        <p className="font-mono text-4xl font-bold mt-4 text-museum-text">
          Annual Emissions: {formatNumber(specimen.emissions)} kg CO₂
        </p>
      </header>

      {/* Uses the imported component, wrapped with valid props */}
      <ClimateContext
        specimen={
          {
            carbonFootprint: { annualKg: specimen.emissions },
          } as unknown as Specimen
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center py-4">
        <div className="bg-museum-bg/30 p-3 rounded-lg border border-museum-border">
          <p className="text-xs text-museum-text-muted uppercase tracking-wider mb-1">
            Transport
          </p>
          <p className="font-mono text-xl text-museum-accent">
            {transportPct}%
          </p>
        </div>
        <div className="bg-museum-bg/30 p-3 rounded-lg border border-museum-border">
          <p className="text-xs text-museum-text-muted uppercase tracking-wider mb-1">
            Diet
          </p>
          <p className="font-mono text-xl text-museum-accent">{dietPct}%</p>
        </div>
        <div className="bg-museum-bg/30 p-3 rounded-lg border border-museum-border">
          <p className="text-xs text-museum-text-muted uppercase tracking-wider mb-1">
            Energy
          </p>
          <p className="font-mono text-xl text-museum-accent">{energyPct}%</p>
        </div>
        <div className="bg-museum-bg/30 p-3 rounded-lg border border-museum-border">
          <p className="text-xs text-museum-text-muted uppercase tracking-wider mb-1">
            Consumption
          </p>
          <p className="font-mono text-xl text-museum-accent">{remainder}%</p>
        </div>
      </div>

      <div className="bg-museum-bg/50 p-6 rounded-lg border border-museum-border">
        <h3 className="font-serif text-lg text-museum-text mb-4">
          3 Personalized Actions to Reduce
        </h3>
        <ul className="list-disc pl-5 space-y-3 text-sm text-museum-text-muted marker:text-museum-accent">
          {transportPct > 30 ? (
            <li>Shift 2 commutes per week to public transit or cycling.</li>
          ) : (
            <li>Combine errands to reduce vehicle mileage.</li>
          )}
          {dietPct > 20 ? (
            <li>Adopt a plant-based diet for 3 days a week.</li>
          ) : (
            <li>Source local produce to reduce supply chain emissions.</li>
          )}
          {energyPct > 20 ? (
            <li>
              Switch to a renewable energy provider or install solar panels.
            </li>
          ) : (
            <li>Upgrade home insulation to reduce heating footprint.</li>
          )}
        </ul>
      </div>
    </section>
  );
}

export const CarbonReport = React.memo(CarbonReportComponent);
