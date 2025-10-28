# Feature Specification: Animated Elimination Exit

**Feature Branch**: `[002-animate-elimination]`  
**Created**: 2025-10-27  
**Status**: Draft  
**Input**: User description: "현재 구현상태는 보존하고, 다음 기능을 추가한다: 라운드가 종료될 때, 만약 승부가 발생하여 제외되는 참가자가 있다면, 애니메이션을 적용하여 게임패널에서 사라지게 한 뒤, 라운드를 종료한다. 이 기능으로 가시성과 UI/UX를 개선하도록 한다."

## Clarifications

### Session 2025-10-27

- Q: Should the 3-second dwell countdown start immediately when a decisive round resolves, or only after the elimination animation finishes? → A: Keep the 3초 대기 먼저, then run the elimination animation.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Watch eliminated players exit clearly (Priority: P1)

The host runs a standard "최종 승자" 토너먼트 with six 참가자 and wants spectators to understand who is knocked out after each 라운드 without reading 콘솔 로그.

**Why this priority**: The animation directly addresses the stated UX problem; without it, spectators miss who left the 게임패널.

**Independent Test**: Launch `index.html`, 입력 six names, 선택 winner 모드, run until a decisive 결과 occurs, and confirm the 시각적 제거 sequence plus Korean console narration.

**Acceptance Scenarios**:

1. **Given** at least four active 참가자 배열 on the 원형 게임패널, **When** a 라운드 resolves with losers, **Then** 결과 화면이 3초간 유지된 뒤 각 탈락자가 0.4–1.0초의 시각적 전환(페이드/축소 혹은 슬라이드)을 거쳐 패널에서 사라진다.
2. **Given** a 라운드 with 탈락자, **When** their exit animation completes, **Then** the 대기 패널와 상단 카운트가 동시에 갱신되고 생존자는 계속 명확하게 표시된다.

---

### User Story 2 - Handle multiple eliminations at once (Priority: P2)

Two observers monitor a loser-tracking 모드 where 다수 참가자 leave in one round and need confirmation that everyone switched to 대기 상태 without missed frames.

**Why this priority**: Multi-elimination rounds are common late in the game; the animation must scale to several simultaneous exits.

**Independent Test**: Manual browser run with eight 참가자 in loser 모드, ensure a 라운드 results in 세 명 이상 탈락, and verify all 탈락자 share consistent exit timing and 대기 패널 반영.

**Acceptance Scenarios**:

1. **Given** 세 명 이상의 탈락자, **When** their exit plays, **Then** animations 시작 within 0.3초 of 결과 표시 and finish together without overlapping surviving 아이콘.

---

### User Story 3 - Preserve flow when no one leaves (Priority: P3)

An 운영자 replays a 라운드 after a 무승부 and expects the 화면 to stay steady—no ghost animations—until a real 탈락이 발생한다.

**Why this priority**: Avoiding false cues maintains 신뢰 in the UI and prevents spectator confusion.

**Independent Test**: Run a 매치 that forces a 무승부 (e.g., 재시작 until 자동으로 발생), observe that no exit animation triggers, then play a 후속 decisive round and confirm animations resume normally.

**Acceptance Scenarios**:

1. **Given** a 라운드 ends in 무승부, **When** the results show, **Then** no 참가자 plays an exit animation and the 다음 라운드 starts normally.
2. **Given** the 다음 라운드 has 탈락자, **When** it resolves, **Then** the exit animation triggers once per 탈락자 despite the 이전 무승부.

### Edge Cases

- 마지막 두 참가자가 동시에 탈락하여 최종 우승/패자만 남을 때, 애니메이션이 끝난 뒤에만 최종 팝업이 뜬다.
- 동일 라운드에서 5명 이상 탈락해도 애니메이션이 겹치지 않고 모두 가시적으로 실행된다.
- 모바일 뷰포트(가로 375px 이하)에서 애니메이션이 잘려 보이지 않는다.
- 진행자가 애니메이션 도중 새 게임을 시작하면 기존 애니메이션이 즉시 종료되고 새 상태가 깔끔하게 초기화된다.
- 카운트다운 오버레이가 표시 중일 때에도 탈락 애니메이션 시야를 가리지 않는다.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every decisive 라운드 MUST trigger a visual exit animation for each 탈락자 on the 게임패널 before the 참가자 아이콘 disappears.
- **FR-002**: Exit animations MUST begin immediately after the 고정 3초 대기 타이머 completes, run for 0.4–1.0초, and finish before the 다음 라운드 카운트다운이 시작된다.
- **FR-003**: 생존 참가자와 카운트다운 요소는 애니메이션 동안 흐려지거나 숨겨지지 않고, 탈락자만 시각적으로 구분되어야 한다.
- **FR-004**: 대기자 패널과 참가자 수 카운트는 탈락 애니메이션이 완료된 뒤 한 번만 갱신되어, 관찰자가 중복 플래시 없이 상태 변화를 이해할 수 있어야 한다.
- **FR-005**: 애니메이션이 끝난 라운드에서 마지막 남은 참가자가 결정되면, 최종 결과 팝업은 애니메이션 종료 직후에만 표시되어 갑작스러운 화면 전환을 피해야 한다.
- **FR-006**: 브라우저가 애니메이션을 지원하지 않거나 사용자가 환경 설정에서 모션을 최소화한 경우, 참가자는 즉시 제거되되 콘솔 로그와 패널 카운트가 동일한 정보를 제공해야 한다.

### Assumptions

- 라운드 결과는 기존 자동 컨트롤(카운트다운, 딜레이 3초) 흐름을 유지하며, 선택 공개 후 3초 대기 시간이 지난 다음 탈락 애니메이션이 실행된다.
- 탈락 애니메이션은 페이드/축소/슬라이드 조합처럼 누구나 인지 가능한 시각적 효과를 사용하며, 방향성은 원형 패널 외곽으로 빠져나가는 느낌을 준다.
- 기존 Korean 로그 포맷은 변하지 않고, 필요한 경우 애니메이션 시작과 종료를 알리는 메시지만 추가한다.

### Key Entities *(include if feature involves data)*

- **Active Participant Display**: 원형 게임패널에 노출되는 참가자 카드(이름, 위치, 현재 상태). 애니메이션 대상이 된다.
- **Waiting Queue Indicator**: 대기 상태 참가자 목록과 카운트 텍스트. 애니메이션 종료 시점에 업데이트된다.
- **Round Outcome Summary**: 라운드 결괏값(승자/패자 목록, 모드, 라운드 번호)을 기록하며 애니메이션 트리거 조건을 제공한다.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In manual Chrome 및 Firefox 테스트 각 3회 중 decisive 라운드 100%에서 탈락 애니메이션이 확인된다.
- **SC-002**: 탈락 애니메이션 한 사이클은 1.0초를 초과하지 않아, 선택 공개 후 3초 대기 + 애니메이션까지 총 4초 이내에 다음 라운드가 시작된다.
- **SC-003**: 관찰자 피드백 설문(5명 기준)에서 80% 이상이 "누가 탈락했는지 즉시 알 수 있다"에 동의한다.
- **SC-004**: 무승부, 단일 탈락, 다중 탈락, 최종 라운드 시나리오 각각의 수동 체크리스트 실행 시 UI/로그 불일치가 0건이다.
