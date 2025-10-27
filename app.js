// app.js
// Phase 1 scaffolding: establish namespaces for state, events, and renderers.

const INPUT_LIMITS = {
  min: 2,
  max: 12,
};

const log = (scope, message, payload) => {
  const timestamp = new Date().toLocaleTimeString('ko-KR', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  if (payload !== undefined) {
    console.log(`[${timestamp}] ${scope} - ${message}`, payload);
  } else {
    console.log(`[${timestamp}] ${scope} - ${message}`);
  }
};

const state = {
  game: {
    mode: null,
    activeParticipants: [],
    waitingParticipants: [],
    history: [],
    countdown: {
      remainingMs: 0,
      isRunning: false,
      currentRound: 0,
    },
    finalParticipant: null,
    nameRadius: 0,
  },
  dom: {
    root: null,
    header: null,
    inputSlot: null,
    actionSlot: null,
    arena: null,
    countdownOverlay: null,
    countdownIndicator: null,
    participantRing: null,
    waitingPanel: null,
    historyPanel: null,
    finalPopup: null,
    finalPopupMode: null,
    finalPopupName: null,
    finalPopupClose: null,
  },
};

const GameState = {
  reset() {
    state.game.mode = null;
    state.game.activeParticipants = [];
    state.game.waitingParticipants = [];
    state.game.history = [];
    state.game.countdown = {
      remainingMs: 0,
      isRunning: false,
      currentRound: 0,
    };
    state.game.finalParticipant = null;
  },

  setMode(mode) {
    state.game.mode = mode;
  },

  setActiveParticipants(participants) {
    state.game.activeParticipants = participants;
  },

  setWaitingParticipants(participants) {
    state.game.waitingParticipants = participants;
  },

  pushHistory(round) {
    state.game.history = [round, ...state.game.history];
  },

  setCountdown({ remainingMs, isRunning, currentRound }) {
    state.game.countdown.remainingMs = remainingMs;
    state.game.countdown.isRunning = isRunning;
    state.game.countdown.currentRound = currentRound;
  },

  finalize(participant) {
    state.game.finalParticipant = participant;
    state.game.countdown.isRunning = false;
  },

  setNameRadius(radius) {
    state.game.nameRadius = radius;
  },

  serialize() {
    return structuredClone(state.game);
  },
};

const events = (() => {
  const listeners = new Map();

  return {
    on(eventName, handler) {
      if (!listeners.has(eventName)) {
        listeners.set(eventName, new Set());
      }
      listeners.get(eventName).add(handler);
      return () => listeners.get(eventName)?.delete(handler);
    },
    emit(eventName, payload) {
      const handlers = listeners.get(eventName);
      if (!handlers) return;
      handlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`[이벤트 오류] ${eventName}`, error);
        }
      });
    },
    clear() {
      listeners.clear();
    },
  };
})();

const PubSub = {
  emit(eventName, payload) {
    events.emit(eventName, payload);
  },
  on(eventName, handler) {
    return events.on(eventName, handler);
  },
  clear() {
    events.clear();
  },
};

