// 進入點:接好 Questions/GameState/SoloState/Keyboard/UI,管理回合計時器。
(function main() {
  let gs = null;
  let soloGs = null;
  let settings = null;
  let currentTimer = null;
  let roundToken = 0;

  // 團隊模式、一人模式共用同一套「排程計時器 + roundToken 讓過期的
  // setTimeout 失效」機制,用參數指定逾時要呼叫哪個狀態機的 timeout()、
  // 要更新哪一組計時徽章,避免兩邊各寫一份幾乎一樣的邏輯。
  function armTimer(seconds, onExpire, startTimerBarFn) {
    roundToken++;
    const myToken = roundToken;
    clearTimeout(currentTimer);
    startTimerBarFn(seconds);
    currentTimer = setTimeout(() => {
      if (myToken === roundToken) onExpire();
    }, seconds * 1000);
  }

  // ---- 團隊搶答拔河 ----

  function nextRound() {
    const q = Questions.generate(settings.modes, settings.romanSystem, settings.levels);
    gs.startRound(q);
    armTimer(settings.questionSeconds, () => gs.timeout(), UI.startTimerBar);
  }

  function onStateChange(state) {
    UI.render(state, settings);
    if (state.phase === 'result') {
      clearTimeout(currentTimer);
      roundToken++;
      setTimeout(nextRound, 1500);
    } else if (state.phase === 'gameover') {
      clearTimeout(currentTimer);
      roundToken++;
      UI.stopTimerBar();
      Keyboard.stop();
      setTimeout(() => UI.showGameOver(state, settings), 1200);
    }
  }

  function startTeamGame() {
    gs = new GameState({ settings, onChange: onStateChange });
    UI.resetTug();
    UI.showScreen('game');
    Keyboard.start(null, {
      onBuzz: (team) => gs.buzz(team),
      onAnswer: (idx) => { if (gs.phase === 'answer') gs.answer(gs.activeTeam, idx); },
    });
    nextRound();
  }

  // ---- 一人刷題 ----

  function nextSoloRound() {
    const q = Questions.generate(settings.modes, settings.romanSystem, settings.levels);
    soloGs.startRound(q);
    armTimer(settings.questionSeconds, () => soloGs.timeout(), UI.startSoloTimerBar);
  }

  function onSoloStateChange(state) {
    UI.renderSolo(state, settings, SoloStats.load());
    if (state.phase === 'result') {
      SoloStats.recordAnswer(state.lastResult.correct, state.currentStreak);
      UI.renderSolo(state, settings, SoloStats.load()); // 累計數字更新後馬上反映
      clearTimeout(currentTimer);
      roundToken++;
      setTimeout(nextSoloRound, 1200);
    }
  }

  function startSoloGame() {
    soloGs = new SoloState({ onChange: onSoloStateChange });
    UI.showScreen('solo');
    nextSoloRound();
  }

  function endSolo() {
    clearTimeout(currentTimer);
    roundToken++;
    UI.stopTimerBar();
    soloGs = null;
    backToSettings();
  }

  // ---- 共用 ----

  function startGame() {
    settings = Settings.readForm();
    if (settings.gameType === 'solo') {
      startSoloGame();
    } else {
      startTeamGame();
    }
  }

  function backToSettings() {
    clearTimeout(currentTimer);
    roundToken++;
    UI.stopTimerBar();
    Keyboard.stop();
    gs = null;
    soloGs = null;
    UI.renderSoloStats(SoloStats.load());
    UI.showScreen('settings');
  }

  function wireDom() {
    document.getElementById('settingsForm').addEventListener('submit', (e) => {
      e.preventDefault();
      startGame();
    });
    document.querySelectorAll('input[name="gameType"]').forEach((radio) => {
      radio.addEventListener('change', () => UI.applyGameTypeVisibility(radio.value));
    });
    document.getElementById('resetSoloStatsBtn').addEventListener('click', () => {
      if (confirm('確定要清除累計練習紀錄嗎?這個動作沒辦法復原。')) {
        UI.renderSoloStats(SoloStats.reset());
      }
    });

    document.getElementById('backBtn').addEventListener('click', backToSettings);
    document.getElementById('playAgainBtn').addEventListener('click', backToSettings);
    document.getElementById('buzzBtnA').addEventListener('click', () => gs && gs.buzz('A'));
    document.getElementById('buzzBtnB').addEventListener('click', () => gs && gs.buzz('B'));
    document.querySelectorAll('#choices .choiceBtn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (gs && gs.phase === 'answer') gs.answer(gs.activeTeam, Number(btn.dataset.idx));
      });
    });

    document.getElementById('soloEndBtn').addEventListener('click', endSolo);
    document.querySelectorAll('#soloChoices .choiceBtn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (soloGs && soloGs.phase === 'answering') soloGs.answer(Number(btn.dataset.idx));
      });
    });
    // 一人模式沒有搶答,直接按 1~4 作答就好,不用走 Keyboard.js 那套跟隊伍
    // 綁在一起的搶答鍵邏輯,另外接一個簡單的 keydown 監聽器。
    document.addEventListener('keydown', (e) => {
      if (!soloGs || soloGs.phase !== 'answering') return;
      const idx = ['1', '2', '3', '4'].indexOf(e.key);
      if (idx !== -1) soloGs.answer(idx);
    });
  }

  function showVersion() {
    const el = document.getElementById('appVersion');
    if (!el || typeof APP_VERSION === 'undefined') return;
    el.textContent = APP_VERSION.updatedAt
      ? `${APP_VERSION.version} · 更新於 ${APP_VERSION.updatedAt}`
      : APP_VERSION.version;
  }

  async function init() {
    UI.cacheEls();
    UI.showScreen('settings');
    UI.applyGameTypeVisibility('solo');
    UI.renderSoloStats(SoloStats.load());
    wireDom();
    showVersion();
    try {
      const info = await Questions.load();
      UI.setDictStatus(`題庫已就緒,共 ${info.count} 詞`, true);
    } catch (err) {
      UI.setDictStatus(`題庫載入失敗: ${err.message}`, false);
      console.error(err);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
