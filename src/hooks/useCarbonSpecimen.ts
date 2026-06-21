"use client";

import { useState, useCallback, useEffect } from "react";
import type { Specimen, CarbonFootprint, HabitsInput, OnboardingSpecimen, ConservationStatusLevel, EmissionsKg } from "@/types";
import { toEmissionsKg, toSpecimenId } from "@/types";
import { kgCO2ToTrees } from "@/lib/utils";
import { calculateAnnualEmissions, calculateLifestyleExpiry, getConservationStatus } from "@/lib/extinction";

// ─── Carbon Translation ────────────────────────────────────

interface CarbonTranslation {
  trees: number;
  flightsNYtoLondon: number;
  smartphoneCharges: number;
  beefBurgers: number;
  streamingHours: number;
}

function translateCarbon(kgCO2: number): CarbonTranslation {
  return {
    trees: kgCO2ToTrees(kgCO2),
    flightsNYtoLondon: Math.round((kgCO2 / 986) * 100) / 100,
    smartphoneCharges: Math.round(kgCO2 / 0.008),
    beefBurgers: Math.round(kgCO2 / 3.6),
    streamingHours: Math.round(kgCO2 / 0.036),
  };
}

// ─── localStorage helpers (SSR-safe) ────────────────────────

const STORAGE_KEY = "the-obsolete-human:specimen";

function loadSpecimen(): OnboardingSpecimen | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingSpecimen;
    // Re-hydrate Date objects from ISO strings
    return {
      ...parsed,
      extinctionDate: parsed.extinctionDate
        ? new Date(parsed.extinctionDate)
        : null,
      createdAt: new Date(parsed.createdAt),
    };
  } catch {
    return null;
  }
}

function saveSpecimen(specimen: OnboardingSpecimen): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(specimen));
  } catch {
    // localStorage full or unavailable — silently degrade
  }
}

function removeSpecimen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently degrade
  }
}

// ─── Species Name Generator ────────────────────────────────

function generateSpeciesName(habits: HabitsInput): string {
  const dietMap: Record<HabitsInput["diet"], string> = {
    herbivore: "herbivorus",
    omnivore: "omnivorus",
    carnivore: "carnivorus",
    opportunistic: "opportunistus",
  };
  const transportMap: Record<HabitsInput["transport"], string> = {
    none: "sedentarius",
    public: "transitensis",
    private: "combustionis",
    mixed: "versatilus",
    aviation_heavy: "volatilis",
  };
  return `Homo ${dietMap[habits.diet]} ${transportMap[habits.transport]}`;
}

// ─── Hook: useOnboardingSpecimen ───────────────────────────
// Creates and persists an OnboardingSpecimen from form data.

export function useOnboardingSpecimen() {
  const [specimen, setSpecimen] = useState<OnboardingSpecimen | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage after mount (prevents mismatch)
  useEffect(() => {
    setSpecimen(loadSpecimen());
    setIsLoading(false);
  }, []);

  const createSpecimen = useCallback((habits: HabitsInput) => {
    const emissions = calculateAnnualEmissions(habits);
    const expiry = calculateLifestyleExpiry(emissions);
    const status: ConservationStatusLevel = getConservationStatus(emissions);
    const speciesName = generateSpeciesName(habits);

    const newSpecimen: OnboardingSpecimen = {
      id: toSpecimenId(crypto.randomUUID()),
      name: habits.name,
      speciesName,
      commonName: `The ${habits.name} Specimen`,
      habitat: habits.housingType,
      diet: habits.diet,
      transport: habits.transport,
      energy: habits.energySource,
      conservationStatus: status,
      extinctionDate: expiry,
      emissions: toEmissionsKg(emissions) as EmissionsKg,
      avatarSeed: crypto.randomUUID().slice(0, 8),
      createdAt: new Date(),
    };

    setSpecimen(newSpecimen);
    saveSpecimen(newSpecimen);
    return newSpecimen;
  }, []);

  const clearSpecimen = useCallback(() => {
    setSpecimen(null);
    removeSpecimen();
  }, []);

  return {
    specimen,
    isLoading,
    createSpecimen,
    clearSpecimen,
  };
}

// ─── Hook: useCarbonSpecimen (legacy gallery) ──────────────
// Used by existing gallery components for carbon translation.

export function useCarbonSpecimen(specimen: Specimen | null) {
  const [selectedUnit, setSelectedUnit] = useState<keyof CarbonTranslation>("trees");

  const carbonData: CarbonFootprint | null = specimen?.carbonFootprint ?? null;

  const translation = carbonData ? translateCarbon(carbonData.annualKg) : null;

  const formattedValue = useCallback((): string => {
    if (!translation) return "No data available";

    const value = translation[selectedUnit];
    switch (selectedUnit) {
      case "trees":
        return `${value.toLocaleString()} trees needed annually to offset`;
      case "flightsNYtoLondon":
        return `${value} round-trip flights from New York to London`;
      case "smartphoneCharges":
        return `${value.toLocaleString()} full smartphone charges`;
      case "beefBurgers":
        return `${value.toLocaleString()} beef burgers produced`;
      case "streamingHours":
        return `${value.toLocaleString()} hours of video streaming`;
      default:
        return "Unknown unit";
    }
  }, [translation, selectedUnit]);

  return {
    carbonData,
    translation,
    selectedUnit,
    setSelectedUnit,
    formattedValue,
  };
}
