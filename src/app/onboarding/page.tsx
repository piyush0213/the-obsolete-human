"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { onboardingSchema } from "@/lib/validators";
import { useOnboardingSpecimen } from "@/hooks/useCarbonSpecimen";
import { announce } from "@/components/accessibility/ScreenReaderAnnouncer";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { HabitsInput } from "@/types";

type FormErrors = Partial<Record<keyof HabitsInput, string>>;

export default function OnboardingPage() {
  const router = useRouter();
  const { createSpecimen } = useOnboardingSpecimen();
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrors({});

      const formData = new FormData(e.currentTarget);
      const raw = {
        name: formData.get("name") as string,
        diet: formData.get("diet") as string,
        transport: formData.get("transport") as string,
        weeklyKm: Number(formData.get("weeklyKm")),
        energySource: formData.get("energySource") as string,
        housingType: formData.get("housingType") as string,
        acUsage: formData.get("acUsage") as string,
        deliveriesPerWeek: Number(formData.get("deliveriesPerWeek")),
        electronicsReplacement: formData.get("electronicsReplacement") as string,
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
        announce("Form contains errors. Please review the highlighted fields.");
        return;
      }

      setIsSubmitting(true);
      announce("Classifying specimen. Please wait.");

      // Simulate a brief classification delay for UX
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
        announce("Classification complete. Redirecting to specimen profile.");
        router.push("/specimen");
      }, 1500);
    },
    [createSpecimen, router],
  );

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

        {isSubmitting ? (
          <div className="space-y-6" role="status" aria-label="Classifying specimen">
            <p className="sr-only">Classifying specimen, please wait.</p>
            <div className="glass-panel p-8 space-y-6">
              <Skeleton variant="text" lines={2} />
              <Skeleton variant="rect" />
              <Skeleton variant="text" lines={3} />
              <Skeleton variant="rect" className="h-12" />
            </div>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-10"
          >
            {/* ══ Section 1: Nesting Behavior ══ */}
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
                  { value: "apartment", label: "Apartment — Multi-unit hive structure" },
                  { value: "house", label: "House — Detached territorial dwelling" },
                  { value: "shared", label: "Shared — Communal habitation" },
                  { value: "nomadic", label: "Nomadic — No fixed shelter" },
                ]}
                error={errors.housingType}
              />

              <Select
                label="Energy Source"
                name="energySource"
                placeholder="Select primary energy"
                options={[
                  { value: "renewable", label: "Renewable — Solar/Wind/Hydro" },
                  { value: "mixed", label: "Mixed — Hybrid grid" },
                  { value: "fossil", label: "Fossil — Combustion-based" },
                  { value: "unknown", label: "Unknown — Unaware of source" },
                ]}
                error={errors.energySource}
              />

              <Select
                label="Air Conditioning Usage"
                name="acUsage"
                placeholder="Select AC frequency"
                options={[
                  { value: "none", label: "None — Thermal endurance" },
                  { value: "occasional", label: "Occasional — Seasonal deployment" },
                  { value: "regular", label: "Regular — Daily activation" },
                  { value: "constant", label: "Constant — Permanent climate control" },
                ]}
                error={errors.acUsage}
              />
            </fieldset>

            {/* ══ Section 2: Dietary Class ══ */}
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
                  { value: "herbivore", label: "Herbivore — Plant-based sustenance" },
                  { value: "omnivore", label: "Omnivore — Mixed consumption" },
                  { value: "carnivore", label: "Carnivore — Animal-protein dominant" },
                  { value: "opportunistic", label: "Opportunistic — Whatever is available" },
                ]}
                error={errors.diet}
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
                helperText="How many food/goods deliveries arrive at your nest weekly?"
              />
            </fieldset>

            {/* ══ Section 3: Migration Patterns ══ */}
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
                  { value: "none", label: "None — Sedentary specimen" },
                  { value: "public", label: "Public — Mass transit utilization" },
                  { value: "private", label: "Private — Personal combustion vehicle" },
                  { value: "mixed", label: "Mixed — Multi-modal migration" },
                  { value: "aviation_heavy", label: "Aviation Heavy — Frequent flyer" },
                ]}
                error={errors.transport}
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
                helperText="Total kilometers traveled per week by your primary transport mode"
              />
            </fieldset>

            {/* ══ Section 4: Display Behavior ══ */}
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
                  { value: "rarely", label: "Rarely — Until device failure" },
                  { value: "bi_yearly", label: "Bi-Yearly — Every two cycles" },
                  { value: "yearly", label: "Yearly — Annual upgrade ritual" },
                  { value: "obsessively", label: "Obsessively — Every release event" },
                ]}
                error={errors.electronicsReplacement}
              />
            </fieldset>

            {/* ══ Submit ══ */}
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
        )}
      </div>
    </div>
  );
}
