"use client";

import { useState, useEffect, useCallback } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { announce } from "@/components/accessibility/ScreenReaderAnnouncer";
import { EXTINCTION_CLOCK_DATA, calculateExtinctionProgress, formatYearsRemaining } from "@/lib/extinction";
import { cn } from "@/lib/utils";

interface ExtinctionClockProps {
  /** Optional: personal lifestyle expiry date for the countdown ring */
  expiryDate?: Date | null;
  className?: string;
}

/**
 * ExtinctionClock — Real-time countdown + behavioral decline tracker.
 *
 * Features:
 * - SVG circular progress ring with aria-valuemin/max/now
 * - Ticks every second when an expiryDate is provided
 * - Announces major milestones to screen readers
 * - Falls back to behavioral extinction timeline list
 */
export function ExtinctionClock({ expiryDate, className }: ExtinctionClockProps) {
  const prefersReducedMotion = useReducedMotion();
  const currentYear = new Date().getFullYear();
  const [now, setNow] = useState(Date.now());

  // Tick every second for the countdown
  useEffect(() => {
    if (!expiryDate) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiryDate]);

  // Announce milestones
  const lastMilestone = useState<string | null>(null);
  const checkMilestone = useCallback((remaining: number) => {
    const milestones = [365, 180, 90, 30, 7, 1];
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    for (const m of milestones) {
      if (days === m && lastMilestone[0] !== `${m}`) {
        lastMilestone[1](`${m}`);
        announce(`Warning: Only ${days} day${days !== 1 ? "s" : ""} remaining in your carbon budget.`);
        break;
      }
    }
  }, [lastMilestone]);

  // Calculate countdown values
  const remaining = expiryDate ? Math.max(expiryDate.getTime() - now, 0) : 0;
  const totalBudgetMs = expiryDate ? Math.max(expiryDate.getTime() - (expiryDate.getTime() - 365.25 * 24 * 60 * 60 * 1000), 1) : 1;
  const progressPercent = expiryDate ? Math.min(((totalBudgetMs - remaining) / totalBudgetMs) * 100, 100) : 0;

  if (expiryDate && remaining > 0) {
    checkMilestone(remaining);
  }

  // Format countdown
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  // SVG ring constants
  const RADIUS = 70;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeOffset = CIRCUMFERENCE * (1 - progressPercent / 100);

  return (
    <section aria-labelledby="extinction-clock-heading" className={cn("space-y-8", className)}>
      <header className="text-center space-y-2">
        <h2 id="extinction-clock-heading" className="font-serif text-3xl text-museum-text tracking-wide">
          The Extinction Clock
        </h2>
        <p className="text-sm text-museum-text-muted max-w-lg mx-auto">
          {expiryDate
            ? "Your personal carbon budget countdown — based on your lifestyle emissions."
            : "Tracking the decline of once-universal human behaviors."}
        </p>
      </header>

      {/* ── SVG Countdown Ring ── */}
      {expiryDate && (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-48 h-48">
            <svg
              viewBox="0 0 160 160"
              className="w-full h-full -rotate-90"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressPercent)}
              aria-label="Lifestyle extinction countdown"
            >
              {/* Background ring */}
              <circle cx="80" cy="80" r={RADIUS} fill="none"
                stroke="currentColor" strokeWidth="6"
                className="text-museum-border" />
              {/* Progress ring */}
              <circle cx="80" cy="80" r={RADIUS} fill="none"
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeOffset}
                className={cn(
                  progressPercent >= 80 ? "text-museum-danger" :
                  progressPercent >= 50 ? "text-museum-accent" :
                  "text-museum-secondary",
                  !prefersReducedMotion && "transition-all duration-1000",
                )}
                stroke="currentColor" />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl text-museum-text">{days}</span>
              <span className="text-[10px] text-museum-text-muted uppercase tracking-widest">days left</span>
            </div>
          </div>

          {/* Digital countdown */}
          <div className="flex gap-4 font-mono text-sm text-museum-text-muted" aria-live="off">
            {[
              { val: days, unit: "Days" },
              { val: hours, unit: "Hrs" },
              { val: minutes, unit: "Min" },
              { val: seconds, unit: "Sec" },
            ].map(({ val, unit }) => (
              <div key={unit} className="text-center">
                <span className="block text-lg text-museum-text tabular-nums">{String(val).padStart(2, "0")}</span>
                <span className="text-[9px] uppercase tracking-wider">{unit}</span>
              </div>
            ))}
          </div>

          {/* SR-only live text (updates less frequently) */}
          <p className="sr-only" aria-live="polite">
            {days} days, {hours} hours remaining in your carbon budget.
          </p>
        </div>
      )}

      {/* ── Behavioral Extinction Timeline ── */}
      <div className="space-y-4" role="list" aria-label="Behavioral extinction timelines">
        {EXTINCTION_CLOCK_DATA.map((item) => {
          const progress = calculateExtinctionProgress(item);
          const yearsText = formatYearsRemaining(item.estimatedExtinctionYear, currentYear);
          return (
            <article key={item.behavior} className="p-4 rounded-lg border border-museum-border bg-museum-bg/50 space-y-2" role="listitem">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm text-museum-text">{item.behavior}</h3>
                <span className="font-mono text-xs text-museum-text-muted">{yearsText}</span>
              </div>
              <div className="relative w-full h-2 rounded-full bg-museum-bg-elevated overflow-hidden"
                role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}
                aria-label={`${item.behavior}: ${Math.round(progress)}% toward extinction`}>
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full",
                    progress >= 80 ? "bg-museum-danger" : progress >= 50 ? "bg-museum-accent" : "bg-museum-secondary",
                    !prefersReducedMotion && "transition-all duration-1000 ease-out",
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-museum-text-muted font-mono">
                <span>Peak: {item.peakAdoptionRate}% ({item.peakAdoptionYear})</span>
                <span>Current: {item.currentAdoptionRate}%</span>
                <span>Est. Extinction: {item.estimatedExtinctionYear}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
