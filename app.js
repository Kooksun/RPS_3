// app.js
// Phase 1 scaffolding: establish namespaces for state, events, and renderers.

const INPUT_LIMITS = {
  min: 2,
  max: 12,
};

const MODE_METADATA = Object.freeze({
  winner: {
    id: 'winner',
    label: '승자 뽑기',
    targetSurvivors: 1,
    exclusionRule: 'drop-losers',
  },
  loser: {
    id: 'loser',
    label: '패자 뽑기',
    targetSurvivors: 1,
    exclusionRule: 'drop-winners',
  },
  'winner-dual': {
    id: 'winner-dual',
    label: '승자 2명 뽑기',
    targetSurvivors: 2,
    exclusionRule: 'drop-losers',
  },
  'loser-dual': {
    id: 'loser-dual',
    label: '패자 2명 뽑기',
    targetSurvivors: 2,
    exclusionRule: 'drop-winners',
  },
});

const getModeMetadata = (modeKey) => MODE_METADATA[modeKey] ?? MODE_METADATA.winner;
const resolveBaseMode = (modeId) =>
  String(modeId ?? 'winner').startsWith('loser') ? 'loser' : 'winner';

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
    modeLabel: '',
    modeConfig: MODE_METADATA.winner,
    activeParticipants: [],
    waitingParticipants: [],
    history: [],
    countdown: {
      remainingMs: 0,
      isRunning: false,
      currentRound: 0,
    },
    targetSurvivors: MODE_METADATA.winner.targetSurvivors,
    exclusionRule: MODE_METADATA.winner.exclusionRule,
    pendingSuddenDeath: null,
    nameRadius: 0,
    finalParticipants: [],
    suddenDeath: {
      status: 'idle',
      lockedFinalistIds: [],
      noticeRoundIndex: null,
      pendingParticipantIds: [],
    },
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
    suddenDeathNotice: null,
    suddenDeathNoticeTitle: null,
    suddenDeathNoticeMessage: null,
    suddenDeathNoticeCard: null,
    suddenDeathNoticePrevFocus: null,
  },
};

