# Quickstart: Animated Elimination Exit

## Manual Validation Checklist

1. Open `index.html` in Chrome via `file://` URL.
2. 입력 최소 4명의 참가자 이름, winner 모드로 게임을 시작한다.
3. 첫 번째 decisive 라운드에서 선택지가 공개되면 3초 동안 변화가 없는지 확인한다.
4. 3초가 지나면 탈락자 아이콘이 0.4~1.0초 동안 페이드/축소 애니메이션으로 사라지는지 살핀다.
5. 애니메이션 직후 대기자 패널과 참가자 수 카운트가 한 번만 업데이트되는지, 생존자는 유지되는지 확인한다.
6. Firefox에서도 동일 시나리오를 반복하여 브라우저 간 일관성을 검증한다.
7. 개발자 도구를 열어 Korean 콘솔 로그가 애니메이션 시작과 종료를 포함해 전 과정을 설명하는지 점검한다.
8. OS에서 "Reduce motion" 옵션을 활성화한 뒤 다시 실행해 애니메이션이 생략되고 즉시 제거되는지 확인한다.

## User Story 1 – Watch eliminated players exit clearly (Priority: P1)

### Chrome Validation Scenario

- 참가자 6명의 이름을 입력하고 winner 모드로 시작한다.
- 첫 decisive 라운드에서 선택 공개 후 3초 동안 화면이 고정된 것을 확인한다.
- 3초가 지나면 탈락자 카드에 `is-eliminating` 효과가 적용되어 0.4~1.0초 내에 눈에 띄게 사라지는지 관찰한다.
- 애니메이션 직후 대기자 패널과 참가자 수 카운트가 동시에 갱신되고, 생존자 배치는 유지되는지 확인한다.

### Observation Log

- 2025-10-28 09:35 Firefox: loser 모드, 동시 탈락 3명, 애니메이션 0.6초 추정, 로그 정상
- 2025-10-27 17:01 Chrome: Winner 모드 6명, 애니메이션 0.6초 추정, 로그 이상 없음
- Chrome 실행 일시, 참가자 이름 구성, 애니메이션 지속 시간(타이머 기반 추정)과 Korean 콘솔 로그 메시지를 기록한다.
- 문제가 발생하면 재현 단계와 스크린샷을 첨부하고, `specs/002-animate-elimination/notes.md`에 적는다.

## Reset Instructions

- 애니메이션 도중 새 게임을 시작할 경우 기존 타이머와 애니메이션이 중단되고 초기화 로그가 남는지 확인한다.
- 테스트 전마다 브라우저 캐시를 지울 필요는 없지만, 다른 확장 프로그램이 DOM에 영향을 줄 경우 비활성화한다.

## Reporting

- 실행 결과 요약과 문제점은 `specs/002-animate-elimination/notes.md` (존재 시) 또는 프로젝트 변경 로그에 기록한다.
- 문제가 발견되면 콘솔 로그 타임스탬프와 함께 스크린샷을 첨부하여 재현 단계를 명시한다.

## User Story 2 – Handle multiple eliminations at once (Priority: P2)

### Firefox Multi-Elimination Checklist

- 8명의 참가자를 loser 모드로 입력하고 실행한다.
- 첫 decisive 라운드에서 세 명 이상이 동시에 탈락하도록 재시도한다.
- 탈락자 카드가 동일한 타이밍으로 `is-eliminating` 애니메이션을 실행하는지 확인한다.
- 애니메이션이 끝난 직후 대기자 패널과 카운트가 한 번만 갱신되는지 관찰한다.

### Observation Log

- Firefox 실행 일시, 참가자 구성, 탈락자 수, 애니메이션 지속 시간, 콘솔 로그 메시지를 기록한다.
- 문제가 발생하면 재현 단계와 스크린샷을 첨부하고, `specs/002-animate-elimination/notes.md`에 적는다.

## User Story 3 – Preserve flow when no one leaves (Priority: P3)

### Stalemate & Reduced-Motion Validation Script

- 참가자 4명을 winner 모드로 입력하고, 무승부가 나올 때까지 재시도한다.
- 무승부 라운드에서 탈락 애니메이션이 발생하지 않고 다음 라운드로 넘어가는지 확인한다.
- 시스템의 \"Reduce motion\" 설정을 활성화한 뒤 다시 실행하여 탈락자가 즉시 제거되는지 확인한다.
- 새 게임을 시작할 때 기존 애니메이션 잔상이 남지 않고 UI가 초기화되는지 검증한다.

### Observation Log

- 2025-10-28 09:55 Chrome: 무승부 후 다음 라운드에서만 애니메이션 발동, reduced motion 설정 시 즉시 제거 확인
- 테스트 실행 일시, 무승부 재현 횟수, reduced motion 설정 여부, 콘솔 로그 메시지를 기록한다.

## Final Regression Summary

- 2025-10-28 10:05 Chrome & Firefox: 전체 시나리오(승자/패자/무승부/모션 최소화) 수동 검증 완료, UI/콘솔 불일치 없음
