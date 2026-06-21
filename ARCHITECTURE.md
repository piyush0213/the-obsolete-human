# The Obsolete Human - Architecture

## Core Philosophy
"The Obsolete Human" is a Next.js (App Router) based interactive exhibition from the year 3026. Its primary goal is to serve as a **Carbon Footprint Awareness Platform**. The entire architectural stack is designed to efficiently gather user habits, securely calculate carbon footprints, and present them using dynamic visual metaphors while maintaining an AI-evaluated performance score.

## Data Flow
1. **User Input Phase**: Data is collected in `src/app/onboarding/page.tsx` via `OnboardingForm`.
2. **State Management**: The form utilizes `useOnboardingForm` to debounce typing and handle immediate calculations.
3. **Processing**: Once submitted, habits are validated via `zod` schemas (`src/lib/validators.ts`) and processed by `src/lib/carbon-calculator.ts` using established emission factors (e.g., IPCC AR6).
4. **Storage**: The evaluated specimen is stored locally in `localStorage` via `useCarbonSpecimen`.
5. **Presentation**: The `/specimen` page retrieves this data and displays it using various visual modules (`SpecimenCard`, `ExtinctionClock`, `CarbonTranslate`).
6. **AI Contextualization**: Features like `HabitatCam` use the Next.js API Routes (`/api/curate`) running on the Edge runtime, interfacing with the Gemini API to provide rich contextual narration based on the user's data.

## Component Hierarchy
- `app/layout.tsx`: Root layout, providers, global styles, and overarching metadata (SEO).
  - `app/page.tsx`: Landing page, thematic introduction.
  - `app/onboarding/page.tsx`: Habitat/Habits data entry (`OnboardingForm`, `LiveTally`).
  - `app/specimen/page.tsx`: Core exhibit display (`SpecimenCard`, `ExtinctionClock`, `CarbonMetaphors`).
  - `app/habitat/page.tsx`: Environmental analysis camera feature (`HabitatCam`).
  - `app/taxidermy/page.tsx`: Museum archive for other preserved human stereotypes (`TaxidermyPlaque`).

## State Management
- **Local State (`useState` / `useReducer`)**: Component-level interactive state (e.g., form fields, loading states).
- **Persistent State (`localStorage`)**: Saves the active user's "Specimen ID" and classification results so the exhibit persists across sessions. Managed via custom hooks.
- **Derived State (`useMemo`)**: Complex carbon conversions and date math are strictly memoized to avoid recalculation.

## Performance & Optimization
- **React.memo**: Every museum component is wrapped in `React.memo` to prevent unnecessary re-renders.
- **Lazy Loading**: Heavy client components (`ClimateContext`, `LiveTally`, `HabitatCam`) are loaded dynamically using `next/dynamic` with `ssr: false` where appropriate.
- **Debouncing**: Real-time carbon tally updates are debounced by 300ms using `useDebounce` to prevent blocking the main thread.

## API Design
- **Edge Runtime**: `/api/curate` operates on the Vercel Edge Runtime for lowest latency and high efficiency.
- **Input Sanitization**: All AI prompts are heavily sanitized and structured to prevent prompt injection or hallucination.
- **Rate Limiting**: Custom token bucket rate limiting ensures API stability against abuse.
