## Research Summary

### 1. Responsive Radial Layout without Frameworks
- **Decision**: Position participants using CSS custom properties and `transform: rotate`/`translate` calculations driven by vanilla JS.
- **Rationale**: Keeps bundle framework-free, allows dynamic participant counts (2–12), and scales cleanly across responsive breakpoints by recalculating radius based on container size.
- **Alternatives considered**:
  - SVG-based circular layout: precise but adds extra markup management and complicates emoji scaling.
  - Absolute positioning with fixed pixel offsets: fails responsiveness requirements and becomes brittle for different viewport sizes.

### 2. Countdown & Animation Timing
- **Decision**: Use `requestAnimationFrame`-driven loop for countdown display coupled with CSS transition classes for emoji and popup animations. To make the reveal feel less mechanical, a random delay of 0–200ms is applied to each emoji's appearance via `setTimeout`.
- **Rationale**: `requestAnimationFrame` aligns with browser paint cycles, supporting the 60fps success criterion and simplifying pause/resume when tab visibility changes, while CSS transitions keep animations declarative. The randomized delay improves the user experience by masking the simultaneous nature of the underlying state update.
- **Alternatives considered**:
  - `setInterval` timers: simpler but risk drift on inactive tabs and may miss frame budget targets.
  - Web Animations API: powerful but heavier to manage for basic opacity/scale transitions and offers limited support in older browsers without polyfills (conflicts with minimal tooling).

### 3. Manual Validation Workflow
- **Decision**: Establish a repeatable checklist covering Chrome and Firefox runs, verifying Korean console logs, history ordering, waiting panel stacking, and final popup display.
- **Rationale**: Constitution forbids automated test frameworks, so a documented manual process ensures consistent verification before distribution.
- **Alternatives considered**:
  - Adding lightweight automated smoke tests with headless browsers: violates “Minimal Tooling Footprint” principle.
  - Ad-hoc manual testing with no checklist: increases regression risk and weakens compliance evidence.
