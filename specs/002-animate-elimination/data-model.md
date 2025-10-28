# Data Model: Animated Elimination Exit

## Entities

### ActiveParticipantNode
- **Source**: `state.dom.participantRing` nodes representing active players.
- **Fields**:
  - `participantId` (string) – unique identifier from `GameState.activeParticipants.id`.
  - `name` (string) – displayed label.
  - `status` ("active" | "waiting") – expected state; should remain "active" until elimination animation finishes.
  - `domElement` (HTMLElement) – reference used for animation class toggles.
- **Relationships**: Mirrors `GameState.activeParticipants` entries; removal deferred until animation end.
- **Validation**: Node must exist before animation begins; skip animation if element not found (logs warning).

### EliminationSequence
- **Source**: Generated per decisive round after 3초 dwell.
- **Fields**:
  - `roundIndex` (number) – 1-based round for logging.
  - `mode` ("winner" | "loser") – determines which participant IDs are eliminated.
  - `eliminatedIds` (string[]) – participants slated for removal.
  - `durationMs` (number) – animation runtime (default 600ms; bounded 400–1000ms per FR-002).
  - `prefersReducedMotion` (boolean) – indicates whether to skip animation and remove instantly.
- **Relationships**: Consumes `RoundOutcomeSummary` to derive `eliminatedIds`; feeds `applyNextActiveParticipants` once complete.
- **State Transitions**: `pending` → `animating` → `completed` (or `skipped` when reduced motion).

### RoundOutcomeSummary
- **Source**: Already produced in existing game logic when a round resolves.
- **Fields**:
  - `index` (number)
  - `choices` (array of `{ participantId, emoji, resultTag }`)
  - `winners` (string[])
  - `losers` (string[])
  - `mode` ("winner" | "loser")
- **Usage Update**: Provides inputs to build `EliminationSequence` prior to updating waiting panel.

### WaitingPanelSnapshot
- **Source**: Created after animation completes to refresh waiting panel once per round.
- **Fields**:
  - `timestamp` (number) – ms since epoch when update occurs.
  - `waitingNames` (string[]) – final ordering after elimination.
  - `activeCount` (number)
  - `waitingCount` (number)
- **Relationships**: Derived from `GameState.waitingParticipants` post-elimination; used to maintain logging consistency.

## Events

- `round:elimination:start` – emitted when elimination animation begins (payload: `EliminationSequence`).
- `round:elimination:complete` – emitted after animation removal, triggering `applyNextActiveParticipants` and subsequent round start.
- `round:elimination:skipped` – emitted when animation bypassed due to reduced motion; consumers treat as instant completion.

## Derived State Rules

- `GameState.activeParticipants` must not mutate between dwell completion and `round:elimination:(complete|skipped)` to preserve animation targets.
- Countdown timers for the next round start only after elimination events finish, ensuring total turnaround ≤4초 (SC-002).

