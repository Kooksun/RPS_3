# Research: Animated Elimination Exit

## Decision 1: Stage elimination animation after dwell using dedicated controller hook
- **Decision**: Extend the existing dwell flow so that `round:dwell:complete` triggers an elimination animation routine, which then emits a follow-up event when finished.
- **Rationale**: Keeps the 3초 결과 노출 intact, satisfies the spec ordering (dwell → animation → removal), and centralizes timing logic alongside current countdown/dwell controllers.
- **Alternatives considered**:
  - Trigger animation during the dwell window; rejected because 결과 표시 시간이 줄어들어 명시 요구와 어긋난다.
  - Handle animation entirely inside SimulationEngine; rejected to avoid mixing timing orchestration with game state resolution logic.

## Decision 2: Apply CSS transition classes with JS lifecycle callbacks
- **Decision**: Inject elimination classes on affected participant nodes (`is-eliminating` plus 모드별 변형 클래스), rely on CSS keyframes/transition 조합으로 0.6초 내외 아크 이동을 구현하고, 애니메이션 종료 이벤트로 DOM을 정리한다.
- **Rationale**: Matches the static asset constraint (no new libraries), keeps animation definitions declarative in CSS, enables 모드별 분위기 분기(패배자는 붉은 하강, 승자는 황금 상승), and allows easy coordination via lifecycle callbacks.
- **Alternatives considered**:
  - Use JS-driven `requestAnimationFrame` updates; rejected as harder to maintain and less performant for simultaneous eliminations.
  - Animate via inline styles per node; rejected to keep separation of concerns and reuse CSS across active/waiting panels.

## Decision 3: Respect reduced motion preferences with instant fallback
- **Decision**: Detect `prefers-reduced-motion: reduce` via CSS (and double-check with JS flag) to skip the animation, immediately remove nodes, and rely on console logs/counts for clarity.
- **Rationale**: Aligns with FR-006 accessibility requirement while keeping behavior deterministic for users who disable animations.
- **Alternatives considered**:
  - Always animate regardless of setting; rejected due to accessibility non-compliance.
  - Provide a manual toggle in UI; rejected to avoid scope creep and additional controls beyond spec.

## Decision 4: Batch waiting panel updates until animation completion
- **Decision**: Delay calls to `applyNextActiveParticipants` and waiting panel updates until the animation routine resolves, then update both active ring and waiting list once.
- **Rationale**: Prevents flicker during the animation and satisfies FR-004's "한 번만 갱신" constraint.
- **Alternatives considered**:
  - Update panels immediately before animation; rejected because it would remove nodes that still need to animate, breaking the visual flow.
  - Incrementally remove each participant as their animation finishes; rejected to keep simultaneous eliminations synchronized and predictable.

## Decision 5: Differentiate exit tone per mode
- **Decision**: 승자 뽑기(`winner` 모드)에서는 패배자에게 붉은 하강 아크와 잔상을 적용하고, 패자 뽑기(`loser` 모드)에서는 승자에게 황금빛 상승 아크와 글리터 효과를 제공하여 감정선을 분리한다.
- **Rationale**: Same animation controller can feed CSS classes that communicate 패배와 승리의 대비, improving UX clarity without separate code paths.
- **Alternatives considered**:
  - Single neutral animation for both modes; rejected because it felt bland and failed to highlight 승자/패자 역할 차이.
  - 완전히 다른 JS 로직 작성; rejected to avoid doubling maintenance cost when CSS 클래스 분기만으로 충분했다.
