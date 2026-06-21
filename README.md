# The Obsolete Human: A Carbon Footprint Awareness Platform

This platform calculates your personal carbon emissions and visualizes them as a species conservation status in a museum exhibit. The museum catalogs the extinct behaviors of Homo sapiens sapiens — from the Age of Combustion to the Great Automation.

Curated by AI. Classified by you.

## Environmental Impact

Our goal is to raise awareness about the severe impacts of climate change by transforming abstract carbon footprint metrics into a tangible, emotional narrative. By placing your environmental impact into the context of an extinct species exhibit, the platform starkly illustrates how unsustainable lifestyle choices lead to ecological collapse. Calculating your carbon footprint is the first step toward building a sustainable future.

## Carbon Calculation Methodology

The core carbon footprint calculation is based on standard emission factors provided by global climate authorities, including the Intergovernmental Panel on Climate Change (IPCC). We convert everyday habits into precise greenhouse gas emissions:
- **Transportation:** Measured in kg CO₂ per km based on vehicle type and mass transit averages.
- **Diet:** Baseline emissions per diet type, reflecting agricultural carbon footprint costs (e.g., high emission factors for beef).
- **Energy & Housing:** Combines housing multipliers with regional energy grid standard emission factors.
- **Consumption:** Tracks the carbon footprint of logistics, deliveries, and electronics lifecycle.

By quantifying these lifestyle choices, we estimate your total annual carbon footprint and dynamically calculate a "Lifestyle Expiry Date" based on a 1.5°C global climate target.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Vanilla CSS (Custom Design System)
- **AI Integration:** Google Gemini via Edge API Route
- **Testing:** Vitest, React Testing Library, Playwright
- **Validation:** Zod
- **Icons/UI:** Lucide React, Radix primitives (via bespoke implementations)

## Setup Instructions

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env.local` file and add your Gemini API Key:

   ```env
   GEMINI_API_KEY=your_key_here
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Run tests:**

   ```bash
   npm test
   npm run test:e2e
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Architecture

```text
+-------------------+       +-----------------------+       +-------------------+
|                   |       |                       |       |                   |
|  User Interface   +------>+  Next.js App Router   +------>+  Gemini AI Edge   |
|  (Client Comps)   |       |  (Server/Edge Routes) |       |  (Curator API)    |
|                   |       |                       |       |                   |
+--------+----------+       +-----------+-----------+       +-------------------+
         |                              |
         | LocalStorage Persistence     | Zod Validation & Security
         v                              v
+-------------------+       +-----------------------+
|                   |       |                       |
|  State Management |       | Rate Limiting & San.  |
|  (Custom Hooks)   |       | (In-Memory / Crypto)  |
|                   |       |                       |
+-------------------+       +-----------------------+
```

## Security & Reliability

- **Content Security Policy (CSP):** Implemented to prevent XSS.
- **Sanitization:** All AI output is sanitized before rendering.
- **Rate Limiting:** Edge-level rate limiting prevents API abuse and controls Gemini billing.
- **Validation:** Strict schema validation via Zod on all API endpoints.

## Accessibility Statement

The Obsolete Human is committed to digital inclusion and is built to **WCAG 2.1 AAA** compliance standards:

- **Keyboard Navigation:** Fully navigable via keyboard with visible focus states and `FocusTrap` on modals.
- **Screen Reader Optimized:** Semantic HTML5 landmarks, `aria-live` regions for dynamic content, and visually hidden descriptive text.
- **Motion Sensitivities:** Strict adherence to `prefers-reduced-motion` media queries, automatically disabling ambient animations, transitions, and smooth scrolling.

## License

MIT License. See [LICENSE](LICENSE) for details.