const HistoryRenderer = {
  reset() {
    if (!state.dom.historyPanel) return;
    state.dom.historyPanel.innerHTML = '<p class="placeholder">라운드 기록이 없습니다.</p>';
  },
  append(round) {
    if (!state.dom.historyPanel || !round) return;
    const panel = state.dom.historyPanel;
    if (panel.firstElementChild?.classList.contains('placeholder')) {
      panel.innerHTML = '';
    }
    const card = HistoryRenderer.createCard(round);
    panel.prepend(card);
    log('히스토리', `라운드 ${round.index ?? '?'} 기록이 추가되었습니다.`);
  },
  createCard(round) {
    const card = document.createElement('article');
    const mode = round.mode || state.game.mode || 'winner';
    card.className = `history-card history-card--${mode === 'winner' ? 'winner' : 'loser'}`;

    const header = document.createElement('div');
    header.className = 'history-card__header';

    const numPlayers = round.choices.length;
    const prob = ProbabilityCalculator.calculate({
      numPlayers: numPlayers,
      winners: (round.winners ?? []).length,
      losers: (round.losers ?? []).length,
    });
    const probPercent = (prob * 100).toFixed(1);

    header.innerHTML = `<span>라운드 ${round.index ?? '?'}</span><span class="probability">${probPercent}%</span>`;

    const body = document.createElement('div');
    body.className = 'history-card__body';

    const isStalemate = (round.winners ?? []).length === 0 && (round.losers ?? []).length === 0;
    const eliminatedIds = new Set(mode === 'winner' ? round.losers : round.winners);

    (round.choices ?? []).forEach((choice) => {
      const row = document.createElement('div');
      row.className = 'history-card__row';
      const name = HistoryRenderer.lookupName(choice.participantId);
      const isEliminated = eliminatedIds.has(choice.participantId);

      let nameHtml;
      if (isStalemate) {
        nameHtml = `😐 ${name}`;
      } else if (mode === 'winner') {
        nameHtml = isEliminated ? `💀 ${name}` : `😊 ${name}`;
      } else { // loser mode
        nameHtml = isEliminated ? `😊 ${name}` : `💀 ${name}`;
      }

      row.innerHTML = `<span>${nameHtml}</span><span>${choice.emoji ?? '?'}</span>`;
      body.appendChild(row);
    });

    card.appendChild(header);
    card.appendChild(body);
    return card;
  },
  lookupName(participantId) {
    const pools = [state.game.activeParticipants, state.game.waitingParticipants];
    for (const pool of pools) {
      const match = pool.find((participant) => participant.id === participantId);
      if (match) return match.name;
    }
    return participantId;
  },
};

let lastCountdownDisplay = null;

