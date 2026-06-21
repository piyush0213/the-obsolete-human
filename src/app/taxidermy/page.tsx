'use client';
/**
 * @file page.tsx
 * @description Implements app/taxidermy/page.tsx for The Obsolete Human Museum.
 */

import React from 'react';

import { useState, useMemo } from 'react';
import type { TaxidermyPlaque as TaxidermyPlaqueType } from '@/types';
import { TaxidermyPlaque } from '@/components/museum/TaxidermyPlaque';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatMuseumDate } from '@/lib/utils';

const PLAQUES: TaxidermyPlaqueType[] = [
  {
    specimenId: 'TOH-K7R2M-A4B9',
    title: 'The Last Manual Driver',
    dateOfPreservation: '2024-03-15T00:00:00.000Z',
    preservationMethod: 'Holographic Neural Capture (HNC-7)',
    curatorNotes:
      "Preserved at the precise moment the specimen activated the combustion engine's ignition sequence — a cascade of controlled explosions that would propel a 1,800-kilogram metal chassis at velocities exceeding 100 km/h. The subject's calm demeanor during this objectively terrifying procedure remains a source of scholarly fascination.",
    exhibitHall: 'Hall of Forgotten Commutes',
    donorAttribution: 'The Musk Foundation for Automotive History',
  },
  {
    specimenId: 'TOH-P3Q8N-C5D2',
    title: 'The Currency Counter',
    dateOfPreservation: '2023-11-20T00:00:00.000Z',
    preservationMethod: 'Temporal Crystallization (TC-3)',
    curatorNotes:
      'Captured mid-transaction at a street market, this specimen is shown exchanging processed cellulose rectangles for organic produce. Note the characteristic thumb-and-forefinger motion used to separate individual notes — a fine motor skill now lost to the species entirely.',
    exhibitHall: 'Gallery of Analog Communication',
    donorAttribution: 'The Federal Reserve Historical Society',
  },
  {
    specimenId: 'TOH-L9M4K-E7F3',
    title: 'The Cubicle Sentinel',
    dateOfPreservation: '2024-06-01T00:00:00.000Z',
    preservationMethod: 'Ambient Field Suspension (AFS-12)',
    curatorNotes:
      "This specimen was preserved during 'the afternoon slump' — a daily circadian trough that afflicted office workers between 14:00 and 15:30. The subject is seated in a pneumatic chair, staring at a luminous rectangle, one hand resting on a peripheral input device called a 'mouse.'",
    exhibitHall: 'Wing of Manual Labor',
  },
  {
    specimenId: 'TOH-R5S1T-G8H4',
    title: 'The Aisle Navigator',
    dateOfPreservation: '2024-08-10T00:00:00.000Z',
    preservationMethod: 'Quantum State Freezing (QSF-2)',
    curatorNotes:
      "Frozen at the moment of selecting a cereal product from among 47 nearly identical options. The subject's expression — a mixture of concentration, mild confusion, and resigned acceptance — has been cited in over 200 academic papers on the paradox of choice.",
    exhibitHall: 'Chamber of Physical Commerce',
    donorAttribution: 'The Walmart Anthropological Trust',
  },
];

/** Exhibit halls for filtering */
const HALLS = Array.from(new Set(PLAQUES.map((p) => p.exhibitHall)));
/**
 * @description Displays a searchable grid of saved behavioral specimens.
 * @returns {JSX.Element} The taxidermy archive interface.
 */
function TaxidermyPageComponent(): JSX.Element {
  const [selectedPlaque, setSelectedPlaque] =
    useState<TaxidermyPlaqueType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hallFilter, setHallFilter] = useState('');

  const filtered = useMemo(() => {
    return PLAQUES.filter((plaque) => {
      const matchesSearch =
        !searchQuery ||
        plaque.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plaque.curatorNotes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plaque.specimenId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesHall = !hallFilter || plaque.exhibitHall === hallFilter;

      return matchesSearch && matchesHall;
    });
  }, [searchQuery, hallFilter]);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12 space-y-4">
          <p className="font-mono text-xs text-museum-accent uppercase tracking-[0.3em]">
            Wing C — Preservation Archives
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-museum-text tracking-tight">
            The Taxidermy Hall
          </h1>
          <p className="text-museum-text-muted max-w-2xl mx-auto leading-relaxed">
            Our most meticulously preserved specimens, frozen at the exact
            moment of their peak cultural significance. Each display captures
            not just the physical form, but the emotional resonance of behaviors
            that defined an era.
          </p>
        </header>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-2xl mx-auto">
          <div className="flex-1">
            <Input
              label="Search Archives"
              placeholder="Search by name, ID, or notes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search the taxidermy archive"
            />
          </div>
          <div className="sm:w-64">
            <Select
              label="Exhibit Hall"
              options={[
                { value: '', label: 'All Halls' },
                ...HALLS.map((hall) => ({ value: hall, label: hall })),
              ]}
              value={hallFilter}
              onChange={(e) => setHallFilter(e.target.value)}
              aria-label="Filter by exhibit hall"
            />
          </div>
        </div>

        {/* ── Grid ── */}
        <ul
          className="grid grid-cols-1 md:grid-cols-2 gap-8 list-none p-0 m-0"
          aria-label="Preserved specimens"
        >
          {filtered.map((plaque) => (
            <li key={plaque.specimenId}>
              <button
                type="button"
                onClick={() => setSelectedPlaque(plaque)}
                className="cursor-pointer text-left w-full h-full block focus-ring p-0 border-none bg-transparent"
              >
                <TaxidermyPlaque plaque={plaque} />
              </button>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-serif text-xl text-museum-text-muted">
              No specimens match your search.
            </p>
            <p className="text-sm text-museum-text-muted/60 mt-2">
              Try adjusting your filters or browse the full archive.
            </p>
          </div>
        )}

        {/* ── Detail Dialog ── */}
        <Dialog
          open={selectedPlaque !== null}
          onClose={() => setSelectedPlaque(null)}
          title={selectedPlaque?.title ?? 'Specimen Details'}
          description={
            selectedPlaque
              ? `Specimen ${selectedPlaque.specimenId} — ${selectedPlaque.exhibitHall}`
              : undefined
          }
        >
          {selectedPlaque && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="font-mono text-[10px] text-museum-text-muted uppercase tracking-widest">
                    Date of Preservation
                  </dt>
                  <dd className="text-museum-text mt-0.5">
                    <time dateTime={selectedPlaque.dateOfPreservation}>
                      {formatMuseumDate(selectedPlaque.dateOfPreservation)}
                    </time>
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] text-museum-text-muted uppercase tracking-widest">
                    Preservation Method
                  </dt>
                  <dd className="text-museum-text mt-0.5">
                    {selectedPlaque.preservationMethod}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] text-museum-text-muted uppercase tracking-widest">
                    Exhibit Hall
                  </dt>
                  <dd className="text-museum-accent mt-0.5">
                    {selectedPlaque.exhibitHall}
                  </dd>
                </div>
                {selectedPlaque.donorAttribution && (
                  <div>
                    <dt className="font-mono text-[10px] text-museum-text-muted uppercase tracking-widest">
                      Donor
                    </dt>
                    <dd className="text-museum-text mt-0.5">
                      {selectedPlaque.donorAttribution}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="museum-plaque">
                <p className="text-sm leading-relaxed">
                  &ldquo;{selectedPlaque.curatorNotes}&rdquo;
                </p>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </div>
  );
}

export default React.memo(TaxidermyPageComponent);
