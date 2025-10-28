# Tasks: Animated Elimination Exit

**Input**: Design documents from `/specs/002-animate-elimination/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated frameworks are used. Validation relies on manual browser runs documented in the spec, plan, and quickstart.

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

**Purpose**: Establish scaffolding for the elimination sequence that all user stories rely upon.

- [X] T001 Create `EliminationSequenceController` skeleton with exported stub methods in `app.js`
- [X] T002 [P] Document planned elimination PubSub events in `specs/002-animate-elimination/contracts/README.md`

---

## Phase 2: Foundational Sequencing (Blocking Prerequisites)

**Purpose**: Build the elimination data pipeline and timing gate before story-specific UX is implemented.

- [X] T003 Populate `EliminationSequenceController` with builder logic matching data-model entities in `app.js`
- [X] T004 Add reduced-motion detection helper and fallback branch to `app.js`
- [X] T005 Refactor `round:dwell:complete` handler to await elimination completion before calling `applyNextActiveParticipants` in `app.js`

**Checkpoint**: Dwell completion now routes through the elimination controller; user stories can focus on UI/UX behavior.

---

## Phase 3: User Story 1 – Watch eliminated players exit clearly (Priority: P1) 🎯 MVP

**Goal**: Animate each 탈락자 after the 3초 dwell so spectators instantly see who left the 게임패널.

**Independent Test**: Manual Chrome run confirming dwell → animation (0.4–1.0초) → state update, while Korean console logs narrate start and finish.

### Manual Validation for User Story 1

- [X] T006 [US1] Describe Chrome validation scenario and expected observations in `specs/002-animate-elimination/quickstart.md`
- [X] T007 [US1] Execute Chrome manual run and capture timestamps/log snippets in `specs/002-animate-elimination/quickstart.md`

### Implementation for User Story 1

- [X] T008 [P] [US1] Add elimination animation classes, durations (0.6s default), and easing to `styles.css`
- [X] T009 [US1] Implement DOM animation pipeline that toggles `is-eliminating` on target nodes and waits for `transitionend` in `app.js`
- [X] T010 [US1] Defer waiting panel updates until the animation promise resolves in `app.js`
- [X] T011 [US1] Emit Korean console logs for animation start and completion in `app.js`

**Checkpoint**: Post-dwell animation runs for individual eliminations; results are documented and demo-ready.

---

## Phase 4: User Story 2 – Handle multiple eliminations at once (Priority: P2)

**Goal**: Ensure 동시에 탈락하는 참가자들이 동일한 타이밍으로 애니메이션되고 대기 패널이 일관되게 갱신된다.

**Independent Test**: Manual Firefox run with loser 모드 triggering ≥3 eliminations, verifying synchronized animations and a single panel refresh.

### Manual Validation for User Story 2

- [X] T012 [US2] Outline Firefox multi-elimination checklist in `specs/002-animate-elimination/quickstart.md`
- [X] T013 [US2] Perform Firefox multi-elimination run and note observations in `specs/002-animate-elimination/quickstart.md`

### Implementation for User Story 2

- [X] T014 [US2] Expand elimination controller to await all active transition promises before emitting completion in `app.js`
- [X] T015 [P] [US2] Fine-tune elimination CSS (z-index, transform origin) to keep simultaneous animations readable in `styles.css`
- [X] T016 [US2] Update Korean console messaging to include eliminated participant counts per round in `app.js`

**Checkpoint**: Multi-elimination rounds animate cohesively with accurate counts and UI updates.

---

## Phase 5: User Story 3 – Preserve flow when no one leaves (Priority: P3)

**Goal**: Prevent false cues during 무승부 or reduced-motion scenarios while keeping subsequent rounds smooth.

**Independent Test**: Manual regression forcing a stalemate followed by a decisive round, plus reduced-motion run to confirm instant removals.

### Manual Validation for User Story 3

- [X] T017 [US3] Add stalemate and reduced-motion validation script to `specs/002-animate-elimination/quickstart.md`
- [X] T018 [US3] Run stalemate → decisive flow and reduced-motion check, logging outcomes in `specs/002-animate-elimination/quickstart.md`

### Implementation for User Story 3

- [X] T019 [US3] Short-circuit elimination controller when no `eliminatedIds` are present in `app.js`
- [X] T020 [US3] Reset animation state and pending timers when a new game starts in `app.js`
- [X] T021 [P] [US3] Add `@media (prefers-reduced-motion: reduce)` rules to skip transitions in `styles.css`

**Checkpoint**: No animation plays during stalemates, reduced-motion users see instant removals, and the system resets cleanly.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation, cleanup, and regression to ensure consistency across browsers and logs.

- [X] T022 Refresh research decisions and open questions in `specs/002-animate-elimination/research.md`
- [X] T023 Review `app.js` and `styles.css` for leftover debug code or redundant classes, pruning as needed
- [X] T024 Run full Chrome + Firefox regression per quickstart and record final outcomes in `specs/002-animate-elimination/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

1. Phase 1 → 2 → 3 → 4 → 5 → 6 (sequential baseline)
2. User story phases (3–5) require Phase 2 completion.
3. Phase 6 starts after all targeted user stories reach their checkpoints.

### User Story Dependency Graph

```
US1 (P1) ──▶ US2 (P2) ──▶ US3 (P3)
```

US2 builds on the animation primitives from US1, and US3 relies on the finalized controller behavior from US2.

### Parallel Opportunities

- T002 can run alongside T001 because it touches documentation only.
- After T005, T008 (styles.css) can proceed in parallel with T009/T010 sequence work.
- Within US2, T015 (styles.css) may run concurrently once T014’s API shape is known.
- In US3, T021 (styles.css) can execute parallel to T019/T020 once skip logic is defined.

### Parallel Execution Examples

```bash
# User Story 1
# Dev A (UI):  tackle T008 in styles.css
# Dev B (Logic): implement T009/T010 in app.js

# User Story 2
# Dev A: finalize Promise aggregation (T014)
# Dev B: adjust multi-elimination styling (T015)

# User Story 3
# Dev A: implement stalemate guard and reset logic (T019, T020)
# Dev B: add prefers-reduced-motion CSS overrides (T021)
```

---

## Implementation Strategy

1. Deliver MVP by completing Phase 3 (US1) before touching later stories.
2. Use feature flags within `EliminationSequenceController` during development if incremental toggles help isolate regressions (remove before ship).
3. Keep animation durations configurable in one place to simplify fine-tuning during manual validation.
4. After each story, run its manual checklist before moving to the next to maintain incremental confidence.

---

## MVP Scope Recommendation

- Complete Phases 1–3 to ship the core elimination animation experience flagged as P1.
- Defer Phases 4–5 if schedule compresses, but note the UX risks (multi eliminations, stalemates) in release notes.

---