const render = {
  cacheDom() {
    state.dom.root = document.getElementById('app');
    state.dom.header = document.getElementById('control-bar');
    state.dom.inputSlot = document.querySelector('.control-slot[data-slot="input"]');
    state.dom.actionSlot = document.querySelector('.control-slot[data-slot="actions"]');
    state.dom.arena = document.querySelector('.arena');
    state.dom.countdownIndicator = document.getElementById('countdown-indicator');
    state.dom.participantRing = document.getElementById('participant-ring');
    state.dom.choiceRing = document.getElementById('choice-ring');
    state.dom.waitingPanel = document.querySelector('.panel-content[data-panel="waiting"]');
    state.dom.historyPanel = document.querySelector('.panel-content[data-panel="history"]');
    state.dom.finalPopup = document.getElementById('final-popup');
    state.dom.finalPopupMode = document.querySelector('.final-popup__mode');
    state.dom.finalPopupName = document.querySelector('.final-popup__name');
    state.dom.finalPopupClose = document.getElementById('final-popup-close');
    if (state.dom.finalPopupClose) {
      state.dom.finalPopupClose.addEventListener('click', render.hideFinalPopup);
    }
  },
  initPlaceholders() {
    if (!state.dom.waitingPanel) return;
    state.dom.waitingPanel.innerHTML = '<p class="placeholder">대기자가 없습니다.</p>';
    HistoryRenderer.reset();
  },
  refreshParticipants(participants = state.game.activeParticipants) {
    if (!state.dom.participantRing) return;
    state.dom.participantRing.innerHTML = '';
    if (state.dom.choiceRing) state.dom.choiceRing.innerHTML = '';

    const container = state.dom.participantRing;

    const active = participants.length ? participants : state.game.activeParticipants;
    if (!active.length) {
      container.innerHTML = '<p class="placeholder">참가자를 입력해 주세요.</p>';
      return;
    }

    const arenaRect = state.dom.arena?.getBoundingClientRect();
    const arenaDiameter = arenaRect ? Math.min(arenaRect.width, arenaRect.height) : 360;
    const baseRadius = arenaDiameter / 2 - 25;
    const densityOffset = active.length <= 4 ? 20 : active.length <= 8 ? 10 : 0;
    const computedRadius = Math.max(
      80,
      baseRadius - densityOffset - (window.innerWidth < 768 ? 20 : 0)
    );
    GameState.setNameRadius(computedRadius);

    active.forEach((participant, index) => {
      const angle = (360 / active.length) * index;
      const node = document.createElement('div');
      node.className = 'participant-node';
      node.style.setProperty('--angle', `${angle}deg`);
      node.style.setProperty('--radius-px', `${computedRadius}px`);
      node.dataset.participantId = participant.id;
      node.innerHTML = `<span class="participant-name">${participant.name}</span>`;

      container.appendChild(node);
      requestAnimationFrame(() => node.classList.add('is-visible'));
    });
  },
  updateCountdown(value) {
    if (!state.dom.countdownIndicator) return;

    if (value == null || value === '') {
      state.dom.countdownIndicator.classList.remove('is-visible');
      if (lastCountdownDisplay !== '') {
        log('카운트다운 UI', '중앙 숫자 숨김 처리');
        lastCountdownDisplay = '';
      }
      return;
    }

    state.dom.countdownIndicator.textContent = value;
    state.dom.countdownIndicator.classList.add('is-visible');
    if (lastCountdownDisplay !== value) {
      log('카운트다운 UI', `중앙 숫자 표시: ${value}`);
      lastCountdownDisplay = value;
    }
  },

  updateCountdownIndicator(value) {
    if (!state.dom.countdownIndicator) return;
    state.dom.countdownIndicator.textContent = value;
  },

  showCountdown({ roundIndex, durationMs }) {
    log(
      '카운트다운 UI',
      `라운드 ${roundIndex + 1} (기간 ${Math.ceil((durationMs ?? 0) / 1000)}초) 표시`
    );
    render.updateCountdown(Math.ceil((durationMs ?? 0) / 1000));
  },
  hideCountdown() {
    render.updateCountdown('');
  },
  showFinalPopup({ participantName, mode }) {
    if (!state.dom.finalPopup) return;
    state.dom.finalPopupMode.textContent =
      mode === 'winner' ? '최종 승자' : '최종 패자';
    state.dom.finalPopupName.textContent = participantName ?? '-';
    state.dom.finalPopup.hidden = false;
    const previouslyFocused = document.activeElement;
    state.dom.finalPopup.dataset.previousFocus =
      previouslyFocused && previouslyFocused !== document.body
        ? previouslyFocused.id || previouslyFocused.className || 'focus'
        : '';
    if (state.dom.finalPopupClose) {
      state.dom.finalPopupClose.focus();
    }
    state.dom.finalPopup.addEventListener('keydown', render.handleDialogKeydown);
    state.dom.finalPopup.addEventListener('click', render.handleDialogBackdrop);
  },
  hideFinalPopup() {
    if (!state.dom.finalPopup) return;
    state.dom.finalPopup.removeEventListener(
      'keydown',
      render.handleDialogKeydown
    );
    state.dom.finalPopup.removeEventListener(
      'click',
      render.handleDialogBackdrop
    );
    state.dom.finalPopup.hidden = true;
    const focusTargetSelector = state.dom.finalPopup.dataset.previousFocus;
    if (focusTargetSelector) {
      const candidate = document.getElementById(focusTargetSelector);
      if (candidate) candidate.focus();
    } else if (state.dom.inputSlot) {
      const input = state.dom.inputSlot.querySelector('input');
      input?.focus();
    }
  },
  handleDialogKeydown(event) {
    if (event.key === 'Escape') {
      render.hideFinalPopup();
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      state.dom.finalPopupClose?.focus();
    }
  },
  handleDialogBackdrop(event) {
    if (event.target === state.dom.finalPopup) {
      render.hideFinalPopup();
    }
  },
  reset() {
    render.updateCountdown('');
    render.initPlaceholders();
    if (state.dom.participantRing) {
      state.dom.participantRing.innerHTML = '';
    }
    if (state.dom.choiceRing) {
      state.dom.choiceRing.innerHTML = '';
    }
    render.updateCountdownIndicator('0');
    HistoryRenderer.reset();
    render.hideFinalPopup();
  },
};

PubSub.on('countdown:start', (payload) => render.showCountdown(payload ?? {}));
PubSub.on('countdown:tick', (payload) => {
  if (!payload) return;
  render.updateCountdown(Math.ceil((payload.remainingMs ?? 0) / 1000));
});
PubSub.on('countdown:complete', () => render.hideCountdown());

