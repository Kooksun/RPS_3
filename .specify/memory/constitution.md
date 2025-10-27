<!--
Sync Impact Report
- Version change: 0.0.0 → 1.0.0
- Modified principles:
  - PRINCIPLE_1_NAME placeholder → I. Browser-Only Delivery
  - PRINCIPLE_2_NAME placeholder → II. Auto Simulation Flow
  - PRINCIPLE_3_NAME placeholder → III. Korean Console Observability
  - PRINCIPLE_4_NAME placeholder → IV. Minimal Tooling Footprint
- Added sections:
  - Implementation Constraints
  - Development Workflow
- Removed sections:
  - Placeholder Principle V slot
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
- Follow-up TODOs: none
-->
# RPS Simulation Browser App Constitution

## Core Principles

### I. Browser-Only Delivery
- Deliver the entire experience through a single-page HTML/CSS/JS bundle that runs directly in the browser without any backend services, build pipelines, or server-side rendering.
- Assets must remain static and loadable via `file://` or any static host with no environment-specific dependencies.
**Rationale**: The project mandates a lightweight experience that relies solely on the web browser environment and must not require infrastructure beyond static file hosting.

### II. Auto Simulation Flow
- Players only provide their names; the application must automatically generate rock, paper, or scissors choices and determine winners or losers for each round without additional user input.
- Surface match outcomes clearly in the UI, including the final result and per-round details, ensuring deterministic handling of ties (e.g., immediate replay) so the flow never stalls.
**Rationale**: The app’s purpose is to simulate the game end-to-end, so automation of choices and outcomes is non-negotiable once participant names are entered.

### III. Korean Console Observability
- Emit Korean-language console logs that describe each stage of the simulation: initialization, round resolution, tie handling, and final summary.
- Logs must provide enough granularity for browser inspector users to follow the control flow and data changes without reading the source code.
**Rationale**: Inspectability through Korean console output is the primary debugging aid, replacing formal tooling or test frameworks.

### IV. Minimal Tooling Footprint
- Use vanilla browser APIs and plain HTML/CSS/JS; avoid frontend frameworks, bundlers, transpilers, and package managers.
- Skip Git-based workflows and automated test frameworks (e.g., Jest, Mocha); rely on manual validation via the browser to verify compliance with the principles.
- Keep project artifacts human-editable with no binary or generated files checked in.
**Rationale**: The project emphasizes simplicity and manual control, so extra tooling would violate expectations and add avoidable complexity.

## Implementation Constraints

- Default file set is `index.html`, `styles.css`, and `app.js` stored together for clarity; expand only if the additional file is essential and still loads statically.
- Randomization must use native browser capabilities (`Math.random`) without external libraries; document any deterministic seeds directly in code comments if needed.
- UI text may be bilingual, but the core interaction (name inputs and result displays) must remain intuitive without additional documentation.

## Development Workflow

- Validate every change manually in at least two browsers (e.g., Chrome and Firefox) to ensure the static bundle behaves consistently.
- Before sharing builds, open the browser inspector, clear the console, run a full simulation, and confirm Korean log coverage for initialization, each round, ties, and final outcome.
- Archive change notes within project documentation since Git history is unavailable; include version number, date, and manual test status.

## Governance

- This constitution overrides other process guidance; any deviation requires a documented amendment in this file.
- Amendments demand review by the current steward(s), update of the Sync Impact Report, and a justification note in project docs summarizing the change.
- Versioning follows semantic rules: MAJOR for principle changes/removals, MINOR for new principles/sections, PATCH for clarifications. Bump the version and update amendment dates whenever edits occur.
- Compliance reviews happen before distributing any new bundle; reviewers confirm all principles, constraints, and workflow steps were satisfied for the change.

**Version**: 1.0.0 | **Ratified**: 2025-10-24 | **Last Amended**: 2025-10-24
