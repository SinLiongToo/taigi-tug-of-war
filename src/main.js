// 進入點:接好 Questions/GameState/Keyboard/UI,管理回合計時器。
(function main() {
  let gs = null;
  let settings = null;
  let currentTimer = null;
  let roundToken = 0;

  function armTimer(seconds) {
    roundToken++;
    const myToken = roundToken;
    clearTimeout(currentTimer);
    UI.startTimerBar(seconds);
    currentTimer = setTimeout(() => {
      if (myToken === roundToken) gs.timeout();
    }, seconds * 1000);
  }

  function nextRound() {
    const q = Questions.generate(settings.modes, settings.romanSystem);
    gs.startRound(q);
    armTimer(settings.questionSeconds);
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

  function startGame() {
    settings = Settings.readForm();
    gs = new GameState({ settings, onChange: onStateChange });
    UI.resetTug();
    UI.showScreen('game');
    Keyboard.start(null, {
      onBuzz: (team) => gs.buzz(team),
      onAnswer: (idx) => { if (gs.phase === 'answer') gs.answer(gs.activeTeam, idx); },
    });
    nextRound();
  }

  function backToSettings() {
    clearTimeout(currentTimer);
    roundToken++;
    UI.stopTimerBar();
    Keyboard.stop();
    gs = null;
    UI.showScreen('settings');
  }

  function initTheme() {
    const root = document.documentElement;
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
    document.getElementById('themeToggle').addEventListener('click', () => {
      const current = root.dataset.theme
        || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = current === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      localStorage.setItem('theme', next);
    });
  }

  function wireDom() {
    document.getElementById('settingsForm').addEventListener('submit', (e) => {
      e.preventDefault();
      startGame();
    });
    document.getElementById('backBtn').addEventListener('click', backToSettings);
    document.getElementById('playAgainBtn').addEventListener('click', backToSettings);
    document.getElementById('buzzBtnA').addEventListener('click', () => gs && gs.buzz('A'));
    document.getElementById('buzzBtnB').addEventListener('click', () => gs && gs.buzz('B'));
    document.querySelectorAll('.choiceBtn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (gs && gs.phase === 'answer') gs.answer(gs.activeTeam, Number(btn.dataset.idx));
      });
    });
  }

  async function init() {
    UI.cacheEls();
    UI.showScreen('settings');
    wireDom();
    initTheme();
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
