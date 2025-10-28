# Tasks: Dual Finalist Selection Modes

**Input**: Design documents from `/specs/001-add-dual-selection/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated frameworks are used. Validation relies on manual browser runs documented in the spec and plan.

**Organization**: Tasks are grouped by user story so each increment can ship independently while honoring the constitution.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)  
- **[Story]**: User story reference (e.g., US1, US2, US3)  
- Always include exact file paths (`index.html`, `styles.css`, `app.js`, etc.)

## Path Conventions

- Static bundle lives at repository root (`index.html`, `styles.css`, `app.js`)  
- Create `assets/` only when a static resource is unavoidable—justify additions in plan.md  
- No `src/`, `tests/`, or backend directories are permitted without a constitution amendment

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prep documentation and scaffolding needed by all stories.

- [X] T001 Update dual-finalist manual validation prerequisites in `specs/001-add-dual-selection/quickstart.md`
- [X] T002 Introduce mode metadata scaffold (type, targetSurvivors) in `app.js`

---

## Phase 2: Foundational State & Logic Updates (Blocking Prerequisites)

**Purpose**: Extend the shared simulation core before story-specific behavior.

- [X] T003 Expand `initializeGameState` (or equivalent) in `app.js` to track `mode`, `targetSurvivors`, and `pendingSuddenDeath`
- [X] T004 Add survivor evaluation helper that applies `exclusionRule` and recomputes active/waiting participants in `app.js`
- [X] T005 Implement sudden-death replay scheduler that reuses tied survivors until counts meet `targetSurvivors` in `app.js`

**Checkpoint**: Foundation ready—user story implementation can now begin.

---

## Phase 3: User Story 1 – Identify the top two winners (Priority: P1) 🎯 MVP

**Goal**: Allow hosts to start `승자 2명 뽑기` mode and finish with exactly two winners announced together.

**Independent Test**: Launch `index.html`, input 6–10 names, select `승자 2명 뽑기`, and confirm UI plus Korean console logs present two winners when the game ends.

### Manual Validation

- [X] T006 [US1] Document Chrome validation checklist for `승자 2명 뽑기` scenario in `specs/001-add-dual-selection/quickstart.md`

### Implementation

- [X] T007 [US1] Restructure the start button container and inject the `승자 2명 뽑기` control markup in `index.html`
- [X] T008 [P] [US1] Style dual-winner control spacing, hover, and disabled states in `styles.css`
- [X] T009 [US1] Map the new button handler to winner-dual mode metadata and log selection details in `app.js`
- [X] T010 [US1] Update winner termination logic so popups, waiting list, and console summaries list both winners in `app.js`

**Checkpoint**: User Story 1 delivers a dual-winner flow demonstrable in isolation.

---

## Phase 4: User Story 2 – Surface the bottom two losers (Priority: P2)

**Goal**: Provide `패자 2명 뽑기` start mode that retains losers and stops once two remain.

**Independent Test**: Run `index.html` in Firefox with ≥6 participants, choose `패자 2명 뽑기`, and verify UI plus Korean logs highlight the two final losers.

### Manual Validation

- [X] T011 [US2] Record Firefox validation checklist for `패자 2명 뽑기` flow in `specs/001-add-dual-selection/quickstart.md`

### Implementation

- [X] T012 [US2] Add the `패자 2명 뽑기` start button markup within the existing control group in `index.html`
- [X] T013 [P] [US2] Adjust shared button styling to accommodate the loser-dual control in `styles.css`
- [X] T014 [US2] Wire the loser-dual button to mode metadata with `exclusionRule: drop-winners` in `app.js`
- [X] T015 [US2] Ensure final popup, waiting list, and console reporting enumerate two losers and disable further rounds in `app.js`

**Checkpoint**: User Stories 1 and 2 both function independently with clear dual-finalist outcomes.

---

## Phase 5: User Story 3 – Maintain mode clarity across selections (Priority: P3)

**Goal**: Keep button states, logs, and history context consistent when switching among all four modes.

**Independent Test**: In a single session, run each mode in succession (`승자`, `승자 2명`, `패자`, `패자 2명`) and ensure UI resets correctly while Korean console logs reflect the active mode and survivor counts.

### Manual Validation

- [X] T016 [US3] Document multi-mode regression checklist covering all four modes in `specs/001-add-dual-selection/quickstart.md`

### Implementation

- [X] T017 [US3] Reset button enable/disable states and clear survivors when changing modes or restarting in `app.js`
- [X] T018 [P] [US3] Emit Korean console messages for mode selection, per-round survivor counts, and sudden-death retries in `app.js`
- [X] T019 [US3] Update history card rendering to show remaining vs target counts for dual modes in `app.js`
- [X] T020 [P] [US3] Apply visual state cues (active/disabled) for all mode buttons to prevent confusion in `styles.css`

**Checkpoint**: All modes remain comprehensible when mixed within the same session.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and documentation touch-ups after all stories pass validation.

- [ ] T021 Consolidate duplicate mode metadata definitions and inline comments introduced across tasks in `app.js`
- [ ] T022 [P] Summarize dual-finalist implementation decisions in `specs/001-add-dual-selection/research.md`
- [ ] T023 Execute full Chrome and Firefox regression run and log results in `specs/001-add-dual-selection/quickstart.md`
- [ ] T024 [P] Review `index.html` and `styles.css` for unused classes or attributes introduced by the feature
- [ ] T025 Final pass over Korean console phrasing to ensure consistency across modes in `app.js`

---

## Dependencies & Execution Order

1. **Phase 1 → Phase 2**: Setup documentation and scaffolding precede core logic changes.  
2. **Phase 2 → User Stories**: Shared state and sudden-death helpers must exist before any story-specific wiring.  
3. **User Story Priority**: US1 (P1) is the MVP, US2 (P2) builds alongside but can start after Phase 2, and US3 (P3) layers clarity improvements on top of completed modes.  
4. **Polish**: Runs only after all story checkpoints succeed.

---

## Parallel Execution Opportunities

- **Within Phase 3**: Tasks T008 and T009 can run in parallel once T007 completes (CSS vs JS).  
- **Within Phase 4**: Tasks T013 and T014 operate in parallel after T012 establishes markup.  
- **Within Phase 5**: Tasks T018 and T020 can proceed concurrently following T017.  
- **Polish**: Tasks T022 and T024 are documentation/style cleanups and may run alongside regression task T023’s execution window.

---

## Implementation Strategy

1. **Deliver MVP (US1)**: Prioritize completing Phase 1, Phase 2, and Phase 3 to demo the dual-winner mode quickly.  
2. **Add Loser Dual Mode (US2)**: Reuse the shared helpers to minimize incremental risk while introducing opposing elimination rules.  
3. **Reinforce Clarity (US3)**: Finish by hardening state resets, logging, and history cues so operators can confidently mix modes.  
4. **Polish**: Close with documentation updates, regression notes, and minor refactors to keep the static bundle maintainable.
