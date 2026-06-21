/**
 * @file useOnboardingForm.ts
 * @description Implements hooks/useOnboardingForm.ts for The Obsolete Human Museum.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingSchema } from '@/lib/validators';
import { useOnboardingSpecimen } from '@/hooks/useCarbonSpecimen';
import { announce } from '@/components/accessibility/ScreenReaderAnnouncer';
import { calculateCarbonFootprint } from '@/lib/carbon-calculator';
import { DEBOUNCE_MS } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';
import type { HabitsInput } from '@/types';

type FormErrors = Partial<Record<keyof HabitsInput, string>>;

type UseOnboardingFormReturn = {
  errors: FormErrors;
  isSubmitting: boolean;
  liveEmissions: number | null;
  formRef: React.RefObject<HTMLFormElement>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleFormChange: () => void;
};

export function useOnboardingForm(): UseOnboardingFormReturn {
  const router = useRouter();
  const { createSpecimen } = useOnboardingSpecimen();
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawHabits, setRawHabits] = useState<HabitsInput | null>(null);
  const debouncedHabits = useDebounce(rawHabits, DEBOUNCE_MS);
  const [liveEmissions, setLiveEmissions] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (debouncedHabits) {
      setLiveEmissions(calculateCarbonFootprint(debouncedHabits));
    }
  }, [debouncedHabits]);

  const handleFormChange = useCallback(() => {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const raw = {
      name: (formData.get('name') as string) || 'Unknown',
      diet: (formData.get('diet') as string) || 'omnivore',
      transport: (formData.get('transport') as string) || 'mixed',
      weeklyKm: Number(formData.get('weeklyKm')) || 0,
      energySource: (formData.get('energySource') as string) || 'mixed',
      housingType: (formData.get('housingType') as string) || 'apartment',
      acUsage: (formData.get('acUsage') as string) || 'none',
      deliveriesPerWeek: Number(formData.get('deliveriesPerWeek')) || 0,
      electronicsReplacement:
        (formData.get('electronicsReplacement') as string) || 'yearly',
    } as HabitsInput;
    setRawHabits(raw);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrors({});

      const formData = new FormData(e.currentTarget);
      const raw = {
        name: formData.get('name') as string,
        diet: formData.get('diet') as string,
        transport: formData.get('transport') as string,
        weeklyKm: Number(formData.get('weeklyKm')),
        energySource: formData.get('energySource') as string,
        housingType: formData.get('housingType') as string,
        acUsage: formData.get('acUsage') as string,
        deliveriesPerWeek: Number(formData.get('deliveriesPerWeek')),
        electronicsReplacement: formData.get(
          'electronicsReplacement'
        ) as string,
      };

      const parsed = onboardingSchema.safeParse(raw);
      if (!parsed.success) {
        const fieldErrors: FormErrors = {};
        for (const issue of parsed.error.issues) {
          const field = issue.path[0] as keyof HabitsInput | undefined;
          if (field && !fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        }
        setErrors(fieldErrors);
        announce('Form contains errors. Please review the highlighted fields.');
        return;
      }

      setIsSubmitting(true);
      announce('Classifying specimen. Please wait.');

      setTimeout(() => {
        const habits: HabitsInput = {
          name: parsed.data.name,
          diet: parsed.data.diet,
          transport: parsed.data.transport,
          weeklyKm: parsed.data.weeklyKm,
          energySource: parsed.data.energySource,
          housingType: parsed.data.housingType,
          acUsage: parsed.data.acUsage,
          deliveriesPerWeek: parsed.data.deliveriesPerWeek,
          electronicsReplacement: parsed.data.electronicsReplacement,
        };

        createSpecimen(habits);
        announce('Classification complete. Redirecting to specimen profile.');
        router.push('/specimen');
      }, 1500);
    },
    [createSpecimen, router]
  );

  return {
    errors,
    isSubmitting,
    liveEmissions,
    formRef,
    handleSubmit,
    handleFormChange,
  };
}
