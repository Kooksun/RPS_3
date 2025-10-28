# Contracts: Animated Elimination Exit

No external network APIs are introduced; the simulation remains entirely client-side per Constitution Principle I.

## Internal PubSub Events

| Event | Payload | Purpose |
|-------|---------|---------|
| `round:elimination:start` | `EliminationSequence` | Signal that post-dwell elimination animation is starting. |
| `round:elimination:complete` | `{ roundIndex, eliminatedIds, mode }` | Notify that animations finished and state updates can proceed. |
| `round:elimination:skipped` | `{ roundIndex, eliminatedIds, mode }` | Notify that reduced-motion shortcut removed nodes instantly. |

Consumers: `SimulationEngine`, `applyNextActiveParticipants`, `WaitingPanelRenderer`, and logging utilities.

> These events are coordinated by the `EliminationSequenceController` skeleton defined in `app.js`, which will be expanded in later phases.
