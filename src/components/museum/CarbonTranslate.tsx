"use client";

import type { Specimen } from "@/types";
import { useCarbonSpecimen } from "@/hooks/useCarbonSpecimen";
import { Select } from "@/components/ui/Select";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CarbonTranslateProps {
  specimen: Specimen;
  className?: string;
}

const UNIT_OPTIONS = [
  { value: "trees", label: "Trees to Offset" },
  { value: "flightsNYtoLondon", label: "NY↔London Flights" },
  { value: "smartphoneCharges", label: "Phone Charges" },
  { value: "beefBurgers", label: "Beef Burgers" },
  { value: "streamingHours", label: "Streaming Hours" },
] as const;

/**
 * CarbonTranslate — Museum exhibit label translating emissions into metaphors.
 *
 * Accessibility:
 * - Uses definition list (<dl>, <dt>, <dd>) for structured data
 * - Select has associated label
 * - Equivalent value announced via aria-live="polite"
 * - Trend badge has both colour and text label
 */
export function CarbonTranslate({ specimen, className }: CarbonTranslateProps) {
  const { carbonData, translation, selectedUnit, setSelectedUnit, formattedValue } =
    useCarbonSpecimen(specimen);

  if (!carbonData || !translation) return null;

  return (
    <section
      aria-labelledby="carbon-translate-heading"
      className={cn(
        "p-6 rounded-xl border border-museum-border bg-museum-bg-glass backdrop-blur-md",
        className,
      )}
    >
      <header className="mb-4">
        <h3
          id="carbon-translate-heading"
          className="font-serif text-lg text-museum-text flex items-center gap-2"
        >
          <span className="text-museum-secondary" aria-hidden="true">⚗</span>
          Carbon Translation
        </h3>
        <p className="text-xs text-museum-text-muted mt-1">
          Annual carbon impact of this behavioral specimen, translated into tangible equivalents.
        </p>
      </header>

      {/* ── Exhibit data as definition list ── */}
      <dl className="space-y-4">
        {/* Annual emissions */}
        <div className="text-center py-4">
          <dt className="text-xs text-museum-text-muted uppercase tracking-wider">
            kg CO₂ per year
          </dt>
          <dd className="font-mono text-3xl text-museum-accent mt-1">
            {formatNumber(carbonData.annualKg)}
          </dd>
        </div>

        {/* Unit selector */}
        <div>
          <Select
            label="Translate to"
            options={[...UNIT_OPTIONS]}
            value={selectedUnit}
            onChange={(e) =>
              setSelectedUnit(e.target.value as typeof selectedUnit)
            }
            aria-label="Select carbon equivalent unit"
          />
        </div>

        {/* Translated equivalent */}
        <div className="text-center py-2">
          <dt className="sr-only">Carbon equivalent</dt>
          <dd
            className="text-sm text-museum-text font-sans"
            aria-live="polite"
          >
            Equivalent to{" "}
            <strong className="text-museum-accent">{formattedValue()}</strong>
          </dd>
        </div>

        {/* Emission trend */}
        <div className="flex items-center gap-2">
          <dt className="text-xs text-museum-text-muted">Emission trend</dt>
          <dd>
            <span
              className={cn(
                "inline-block px-2 py-0.5 rounded-full text-[9px] font-mono uppercase",
                carbonData.trend === "DECREASING"
                  ? "bg-museum-secondary/20 text-museum-secondary"
                  : carbonData.trend === "INCREASING"
                    ? "bg-museum-danger/20 text-museum-danger"
                    : "bg-museum-accent/20 text-museum-accent",
              )}
            >
              {carbonData.trend === "DECREASING" && "↓ "}
              {carbonData.trend === "INCREASING" && "↑ "}
              {carbonData.trend === "STABLE" && "→ "}
              {carbonData.trend}
            </span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