const InputParser = {
  sanitize(rawName = '') {
    return rawName.replace(/\s+/g, ' ').trim();
  },
  dedupe(names) {
    const seen = new Set();
    const unique = [];
    names.forEach((name) => {
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        unique.push(name);
      }
    });
    return unique;
  },
  createParticipant(name, index) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'player';
    return {
      id: `participant-${index + 1}-${slug}`,
      name,
      status: 'active',
      currentChoice: 'none',
      placementAngle: 0,
    };
  },
  parse(rawInput = '') {
    const names = rawInput
      .split(',')
      .map((token) => InputParser.sanitize(token))
      .filter(Boolean);

    const unique = InputParser.dedupe(names);
    const limited = unique.slice(0, INPUT_LIMITS.max);
    const participants = limited.map((name, index) =>
      InputParser.createParticipant(name, index)
    );

    const warnings = [];
    if (unique.length > INPUT_LIMITS.max) {
      warnings.push(`참가자는 최대 ${INPUT_LIMITS.max}명까지 입력할 수 있습니다.`);
    }
    if (participants.length < INPUT_LIMITS.min) {
      warnings.push(`게임을 시작하려면 최소 ${INPUT_LIMITS.min}명이 필요합니다.`);
    }

    return {
      participants,
      count: participants.length,
      isCountValid:
        participants.length >= INPUT_LIMITS.min &&
        participants.length <= INPUT_LIMITS.max,
      warnings,
    };
  },
};

const Controls = (() => {
  const refs = {
    input: null,
    winnerBtn: null,
    loserBtn: null,
  };

  const stateCache = {
    parsed: InputParser.parse(''),
  };
  let lastButtonsEnabled = false;

  const handleInput = () => {
    if (!refs.input) return;
    stateCache.parsed = InputParser.parse(refs.input.value);
    GameState.setActiveParticipants(stateCache.parsed.participants);
    Controls.updateButtons(stateCache.parsed.isCountValid);
    render.refreshParticipants(stateCache.parsed.participants);
    log('참가자', `현재 ${stateCache.parsed.count}명 입력됨`);
    PubSub.emit('participants:update', { ...stateCache.parsed });
  };

const handleStart = (mode) => {
    if (!refs.input) return;
    const { participants, isCountValid, warnings } = InputParser.parse(refs.input.value);
    if (!isCountValid) {
      const message =
        warnings.length > 0
          ? warnings.join(' ')
          : '유효한 참가자 수를 입력해 주세요.';
      log('시작 불가', message);
      return;
    }
    GameState.reset();
    GameState.setMode(mode);
    GameState.setActiveParticipants(participants);
    Controls.lock();
    log('게임 시작', `${mode === 'winner' ? '승자' : '패자'} 모드로 시작합니다.`);
    CountdownOverlayController.showIntro();
    PubSub.emit('game:start', {
      mode,
      participants: GameState.serialize().activeParticipants,
    });
  };

  const Controls = {
    attach() {
      refs.input = document.getElementById('participants-input');
      refs.winnerBtn = document.getElementById('start-winner');
      refs.loserBtn = document.getElementById('start-loser');

      if (refs.input) {
        refs.input.addEventListener('input', handleInput);
      }
      if (refs.winnerBtn) {
        refs.winnerBtn.addEventListener('click', () => handleStart('winner'));
      }
      if (refs.loserBtn) {
        refs.loserBtn.addEventListener('click', () => handleStart('loser'));
      }

      Controls.updateButtons(false);
    },
    updateButtons(isValid) {
      [refs.winnerBtn, refs.loserBtn].forEach((btn) => {
        if (btn) {
          btn.disabled = !isValid;
        }
      });
      if (lastButtonsEnabled !== isValid) {
        log(
          '시작 버튼',
          isValid ? '버튼이 활성화되었습니다.' : '버튼이 비활성화되었습니다.'
        );
        lastButtonsEnabled = isValid;
      }
    },
    lock() {
      if (refs.input) refs.input.disabled = true;
      Controls.updateButtons(false);
      log('입력 잠금', '게임이 진행 중입니다. 입력이 비활성화되었습니다.');
    },
    unlock() {
      if (refs.input) {
        refs.input.disabled = false;
      }
      log('입력 해제', '새로운 참가자를 입력할 수 있습니다.');
      handleInput();
    },
  };

  return Controls;
})();

PubSub.on('game:complete', () => {
  Controls.unlock();
  DwellController.clear();
});
PubSub.on('game:ready', () => Controls.unlock());

