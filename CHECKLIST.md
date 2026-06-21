# The Obsolete Human - Manual Hackathon Checklist

This checklist contains **strict manual verification steps** that the automated `audit.js` script cannot verify. Complete these within the next 6 hours to ensure a perfect 97.51+ score.

## 1. Accessibility: Keyboard-Only Navigation

**Instructions:** Disconnect your mouse and navigate the entire application.

- [ ] **Entrance Page:** Press `Tab`. The first focused element MUST be the "Skip to main content" link. Press `Enter` to ensure it scrolls/focuses the `<main id="main-content">` block.
- [ ] **Focus Rings:** Every interactive element (`<a>`, `<button>`, `<input>`, `<select>`) must show a clearly visible focus ring (e.g., 2px solid outline) when tabbed to.
- [ ] **Onboarding Form:**
  - Verify you can tab through every input field.
  - Verify dropdowns (`<select>`) can be opened and selected using the `Space`, `Enter`, and Arrow keys.
  - Verify pressing `Enter` while inside the form correctly submits it.
- [ ] **Habitat Cam:** Tab to the drag-and-drop upload zone. Press `Enter` or `Space` — it MUST trigger the native file selection dialog.
- [ ] **Taxidermy Modals:**
  - Tab to a specimen card and press `Enter` to open the modal.
  - While the modal is open, verify **Focus Trapping**: tabbing repeatedly should cycle focus _only_ within the modal, never escaping to the background page.
  - Verify pressing `Escape` closes the modal and returns focus to the trigger card.

## 2. Accessibility: Screen Reader Test

**Instructions:** Enable VoiceOver (Mac) or NVDA (Windows).

- [ ] **Form Errors:** Submit the onboarding form empty. Verify the screen reader immediately announces the validation errors (using `aria-describedby` and `aria-invalid="true"`).
- [ ] **Loading States:** Upload a habitat photo. Ensure the screen reader reads "Uploading photograph..." and "Analyzing habitat. Dr. Thorne is examining your nesting chamber..." dynamically via the `aria-live="polite"` regions.
- [ ] **Icons & Metaphors:** Navigate to the Extinction Clock and Carbon Metaphors. Verify the screen reader reads the hidden context (e.g., "Conservation status: Endangered") and ignores decorative emojis (`aria-hidden="true"`).
- [ ] **Heading Hierarchy:** Open the screen reader's Rotor/Headings menu. Verify there is exactly ONE `<h1>` per page, and headings cascade logically (`<h2>` -> `<h3>`) without skipped levels.

## 3. Lighthouse & Performance Profiling

**Instructions:** Run a Google Lighthouse report in Chrome Incognito.

- [ ] **Score Goals:** Performance: ≥95 | Accessibility: 100 | Best Practices: 100 | SEO: ≥95.
- [ ] **Image Optimization:** Ensure uploaded habitat photos are processed efficiently and not causing large Layout Shifts (CLS < 0.1).
- [ ] **Prefers-Reduced-Motion:** Simulate "prefers-reduced-motion: reduce" in Chrome DevTools (Rendering tab). Verify the grain animation stops and modal transitions are disabled.

## 4. Mobile Responsiveness

**Instructions:** Open Chrome DevTools and toggle Device Toolbar.

- [ ] **Touch Targets:** Verify all buttons and select fields have a minimum touch area of 44x44px.
- [ ] **No Horizontal Scroll:** Verify the layout does not break or scroll horizontally on iPhone SE dimensions (320px width).
- [ ] **Grid Stacking:** Verify the Taxidermy Archives grid stacks into a single column cleanly on mobile.

## 5. Security & Edge Cases

- [ ] **XSS Prevention:** Paste `<script>alert(1)</script>` into the "Specimen Name" or "Field Notes" input. Ensure it renders as raw text and does not execute.
- [ ] **Rate Limiting:** Click the "Generate Field Note" button 6 times rapidly. The 6th click MUST fail gracefully and show an error message.
- [ ] **Env Check:** Verify `GEMINI_API_KEY` is NOT checked into GitHub. Double check your recent commits.

## 6. Submission Guidelines

- [ ] **LinkedIn Post:** Write your required post summarizing the "Carbon Footprint Museum" concept, tagging the required hackathon sponsors, and linking to the live URL. Include a screenshot of the Extinction Clock.
- [ ] **Demo Video:** Record a max 3-minute video showing the end-to-end flow: Onboarding -> Specimen Profile -> Habitat Upload -> Taxidermy Archive.
- [ ] **GitHub Repo:** Ensure the `README.md` is fully populated, the architecture diagram is present, and the repo is Public.
