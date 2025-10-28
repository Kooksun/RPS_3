# Data Model: Dual Finalist Selection Modes

## Entities

### Participant
- **Attributes**:
  - `name` (string) – trimmed input label displayed in UI.
  - `status` (enum: `active`, `waiting`) – determines panel placement.
  - `role` (enum: `winner`, `loser`, `undecided`) – inferred each round for history annotation.
- **Validation Rules**:
  - Names trimmed of leading/trailing whitespace.
  - Empty strings rejected; duplicates allowed but preserved verbatim.
- **Lifecycle**:
  - Starts as `active`.
  - Moves to `waiting` once removed from current mode’s survivor pool.
  - Can return to `active` only on game restart.

### GameMode
- **Attributes**:
  - `type` (enum: `winner`, `loser`, `winner-dual`, `loser-dual`).
  - `targetSurvivors` (number: `1` or `2`).
  - `exclusionRule` (enum: `drop-winners`, `drop-losers`) – determines which group leaves the active panel after each round.
- **Relationships**:
  - Bound to `GameState` for the current session.

### GameState
- **Attributes**:
  - `activeParticipants` (array<Participant>).
  - `waitingParticipants` (array<Participant>).
  - `mode` (GameMode).
  - `roundNumber` (number).
  - `pendingSuddenDeath` (boolean) – true when tied survivors require replays.
- **Lifecycle**:
  - Initialized on start button press with sanitized participants.
  - Mutated each round after countdown, move generation, and result evaluation.
  - Marks completion when `activeParticipants.length === mode.targetSurvivors`.

### RoundResult
- **Attributes**:
  - `roundNumber` (number).
  - `moves` (Map<Participant.name, choice>` choice ∈ {`rock`, `paper`, `scissors`}).
  - `winners` (array<Participant.name>).
  - `losers` (array<Participant.name>).
  - `suddenDeath` (boolean).
- **Relationships**:
  - Pushed to history timeline for UI rendering.
  - Used to derive survivor counts and potential sudden-death requirements.

## Derived Rules
- After each decisive round:
  - If `mode.exclusionRule === drop-winners`, move winners to waiting list; otherwise move losers.
  - Recompute `activeParticipants` from survivors and compare against `targetSurvivors`.
  - When survivors exceed `targetSurvivors`, schedule a sudden-death replay limited to those participants.
- Sudden-death rounds reuse standard flow but tag `suddenDeath = true` for logging and history styling.