const CountdownOverlayController = {
  showIntro() {
    render.updateCountdown('시작!');
    setTimeout(() => {
      if (!state.game.countdown.isRunning) {
        render.updateCountdown('');
      }
    }, 800);
  },
  revealChoices(choices) {
    const container = state.dom.choiceRing;
    if (!container) return;
    container.innerHTML = '';

    const nameRadius = state.game.nameRadius;
    const choiceRadius = nameRadius > 0 ? nameRadius * 0.75 : 80;

    choices.forEach((choice, index) => {
      const angle = (360 / choices.length) * index;
      const wrapper = document.createElement('div');
      wrapper.className = 'choice-node-wrapper';
      wrapper.style.setProperty('--angle', `${angle}deg`);
      wrapper.style.setProperty('--radius-px', `${choiceRadius}px`);

      const innerNode = document.createElement('div');
      innerNode.className = 'choice-node';
      innerNode.dataset.participantId = choice.participantId;
      innerNode.textContent = choice.emoji;

      wrapper.appendChild(innerNode);
      container.appendChild(wrapper);
      requestAnimationFrame(() => innerNode.classList.add('is-visible'));
    });
  },
};

const CountdownController = (() => {
  const TICK_INTERVAL_MS = 250;
  let timerId = null;
  let endTimestamp = 0;
  let currentRoundIndex = 0;

  const durationForRound = (roundIndex = 0) => {
    if (roundIndex < 5) return 5000;
    if (roundIndex < 10) return 4000;
    return 3000;
  };

  const clearTimer = () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  };

  const updateCountdownState = (remainingMs, isRunning) => {
    GameState.setCountdown({
      remainingMs,
      isRunning,
      currentRound: currentRoundIndex,
    });
  };

  const stopInternal = () => {
    clearTimer();
    updateCountdownState(0, false);
  };

  const scheduleTicks = () => {
    const tick = () => {
      const remainingMs = Math.max(0, endTimestamp - Date.now());
      if (remainingMs <= 0) {
        stopInternal();
        PubSub.emit('countdown:complete', { roundIndex: currentRoundIndex });
        return;
      }
      updateCountdownState(remainingMs, true);
      PubSub.emit('countdown:tick', {
        roundIndex: currentRoundIndex,
        remainingMs,
      });
    };

    timerId = window.setInterval(tick, TICK_INTERVAL_MS);
    window.setTimeout(tick, 0);
  };

  return {
    start(roundIndex = 0) {
      stopInternal();
      currentRoundIndex = roundIndex;
      const durationMs = durationForRound(roundIndex);
      endTimestamp = Date.now() + durationMs;
      updateCountdownState(durationMs, true);
      scheduleTicks();
      return durationMs;
    },
    stop: stopInternal,
  };
})();

const WaitingPanelRenderer = {
  reset() {
    if (!state.dom.waitingPanel) return;
    state.dom.waitingPanel.textContent = '대기자: 없음';
  },
  render(list) {
    if (!state.dom.waitingPanel) return;

    if (!list.length) {
      WaitingPanelRenderer.reset();
      return;
    }
    const names = list.map((p) => p.name).join(', ');
    state.dom.waitingPanel.textContent = `대기자: ${names}`;
  },
};

const DwellController = (() => {
  let timerId = null;
  const DWELL_MS = 3000;

  return {
    start(payload) {
      DwellController.clear();
      log('대기 시간', '결과를 3초간 표시합니다.');
      timerId = window.setTimeout(() => {
        timerId = null;
        log('대기 시간', '다음 라운드를 진행합니다.');
        PubSub.emit('round:dwell:complete', payload);
      }, DWELL_MS);
    },
    clear() {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
    },
  };
})();

const applyNextActiveParticipants = (nextActiveIds = [], mode) => {
  const prevActive = state.game.activeParticipants;
  const prevWaiting = state.game.waitingParticipants;
  const pool = new Map([...prevActive, ...prevWaiting].map((participant) => [participant.id, { ...participant }]));

  const newActive = nextActiveIds
    .map((id) => pool.get(id))
    .filter(Boolean)
    .map((participant) => ({ ...participant, status: 'active' }));

  const newActiveSet = new Set(nextActiveIds);
  const newlyWaiting = prevActive
    .filter((participant) => !newActiveSet.has(participant.id))
    .map((participant) => ({ ...participant, status: 'waiting' }));
  const waitingKeep = prevWaiting
    .filter((participant) => !newActiveSet.has(participant.id))
    .map((participant) => ({ ...participant, status: 'waiting' }));
  const waitingList = [...newlyWaiting, ...waitingKeep];

  GameState.setActiveParticipants(newActive);
  GameState.setWaitingParticipants(waitingList);
  render.refreshParticipants(newActive);
  WaitingPanelRenderer.render(waitingList);
  const summary = {
    activeCount: newActive.length,
    waitingCount: waitingList.length,
    mode,
  };
  log('패널 상태', `활성 ${summary.activeCount}명 / 대기 ${summary.waitingCount}명 (${mode})`);
  PubSub.emit('round:panel:update', summary);
};

