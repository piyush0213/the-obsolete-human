import type { HabitatData } from "@/types";

/**
 * Sample habitat data for the museum collection.
 * Separated from the HabitatCam client component so it can be used in server components.
 */
export const SAMPLE_HABITATS: HabitatData[] = [
  {
    id: "hab-001",
    name: "The Suburban Commuter Corridor",
    biome: "Asphalt Savanna",
    temperature: 28.4,
    humidity: 45,
    biodiversityIndex: 0.12,
    threatLevel: "CRITICALLY_ENDANGERED",
    coordinates: { lat: 40.7128, lng: -74.006 },
    description:
      "Once teeming with millions of single-occupant combustion vehicles, this multi-lane habitat stretched for hundreds of kilometers between dormitory settlements and labor zones. The daily migration — known colloquially as 'the commute' — remains one of the most energy-intensive behavioral patterns ever documented.",
  },
  {
    id: "hab-002",
    name: "The Open-Plan Office Ecosystem",
    biome: "Fluorescent Tundra",
    temperature: 21.5,
    humidity: 35,
    biodiversityIndex: 0.08,
    threatLevel: "ENDANGERED",
    coordinates: { lat: 51.5074, lng: -0.1278 },
    description:
      "An artificially climate-controlled environment where Homo laborans sedentarius congregated in dense colonies. The ecosystem was characterized by its uniform lighting, recycled air, and the persistent hum of electronic machinery. Territorial disputes were subtle but fierce.",
  },
  {
    id: "hab-003",
    name: "The Retail Megastructure",
    biome: "Commercial Reef",
    temperature: 22.0,
    humidity: 40,
    biodiversityIndex: 0.31,
    threatLevel: "VULNERABLE",
    coordinates: { lat: 34.0522, lng: -118.2437 },
    description:
      "Vast enclosed structures where humans engaged in physical procurement rituals. Specimens would navigate labyrinthine corridors, selecting goods by direct inspection — a practice now considered charmingly inefficient. These structures often featured communal feeding zones known as 'food courts.'",
  },
];
