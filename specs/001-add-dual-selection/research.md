# Research Notes: Dual Finalist Selection Modes

## Survivor Monitoring Strategy
- **Decision**: Extend existing in-memory `state.game` tracking to include dual-finalist mode metadata and evaluate survivor counts after each round.
- **Rationale**: Keeps logic close to current elimination flow, reducing risk of desynchronizing UI and state while avoiding new data structures.
- **Alternatives Considered**:
  - Separate survivor tracker object → Rejected to prevent redundant sources of truth.
  - Post-processing history log to infer survivors → Rejected because it delays termination detection.

## Sudden-Death Resolution
- **Decision**: Trigger automatic sudden-death reruns among tied survivors whenever a round would leave more than two contenders in dual-finalist modes.
- **Rationale**: Aligns with clarified requirement while preserving automated play without manual intervention.
- **Alternatives Considered**:
  - Accepting all tied participants as co-finalists → Rejected; violates fixed-two outcome.
  - Using non-RPS tie-break heuristics (order, score) → Rejected; inconsistent with game mechanics.

## Mode Selection UX
- **Decision**: Add two new start buttons grouped with existing winner/loser buttons, respecting current enable/disable rules and visual hierarchy.
- **Rationale**: Users already expect mode selection in that area; reuse ensures quick adoption and minimal CSS disruption.
- **Alternatives Considered**:
  - Toggle switch to choose finalist count → Rejected; would complicate explaining winner vs loser modes.
  - Modal dialog for advanced options → Rejected; adds unnecessary interaction steps.

## Logging Enhancements
- **Decision**: Expand Korean console output to announce selected mode, per-round survivor counts, and sudden-death retries.
- **Rationale**: Satisfies observability principle and aids manual validation during multi-mode runs.
- **Alternatives Considered**:
  - Maintain current log granularity → Rejected; lacks clarity for dual modes.
  - Add English duplicates → Rejected to keep focus on Korean observability expectation.
