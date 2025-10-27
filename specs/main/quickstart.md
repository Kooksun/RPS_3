## Quickstart: Responsive RPS Simulation UI

### Prerequisites
- Modern desktop browser (Chrome 124+, Firefox 126+)
- Static file access (double-click `index.html` or use `python3 -m http.server` if needed)

### Run the Simulation
1. Open `index.html` in Chrome.
2. Enter 2–12 participant names separated by commas (e.g., `철수, 영희, 민수`).
3. Observe the radial layout updating immediately; verify start buttons enable only with valid counts.
4. Click either `승자 뽑기` or `패자 뽑기` to begin automatic rounds.

### Baseline Manual Validation Steps
- Open DevTools console (Korean locale preferred) before interacting.
- Capture initial state: empty waiting/history panels, disabled start buttons.
- Enter sample names (`철수,영희,민수`) and confirm immediate participant updates plus console log entry.
- Start one simulation round in 승자 모드 and one in 패자 모드, observing countdown and emoji placeholders.
- Resize the browser window to ~1024px width and ensure layout containers remain visible without horizontal scroll.

### Manual Validation Checklist
- **Korean Console Logs**: With DevTools open, confirm logs for initialization, each countdown start/end, choice assignment, panel updates, and final popup.
- **Countdown Timing**: Ensure rounds 1–5 show 5-second countdown, 6–10 show 4 seconds, and subsequent rounds show 3 seconds using visible timer.
- **Radial Layout & Animations**: Participants stay evenly spaced around the circle (verify count increments/decrements as names are typed), choices animate larger than names, and layout adapts when resizing window between 768–1440px width.
- **Waiting & History Panels**: Eliminated players appear in the comma-separated waiting list at the bottom of the arena. The history panel on the right scrolls vertically when its content overflows. Each card header displays the round number and the outcome's probability.
- **Stalemate Handling**: When no eliminations occur, confirm a history card for the stalemate is created, and the next round starts after a 3-second delay.
- **Final Popup**: Once a single participant remains, popup prominently displays final winner/loser and simulation halts.

### Cross-Browser Pass
Repeat the run in Firefox:
- Re-run the entire flow in the latest Firefox build with DevTools console open.
- Confirm countdown timing matches Chrome and that Korean logs list identical events (init, countdown, choices, panel updates, completion).
- Note any rendering or timing deltas in the Firefox notes table below.

| Browser | Countdown Timing | Console Log Sample | Layout Notes |
|---------|------------------|--------------------|--------------|
| Chrome 124+ | ✅ 5s/4s/3s tiers match spec | See `/specs/main/reference/logs-us2.txt` (승자/패자 예시) | No deviations |
| Firefox 126+ | ✅ Matches Chrome; add note if throttled | Document any console differences in quickstart.md under Cross-Browser Pass | Verify radial layout still centered and text legible |
