import type { TaxidermyItem as TaxidermyItemType, TaxidermyPlaque as LegacyPlaqueType } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { formatMuseumDate, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TaxidermyPlaqueProps {
  plaque?: LegacyPlaqueType;
  item?: TaxidermyItemType;
  className?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  transportation: "Transportation", communication: "Communication",
  commerce: "Commerce", labor: "Labor", recreation: "Recreation", sustenance: "Sustenance",
};

/** Decorative brass corner accents */
function CornerAccents() {
  return (
    <>
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-museum-accent/40 rounded-tl-xl" aria-hidden="true" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-museum-accent/40 rounded-tr-xl" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-museum-accent/40 rounded-bl-xl" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-museum-accent/40 rounded-br-xl" aria-hidden="true" />
    </>
  );
}

function Divider({ width = "w-12" }: { width?: string }) {
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden="true">
      <div className={cn("h-px bg-museum-accent/30", width)} />
      <div className="w-1.5 h-1.5 rounded-full bg-museum-accent/50" />
      <div className={cn("h-px bg-museum-accent/30", width)} />
    </div>
  );
}

/**
 * TaxidermyPlaque — Brass museum plaque for preserved items.
 *
 * Supports both new TaxidermyItem (carbon cost) and legacy plaque format.
 * Each plaque: role="listitem", aria-label with full description,
 * <dl> for metadata, hover/focus reveals full plaque text.
 */
export function TaxidermyPlaque({ plaque, item, className }: TaxidermyPlaqueProps) {
  const cardClasses = cn(
    "group relative overflow-hidden border-museum-accent/20 transition-all",
    "hover:border-museum-accent/50 focus-within:border-museum-accent/50",
    className,
  );

  const revealClasses = cn(
    "text-sm text-museum-text-muted italic leading-relaxed",
    "max-h-0 overflow-hidden transition-all duration-300",
    "group-hover:max-h-40 group-focus-within:max-h-40",
  );

  if (item) {
    const catLabel = CATEGORY_LABELS[item.category] ?? item.category;
    return (
      <Card className={cardClasses} role="listitem" tabIndex={0}
        aria-label={`${item.name}: ${formatNumber(item.carbonCost)} kg CO₂, acquired ${formatMuseumDate(item.dateAcquired)}, category ${catLabel}`}>
        <CornerAccents />
        <CardContent className="p-8 text-center space-y-4">
          <h3 className="font-serif text-2xl text-museum-accent tracking-wide">{item.name}</h3>
          <Divider />
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-mono text-[10px] text-museum-text-muted uppercase tracking-[0.2em]">Carbon Cost</dt>
              <dd className="font-mono text-lg text-museum-danger mt-0.5">{formatNumber(item.carbonCost)} kg CO₂</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] text-museum-text-muted uppercase tracking-[0.2em]">Date Acquired</dt>
              <dd className="font-sans text-museum-text mt-0.5"><time dateTime={item.dateAcquired}>{formatMuseumDate(item.dateAcquired)}</time></dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] text-museum-text-muted uppercase tracking-[0.2em]">Category</dt>
              <dd className="font-sans text-museum-accent mt-0.5">{catLabel}</dd>
            </div>
          </dl>
          <Divider width="w-8" />
          <blockquote className={revealClasses}>&ldquo;{item.plaqueText}&rdquo;</blockquote>
        </CardContent>
      </Card>
    );
  }

  if (!plaque) return null;

  return (
    <Card className={cardClasses} role="listitem" tabIndex={0}
      aria-label={`${plaque.title}: Preserved ${formatMuseumDate(plaque.dateOfPreservation)}, exhibit ${plaque.exhibitHall}`}>
      <CornerAccents />
      <CardContent className="p-8 text-center space-y-4">
        <h3 className="font-serif text-2xl text-museum-accent tracking-wide">{plaque.title}</h3>
        <Divider />
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-mono text-[10px] text-museum-text-muted uppercase tracking-[0.2em]">Specimen ID</dt>
            <dd className="font-mono text-museum-text mt-0.5">{plaque.specimenId}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] text-museum-text-muted uppercase tracking-[0.2em]">Date of Preservation</dt>
            <dd className="font-sans text-museum-text mt-0.5"><time dateTime={plaque.dateOfPreservation}>{formatMuseumDate(plaque.dateOfPreservation)}</time></dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] text-museum-text-muted uppercase tracking-[0.2em]">Method</dt>
            <dd className="font-sans text-museum-text mt-0.5">{plaque.preservationMethod}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] text-museum-text-muted uppercase tracking-[0.2em]">Exhibit Hall</dt>
            <dd className="font-sans text-museum-accent mt-0.5">{plaque.exhibitHall}</dd>
          </div>
        </dl>
        <Divider width="w-8" />
        <blockquote className={revealClasses}>&ldquo;{plaque.curatorNotes}&rdquo;</blockquote>
        {plaque.donorAttribution && (
          <p className="text-[10px] text-museum-text-muted/60 uppercase tracking-widest">Donated by {plaque.donorAttribution}</p>
        )}
      </CardContent>
    </Card>
  );
}
