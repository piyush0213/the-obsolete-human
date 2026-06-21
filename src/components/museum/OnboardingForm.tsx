'use client';
/**
 * @file OnboardingForm.tsx
 * @description Implements components/museum/OnboardingForm.tsx for The Obsolete Human Museum.
 */

import React from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import dynamic from 'next/dynamic';
import { useOnboardingForm } from '@/hooks/useOnboardingForm';

const LiveTally = dynamic(() => import('@/components/museum/LiveTally'), {
  ssr: false,
});

function OnboardingFormComponent(): JSX.Element {
  const {
    errors,
    isSubmitting,
    liveEmissions,
    formRef,
    handleSubmit,
    handleFormChange,
  } = useOnboardingForm();

  if (isSubmitting) {
    return (
      <div
        className="space-y-6"
        role="status"
        aria-label="Classifying specimen"
      >
        <p className="sr-only">Classifying specimen, please wait.</p>
        <div className="glass-panel p-8 space-y-6">
          <Skeleton variant="text" lines={2} />
          <Skeleton variant="rect" />
          <Skeleton variant="text" lines={3} />
          <Skeleton variant="rect" className="h-12" />
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onChange={handleFormChange}
      noValidate
      className="space-y-10"
    >
      <fieldset className="glass-panel p-6 sm:p-8 space-y-5">
        <legend className="font-serif text-xl text-museum-text px-2">
          <span className="font-mono text-[10px] text-museum-accent uppercase tracking-widest block mb-1">
            Section 1
          </span>
          Nesting Behavior
        </legend>

        <Input
          label="Specimen Name"
          name="name"
          placeholder="Enter your name"
          error={errors.name}
          helperText="How should we label your specimen tag?"
          required
          autoComplete="given-name"
        />

        <Select
          label="Housing Type"
          name="housingType"
          placeholder="Select shelter classification"
          options={[
            {
              value: 'apartment',
              label: 'Apartment — Multi-unit hive structure',
            },
            { value: 'house', label: 'House — Detached territorial dwelling' },
            { value: 'shared', label: 'Shared — Communal habitation' },
            { value: 'nomadic', label: 'Nomadic — No fixed shelter' },
          ]}
          error={errors.housingType}
          helperText="Larger territorial dwellings (houses) require more carbon-intensive temperature control than multi-unit structures."
        />

        <Select
          label="Energy Source"
          name="energySource"
          placeholder="Select primary energy"
          options={[
            { value: 'renewable', label: 'Renewable — Solar/Wind/Hydro' },
            { value: 'mixed', label: 'Mixed — Hybrid grid' },
            { value: 'fossil', label: 'Fossil — Combustion-based' },
            { value: 'unknown', label: 'Unknown — Unaware of source' },
          ]}
          error={errors.energySource}
          helperText="Fossil combustion adds heavy carbon burdens compared to renewable grids."
        />

        <Select
          label="Air Conditioning Usage"
          name="acUsage"
          placeholder="Select AC frequency"
          options={[
            { value: 'none', label: 'None — Thermal endurance' },
            { value: 'occasional', label: 'Occasional — Seasonal deployment' },
            { value: 'regular', label: 'Regular — Daily activation' },
            {
              value: 'constant',
              label: 'Constant — Permanent climate control',
            },
          ]}
          error={errors.acUsage}
          helperText="Permanent climate control significantly increases a specimen's energy footprint."
        />
        <LiveTally emissions={liveEmissions} />
      </fieldset>

      <fieldset className="glass-panel p-6 sm:p-8 space-y-5">
        <legend className="font-serif text-xl text-museum-text px-2">
          <span className="font-mono text-[10px] text-museum-accent uppercase tracking-widest block mb-1">
            Section 2
          </span>
          Dietary Class
        </legend>

        <Select
          label="Primary Diet"
          name="diet"
          placeholder="Select dietary classification"
          options={[
            { value: 'herbivore', label: 'Herbivore — Plant-based sustenance' },
            { value: 'omnivore', label: 'Omnivore — Mixed consumption' },
            {
              value: 'carnivore',
              label: 'Carnivore — Animal-protein dominant',
            },
            {
              value: 'opportunistic',
              label: 'Opportunistic — Whatever is available',
            },
          ]}
          error={errors.diet}
          helperText="Animal-protein dominant diets have a significantly higher carbon footprint due to agricultural emissions."
        />

        <Input
          label="Deliveries Per Week"
          name="deliveriesPerWeek"
          type="number"
          placeholder="0"
          min={0}
          max={50}
          defaultValue={0}
          error={errors.deliveriesPerWeek}
          helperText="How many food/goods deliveries arrive at your nest weekly? High carbon cost for final-mile logistics."
        />
        <LiveTally emissions={liveEmissions} />
      </fieldset>

      <fieldset className="glass-panel p-6 sm:p-8 space-y-5">
        <legend className="font-serif text-xl text-museum-text px-2">
          <span className="font-mono text-[10px] text-museum-accent uppercase tracking-widest block mb-1">
            Section 3
          </span>
          Migration Patterns
        </legend>

        <Select
          label="Transport Mode"
          name="transport"
          placeholder="Select primary locomotion"
          options={[
            { value: 'none', label: 'None — Sedentary specimen' },
            { value: 'public', label: 'Public — Mass transit utilization' },
            {
              value: 'private',
              label: 'Private — Personal combustion vehicle',
            },
            { value: 'mixed', label: 'Mixed — Multi-modal migration' },
            {
              value: 'aviation_heavy',
              label: 'Aviation Heavy — Frequent flyer',
            },
          ]}
          error={errors.transport}
          helperText="Personal combustion vehicles and aviation are among the largest individual carbon contributors."
        />

        <Input
          label="Weekly Distance (km)"
          name="weeklyKm"
          type="number"
          placeholder="0"
          min={0}
          max={5000}
          defaultValue={0}
          error={errors.weeklyKm}
          helperText="Total kilometers traveled per week by your primary transport mode, driving major CO₂ emissions."
        />
        <LiveTally emissions={liveEmissions} />
      </fieldset>

      <fieldset className="glass-panel p-6 sm:p-8 space-y-5">
        <legend className="font-serif text-xl text-museum-text px-2">
          <span className="font-mono text-[10px] text-museum-accent uppercase tracking-widest block mb-1">
            Section 4
          </span>
          Display Behavior
        </legend>

        <Select
          label="Electronics Replacement Frequency"
          name="electronicsReplacement"
          placeholder="Select replacement cadence"
          options={[
            { value: 'rarely', label: 'Rarely — Until device failure' },
            { value: 'bi_yearly', label: 'Bi-Yearly — Every two cycles' },
            { value: 'yearly', label: 'Yearly — Annual upgrade ritual' },
            {
              value: 'obsessively',
              label: 'Obsessively — Every release event',
            },
          ]}
          error={errors.electronicsReplacement}
          helperText="Manufacturing synthetic polymers and rare-earth components for electronics has a massive hidden carbon cost."
        />
        <LiveTally emissions={liveEmissions} />
      </fieldset>

      <div className="text-center">
        <Button type="submit" size="lg" className="min-w-[240px]">
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
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Classify Specimen
        </Button>
      </div>
    </form>
  );
}

export const OnboardingForm = React.memo(OnboardingFormComponent);
