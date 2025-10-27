## Data Model

### Participant
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `id` | string | Stable identifier derived from sanitized name | Unique per game session |
| `name` | string | Display name shown in UI | Trimmed, 1–24 visible chars after trimming |
| `status` | enum (`active`, `waiting`, `eliminated`) | Current placement relative to active panel | Determined by game mode rules |
| `currentChoice` | enum (`rock`, `paper`, `scissors`, `none`) | Last assigned move | Reset to `none` on countdown start |
| `placementAngle` | number (degrees) | Calculated angle for radial layout | 0–360 exclusive, recalculated each round |

### Round
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `index` | integer | Sequential round number starting at 1 | Increments by 1 per completed round |
| `countdownDurationMs` | integer | Countdown duration in milliseconds | 5000 for rounds 1–5, 4000 for 6–10, 3000 otherwise |
| `startedAt` | DOMHighResTimeStamp | Monotonic timestamp when countdown begins | Captured via `performance.now()` |
| `choices` | array\<RoundChoice\> | Snapshot of participant choices | Must include all active participants |
| `outcome` | enum (`win`, `loss`, `stalemate`) | Result classification relative to active mode | `stalemate` is recorded and triggers a replay after a 3-second delay |

#### RoundChoice (inline type)
| Field | Type | Description |
|-------|------|-------------|
| `participantId` | string | Reference to Participant.id |
| `emoji` | enum (`✌️`, `✊`, `🖐️`) | Visual representation |
| `resultTag` | enum (`winner`, `loser`, `pending`) | Outcome tag for history card |

### GameState
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `mode` | enum (`winner`, `loser`) | Active game mode selected at start | Immutable during session |
| `activeParticipants` | array\<Participant\> | Participants currently in the central panel | 1–12 entries (initially 2–12) |
| `waitingParticipants` | array\<Participant\> | Participants stacked in waiting panel, rendered as a comma-separated list. Sorted by most recent addition first. |
| `history` | array\<Round\> | Ordered list of completed rounds | Most recent first when rendered |
| `countdownState` | object | Derived state for countdown display | Contains `remainingMs`, `isRunning` |
| `isRunning` | boolean | Indicates simulation is active | False only when idle or popup shown |
| `finalParticipant` | Participant \| null | Winner/loser shown in popup | Set when `activeParticipants.length === 1` |
| `nameRadius` | number | Calculated radius of the outer name circle in pixels | Set by rendering engine |

### Relationships & State Transitions
- `Participant.status` transitions:
  - `active` → `waiting` when eliminated (winner mode removes losers; loser mode removes winners).
  - `active` → `eliminated` only when final popup shown and participant is resolved outcome.
  - `waiting` remains unless reintegrated (not applicable in current flow).
- `GameState.activeParticipants` shrink after each round based on mode outcome; stalemates leave list unchanged.
- `Round` entities append to `GameState.history` immediately after results display but before the 3-second dwell period completes.

### Derived/Computed Values
- Placement angles computed as `360 / activeCount * index` with offsets to align first participant at top center.
- Countdown tier derived from `Round.index` according to FR-004.
- Radial radius scales with container min(width, height) × responsive ratio (e.g., 0.35 desktop, 0.30 tablet).
