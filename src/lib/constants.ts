import type { ConservationStatus } from "@/types";

/** Museum name constant */
export const MUSEUM_NAME = "The Obsolete Human" as const;

/** Museum tagline */
export const MUSEUM_TAGLINE =
  "A Natural History Museum from the Year 3026" as const;

/** Museum description for meta tags */
export const MUSEUM_DESCRIPTION =
  "Cataloguing the extinct behaviors of Homo sapiens sapiens — from the Age of Combustion to the Great Automation." as const;

/** Navigation links */
export const NAV_LINKS = [
  { href: "/", label: "Entrance", ariaLabel: "Return to the museum entrance" },
  {
    href: "/onboarding",
    label: "Classification",
    ariaLabel: "Begin your specimen classification",
  },
  {
    href: "/habitat",
    label: "Habitat",
    ariaLabel: "Explore the habitat cam",
  },
  {
    href: "/taxidermy",
    label: "Archives",
    ariaLabel: "View the taxidermy archives",
  },
] as const;

/** Conservation status display configuration */
export const CONSERVATION_STATUS_CONFIG: Record<
  ConservationStatus,
  { label: string; color: string; bgColor: string; description: string }
> = {
  EXTINCT: {
    label: "Extinct",
    color: "text-museum-danger",
    bgColor: "bg-museum-danger/20",
    description: "No longer practiced by any known population",
  },
  CRITICALLY_ENDANGERED: {
    label: "Critically Endangered",
    color: "text-red-400",
    bgColor: "bg-red-400/20",
    description: "Fewer than 50 practitioners remain worldwide",
  },
  ENDANGERED: {
    label: "Endangered",
    color: "text-orange-400",
    bgColor: "bg-orange-400/20",
    description: "Rapid decline observed across all demographics",
  },
  VULNERABLE: {
    label: "Vulnerable",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/20",
    description: "Significant decline in practice frequency",
  },
  NEAR_THREATENED: {
    label: "Near Threatened",
    color: "text-museum-accent",
    bgColor: "bg-museum-accent/20",
    description: "Early signs of behavioral displacement detected",
  },
  LEAST_CONCERN: {
    label: "Least Concern",
    color: "text-museum-secondary",
    bgColor: "bg-museum-secondary/20",
    description: "Still widely practiced but monitored for change",
  },
} as const;

/** Carbon category labels */
export const CARBON_CATEGORIES = {
  TRANSPORT: "Transportation & Mobility",
  DIET: "Diet & Sustenance",
  HOUSING: "Shelter & Dwelling",
  CONSUMPTION: "Material Consumption",
  DIGITAL: "Digital Activity",
  RECREATION: "Leisure & Recreation",
} as const;

/** Museum exhibit halls */
export const EXHIBIT_HALLS = [
  "Hall of Forgotten Commutes",
  "Gallery of Analog Communication",
  "Wing of Manual Labor",
  "Chamber of Physical Commerce",
  "Rotunda of Combustion Engines",
  "Archive of Paper Records",
] as const;

/** Skeleton loading pulse duration */
export const SKELETON_PULSE_MS = 1500 as const;

/** Max field note character length */
export const MAX_FIELD_NOTE_LENGTH = 2000 as const;

/** Debounce delay for search inputs */
export const SEARCH_DEBOUNCE_MS = 300 as const;

export const EMISSION_FACTOR_BEEF_KG_CO2 = 27;
export const MAX_UPLOAD_SIZE_MB = 5;
export const DEBOUNCE_MS = 300;
export const SUSTAINABLE_TARGET_KG = 1500;

export const WEEKS_PER_YEAR = 52;
export const KG_PER_TONNE = 1000;
export const DAYS_PER_YEAR = 365.25;
export const HOURS_PER_DAY = 24;
export const MINUTES_PER_HOUR = 60;
export const SECONDS_PER_MINUTE = 60;
export const MS_PER_SECOND = 1000;
export const MONTHS_PER_YEAR = 12;
export const HUNDRED_PERCENT = 100;

/** Maps conservation status → visual color classes */
export const STATUS_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  "Least Concern": {
    text: "text-museum-secondary",
    bg: "bg-museum-secondary/20",
    border: "border-museum-secondary/30",
  },
  "Vulnerable": {
    text: "text-yellow-400",
    bg: "bg-yellow-400/20",
    border: "border-yellow-400/30",
  },
  "Endangered": {
    text: "text-orange-400",
    bg: "bg-orange-400/20",
    border: "border-orange-400/30",
  },
  "Critically Endangered": {
    text: "text-red-400",
    bg: "bg-red-400/20",
    border: "border-red-400/30",
  },
  "Extinct in the Wild": {
    text: "text-museum-danger",
    bg: "bg-museum-danger/20",
    border: "border-museum-danger/30",
  },
};
