/**
 * @file ClimateContext.tsx
 * @description Implements components/museum/ClimateContext.tsx for The Obsolete Human Museum.
 */
import React from 'react';
import { formatNumber } from '@/lib/utils';
import type { Specimen } from '@/types';

function ClimateContextComponent({
  specimen,
}: {
  specimen: Specimen;
}): JSX.Element | null {
  const userKg = specimen.carbonFootprint?.annualKg;
  if (!userKg) return null;

  const globalAvg = 4800;
  const parisTarget = 1500;

  // Calculate max range for progress bar (cap it at a reasonable maximum for extreme users)
  const maxRange = Math.max(userKg + 1000, 10000);

  return (
    <section className="p-6 rounded-xl border border-museum-border bg-museum-bg-glass backdrop-blur-md space-y-6">
      <header>
        <h3 className="font-serif text-xl text-museum-text">Climate Context</h3>
        <p className="text-sm text-museum-text-muted mt-1">
          Comparing this specimen&apos;s annual carbon emissions against global
          benchmarks.
        </p>
      </header>

      <div className="relative pt-6 pb-2">
        {/* Background track */}
        <div className="h-4 bg-museum-bg-dark rounded-full overflow-hidden flex">
          <div
            className="h-full bg-museum-secondary/40 border-r border-museum-secondary"
            style={{
              width: `${Math.min((parisTarget / maxRange) * 100, 100)}%`,
            }}
            title="Paris Agreement Target"
          />
          <div
            className="h-full bg-museum-accent/30 border-r border-museum-accent"
            style={{
              width: `${Math.min(((globalAvg - parisTarget) / maxRange) * 100, 100)}%`,
            }}
            title="Global Average"
          />
        </div>

        {/* User Marker */}
        <div
          className="absolute top-2 bottom-0 w-1 bg-museum-text z-10 shadow-glow"
          style={{ left: `${Math.min((userKg / maxRange) * 100, 100)}%` }}
        >
          <div className="absolute -top-6 -translate-x-1/2 text-xs font-mono font-bold text-museum-text whitespace-nowrap">
            You: {formatNumber(userKg)} kg CO₂
          </div>
        </div>

        {/* Benchmark Markers */}
        <div
          className="absolute top-10 w-px h-2 bg-museum-secondary"
          style={{ left: `${(parisTarget / maxRange) * 100}%` }}
        >
          <span className="absolute top-3 -translate-x-1/2 text-[10px] text-museum-secondary font-mono whitespace-nowrap">
            Target: 1.5t
          </span>
        </div>
        <div
          className="absolute top-10 w-px h-2 bg-museum-accent"
          style={{ left: `${(globalAvg / maxRange) * 100}%` }}
        >
          <span className="absolute top-3 -translate-x-1/2 text-[10px] text-museum-accent font-mono whitespace-nowrap">
            Avg: 4.8t
          </span>
        </div>
      </div>
    </section>
  );
}

export const ClimateContext = React.memo(ClimateContextComponent);
