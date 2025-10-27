---
description: "Task list for Responsive RPS Simulation UI"
---

# Tasks: Responsive RPS Simulation UI

**Input**: Design documents from `/specs/main/`  
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

## Phase 1: Static Bundle Setup (Shared Infrastructure)

**Purpose**: Establish the minimal HTML/CSS/JS skeleton

- [X] T001 Update feature scope note in `/specs/main/plan.md`
- [X] T002 Ensure base HTML scaffold exists in `/index.html` with header, main, and footer containers
- [X] T003 Define global CSS variables and base typography in `/styles.css`
- [X] T004 [P] Initialize module structure with state/events/render namespaces in `/app.js`
- [X] T005 [P] Document baseline manual validation steps in `/specs/main/quickstart.md`

---

## Phase 2: Foundational Simulation Logic (Blocking Prerequisites)

**Purpose**: Ensure automation works before story-specific UI changes

**⚠️ CRITICAL**: No user story work can begin until automatic move generation, countdown tiers, and tie replay are implemented.

- [X] T006 Implement core `GameState` object and state reset helpers in `/app.js`
- [X] T007 Build simple pub/sub utility for internal events in `/app.js`
- [X] T008 [P] Implement participant input parser with sanitization and name deduplication in `/app.js`
- [X] T009 [P] Add random move generator honoring stalemate replay rule in `/app.js`
- [X] T010 Wire countdown controller using `requestAnimationFrame` in `/app.js`
- [X] T011 Connect event wiring between input parser, game start buttons, and state engine in `/app.js`

**Checkpoint**: Foundation ready—user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 이름 입력과 기본 레이아웃 (Priority: P1) 🎯 MVP

**Goal**: 사용자 입력에 따라 참가자를 즉시 원형 배치하고 유효 인원수 범위에서만 시작 버튼을 활성화한다.

**Independent Test**: Manual browser run verifying that comma-separated names update the radial layout and toggle both start buttons correctly while Korean console logs record state changes.

### Manual Validation for User Story 1

- [ ] T012 Update `/specs/main/quickstart.md` with Chrome validation details and expected Korean console log sequence for name entry
- [ ] T013 Capture reference screenshots of the radial layout and button states in `/specs/main/reference/` (create folder if needed)

### Implementation for User Story 1

- [X] T014 [P] [US1] Implement form markup for name input and start buttons in `/index.html`
- [X] T015 [P] [US1] Style top header area (15% height) with horizontal alignment in `/styles.css`
- [X] T016 [US1] Implement radial layout renderer tying participant list to circular placement in `/app.js`
- [X] T017 [US1] Render default placeholders in waiting/history panels within `/index.html`
- [X] T018 [US1] Apply base styling for waiting/history containers (30% bottom area, scroll handling) in `/styles.css`
- [X] T019 [US1] Emit Korean console logs for participant updates and button enable/disable transitions in `/app.js`

**Checkpoint**: User Story 1 delivers a fully automated simulation slice and can be demoed independently.

---

## Phase 4: User Story 2 - 자동 라운드 진행과 패널 업데이트 (Priority: P2)

**Goal**: 게임 시작 시 카운트다운, 자동 선택, 히스토리/대기자 패널 업데이트가 모드에 따라 정확히 동작한다.

**Independent Test**: Manual browser run in Chrome and Firefox confirming countdown tiers, emoji reveals, history card creation, waiting panel stacking, and Korean console narration per round.

### Manual Validation for User Story 2

- [X] T020 Log Firefox validation notes (timing, logs, panel updates) into `/specs/main/quickstart.md`
- [X] T021 Record sample console output snippets for both 승자/패자 모드 in `/specs/main/reference/logs-us2.txt`

### Implementation for User Story 2

- [X] T022 [US2] Implement countdown overlay with dynamic text sizing in `/index.html` and `/styles.css`
- [X] T023 [US2] Animate emoji reveal and countdown using CSS transitions and `requestAnimationFrame` hooks in `/app.js` and `/styles.css`
- [X] T024 [US2] Update history panel rendering to append round cards with round index, choices, and outcome in `/app.js`
- [X] T025 [US2] Update waiting panel renderer to stack winners/losers per mode in `/app.js`
- [X] T026 [US2] Add 3-second dwell timer after results with automatic next-round start in `/app.js`
- [X] T027 [US2] Emit detailed Korean console logs for countdown start/end, choices, panel updates, and dwell transitions in `/app.js`

**Checkpoint**: User Stories 1 AND 2 run independently and meet console observability requirements.

---

## Phase 5: User Story 3 - 종료 알림과 반응형 UX (Priority: P3)

**Goal**: 마지막 참가자만 남으면 팝업으로 결과를 안내하고, 전체 레이아웃이 다양한 화면 크기에서도 비율과 가독성을 유지한다.

