# Feature Specification: Responsive RPS Simulation UI

**Feature Branch**: `[001-responsive-ui]`  
**Created**: 2025-10-24  
**Status**: Draft  
**Input**: User description: "가위바위보 시뮬레이션 게임 ... 히스토리 패널: 각 라운드의 결과를 기록하여 표시한다. ... 시각적 피드백 ... 애니메이션 효과 ..."

## User Scenarios & Testing *(mandatory)*

Prioritize user journeys by impact (P1 highest). Each story must deliver a standalone slice that can be demonstrated by opening `index.html` in a browser, entering names, and observing the automated simulation plus Korean console logs.

### User Story 1 - 이름 입력과 기본 레이아웃 (Priority: P1)

사용자는 참가자 이름을 쉼표로 구분해 입력하고, 승자/패자 모드 버튼 상태가 유효 인원수(2~12명)일 때만 활성화된 모습을 확인한다. 게임 진행 패널(좌측)에는 입력된 참가자 이름이 즉시 반영되어 원형으로 배치되고, 대기자 및 히스토리 패널(우측)은 초기 상태로 유지된다.

**Why this priority**: 모든 인터랙션의 기반이 되는 입력과 자동 배치가 제공되어야 이후 게임 자동화 기능을 테스트할 수 있다.

**Independent Test**: Launch the static bundle in a browser, 입력 창에 다양한 참가자 이름을 입력/삭제하며 버튼 활성화 조건과 원형 배치를 확인하고 콘솔에 한국어 상태 로그가 남는지 검증한다.

**Acceptance Scenarios**:

1. **Given** 페이지가 로드된 상태, **When** 사용자가 참가자 이름을 쉼표로 입력하면, **Then** 이름 목록이 즉시 게임 진행 패널의 원형 레이아웃에 반영되고 버튼 활성화 상태가 인원 기준에 맞춰 갱신된다.
2. **Given** 참가자 수가 1명 또는 13명 이상, **When** 사용자가 입력을 제출하면, **Then** 시작 버튼 두 개가 모두 비활성화되며 콘솔에 한국어 안내 로그가 남는다.

---

### User Story 2 - 자동 라운드 진행과 패널 업데이트 (Priority: P2)

사용자가 승자 또는 패자 모드를 선택하면 카운트다운, 자동 선택, 결과 기록, 대기자 패널 업데이트까지 전 과정을 자동으로 관찰할 수 있다.

**Why this priority**: 게임의 핵심인 자동 라운드 진행과 결과 표시가 구현되어야 사용자에게 가치를 제공한다.

**Independent Test**: Manual browser run focusing on 이 유저 스토리의 흐름을 테스트 모드별로 반복 실행하며 콘솔 한국어 로그와 UI 업데이트(카운트다운, 선택 이모지, 히스토리 카드, 대기자 정렬)를 확인한다.

**Acceptance Scenarios**:

1. **Given** 4명의 참가자가 있고 승자 모드를 선택한 상태, **When** 카운트다운이 종료되면, **Then** 모든 참가자의 선택 이모지가 이름 안쪽의 원에 나타나고 결과 카드가 우측 히스토리에 추가되며, 패배한 참가자들은 게임 진행 패널 하단의 대기자 목록에 텍스트로 표시된다.
2. **Given** 패자 모드로 전환된 상태, **When** 다음 라운드가 종료되면, **Then** 승자들이 대기자 패널로 이동하고 패자만 게임 진행 패널에 남으며 3초 후 자동으로 다음 라운드가 시작된다.

---

### User Story 3 - 종료 알림과 반응형 UX (Priority: P3)

게임이 마지막 참가자만 남을 때 종료되고, 다양한 화면 크기에서도 좌-우 2단 레이아웃이 유지되며 팝업형 알림으로 최종 승자/패자가 강조된다.

**Why this priority**: 최종 사용자 경험을 완성하고 반응형 요구사항을 충족해 배포 품질을 확보한다.

**Independent Test**: 수동으로 브라우저 크기를 조정하고 다른 기기 시뮬레이터에서 게임을 끝까지 진행해 종료 팝업, 패널 비율, 가독성, 애니메이션 유지 여부를 확인한다.

