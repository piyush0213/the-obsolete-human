'use client';
/**
 * @file page.tsx
 * @description Implements app/onboarding/page.tsx for The Obsolete Human Museum.
 */

import React from 'react';
import { OnboardingForm } from '@/components/museum/OnboardingForm';

/**
 * @description The multi-step classification form where users input their habits.
 * @returns {JSX.Element} The interactive onboarding form.
 */
function OnboardingPageComponent(): JSX.Element {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12 space-y-4">
          <p className="font-mono text-xs text-museum-accent uppercase tracking-[0.3em]">
            Specimen Classification Protocol
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-museum-text tracking-tight">
            Classify Your Species
          </h1>
          <p className="text-museum-text-muted max-w-2xl mx-auto leading-relaxed">
            Submit your behavioral data for analysis. Our AI curator will
            determine your species designation, conservation status, and
            projected extinction timeline.
          </p>
        </header>

        <OnboardingForm />
      </div>
    </div>
  );
}

export default React.memo(OnboardingPageComponent);