const GameState = {
  reset() {
    state.game.mode = null;
    state.game.modeLabel = '';
    state.game.modeConfig = MODE_METADATA.winner;
    state.game.activeParticipants = [];
    state.game.waitingParticipants = [];
    state.game.history = [];
    state.game.countdown = {
      remainingMs: 0,
      isRunning: false,
      currentRound: 0,
    };
    state.game.targetSurvivors = MODE_METADATA.winner.targetSurvivors;
    state.game.exclusionRule = MODE_METADATA.winner.exclusionRule;
    state.game.pendingSuddenDeath = null;
    state.game.finalParticipants = [];
    state.game.suddenDeath = {
      status: 'idle',
      lockedFinalistIds: [],
      noticeRoundIndex: null,
      pendingParticipantIds: [],
    };
  },

  setMode(mode) {
    const metadata = getModeMetadata(mode);
    state.game.mode = metadata.id;
    state.game.modeLabel = metadata.label;
    state.game.modeConfig = metadata;
    state.game.targetSurvivors = metadata.targetSurvivors;
    state.game.exclusionRule = metadata.exclusionRule;
    state.game.pendingSuddenDeath = null;
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

  finalize(participants) {
    const normalized = Array.isArray(participants)
      ? participants.filter(Boolean)
      : participants
      ? [participants]
      : [];
    state.game.finalParticipants = normalized;
    state.game.countdown.isRunning = false;
    state.game.pendingSuddenDeath = null;
    state.game.suddenDeath.status = 'idle';
    state.game.suddenDeath.lockedFinalistIds = normalized
      .map((participant) => participant?.id)
      .filter(Boolean);
    state.game.suddenDeath.pendingParticipantIds = [];
    state.game.suddenDeath.noticeRoundIndex = null;
  },

  setNameRadius(radius) {
    state.game.nameRadius = radius;
  },

  setPendingSuddenDeath(participantIds) {
    if (Array.isArray(participantIds) && participantIds.length) {
      const unique = [...new Set(participantIds)];
      state.game.pendingSuddenDeath = unique;
      state.game.suddenDeath.pendingParticipantIds = unique;
    } else {
      state.game.pendingSuddenDeath = null;
      state.game.suddenDeath.pendingParticipantIds = [];
    }
  },

  setSuddenDeathStatus(status = 'idle') {
    state.game.suddenDeath.status = status;
  },

  getSuddenDeathStatus() {
    return state.game.suddenDeath.status ?? 'idle';
  },

  setSuddenDeathLocked(ids = []) {
    const normalized = Array.isArray(ids)
      ? ids.filter(Boolean)
      : ids
      ? [ids]
      : [];
    state.game.suddenDeath.lockedFinalistIds = [...new Set(normalized)];
  },

  addSuddenDeathLocked(ids = []) {
    const bucket = new Set(state.game.suddenDeath.lockedFinalistIds);
    if (Array.isArray(ids)) {
      ids.filter(Boolean).forEach((id) => bucket.add(id));
    } else if (ids) {
      bucket.add(ids);
    }
    state.game.suddenDeath.lockedFinalistIds = [...bucket];
  },

  getSuddenDeathLocked() {
    return [...state.game.suddenDeath.lockedFinalistIds];
  },

  setSuddenDeathNoticeRound(index = null) {
    state.game.suddenDeath.noticeRoundIndex = Number.isFinite(index) ? index : null;
  },

  getSuddenDeathNoticeRound() {
    return state.game.suddenDeath.noticeRoundIndex;
  },

  resolveParticipantsByIds(ids = []) {
    const pools = [...state.game.activeParticipants, ...state.game.waitingParticipants];
    const registry = new Map(pools.map((participant) => [participant.id, participant]));
    return ids
      .map((id) => registry.get(id))
      .filter(Boolean);
  },

  getPendingSuddenDeathParticipants() {
    return [...(state.game.suddenDeath.pendingParticipantIds ?? [])];
  },

  getFinalParticipants() {
    return [...state.game.finalParticipants];
  },

  getPendingSuddenDeath() {
    return state.game.pendingSuddenDeath;
  },

  getModeConfig() {
    return state.game.modeConfig ?? MODE_METADATA.winner;
  },

  getTargetSurvivors() {
    return state.game.targetSurvivors ?? MODE_METADATA.winner.targetSurvivors;
  },

  serialize() {
    return structuredClone(state.game);
  },
};

const SurvivorEvaluator = {
  evaluate({ participants = [], outcome, metadata }) {
    const participantIds = participants.map((participant) => participant.id);
    if (!outcome || outcome.result === 'stalemate') {
      return {
        survivorIds: participantIds,
        eliminatedIds: [],
        isStalemate: true,
      };
    }

    const dropWinners = metadata?.exclusionRule === 'drop-winners';
    const rawSurvivors = dropWinners ? outcome.losers : outcome.winners;
    const rawEliminated = dropWinners ? outcome.winners : outcome.losers;

    const survivorIds =
      Array.isArray(rawSurvivors) && rawSurvivors.length
        ? [...new Set(rawSurvivors)]
        : participantIds;
    const eliminatedIds =
      Array.isArray(rawEliminated) && rawEliminated.length
        ? [...new Set(rawEliminated)]
        : [];

    return {
      survivorIds,
      eliminatedIds,
      isStalemate: false,
    };
  },

  buildParticipantPools({ survivorIds = [], previousActive = [], previousWaiting = [] }) {
    const pool = new Map(
      [...previousActive, ...previousWaiting].map((participant) => [participant.id, { ...participant }])
    );

    const survivors = survivorIds
      .map((id) => pool.get(id))
      .filter(Boolean)
      .map((participant) => ({ ...participant, status: 'active' }));

    const survivorSet = new Set(survivors.map((participant) => participant.id));
    const newlyWaiting = previousActive
      .filter((participant) => !survivorSet.has(participant.id))
      .map((participant) => ({ ...participant, status: 'waiting' }));
    const retainedWaiting = previousWaiting
      .filter((participant) => !survivorSet.has(participant.id))
      .map((participant) => ({ ...participant, status: 'waiting' }));

    return {
      survivors,
      waiting: [...newlyWaiting, ...retainedWaiting],
    };
  },
};

const SuddenDeathCoordinator = (() => {
  const state = {
    status: 'idle', // idle | notifying | active
    lockedFinalistIds: [],
    pendingParticipantIds: [],
  };

  const markIdle = () => {
    state.status = 'idle';
    state.pendingParticipantIds = [];
    GameState.setSuddenDeathStatus('idle');
    GameState.setSuddenDeathNoticeRound(null);
    GameState.setPendingSuddenDeath(null);
    if (typeof render?.disableSuddenDeathTheme === 'function') {
      render.disableSuddenDeathTheme();
    }
  };

  const reset = () => {
    state.status = 'idle';
    state.lockedFinalistIds = [];
    state.pendingParticipantIds = [];
    GameState.setSuddenDeathLocked([]);
    GameState.setSuddenDeathStatus('idle');
    GameState.setSuddenDeathNoticeRound(null);
    GameState.setPendingSuddenDeath(null);
    if (typeof render?.disableSuddenDeathTheme === 'function') {
      render.disableSuddenDeathTheme();
    }
  };

  const ensureLockedUpdated = () => {
    GameState.setSuddenDeathLocked(state.lockedFinalistIds);
  };

  const schedule = ({
    survivors = [],
    eliminatedIds = [],
    metadata,
    isStalemate = false,
    roundIndex,
  }) => {
    const config = metadata ?? GameState.getModeConfig();
    const target = config?.targetSurvivors ?? 1;
    const result = {
      scheduled: false,
      notice: false,
      nextActiveIds: Array.isArray(survivors) ? [...survivors] : [],
      finalize: false,
      finalIds: [],
      lockedIds: [...state.lockedFinalistIds],
    };

    if (target <= 1) {
      markIdle();
      return result;
    }

    const uniqueSurvivors = Array.isArray(survivors) ? [...new Set(survivors)] : [];
    const uniqueEliminated = Array.isArray(eliminatedIds) ? [...new Set(eliminatedIds)] : [];

    if (isStalemate) {
      const configLabel = metadata?.label ?? '듀얼 모드';
      const normalized = uniqueSurvivors.length ? [...uniqueSurvivors] : GameState.getPendingSuddenDeathParticipants();
      if (state.lockedFinalistIds.length && normalized.length) {
        state.pendingParticipantIds = [...normalized];
        GameState.setPendingSuddenDeath(normalized);
        const enteringSuddenDeath = state.status === 'idle';
        state.status = enteringSuddenDeath ? 'notifying' : 'active';
        GameState.setSuddenDeathStatus(state.status);
        GameState.setSuddenDeathNoticeRound(enteringSuddenDeath ? roundIndex : null);
        ensureLockedUpdated();
        result.scheduled = true;
        result.notice = enteringSuddenDeath;
        result.nextActiveIds = [...normalized];
        result.lockedIds = [...state.lockedFinalistIds];
        log(
          enteringSuddenDeath ? '서든데스 안내' : '서든데스 진행',
          `${configLabel} - 서든데스 무승부, 동일 후보로 재경기합니다.`
        );
        return result;
      }
      markIdle();
      return result;
    }

    const remainingSlots = Math.max(target - state.lockedFinalistIds.length, 0);

    if (remainingSlots <= 0) {
      result.finalize = true;
      result.finalIds = [...state.lockedFinalistIds];
      markIdle();
      return result;
    }

    if (!uniqueSurvivors.length) {
      GameState.setPendingSuddenDeath(null);
      state.pendingParticipantIds = [];
      GameState.setSuddenDeathStatus('idle');
      GameState.setSuddenDeathNoticeRound(null);
      return result;
    }

    if (uniqueSurvivors.length === remainingSlots) {
      const finalIds = [...new Set([...state.lockedFinalistIds, ...uniqueSurvivors])];
      state.lockedFinalistIds = finalIds;
      ensureLockedUpdated();
      result.finalize = true;
      result.finalIds = finalIds;
      markIdle();
      return result;
    }

    if (uniqueSurvivors.length > remainingSlots) {
      const targetLabel = config?.label ?? '듀얼 모드';
      if (!state.lockedFinalistIds.length) {
        GameState.setPendingSuddenDeath(null);
        state.pendingParticipantIds = [];
        GameState.setSuddenDeathStatus('idle');
        GameState.setSuddenDeathNoticeRound(null);
        log(
          '라운드 상태',
          `${targetLabel} - 생존자 ${uniqueSurvivors.length}명, 서든데스 없이 다음 라운드를 진행합니다.`
        );
        return result;
      }

      state.pendingParticipantIds = [...uniqueSurvivors];
      GameState.setPendingSuddenDeath(uniqueSurvivors);
      const enteringSuddenDeath = state.status === 'idle';
      state.status = enteringSuddenDeath ? 'notifying' : 'active';
      GameState.setSuddenDeathStatus(state.status);
      GameState.setSuddenDeathNoticeRound(enteringSuddenDeath ? roundIndex : null);
      result.scheduled = true;
      result.notice = enteringSuddenDeath;
      result.nextActiveIds = [...uniqueSurvivors];
      result.lockedIds = [...state.lockedFinalistIds];
      log(
        enteringSuddenDeath ? '서든데스 안내' : '서든데스 진행',
        `${targetLabel} - 라운드 ${roundIndex} 종료, 후보 ${uniqueSurvivors.length}명 · 목표 ${target}명`
      );
      return result;
    }

    // uniqueSurvivors.length < remainingSlots
    state.lockedFinalistIds = [...new Set([...state.lockedFinalistIds, ...uniqueSurvivors])];
    ensureLockedUpdated();
    const updatedRemaining = Math.max(target - state.lockedFinalistIds.length, 0);

    if (updatedRemaining <= 0) {
      result.finalize = true;
      result.finalIds = [...state.lockedFinalistIds];
      markIdle();
      return result;
    }

    const candidatePool = [...uniqueEliminated];
    state.pendingParticipantIds = candidatePool;
    GameState.setPendingSuddenDeath(candidatePool);
    const candidateCount = candidatePool.length;
    const enteringSuddenDeath = state.status === 'idle';
    state.status = enteringSuddenDeath ? 'notifying' : 'active';
    GameState.setSuddenDeathStatus(state.status);
    GameState.setSuddenDeathNoticeRound(enteringSuddenDeath ? roundIndex : null);
    result.scheduled = candidateCount > 0;
    result.notice = enteringSuddenDeath;
    result.nextActiveIds = candidatePool;
    result.lockedIds = [...state.lockedFinalistIds];
    const label = config?.label ?? '듀얼 모드';
    log(
      enteringSuddenDeath ? '서든데스 안내' : '서든데스 진행',
      `${label} - 라운드 ${roundIndex}에서 ${state.lockedFinalistIds.length}명 확정, 남은 ${updatedRemaining}명을 찾습니다.`
    );
    if (!candidateCount) {
      log('서든데스 경고', '계속 진행할 후보가 없어 즉시 종료 상태로 전환합니다.');
      result.finalize = true;
      result.finalIds = [...state.lockedFinalistIds];
      markIdle();
    }
    return result;
  };

  const markNoticeComplete = () => {
    if (state.status === 'notifying') {
      state.status = 'active';
      GameState.setSuddenDeathStatus('active');
      GameState.setSuddenDeathNoticeRound(null);
    }
  };

  const shouldContinue = () => {
    if (!state.pendingParticipantIds.length) return false;
    if (state.status === 'notifying') return false;
    const snapshot = GameState.serialize();
    const target = snapshot.targetSurvivors ?? 1;
    if (target <= 1) return false;
    const activeCount = snapshot.activeParticipants.length;
    return activeCount >= 2;
  };

  const complete = () => {
    reset();
  };

  const getLockedFinalists = () => [...state.lockedFinalistIds];

  return {
    schedule,
    markNoticeComplete,
    shouldContinue,
    reset,
    complete,
    getLockedFinalists,
  };
})();

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
    const modeId = round.mode || state.game.mode || 'winner';
    const baseMode = resolveBaseMode(modeId);
    card.className = `history-card history-card--${baseMode === 'winner' ? 'winner' : 'loser'}`;
    if (round.suddenDeath) {
      card.classList.add('history-card--sudden-death');
    }

    const header = document.createElement('div');
    header.className = 'history-card__header';

    const numPlayers = round.choices.length;
    const prob = ProbabilityCalculator.calculate({
      numPlayers: numPlayers,
      winners: (round.winners ?? []).length,
      losers: (round.losers ?? []).length,
    });
    const probPercent = (prob * 100).toFixed(1);

    const survivorLabel = baseMode === 'winner' ? '남은 우승 후보' : '남은 패자 후보';
    const countLine =
      typeof round.remainingCount === 'number'
        ? `${survivorLabel} ${round.remainingCount}명 · 목표 ${round.targetCount ?? '?'}명`
        : '';

    header.innerHTML = `
      <div class="history-card__meta">
        <span class="history-card__round">라운드 ${round.index ?? '?'}</span>
        <span class="history-card__probability">${probPercent}%</span>
      </div>
      ${countLine ? `<span class="survivor-meta">${countLine}</span>` : ''}
    `;

    const body = document.createElement('div');
    body.className = 'history-card__body';

    const isStalemate = (round.winners ?? []).length === 0 && (round.losers ?? []).length === 0;
    const eliminatedIds = new Set(
      baseMode === 'winner' ? round.losers : round.winners
    );

    (round.choices ?? []).forEach((choice) => {
      const row = document.createElement('div');
      row.className = 'history-card__row';
      const name = HistoryRenderer.lookupName(choice.participantId);
      const isEliminated = eliminatedIds.has(choice.participantId);

      let nameHtml;
      if (isStalemate) {
        nameHtml = `😐 ${name}`;
      } else if (baseMode === 'winner') {
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
    render.ensureSuddenDeathNotice();
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
  showFinalPopup({ participantName, participantNames, mode }) {
    if (!state.dom.finalPopup) return;
    const baseMode = resolveBaseMode(mode);
    state.dom.finalPopupMode.textContent =
      baseMode === 'winner' ? '최종 승자' : '최종 패자';
    const names =
      Array.isArray(participantNames) && participantNames.length
        ? participantNames
        : participantName
        ? [participantName]
        : [];
    state.dom.finalPopupName.textContent = names.length ? names.join(', ') : '-';
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
  ensureSuddenDeathNotice() {
    if (state.dom.suddenDeathNotice) return;
    let notice = document.getElementById('sudden-death-notice');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'sudden-death-notice';
      notice.className = 'sudden-death-notice';
      notice.hidden = true;
      notice.setAttribute('aria-hidden', 'true');
      notice.innerHTML = `
        <div class="sudden-death-notice__card" role="alertdialog" aria-modal="true" tabindex="-1" aria-live="assertive">
          <h2 class="sudden-death-notice__title">서든데스 준비</h2>
          <p class="sudden-death-notice__message">남은 참가자를 위한 서든데스를 준비합니다.</p>
        </div>
      `;
      document.body.appendChild(notice);
    }
    state.dom.suddenDeathNotice = notice;
    state.dom.suddenDeathNoticeTitle = notice.querySelector('.sudden-death-notice__title');
    state.dom.suddenDeathNoticeMessage = notice.querySelector('.sudden-death-notice__message');
    state.dom.suddenDeathNoticeCard = notice.querySelector('.sudden-death-notice__card');
  },
  showSuddenDeathNotice({ lockedParticipants = [], remainingSlots = 1, mode } = {}) {
    render.ensureSuddenDeathNotice();
    if (!state.dom.suddenDeathNotice) return;
    const baseMode = resolveBaseMode(mode ?? state.game.mode);
    const lockedNames = lockedParticipants.map((participant) => participant?.name ?? '').filter(Boolean);
    render.enableSuddenDeathTheme();
    if (state.dom.suddenDeathNoticeTitle) {
      state.dom.suddenDeathNoticeTitle.textContent =
        baseMode === 'winner' ? '승자 서든데스 준비' : '패자 서든데스 준비';
    }
    if (state.dom.suddenDeathNoticeMessage) {
      const parts = [];
      if (lockedNames.length) {
        parts.push(`${lockedNames.join(', ')} ${lockedNames.length > 1 ? '참가자들이' : '참가자가'} 확정되었습니다.`);
      }
      parts.push(`남은 ${remainingSlots}명을 위한 서든데스를 곧 시작합니다.`);
      state.dom.suddenDeathNoticeMessage.textContent = parts.join(' ');
    }
    const previouslyFocused = document.activeElement;
    if (
      previouslyFocused &&
      previouslyFocused !== document.body &&
      previouslyFocused !== state.dom.suddenDeathNoticeCard
    ) {
      state.dom.suddenDeathNoticePrevFocus = previouslyFocused;
    } else {
      state.dom.suddenDeathNoticePrevFocus = null;
    }
    state.dom.suddenDeathNotice.hidden = false;
    state.dom.suddenDeathNotice.setAttribute('aria-hidden', 'false');
    state.dom.suddenDeathNoticeCard?.focus();
    log(
      '서든데스 안내',
      `3초 뒤 서든데스를 시작합니다.${lockedNames.length ? ` 확정된 ${lockedNames.length}명: ${lockedNames.join(', ')}` : ''}`
    );
  },
  hideSuddenDeathNotice() {
    if (!state.dom.suddenDeathNotice) return;
    state.dom.suddenDeathNotice.hidden = true;
    state.dom.suddenDeathNotice.setAttribute('aria-hidden', 'true');
    const focusTarget = state.dom.suddenDeathNoticePrevFocus;
    state.dom.suddenDeathNoticePrevFocus = null;
    if (focusTarget && typeof focusTarget.focus === 'function' && document.contains(focusTarget)) {
      focusTarget.focus();
    } else if (state.dom.inputSlot) {
      state.dom.inputSlot.querySelector('input')?.focus();
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
    render.hideSuddenDeathNotice();
    render.disableSuddenDeathTheme();
  },
  enableSuddenDeathTheme() {
    document.body.classList.add('is-sudden-death');
    state.dom.root?.classList.add('is-sudden-death');
    const grid = document.querySelector('.mode-button-grid');
    grid?.classList.add('is-sudden-death');
  },
  disableSuddenDeathTheme() {
    document.body.classList.remove('is-sudden-death');
    state.dom.root?.classList.remove('is-sudden-death');
    const grid = document.querySelector('.mode-button-grid');
    grid?.classList.remove('is-sudden-death');
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
    winnerDualBtn: null,
    loserBtn: null,
    loserDualBtn: null,
  };

  const stateCache = {
    parsed: InputParser.parse(''),
  };
  let lastButtonsEnabled = false;
  let lastActiveMode = null;

  const setActiveModeButton = (modeId) => {
    const resolved = modeId ?? null;
    const target =
      resolved === 'winner'
        ? refs.winnerBtn
        : resolved === 'winner-dual'
        ? refs.winnerDualBtn
        : resolved === 'loser'
        ? refs.loserBtn
        : resolved === 'loser-dual'
        ? refs.loserDualBtn
        : null;
    if (lastActiveMode !== resolved) {
      if (resolved) {
        const metadata = getModeMetadata(resolved);
        log('모드 표시', `${metadata.label} 버튼을 강조합니다.`);
      } else if (lastActiveMode) {
        log('모드 표시', '모드 강조를 초기화합니다.');
      }
      lastActiveMode = resolved;
    }
    [refs.winnerBtn, refs.winnerDualBtn, refs.loserBtn, refs.loserDualBtn].forEach((btn) => {
      if (!btn) return;
      const isActive = btn === target;
      btn.classList.toggle('is-active', isActive);
      if (isActive) {
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  };

  const handleInput = () => {
    if (!refs.input) return;
    stateCache.parsed = InputParser.parse(refs.input.value);
    GameState.setActiveParticipants(stateCache.parsed.participants);
    Controls.updateButtons(stateCache.parsed.isCountValid);
    setActiveModeButton(null);
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
    const metadata = getModeMetadata(mode);
    GameState.reset();
    GameState.setMode(mode);
    GameState.setActiveParticipants(participants);
    Controls.lock();
    setActiveModeButton(GameState.serialize().mode);
    log(
      '게임 시작',
      `${metadata.label} 모드로 시작합니다. 목표 생존자 ${metadata.targetSurvivors}명`
    );
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
      refs.winnerDualBtn = document.getElementById('start-winner-dual');
      refs.loserBtn = document.getElementById('start-loser');
      refs.loserDualBtn = document.getElementById('start-loser-dual');

      if (refs.input) {
        refs.input.addEventListener('input', handleInput);
      }
      if (refs.winnerBtn) {
        refs.winnerBtn.addEventListener('click', () => handleStart('winner'));
      }
      if (refs.winnerDualBtn) {
        refs.winnerDualBtn.addEventListener('click', () => handleStart('winner-dual'));
      }
      if (refs.loserBtn) {
        refs.loserBtn.addEventListener('click', () => handleStart('loser'));
      }
      if (refs.loserDualBtn) {
        refs.loserDualBtn.addEventListener('click', () => handleStart('loser-dual'));
      }

      Controls.updateButtons(false);
      setActiveModeButton(null);
    },
    updateButtons(isValid) {
      [refs.winnerBtn, refs.winnerDualBtn, refs.loserBtn, refs.loserDualBtn].forEach((btn) => {
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
      setActiveModeButton(null);
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
  let lastDurationMs = 0;

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
    start(roundIndex = 0, { durationMs } = {}) {
      stopInternal();
      currentRoundIndex = roundIndex;
      const resolvedDuration = Number.isFinite(durationMs) && durationMs > 0
        ? durationMs
        : durationForRound(roundIndex);
      lastDurationMs = resolvedDuration;
      endTimestamp = Date.now() + resolvedDuration;
      updateCountdownState(resolvedDuration, true);
      scheduleTicks();
      return resolvedDuration;
    },
    stop: stopInternal,
    getLastDuration() {
      return lastDurationMs;
    },
  };
})();

const WaitingPanelRenderer = {
  reset() {
    if (!state.dom.waitingPanel) return;
    state.dom.waitingPanel.innerHTML = '<p class="placeholder">대기자가 없습니다.</p>';
  },
  render(list = [], { mode } = {}) {
    if (!state.dom.waitingPanel) return;

    const baseMode = resolveBaseMode(mode ?? state.game.mode ?? 'winner');
    const lockedLabel = baseMode === 'winner' ? '승자' : '패자';

    const locked = list.filter((participant) => participant.status === 'locked');
    const waiting = list.filter((participant) => participant.status !== 'locked');

    if (!locked.length && !waiting.length) {
      WaitingPanelRenderer.reset();
      return;
    }

    state.dom.waitingPanel.innerHTML = '';
    if (locked.length) {
      const lockedNames = locked.map((participant) => participant.name).join(', ');
      const lockedLine = document.createElement('p');
      lockedLine.className = 'panel-line panel-line--locked';
      lockedLine.textContent = `${lockedLabel}: ${lockedNames}`;
      state.dom.waitingPanel.appendChild(lockedLine);
    }
    if (waiting.length) {
      const waitingNames = waiting.map((participant) => participant.name).join(', ');
      const waitingLine = document.createElement('p');
      waitingLine.className = 'panel-line';
      waitingLine.textContent = `대기자: ${waitingNames}`;
      state.dom.waitingPanel.appendChild(waitingLine);
    }
  },
};

const DwellController = (() => {
  let timerId = null;
  const DWELL_MS = 3000;

  return {
    start(payload) {
      DwellController.clear();
      log('대기 시간', '결과를 3초간 표시합니다.');
      if (payload?.suddenDeath) {
        const snapshot = GameState.serialize();
        const target = snapshot.targetSurvivors ?? 1;
        log('대기 시간', `서든데스 준비 중: 목표 생존자 ${target}명`);
      }
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

const ReducedMotion = (() => {
  const QUERY = '(prefers-reduced-motion: reduce)';
  let mediaQuery;
  let isReduced = false;

  const handleChange = (event) => {
    isReduced = Boolean(event.matches);
  };

  const detect = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      isReduced = false;
      return;
    }
    mediaQuery = window.matchMedia(QUERY);
    isReduced = Boolean(mediaQuery.matches);
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleChange);
    }
  };

  detect();

  return {
    isEnabled() {
      return isReduced;
    },
    teardown() {
      if (!mediaQuery) return;
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (typeof mediaQuery.removeListener === 'function') {
        mediaQuery.removeListener(handleChange);
      }
    },
  };
})();

const EliminationSequenceController = (() => {
  const DEFAULT_DURATION = 600;
  const MIN_DURATION = 400;
  const MAX_DURATION = 1000;

  let pendingSequence = null;

  const clampDuration = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return DEFAULT_DURATION;
    return Math.min(MAX_DURATION, Math.max(MIN_DURATION, value));
  };

  const resolveModeId = (contextMode) => contextMode ?? GameState.serialize().mode ?? 'winner';

  const resolveEliminatedIds = (round, mode) => {
    if (!round) return [];
    const baseMode = resolveBaseMode(mode);
    if (baseMode === 'winner') return Array.isArray(round.losers) ? [...round.losers] : [];
    return Array.isArray(round.winners) ? [...round.winners] : [];
  };

  const escapeToken = (token) => {
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
      return CSS.escape(token);
    }
    return token.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  };

  const resolveTargets = (ids = []) => {
    if (!state.dom.participantRing) return [];
    return ids
      .map((id) =>
        state.dom.participantRing.querySelector(
          `[data-participant-id="${escapeToken(id)}"]`
        )
      )
      .filter(Boolean);
  };

  const resolveParticipantNames = (ids = []) => {
    const snapshot = GameState.serialize();
    const pool = [...snapshot.activeParticipants, ...snapshot.waitingParticipants];
    const nameMap = new Map(pool.map((participant) => [participant.id, participant.name]));
    return ids.map((id) => nameMap.get(id) ?? id);
  };

  const settleTarget = (target) => {
    if (!target) return;
    target.classList.remove('is-eliminating');
    target.classList.remove('is-eliminating--loser');
    target.classList.remove('is-eliminating--winner');
    target.style.removeProperty('--elimination-duration');
  };

  const settleSequenceTargets = (sequence) => {
    (sequence?.targets ?? []).forEach((target) => settleTarget(target));
  };

  const createAnimationPromise = (sequence, target) =>
    new Promise((resolve) => {
      if (!target) {
        resolve();
        return;
      }

      const entry = {
        target,
        fallbackId: null,
        cleaned: false,
        cleanup: () => {},
      };

      const removeEntry = () => {
        sequence.animations = sequence.animations.filter((item) => item !== entry);
      };

      const cleanup = () => {
        if (entry.cleaned) {
          return;
        }
        entry.cleaned = true;
        target.removeEventListener('animationend', handleAnimationEnd);
        target.removeEventListener('transitionend', handleAnimationEnd);
        if (entry.fallbackId != null) {
          window.clearTimeout(entry.fallbackId);
        }
        removeEntry();
        resolve();
      };

      const handleAnimationEnd = (event) => {
        if (event.target !== target) return;
        cleanup();
      };

      const triumphantExit = resolveBaseMode(sequence.mode) === 'loser';
      const runtime = Math.min(
        triumphantExit ? sequence.durationMs + 180 : sequence.durationMs,
        MAX_DURATION
      );

      entry.fallbackId = window.setTimeout(cleanup, runtime + 160);
      target.addEventListener('animationend', handleAnimationEnd);
      target.addEventListener('transitionend', handleAnimationEnd);
      target.style.setProperty('--elimination-duration', `${runtime}ms`);

      entry.cleanup = cleanup;
      sequence.animations.push(entry);

      window.requestAnimationFrame(() => {
        target.classList.add('is-eliminating');
        if (resolveBaseMode(sequence.mode) === 'winner') {
          target.classList.add('is-eliminating--loser');
        } else {
          target.classList.add('is-eliminating--winner');
        }
      });
    });

  const runAnimations = (sequence) => {
    if (!sequence.targets.length) {
      return new Promise((resolve) => window.setTimeout(resolve, sequence.durationMs));
    }
    const promises = sequence.targets.map((target) =>
      createAnimationPromise(sequence, target)
    );
    return Promise.all(promises);
  };

  const buildSequence = (context = {}) => {
    const round = context.round ?? null;
    const mode = resolveModeId(context.mode);
    const baseMode = resolveBaseMode(mode);
    const eliminatedIds = Array.isArray(context.eliminatedIds)
      ? [...context.eliminatedIds]
      : resolveEliminatedIds(round, baseMode);
    const durationMs = clampDuration(context.durationMs ?? DEFAULT_DURATION);

    pendingSequence = {
      roundIndex: round?.index ?? context.roundIndex ?? GameState.serialize().countdown.currentRound,
      mode,
      eliminatedIds,
      durationMs,
      prefersReducedMotion: ReducedMotion.isEnabled(),
      targets: resolveTargets(eliminatedIds),
      animations: [],
      timestamp: Date.now(),
      status: 'pending',
    };
    return pendingSequence;
  };

  const emitWithStatus = (eventName, sequence) => {
    PubSub.emit(eventName, {
      roundIndex: sequence.roundIndex,
      mode: sequence.mode,
      eliminatedIds: [...sequence.eliminatedIds],
      durationMs: sequence.durationMs,
      prefersReducedMotion: sequence.prefersReducedMotion,
    });
  };

  const finalize = (sequence, status) => {
    settleSequenceTargets(sequence);
    (sequence.animations ?? []).forEach((entry) => entry.cleanup?.());
    const result = {
      roundIndex: sequence.roundIndex,
      mode: sequence.mode,
      eliminatedIds: [...sequence.eliminatedIds],
      durationMs: sequence.durationMs,
      prefersReducedMotion: sequence.prefersReducedMotion,
      status,
    };
    pendingSequence = null;
    return result;
  };

  const execute = (context = {}) => {
    const sequence = pendingSequence ?? buildSequence(context);

    if (!sequence.eliminatedIds.length) {
      log('탈락 애니메이션', '제외 대상이 없어 애니메이션을 생략합니다.');
      emitWithStatus('round:elimination:skipped', sequence);
      return Promise.resolve(finalize(sequence, 'skipped'));
    }

    const participantNames = resolveParticipantNames(sequence.eliminatedIds);

    if (sequence.prefersReducedMotion) {
      log(
        '탈락 애니메이션',
        `시스템 모션 최소화 설정으로 즉시 제거 (${participantNames.length}명): ${participantNames.join(', ')}`
      );
      emitWithStatus('round:elimination:skipped', sequence);
      return Promise.resolve(finalize(sequence, 'skipped'));
    }

    if (!sequence.targets.length) {
      log(
        '탈락 애니메이션',
        `DOM 대상이 없어 즉시 제거 (${participantNames.length}명): ${participantNames.join(', ')}`
      );
      emitWithStatus('round:elimination:skipped', sequence);
      return Promise.resolve(finalize(sequence, 'skipped'));
    }

    emitWithStatus('round:elimination:start', sequence);
    const roleLabel = resolveBaseMode(sequence.mode) === 'winner' ? '패배자' : '승자';
    log(
      '탈락 애니메이션',
      `${roleLabel} ${participantNames.length}명 애니메이션 시작: ${participantNames.join(', ')}`
    );

    return runAnimations(sequence)
      .catch((error) => {
        log(
          '탈락 애니메이션',
          '애니메이션 실행 중 오류가 발생하여 즉시 완료 처리합니다.',
          error
        );
      })
      .then(() => {
        emitWithStatus('round:elimination:complete', sequence);
        log(
          '탈락 애니메이션',
          `${roleLabel} ${participantNames.length}명 애니메이션 완료: ${participantNames.join(', ')}`
        );
        return finalize(sequence, 'completed');
      });
  };

  const reset = () => {
    if (pendingSequence) {
      (pendingSequence.animations ?? []).forEach((entry) => entry.cleanup?.());
      settleSequenceTargets(pendingSequence);
      pendingSequence.animations = [];
    }
    pendingSequence = null;
  };

  const cancel = () => {
    reset();
  };

  const getPendingSequence = () => pendingSequence;

  return {
    buildSequence,
    execute,
    reset,
    cancel,
    getPendingSequence,
  };
})();

const applyNextActiveParticipants = ({
  survivorIds = [],
  eliminatedIds = [],
  metadata,
} = {}) => {
  const snapshot = GameState.serialize();
  const { survivors, waiting } = SurvivorEvaluator.buildParticipantPools({
    survivorIds,
    previousActive: snapshot.activeParticipants,
    previousWaiting: snapshot.waitingParticipants,
  });

  const lockedIds = GameState.getSuddenDeathLocked();
  const lockedSet = new Set(lockedIds);

  const decoratedWaiting = waiting.map((participant) =>
    lockedSet.has(participant.id)
      ? { ...participant, status: 'locked' }
      : participant
  );

  GameState.setActiveParticipants(survivors);
  GameState.setWaitingParticipants(decoratedWaiting);
  render.refreshParticipants(survivors);

  const config = metadata ?? GameState.getModeConfig();
  WaitingPanelRenderer.render(decoratedWaiting, { mode: config?.id ?? snapshot.mode ?? 'winner' });
  const modeId = config?.id ?? snapshot.mode ?? 'winner';
  const baseMode = resolveBaseMode(modeId);
  const label = config?.label ?? (baseMode === 'winner' ? '승자 뽑기' : '패자 뽑기');
  const summary = {
    mode: modeId,
    baseMode,
    label,
    activeCount: survivors.length,
    waitingCount: decoratedWaiting.filter((participant) => participant.status !== 'locked').length,
    lockedCount: lockedIds.length,
    targetSurvivors: config?.targetSurvivors ?? GameState.getTargetSurvivors(),
    pendingSuddenDeathCount: Array.isArray(GameState.getPendingSuddenDeath())
      ? GameState.getPendingSuddenDeath().length
      : 0,
  };

  if (eliminatedIds.length) {
    const nameMap = new Map(
      [...snapshot.activeParticipants, ...snapshot.waitingParticipants].map((participant) => [
        participant.id,
        participant.name,
      ])
    );
    const names = eliminatedIds
      .map((id) => nameMap.get(id) ?? id)
      .filter(Boolean)
      .join(', ');
    if (names) {
      log(
        '라운드 결과',
        `${label} 모드 제외 대상: ${names}`
      );
    }
  }

  log(
    '패널 상태',
    `${label} - 활성 ${summary.activeCount}명 / 대기 ${summary.waitingCount}명${
      summary.lockedCount ? ` / 확정 ${summary.lockedCount}명` : ''
    } (목표 ${summary.targetSurvivors}명)`
  );
  if (summary.pendingSuddenDeathCount > 0) {
    log(
      '서든데스 대기',
      `${label} 모드 서든데스 후보 ${summary.pendingSuddenDeathCount}명`
    );
  }
  if (summary.lockedCount > 0) {
    const lockedParticipants = GameState.resolveParticipantsByIds(lockedIds);
    const lockedNames = lockedParticipants.map((participant) => participant?.name ?? '알 수 없음').join(', ');
    log(
      '확정 대상',
      `${label} 모드 확정 ${summary.lockedCount}명: ${lockedNames}`
    );
  }
  PubSub.emit('round:panel:update', summary);
};

PubSub.on('game:start', () => {
  HistoryRenderer.reset();
  WaitingPanelRenderer.reset();
  DwellController.clear();
  EliminationSequenceController.cancel();
  SuddenDeathCoordinator.reset();
  if (typeof render.hideSuddenDeathNotice === 'function') {
    render.hideSuddenDeathNotice();
  }
  state.dwellPayload = null;
});

PubSub.on('round:complete', (payload) => {
  if (!payload) return;
  const { round, nextActiveIds = [], eliminatedIds = [] } = payload;
  if (round) {
    HistoryRenderer.append(round);
  }
  const mode = round?.mode || state.game.mode;
  DwellController.start({
    round,
    nextActiveIds,
    eliminatedIds,
    mode,
    suddenDeath: Boolean(round?.suddenDeath),
  });
});

PubSub.on('countdown:start', (payload) => {
  const roundIndex = (payload?.roundIndex ?? 0) + 1;
  const durationMs = payload?.durationMs ?? 0;
  const isSuddenDeath = Boolean(payload?.suddenDeath);
  log(
    '카운트다운',
    `${roundIndex}라운드 ${durationMs}ms 카운트다운 시작${isSuddenDeath ? ' (서든데스)' : ''}`
  );
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
  const label = payload?.label ?? (payload?.baseMode === 'loser' ? '패자 뽑기' : '승자 뽑기');
  const lockedCount = payload?.lockedCount ?? 0;
  log(
    '패널 업데이트',
    `${label} - 활성 ${payload?.activeCount ?? 0} / 대기 ${payload?.waitingCount ?? 0}${
      lockedCount ? ` / 확정 ${lockedCount}명` : ''
    } (목표 ${
      payload?.targetSurvivors ?? 1
    }명${payload?.pendingSuddenDeathCount ? ` · 서든데스 후보 ${payload.pendingSuddenDeathCount}명` : ''})`
  );
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
  EliminationSequenceController,
};
const SimulationEngine = (() => {
  const state = {
    dwellPayload: null,
  };
  const SUDDEN_DEATH_NOTICE_MS = 3000;

  const runRound = (roundIndex) => {
    const snapshot = GameState.serialize();
    const participants = snapshot.activeParticipants;
    const target = snapshot.targetSurvivors ?? 1;
    const lockedIds = GameState.getSuddenDeathLocked();
    const lockedCount = lockedIds.length;
    const remainingSlots = Math.max(target - lockedCount, 0);

    if (remainingSlots <= 0) {
      const lockedParticipants = GameState.resolveParticipantsByIds(lockedIds);
      if (lockedParticipants.length) {
        SimulationEngine.finish(lockedParticipants);
      } else {
        SimulationEngine.finish(participants);
      }
      return;
    }

    if (participants.length <= target) {
      const pendingSuddenDeath = GameState.getPendingSuddenDeathParticipants();
      if (!pendingSuddenDeath.length && participants.length <= remainingSlots) {
        const lockedParticipants = GameState.resolveParticipantsByIds(lockedIds);
        const finalists = lockedParticipants.length ? [...lockedParticipants, ...participants] : participants;
        SimulationEngine.finish(finalists);
        return;
      }
    }

    const suddenDeathStatus = GameState.getSuddenDeathStatus();
    const pendingSuddenDeath = GameState.getPendingSuddenDeathParticipants();
    const isSuddenDeathRound = suddenDeathStatus === 'active' || (suddenDeathStatus === 'notifying' && pendingSuddenDeath.length > 0);
    const duration = CountdownController.start(roundIndex, {
      durationMs: isSuddenDeathRound ? 3000 : undefined,
    });
    if (isSuddenDeathRound) {
      log('카운트다운', '서든데스 라운드 - 카운트다운을 3초로 고정합니다.');
    }
    PubSub.emit('countdown:start', {
      roundIndex,
      durationMs: duration,
      suddenDeath: isSuddenDeathRound,
    });
  };

  const handleCountdownComplete = ({ roundIndex }) => {
    const snapshot = GameState.serialize();
    const participants = snapshot.activeParticipants;
    const choices = MoveGenerator.assignChoices(participants);
    PubSub.emit('round:choices', { choices });

    const outcome = MoveGenerator.determineOutcome(choices);
    const metadata = snapshot.modeConfig ?? getModeMetadata(snapshot.mode);
    const evaluation = SurvivorEvaluator.evaluate({
      participants,
      outcome,
      metadata,
    });
    const modeId = metadata?.id ?? snapshot.mode ?? 'winner';
    const wasSuddenDeath = GameState.getSuddenDeathStatus() !== 'idle';

    let roundData;
    const nextRoundIndex = roundIndex + 1;

    if (outcome.result === 'stalemate') {
      log('라운드', '무승부가 발생했습니다. 3초 후 재도전합니다.');
      roundData = {
        index: roundIndex + 1,
        mode: modeId,
        choices,
        winners: [],
        losers: [],
      };
    } else {
      roundData = {
        index: roundIndex + 1,
        mode: modeId,
        choices,
        winners: outcome.winners,
        losers: outcome.losers,
      };
    }
    roundData.remainingCount = evaluation.survivorIds.length;
    roundData.targetCount = metadata?.targetSurvivors ?? snapshot.targetSurvivors ?? 1;
    const suddenDeathOutcome = SuddenDeathCoordinator.schedule({
      survivors: evaluation.survivorIds,
      eliminatedIds: evaluation.eliminatedIds,
      metadata,
      isStalemate: evaluation.isStalemate,
      roundIndex: roundData.index,
    });
    roundData.suddenDeath = wasSuddenDeath;

    PubSub.emit('round:complete', {
      round: roundData,
      nextActiveIds:
        Array.isArray(suddenDeathOutcome.nextActiveIds) && suddenDeathOutcome.nextActiveIds.length
          ? suddenDeathOutcome.nextActiveIds
          : evaluation.survivorIds,
      eliminatedIds: evaluation.eliminatedIds,
      suddenDeath: suddenDeathOutcome,
    });
    state.dwellPayload = {
      nextRoundIndex,
      suddenDeath: suddenDeathOutcome.scheduled,
      notice: suddenDeathOutcome.notice,
      finalizeIds: suddenDeathOutcome.finalize ? suddenDeathOutcome.finalIds : null,
    };
  };

  const handleDwellComplete = () => {
    const proceed = () => {
      const snapshot = GameState.serialize();
      const activeCount = snapshot.activeParticipants.length;
      const target = snapshot.targetSurvivors ?? 1;

      if (state.dwellPayload?.finalizeIds?.length) {
        const finalists = GameState.resolveParticipantsByIds(state.dwellPayload.finalizeIds);
        if (finalists.length) {
          log(
            '서든데스 종료',
            `최종 ${finalists.length}명 확정: ${finalists.map((participant) => participant.name).join(', ')}`
          );
          state.dwellPayload.finalizeIds = null;
          SimulationEngine.finish(finalists);
          return;
        }
      }

      if (SuddenDeathCoordinator.shouldContinue()) {
        log(
          '서든데스 진행',
          `남은 ${activeCount}명, 목표 ${target}명까지 서든데스 라운드를 이어갑니다.`
        );
        runRound(state.dwellPayload?.nextRoundIndex ?? 0);
        return;
      }

      const lockedIds = GameState.getSuddenDeathLocked();
      if (lockedIds.length) {
        const lockedParticipants = GameState.resolveParticipantsByIds(lockedIds);
        if (lockedParticipants.length && lockedParticipants.length + activeCount === target) {
          const finalists = [...lockedParticipants, ...snapshot.activeParticipants];
          log(
            '서든데스 종료',
            `서든데스 조합 완료: ${finalists.map((participant) => participant.name).join(', ')}`
          );
          SimulationEngine.finish(finalists);
          return;
        }
      }

      if (activeCount <= target) {
        SimulationEngine.finish(snapshot.activeParticipants);
        return;
      }

      runRound(state.dwellPayload?.nextRoundIndex ?? 0);
    };

    if (state.dwellPayload?.notice) {
      const snapshot = GameState.serialize();
      const lockedIds = GameState.getSuddenDeathLocked();
      const lockedParticipants = GameState.resolveParticipantsByIds(lockedIds);
      const remainingSlots = Math.max((snapshot.targetSurvivors ?? 1) - lockedParticipants.length, 0);
      render.showSuddenDeathNotice({
        lockedParticipants,
        remainingSlots,
        mode: snapshot.mode,
      });
      window.setTimeout(() => {
        render.hideSuddenDeathNotice();
        SuddenDeathCoordinator.markNoticeComplete();
        state.dwellPayload.notice = false;
        log('서든데스 안내', '안내 팝업이 닫히고 서든데스 라운드를 시작합니다.');
        proceed();
      }, SUDDEN_DEATH_NOTICE_MS);
      return;
    }

    proceed();
  };

  return {
    start() {
      runRound(0);
    },
    finish(finalists) {
      CountdownController.stop();
      DwellController.clear();
      const snapshot = GameState.serialize();
      const config = snapshot.modeConfig ?? getModeMetadata(snapshot.mode);
      const baseMode = resolveBaseMode(config?.id);
      const list = Array.isArray(finalists)
        ? finalists.filter(Boolean)
        : finalists
        ? [finalists]
        : [];

      if (!list.length) {
        Controls.unlock();
        return;
      }

      const names = list.map((participant) => participant?.name ?? '알 수 없음');
      GameState.finalize(list);
      render.showFinalPopup({
        participantName: names[0] ?? '알 수 없음',
        participantNames: names,
        mode: config?.id,
      });
      log(
        '게임 종료',
        `${baseMode === 'winner' ? '최종 승자' : '최종 패자'} ${names.length}명: ${names.join(', ')}`
      );
      SuddenDeathCoordinator.complete();
      render.hideSuddenDeathNotice();
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
PubSub.on('round:dwell:complete', async (payload) => {
  const context = payload ?? {};
  const modeId = context.mode ?? GameState.serialize().mode ?? 'winner';
  const metadata = getModeMetadata(modeId);

  EliminationSequenceController.buildSequence({
    round: context.round,
    mode: modeId,
    eliminatedIds: context.eliminatedIds,
  });

  await EliminationSequenceController.execute({
    round: context.round,
    mode: modeId,
    eliminatedIds: context.eliminatedIds,
  });

  if (Array.isArray(context.nextActiveIds)) {
    applyNextActiveParticipants({
      survivorIds: context.nextActiveIds,
      eliminatedIds: Array.isArray(context.eliminatedIds) ? context.eliminatedIds : [],
      metadata,
    });
  }

  SimulationEngine.handleDwellComplete();
});
