# Implementation Plan: Dual Finalist Selection Modes

**Branch**: `[001-add-dual-selection]` | **Date**: 2025-10-28 | **Spec**: specs/001-add-dual-selection/spec.md
**Input**: Feature specification from `/specs/001-add-dual-selection/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. All guidance below reflects the constitution for the RPS Simulation Browser App.

## Summary

Extend the existing automatic RPS tournament so hosts can choose new `승자 2명 뽑기` and `패자 2명 뽑기` start options that only finish once 두 명이 확정된다. Dual-mode rounds now end immediately when 두 명이 한 번에 결정되고, 단일 참가자만 확정될 경우에는 “승자/패자: {이름}”으로 고정 표시한 뒤 3초 안내 팝업을 거쳐 서든데스(3초 고정 카운트다운, 전용 테마, 붉은 테두리 히스토리)로 진입한다. Sudden-death runs reuse the locked finalist from 일반 라운드, continue with the remaining 참가자만 자동으로 돌리고, 두 명이 완성되면 팝업과 콘솔에 같은 순서로 보고한다.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES6+)  
**Primary Dependencies**: None (vanilla browser APIs only)  
**Storage**: N/A (in-memory simulation)  
**Testing**: Manual browser verification (no automated frameworks)  
**Target Platform**: Modern desktop browsers (Chrome, Firefox)  
**Project Type**: Single-page static web application  
**Performance Goals**: Instant load from static files; round resolution within one animation frame  
**Constraints**: Must run offline from static files; no build or bundling steps  
**Scale/Scope**: Supports ad-hoc local sessions with small participant lists (≤16 names recommended)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- `I. Browser-Only Delivery`: UI additions and state logic stay in the existing static files; no new build steps or services introduced.
- `II. Auto Simulation Flow`: Dual-finalist modes still auto-generate choices and now monitor survivor counts plus sudden-death loops so the flow never stalls.
- `III. Korean Console Observability`: Logging updates will announce mode selection, round survivor counts, and dual-finalist conclusions in Korean.
- `IV. Minimal Tooling Footprint`: Enhancements rely on current vanilla JS patterns, reuse manual validation, and avoid extra tooling.

## Project Structure

### Documentation (this feature)

```text
specs/001-add-dual-selection/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
.
├── index.html           # Single-page UI
├── styles.css           # Styling for the simulation page
└── app.js               # Game logic and console logging
```

**Structure Decision**: Single static bundle rooted at repository top-level (`index.html`, `styles.css`, `app.js`). Additions require justification against Principle IV.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