PubSub.on('game:start', () => {
  HistoryRenderer.reset();
  WaitingPanelRenderer.reset();
  DwellController.clear();
});

PubSub.on('round:complete', (payload) => {
  if (!payload) return;
  const { round, nextActiveIds = [] } = payload;
  if (round) {
    HistoryRenderer.append(round);
  }
  const mode = round?.mode || state.game.mode;
  DwellController.start({ round, nextActiveIds, mode });
});

PubSub.on('countdown:start', (payload) => {
  const roundIndex = (payload?.roundIndex ?? 0) + 1;
  log('카운트다운', `${roundIndex}라운드 ${payload?.durationMs ?? 0}ms 카운트다운 시작`);
});

PubSub.on('countdown:tick', (payload) => {
  if (!payload) return;
  log(
    '카운트다운',
    `${payload.roundIndex + 1}라운드 남은 ${Math.ceil((payload.remainingMs ?? 0) / 1000)}초`
  );
});

PubSub.on('countdown:complete', (payload) => {
  const roundIndex = (payload?.roundIndex ?? 0) + 1;
  log('카운트다운', `${roundIndex}라운드 카운트다운 종료`);
});

PubSub.on('round:choices', (payload) => {
  if (!payload?.choices) return;
  log('선택 공개', `${payload.choices.length}명의 선택이 공개되었습니다.`);
  CountdownOverlayController.revealChoices(payload.choices);
});

PubSub.on('round:panel:update', (payload) => {
  log('패널 업데이트', `활성 ${payload?.activeCount ?? 0} / 대기 ${payload?.waitingCount ?? 0}`);
});

const moves = ['rock', 'paper', 'scissors'];

const MoveGenerator = {
  randomChoice() {
    const index = Math.floor(Math.random() * moves.length);
    return moves[index];
  },
  assignChoices(participants) {
    return participants.map((participant) => ({
      participantId: participant.id,
      emoji: MoveGenerator.choiceToEmoji(MoveGenerator.randomChoice()),
      resultTag: 'pending',
    }));
  },
  determineOutcome(choices) {
    const emojiToMove = {
      '✌️': 'scissors',
      '✊': 'rock',
      '🖐️': 'paper',
    };
    const moveCounts = new Map();
    choices.forEach((choice) => {
      const move = emojiToMove[choice.emoji];
      moveCounts.set(move, (moveCounts.get(move) || 0) + 1);
    });
    if (moveCounts.size !== 2) {
      return { result: 'stalemate', winners: [], losers: [] };
    }
    const [moveA, moveB] = [...moveCounts.keys()];
    const beats = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper',
    };
    let winningMove;
    if (beats[moveA] === moveB) winningMove = moveA;
    if (beats[moveB] === moveA) winningMove = moveB;
    const winnerIds = choices
      .filter((choice) => emojiToMove[choice.emoji] === winningMove)
      .map((choice) => choice.participantId);
    const loserIds = choices
      .filter((choice) => !winnerIds.includes(choice.participantId))
      .map((choice) => choice.participantId);
    return { result: 'resolved', winners: winnerIds, losers: loserIds };
  },
  choiceToEmoji(move) {
    switch (move) {
      case 'rock':
        return '✊';
      case 'paper':
        return '🖐️';
      default:
        return '✌️';
    }
  },
};

