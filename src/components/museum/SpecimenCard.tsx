"use client";

import type { Specimen } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { ConservationStatus } from "@/components/museum/ConservationStatus";
import { cn, truncateText, formatNumber, formatMuseumDate } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CARBON_CATEGORIES } from "@/lib/constants";

interface SpecimenCardProps {
  specimen: Specimen;
  onSelect?: (specimen: Specimen) => void;
  className?: string;
}

/**
 * SpecimenCard — Museum specimen display card.
 *
 * Accessibility:
 * - Card uses `<article>` (from Card component) with `aria-labelledby`
 * - Status badge uses aria-label with conservation level + description
 * - "View Full Classification" button has descriptive aria-label
 * - Keyboard navigable: Enter and Space on button open detail view
 * - Tags rendered as a semantic list
 */
export function SpecimenCard({
  specimen,
  onSelect,
  className,
}: SpecimenCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const headingId = `specimen-name-${specimen.id}`;
  const descId = `specimen-desc-${specimen.id}`;

  return (
    <div
      className={cn(
        "group",
        !prefersReducedMotion && "hover:-translate-y-1 transition-transform duration-300",
        className,
      )}
    >
      <Card
        className="h-full flex flex-col"
        aria-labelledby={headingId}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle
                id={headingId}
                className="group-hover:text-museum-accent transition-colors"
              >
                {specimen.commonName}
              </CardTitle>
              <CardDescription className="font-mono text-xs italic mt-1">
                {specimen.scientificName}
              </CardDescription>
            </div>
            <ConservationStatus
              status={specimen.conservationStatus}
              size="sm"
            />
          </div>
          <p className="font-mono text-[10px] text-museum-text-muted/60 tracking-widest uppercase mt-2">
            Catalog No. {specimen.catalogNumber}
          </p>
        </CardHeader>

        <CardContent className="flex-1">
          <p
            id={descId}
            className="text-sm text-museum-text-muted leading-relaxed"
          >
            {truncateText(specimen.description, 200)}
          </p>

          {/* Tags */}
          <ul
            className="mt-4 flex flex-wrap gap-1.5"
            aria-label="Specimen classification tags"
          >
            {specimen.tags.map((tag) => (
              <li key={tag}>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-museum-accent/10 text-museum-accent border border-museum-accent/20">
                  {tag}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-museum-text-muted">
            <span className="font-mono">
              {formatNumber(specimen.carbonFootprint.annualKg)} kg CO₂/yr
            </span>
            <span className="font-sans">
              {CARBON_CATEGORIES[specimen.carbonFootprint.category]}
            </span>
          </div>

          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(specimen)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(specimen);
                }
              }}
              className="
                shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono
                bg-museum-accent/10 text-museum-accent
                border border-museum-accent/30
                hover:bg-museum-accent/20
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-museum-accent focus-visible:ring-offset-1
                focus-visible:ring-offset-museum-bg
                transition-colors
              "
              aria-label={`View full classification for ${specimen.commonName}`}
              aria-describedby={descId}
            >
              View Full Classification
            </button>
          )}

          {!onSelect && (
            <time
              dateTime={specimen.lastObserved}
              className="text-[10px] text-museum-text-muted font-mono"
            >
              Last seen: {formatMuseumDate(specimen.lastObserved)}
            </time>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
