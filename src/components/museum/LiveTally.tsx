/**
 * @file LiveTally.tsx
 * @description Implements components/museum/LiveTally.tsx for The Obsolete Human Museum.
 */
import { memo } from 'react';
import { formatNumber } from '@/lib/utils';
import { SUSTAINABLE_TARGET_KG, HUNDRED_PERCENT } from '@/lib/constants';

function LiveTallyComponent({
  emissions,
}: {
  emissions: number | null;
}): JSX.Element | null {
  if (emissions === null) return null;
  const target = SUSTAINABLE_TARGET_KG;
  const pct = Math.min((emissions / target) * HUNDRED_PERCENT, HUNDRED_PERCENT);
  return (
    <div
      className="bg-museum-accent/10 border border-museum-accent/30 p-4 rounded-lg mt-6 text-center shadow-inner"
      aria-live="polite"
    >
      <p className="font-mono text-sm text-museum-text">
        Estimated emissions:{' '}
        <span className="text-museum-accent text-lg">
          {formatNumber(emissions)}
        </span>{' '}
        kg CO₂/year
      </p>
      <div
        className="w-full bg-museum-bg-dark h-2 mt-3 rounded-full overflow-hidden flex"
        aria-hidden="true"
      >
        <div
          className="bg-museum-secondary h-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-museum-text-muted mt-2 uppercase tracking-wider">
        Distance from 1.5 ton (1,500 kg) sustainable target
      </p>
    </div>
  );
}

export const LiveTally = memo(LiveTallyComponent);
export default LiveTally;