const ProbabilityCalculator = (() => {
  const factMemo = [1];
  const factorial = (num) => {
    if (factMemo[num] !== undefined) return factMemo[num];
    let result = factMemo[factMemo.length - 1];
    for (let i = factMemo.length; i <= num; i++) {
      result *= i;
      factMemo[i] = result;
    }
    return result;
  };

  const combinations = (n, k) => {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k;
    return factorial(n) / (factorial(k) * factorial(n - k));
  };

  const power = (base, exp) => Math.pow(base, exp);

  return {
    calculate({ numPlayers, winners, losers }) {
      const n = numPlayers;
      if (n <= 1) return 0;

      const totalOutcomes = power(3, n);
      const isStalemate = winners === 0 && losers === 0;

      if (isStalemate) {
        // All players choose the same (3 ways) OR all 3 moves are present
        const all3Moves = power(3, n) - 3 * power(2, n) + 3;
        const favorableOutcomes = 3 + all3Moves;
        return favorableOutcomes / totalOutcomes;
      } else {
        // A decisive outcome where only 2 moves are present
        const k = winners > 0 ? winners : losers;
        const favorableOutcomes = 3 * combinations(n, k);
        return favorableOutcomes / totalOutcomes;
      }
    },
  };
})();

const bootstrap = () => {
  render.cacheDom();
  render.reset();
  WaitingPanelRenderer.reset();
  Controls.attach();
  PubSub.emit('app:ready', { timestamp: Date.now() });
};

document.addEventListener('DOMContentLoaded', bootstrap);

export {
  state,
  events,
  render,
  PubSub,
  GameState,
  InputParser,
  INPUT_LIMITS,
  MoveGenerator,
  Controls,
  CountdownOverlayController,
  CountdownController,
  HistoryRenderer,
  WaitingPanelRenderer,
  DwellController,
};
const SimulationEngine = (() => {
  const state = {
    dwellPayload: null,
  };

  const runRound = (roundIndex) => {
    const participants = GameState.serialize().activeParticipants;
    if (participants.length <= 1) {
      SimulationEngine.finish(participants[0]);
      return;
    }

    const duration = CountdownController.start(roundIndex);
    PubSub.emit('countdown:start', {
      roundIndex,
      durationMs: duration,
    });
  };

  const handleCountdownComplete = ({ roundIndex }) => {
    const participants = GameState.serialize().activeParticipants;
    const choices = MoveGenerator.assignChoices(participants);
    PubSub.emit('round:choices', { choices });

    const outcome = MoveGenerator.determineOutcome(choices);
    const mode = GameState.serialize().mode;

    let roundData;
    let nextActiveIds;
    const nextRoundIndex = roundIndex + 1;

    if (outcome.result === 'stalemate') {
      log('라운드', '무승부가 발생했습니다. 3초 후 재도전합니다.');
      roundData = {
        index: roundIndex + 1,
        mode,
        choices,
        winners: [],
        losers: [],
      };
      nextActiveIds = participants.map((p) => p.id);
    } else {
      roundData = {
        index: roundIndex + 1,
        mode,
        choices,
        winners: outcome.winners,
        losers: outcome.losers,
      };
      nextActiveIds =
        mode === 'winner' ? outcome.winners : outcome.losers;
    }

    PubSub.emit('round:complete', {
      round: roundData,
      nextActiveIds,
    });
    state.dwellPayload = { nextRoundIndex };
  };

  const handleDwellComplete = () => {
    const activeCount = GameState.serialize().activeParticipants.length;
    if (activeCount <= 1) {
      SimulationEngine.finish(GameState.serialize().activeParticipants[0]);
      return;
    }
    runRound(state.dwellPayload?.nextRoundIndex ?? 0);
  };

  return {
    start() {
      runRound(0);
    },
    finish(participant) {
      CountdownController.stop();
      DwellController.clear();
      render.showFinalPopup({
        participantName: participant?.name ?? '알 수 없음',
        mode: GameState.serialize().mode,
      });
      log(
        '게임 종료',
        `${GameState.serialize().mode === 'winner' ? '최종 승자' : '최종 패자'}: ${
          participant?.name ?? '알 수 없음'
        }`
      );
      Controls.unlock();
    },
    handleCountdownComplete,
    handleDwellComplete,
  };
})();

PubSub.on('game:start', () => SimulationEngine.start());
PubSub.on('countdown:complete', (payload) =>
  SimulationEngine.handleCountdownComplete(payload ?? {})
);
PubSub.on('round:dwell:complete', (payload) => {
  if (payload) {
    applyNextActiveParticipants(payload.nextActiveIds, payload.mode);
  }
  SimulationEngine.handleDwellComplete();
});
