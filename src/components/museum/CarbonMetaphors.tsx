/**
 * @file CarbonMetaphors.tsx
 * @description Implements components/museum/CarbonMetaphors.tsx for The Obsolete Human Museum.
 */
import React, { useMemo } from 'react';
import { formatNumber } from '@/lib/utils';
import { translateToTreeHours } from '@/lib/carbon-calculator';
import type { OnboardingSpecimen } from '@/types';

/** Metaphor translations for emissions */
export function getCarbonMetaphors(
  kg: number
): { label: string; value: string; icon: string }[] {
  return [
    {
      label: 'NY↔London Flights',
      value: (kg / 986).toFixed(1),
      icon: '✈',
    },
    {
      label: 'Beef Burgers',
      value: formatNumber(Math.round(kg / 3.6)),
      icon: '🍔',
    },
    {
      label: 'Trees to Offset',
      value: formatNumber(Math.ceil(kg / 22)),
      icon: '🌳',
    },
    {
      label: 'Smartphone Charges',
      value: formatNumber(Math.round(kg / 0.008)),
      icon: '📱',
    },
  ];
}

/**
 * @description CarbonMetaphors renders the metaphors grid for a specimen's emissions.
 */
function CarbonMetaphorsComponent({
  specimen,
}: {
  specimen: OnboardingSpecimen;
}): JSX.Element {
  const metaphors = useMemo(
    () => getCarbonMetaphors(specimen.emissions),
    [specimen.emissions]
  );
  const treeHours = useMemo(
    () => translateToTreeHours(specimen.emissions),
    [specimen.emissions]
  );

  return (
    <section className="mt-8" aria-labelledby="carbon-metaphors-heading">
      <h2
        id="carbon-metaphors-heading"
        className="font-serif text-2xl text-museum-text text-center mb-6"
      >
        Carbon Translation
      </h2>
      <p className="text-sm text-museum-text-muted text-center mb-6 max-w-lg mx-auto">
        Your annual {formatNumber(specimen.emissions)} kg CO₂ is equivalent to{' '}
        <strong className="text-museum-accent">{treeHours}</strong>.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metaphors.map((m) => (
          <div
            key={m.label}
            className="text-center p-4 rounded-lg border border-museum-border bg-museum-bg-glass"
          >
            <span className="text-2xl" aria-hidden="true">
              {m.icon}
            </span>
            <p className="font-mono text-xl text-museum-accent mt-2">
              {m.value}
            </p>
            <p className="text-[10px] text-museum-text-muted uppercase tracking-wider mt-1">
              {m.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export const CarbonMetaphors = React.memo(CarbonMetaphorsComponent);