**Acceptance Scenarios**:

1. **Given** 게임이 마지막 플레이어 한 명만 남은 상태, **When** 라운드가 끝나면, **Then** 중앙 팝업에 최종 승자/패자 이름이 크게 표시되고 3개 패널이 종료 상태로 고정된다.
2. **Given** 브라우저 폭이 좁아진 상태, **When** 레이아웃이 재배치되면, **Then** 세로 레이아웃이 유지되고 상단/중앙/하단 영역 비중이 지정된 가중치에 가깝게 유지되며 텍스트가 읽기 쉬운 크기로 남는다.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- 참가자 이름에 공백만 포함되거나 연속 쉼표가 입력된 경우 정규화 처리
- 중복 이름 입력 시 구분 또는 표시 규칙
- 라운드가 반복 무승부로 이어질 때 카운트다운·히스토리 업데이트 타이밍
- 참가자 수가 홀수일 때 승자/패자 모드 처리 (부전승, 패자 없음 시 안내)
- 브라우저 탭 비활성화 상태에서 타이머 동작 지연 시 동기화 방식
- 모바일 세로 화면에서 히스토리 카드 높이가 제한되는 경우 스크롤 처리

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Interface MUST collect 2~12 participant names via a comma-separated input and reflect sanitized names immediately in the game panel.
- **FR-002**: System MUST enable both start buttons only when participant count is within limits; otherwise disable them and log Korean guidance.
- **FR-003**: On start, the app MUST disable inputs/buttons, reset waiting and history panels, and automatically begin the first round.
- **FR-004**: A countdown MUST appear in the panel center with timings: rounds 1-5 = 5s, 6-10 = 4s, 11+ = 3s.
- **FR-005**: After countdown, every participant's choice MUST be rendered as a ✌️/✊/🖐️ emoji in a separate, inner concentric circle, closer to the center than the names.
- **FR-006**: History panel MUST append a card per round. The card header must show the round number and the mathematical probability of that round's outcome. The card body must show each participant's choice, with emojis (e.g., 😊, 💀, 😐) indicating their status for that round based on the game mode.
- **FR-007**: The waiting panel, located at the bottom of the arena, MUST display the names of eliminated participants as a single, comma-separated line of text.
- **FR-008**: The system MUST wait 3 seconds after displaying results before updating participant pools and starting the next countdown automatically.
- **FR-009**: Game MUST terminate when a single participant remains and display a centered popup highlighting the final winner or loser.
- **FR-010**: All game states and transitions MUST emit Korean-language console logs covering initialization, countdown start/end, move assignment, panel updates, and termination.
- **FR-011**: The UI MUST maintain a two-column grid layout (e.g., 5:1 ratio between main content and history). The history panel's content must scroll vertically without expanding the page. On narrower screens, the layout should stack vertically.
- **FR-012**: Animations MUST highlight participant radial placement and the reveal of emoji choices per round using pure CSS/JS without external libraries.
- **FR-013**: When a round ends with no eliminations (a stalemate), the system MUST record the stalemate in the history panel and, after a 3-second delay, trigger the next round.

### Key Entities *(include if feature involves data)*

- **Participant**: Sanitized name, current status (active, waiting), latest choice emoji.
- **Round**: Index, countdown duration, per-participant choices, resulting winners/losers, mode context.
- **Game State**: Mode (winner/loser), active participant array, waiting list, history log, countdown timer configuration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a full simulation (start to winner popup) in under 90 seconds for 6 participants on standard hardware.
- **SC-002**: Each round generates at least five Korean-language console messages covering countdown start/end, choices, outcome, and next-step transition.
- **SC-003**: Layout retains core panel ratios within ±5% across viewports from 768px to 1440px width without horizontal scroll.
- **SC-004**: Animations render smoothly at 60fps in Chrome and Firefox on desktop with no dropped frames during countdown or emoji reveal.
- **SC-005**: Manual regression checklist confirms correct waiting/history ordering and popup termination behavior across both game modes with zero blockers.

## Clarifications

### Session 2025-10-24

- Q: How should stalemates be resolved when no eliminations occur after a round? → A: Record the stalemate round in the history panel, wait 3 seconds, and then start the next round.