**Independent Test**: Manual regression across Chrome and Firefox with viewport resizing to confirm final popup behavior, panel ratios within ±5%, and animation performance at 60fps.

### Manual Validation for User Story 3

- [ ] T028 Extend `/specs/main/quickstart.md` with viewport resizing checklist and final popup verification steps
- [ ] T029 Capture before/after screenshots for narrow (~768px) and wide (~1440px) layouts in `/specs/main/reference/`

### Implementation for User Story 3

- [X] T030 [P] [US3] Implement final popup markup in `/index.html` and base styles in `/styles.css`
- [X] T031 [US3] Add responsive CSS rules (media queries) to maintain 15/55/30 panel ratios and typography scaling in `/styles.css`
- [X] T032 [US3] Integrate popup trigger when `activeParticipants.length === 1` and stop simulation loop in `/app.js`
- [X] T033 [US3] Ensure accessibility attributes (aria-live, focus trap) for popup and close/reset affordance in `/index.html` and `/app.js`
- [X] T034 [US3] Adjust radial layout calculations to adapt participant radius for different viewport heights in `/app.js`
- [X] T035 [US3] Emit Korean console summary when game completes, including final participant name and mode in `/app.js`

**Checkpoint**: All prioritized user stories operate independently with full Korean console coverage.

---

## Phase 6: UI Refinement & Bug Fixes (Post-MVP)

**Purpose**: Refine the user interface based on feedback and fix newly discovered bugs.

- [X] T041 [P] Refactor main layout from 3-row vertical to 2-column horizontal in `/index.html` and `/styles.css`.
- [X] T042 [P] Redesign waiting panel to be a single, comma-separated text line at the bottom of the arena in `/app.js` and `/styles.css`.
- [X] T043 Fix history panel overflow by constraining layout height and enabling internal scroll in `/styles.css`.
- [X] T044 Decouple choice emojis from name nodes into a separate, concentric circle in `/index.html`, `/app.js`, and `/styles.css`.
- [X] T045 Redesign history cards to combine header info and use emojis (😊/💀/😐) for player status in `/app.js`.
- [X] T046 Fix bug where choice emojis were not cleared between rounds in `/app.js`.
- [X] T047 Fix bug where choice emojis were all rendered in the center due to a CSS transform conflict in `/app.js` and `/styles.css`.
- [X] T048 Adjust sizing and positioning of name and choice rings for better visual balance in `/app.js` and `/styles.css`.
- [X] T049 Replace survivor/loser count in history cards with the mathematical probability of the outcome in `/app.js` and `/styles.css`.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Hardening and documentation updates affecting multiple stories

- [ ] T036 [P] Update `/specs/main/plan.md` and `/specs/main/research.md` with implementation notes and deviations
- [ ] T037 Code cleanup and inline documentation for simulation modules in `/app.js`
- [ ] T038 Optimize DOM updates to minimize layout thrash during animations in `/app.js`
- [ ] T039 Confirm Korean console coverage matches quickstart checklist through final pass in Chrome and Firefox (record in `/specs/main/reference/final-run.md`)
- [ ] T040 Run end-to-end manual validation against quickstart checklist and record results in `/specs/main/reference/final-run.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies—start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1—BLOCKS all user stories
- **Phase 3+ (User Stories)**: Depend on Phase 2 completion; run sequentially by priority or in parallel if staffing allows
- **Phase N (Polish)**: Depends on all targeted user stories reaching their checkpoints

### User Story Dependencies

- **User Story 1 (P1)**: Starts after foundational tasks; no downstream dependencies
- **User Story 2 (P2)**: Starts after foundational tasks; builds on US1 layout/state handling but remains independently demoable
- **User Story 3 (P3)**: Starts after foundational tasks; depends on US2’s simulation loop and extends UI responsiveness and completion flow

### Within Each User Story

- Manual validation documentation precedes implementation work
- State/logic updates occur before DOM rendering updates
- Styling polish follows DOM updates
- Console logging instrumentation completes each story

### Parallel Opportunities

- Phase 1 tasks T004 and T005 can run concurrently with T002/T003 once `index.html` scaffold exists
- In Phase 2, T008 and T009 can run in parallel, followed by T010
- In User Story phases, tasks marked `[P]` can be split (e.g., markup vs. JS vs. CSS)
- Manual validation tasks can proceed once respective implementation tasks complete

---

## Implementation Strategy

1. Deliver MVP by completing Phase 1, Phase 2, and User Story 1 (P1) to unlock core experience.
2. Expand automation fidelity and observability with User Story 2 (P2).
3. Finish responsive behavior and completion flow via User Story 3 (P3).
4. Apply polish tasks to harden the experience before distribution.