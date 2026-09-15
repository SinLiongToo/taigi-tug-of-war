// 畫面渲染,只讀 GameState/settings 來更新 DOM,不含遊戲規則邏輯。
const UI = (() => {
  const $ = (id) => document.getElementById(id);

  const el = {};
  function cacheEls() {
    Object.assign(el, {
      settingsScreen: $('settingsScreen'),
      gameScreen: $('gameScreen'),
      gameOverScreen: $('gameOverScreen'),
      dictStatus: $('dictStatus'),
      startBtn: $('startBtn'),
      ropeMarker: $('ropeMarker'),
      panelAName: $('panelA').querySelector('.teamName'),
      panelAScore: $('panelA').querySelector('.teamScore'),
      panelBName: $('panelB').querySelector('.teamName'),
      panelBScore: $('panelB').querySelector('.teamScore'),
      timerFill: $('timerFill'),
      statusLine: $('statusLine'),
      promptLabel: $('promptLabel'),
      promptText: $('promptText'),
      choiceBtns: Array.from(document.querySelectorAll('.choiceBtn')),
      buzzBtnA: $('buzzBtnA'),
      buzzBtnB: $('buzzBtnB'),
      winnerText: $('winnerText'),
    });
  }

  function showScreen(name) {
    el.settingsScreen.hidden = name !== 'settings';
    el.gameScreen.hidden = name !== 'game';
    el.gameOverScreen.hidden = name !== 'gameover';
  }

  function setDictStatus(text, ready) {
    el.dictStatus.textContent = text;
    el.startBtn.disabled = !ready;
  }

  let timerRAF = null;
  function startTimerBar(seconds) {
    cancelAnimationFrame(timerRAF);
    const start = performance.now();
    const durationMs = seconds * 1000;
    el.timerFill.style.width = '100%';
    el.timerFill.classList.remove('timerLow');
    function tick(now) {
      const elapsed = now - start;
      const pct = Math.max(0, 100 - (elapsed / durationMs) * 100);
      el.timerFill.style.width = pct + '%';
      el.timerFill.classList.toggle('timerLow', pct < 25);
      if (pct > 0) timerRAF = requestAnimationFrame(tick);
    }
    timerRAF = requestAnimationFrame(tick);
  }
  function stopTimerBar() {
    cancelAnimationFrame(timerRAF);
  }

  function renderRope(scores, targetScore) {
    const diff = scores.A - scores.B;
    const pct = Math.max(0, Math.min(100, 50 + (diff / targetScore) * 50));
    el.ropeMarker.style.left = pct + '%';
  }

  function statusText(state, settings) {
    const nameA = settings.teamNames.A, nameB = settings.teamNames.B;
    if (state.phase === 'buzz') return '搶答中!按搶答鍵搶下作答權';
    if (state.phase === 'answer') {
      const name = state.activeTeam === 'A' ? nameA : nameB;
      return state.isSteal
        ? `${name} 偷答機會!按 1~4 作答`
        : `${name} 搶到了!按 1~4 作答`;
    }
    if (state.phase === 'result') {
      const r = state.lastResult;
      if (r.timeup) return '時間到,這題作廢';
      const name = r.team === 'A' ? nameA : nameB;
      if (r.correct) return `${name} 答對了!`;
      return r.final ? '兩隊都答錯,這題作廢' : `${name} 答錯了...`;
    }
    return '';
  }

  function render(state, settings) {
    el.panelAName.textContent = settings.teamNames.A;
    el.panelBName.textContent = settings.teamNames.B;
    el.panelAScore.textContent = `${state.scores.A} / ${settings.targetScore}`;
    el.panelBScore.textContent = `${state.scores.B} / ${settings.targetScore}`;
    renderRope(state.scores, settings.targetScore);

    document.querySelectorAll('.teamPanel').forEach(p => p.classList.remove('active'));
    if (state.phase === 'answer') {
      $(state.activeTeam === 'A' ? 'panelA' : 'panelB').classList.add('active');
    }

    el.statusLine.textContent = statusText(state, settings);

    const q = state.currentQuestion;
    if (q) {
      el.promptLabel.textContent = q.promptLabel;
      el.promptText.textContent = q.prompt;
      el.choiceBtns.forEach((btn, idx) => {
        btn.querySelector('.choiceText').textContent = q.choices[idx];
        btn.classList.remove('correct', 'wrong');
        btn.disabled = state.phase !== 'answer';
      });
    }

    if (state.phase === 'result' && q) {
      const r = state.lastResult;
      el.choiceBtns[q.correctIndex].classList.add('correct');
      if (!r.timeup && !r.correct && typeof r.index === 'number' && r.index >= 0) {
        el.choiceBtns[r.index].classList.add('wrong');
      }
      stopTimerBar();
    }
  }

  function showGameOver(state, settings) {
    const name = state.winner === 'A' ? settings.teamNames.A : settings.teamNames.B;
    el.winnerText.textContent = `${name} 獲勝!`;
    showScreen('gameover');
  }

  return {
    cacheEls, showScreen, setDictStatus, startTimerBar, stopTimerBar, render, showGameOver,
  };
})();
