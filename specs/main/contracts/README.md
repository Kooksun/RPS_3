## Contracts Summary

This feature operates entirely within a static browser environment and does not expose networked APIs or external integrations. Instead of REST/GraphQL endpoints, the following internal event contracts govern component interactions:

| Event | Publisher | Subscribers | Payload | Notes |
|-------|-----------|-------------|---------|-------|
| `participants:update` | Name input handler | Game panel renderer, countdown controller | Array of sanitized participant objects | Fired on every input change; keeps radial layout in sync. |
| `game:start` | Start buttons | Game engine, UI controls | `{ mode: "winner" \| "loser" }` | Disables input, initializes `GameState`, resets history/waiting panels. |
| `round:countdown` | Game engine | Countdown display | `{ roundIndex, durationMs }` | Triggers countdown overlay and Korean console logs. |
| `round:choices` | Game engine | Game panel, history writer | Array of `{ participantId, emoji, resultTag }` | Broadcast once per round after countdown completes. |
| `round:complete` | Game engine | Waiting panel, history panel, logger | `{ round, nextActiveIds }` | Handles 3s dwell, updates panels based on mode. |
| `game:complete` | Game engine | Popup renderer, UI controls | `{ finalParticipant, mode }` | Displays final popup and unlocks reset affordance. |

These events will be implemented with simple pub/sub utilities (e.g., array of listeners invoked synchronously) to maintain clarity and testability without introducing external libraries.
