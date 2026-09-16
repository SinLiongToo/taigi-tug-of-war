// 畫面渲染,只讀 GameState/settings 來更新 DOM,不含遊戲規則邏輯。
const UI = (() => {
  const $ = (id) => document.getElementById(id);

  const el = {};
  function cacheEls() {
    Object.assign(el, {
      settingsScreen: $('settingsScreen'),
      gameScreen: $('gameScreen'),
      gameOverScreen: $('gameOverScreen'),
      soloScreen: $('soloScreen'),
      dictStatus: $('dictStatus'),
      startBtn: $('startBtn'),
      ropeKnot: $('ropeKnot'),
      panelAName: $('panelA').querySelector('.teamName'),
      panelAScore: $('panelA').querySelector('.teamScore'),
      panelBName: $('panelB').querySelector('.teamName'),
      panelBScore: $('panelB').querySelector('.teamScore'),
      timerBadge: $('timerBadge'),
      timerNum: $('timerNum'),
      statusLine: $('statusLine'),
      promptLabel: $('promptLabel'),
      promptText: $('promptText'),
      // .choiceBtn 這個 class 團隊模式跟一人模式各有一組(#choices / #soloChoices),
      // 一定要各自限定容器查詢,不然 querySelectorAll('.choiceBtn') 會兩組一起抓到。
      choiceBtns: Array.from(document.querySelectorAll('#choices .choiceBtn')),
      buzzBtnA: $('buzzBtnA'),
      buzzBtnB: $('buzzBtnB'),
      winnerText: $('winnerText'),
      charA: $('charA'),
      charB: $('charB'),

      // 設定畫面上,依「遊戲模式」顯示/隱藏的區塊
      teamOnlyFields: $('teamOnlyFields'),
      soloStatsBox: $('soloStatsBox'),
      soloStatsText: $('soloStatsText'),
      resetSoloStatsBtn: $('resetSoloStatsBtn'),
      teamKeyHint: $('teamKeyHint'),
      soloKeyHint: $('soloKeyHint'),

      // 一人刷題畫面
      soloTimerBadge: $('soloTimerBadge'),
      soloTimerNum: $('soloTimerNum'),
      soloStatusLine: $('soloStatusLine'),
      soloPromptLabel: $('soloPromptLabel'),
      soloPromptText: $('soloPromptText'),
      soloChoiceBtns: Array.from(document.querySelectorAll('#soloChoices .choiceBtn')),
      soloSessionScore: $('soloSessionScore'),
      soloTotalScore: $('soloTotalScore'),
      soloEndBtn: $('soloEndBtn'),
    });
  }

  // 設定畫面依選的遊戲模式('team'|'solo')顯示/隱藏對應欄位。
  function applyGameTypeVisibility(gameType) {
    const isSolo = gameType === 'solo';
    el.teamOnlyFields.hidden = isSolo;
    el.soloStatsBox.hidden = !isSolo;
    el.teamKeyHint.hidden = isSolo;
    el.soloKeyHint.hidden = !isSolo;
    el.startBtn.textContent = isSolo ? '開始練習' : '開始遊戲';
  }

  function renderSoloStats(stats) {
    const acc = stats.totalAnswered ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;
    el.soloStatsText.textContent =
      `累計練習:${stats.totalAnswered} 題,答對 ${stats.totalCorrect} 題(${acc}%)`
      + (stats.bestStreak ? `,最佳連對 ${stats.bestStreak} 題` : '');
  }

  function resetTug() {
    [el.charA, el.charB].forEach(c => c.classList.remove('bigPull', 'stumble', 'victory', 'defeated'));
  }

  let pulseTimer = null;
  function pulseTug(winnerTeam) {
    const winnerEl = winnerTeam === 'A' ? el.charA : el.charB;
    const loserEl = winnerTeam === 'A' ? el.charB : el.charA;
    clearTimeout(pulseTimer);
    [winnerEl, loserEl].forEach(c => c.classList.remove('bigPull', 'stumble'));
    void winnerEl.offsetWidth; // 強制 reflow,讓連續答對也能重新觸發動畫
    winnerEl.classList.add('bigPull');
    loserEl.classList.add('stumble');
    pulseTimer = setTimeout(() => {
      winnerEl.classList.remove('bigPull');
      loserEl.classList.remove('stumble');
    }, 750);
  }

  function celebrateTug(winnerTeam) {
    clearTimeout(pulseTimer);
    const winnerEl = winnerTeam === 'A' ? el.charA : el.charB;
    const loserEl = winnerTeam === 'A' ? el.charB : el.charA;
    winnerEl.classList.remove('bigPull', 'stumble');
    loserEl.classList.remove('bigPull', 'stumble');
    winnerEl.classList.add('victory');
    loserEl.classList.add('defeated');
  }

  function showScreen(name) {
    el.settingsScreen.hidden = name !== 'settings';
    el.gameScreen.hidden = name !== 'game';
    el.gameOverScreen.hidden = name !== 'gameover';
    el.soloScreen.hidden = name !== 'solo';
  }

  function setDictStatus(text, ready) {
    el.dictStatus.textContent = text;
    el.startBtn.disabled = !ready;
  }

  // 團隊模式跟一人模式各有自己的計時徽章,共用同一套倒數邏輯,用參數指定
  // 要更新哪一組 DOM 元素,不用兩邊各寫一份幾乎一樣的 requestAnimationFrame 迴圈。
  let timerRAF = null;
  function startTimerBar(seconds, badgeEl = el.timerBadge, numEl = el.timerNum) {
    cancelAnimationFrame(timerRAF);
    const start = performance.now();
    const durationMs = seconds * 1000;
    badgeEl.classList.remove('timerLow');
    function tick(now) {
      const remaining = Math.max(0, durationMs - (now - start));
      const remainingSec = Math.ceil(remaining / 1000);
      numEl.textContent = remainingSec;
      badgeEl.classList.toggle('timerLow', remaining / durationMs < 0.25);
      if (remaining > 0) timerRAF = requestAnimationFrame(tick);
    }
    timerRAF = requestAnimationFrame(tick);
  }
  function stopTimerBar() {
    cancelAnimationFrame(timerRAF);
  }
  function startSoloTimerBar(seconds) {
    startTimerBar(seconds, el.soloTimerBadge, el.soloTimerNum);
  }

  // 拔河繩結沿著 charA(左,x=95) <-> charB(右,x=305) 之間滑動。
  // A 領先時繩結要往 A 那側(左邊)靠,不是往 B 那側 —— pct 越小代表越靠左。
  const ROPE_LEFT_X = 95, ROPE_RIGHT_X = 305, ROPE_Y = 78;
  function renderRope(scores, targetScore) {
    const diff = scores.A - scores.B;
    const pct = Math.max(0, Math.min(100, 50 - (diff / targetScore) * 50));
    const x = ROPE_LEFT_X + (pct / 100) * (ROPE_RIGHT_X - ROPE_LEFT_X);
    el.ropeKnot.style.transform = `translate(${x}px, ${ROPE_Y}px)`;
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

  // 題目要 render 成文字、emoji、完整照片還是人骨局部裁圖,團隊模式跟一人
  // 模式共用同一套判斷邏輯(依 q.promptType),避免兩邊各寫一份。
  function renderPrompt(labelEl, textEl, q) {
    labelEl.textContent = q.promptLabel;
    if (q.promptType === 'image') {
      textEl.classList.remove('emojiPrompt');
      textEl.innerHTML = '';
      const img = document.createElement('img');
      img.src = q.prompt;
      img.alt = '';
      img.className = 'animalPhoto';
      textEl.appendChild(img);
    } else if (q.promptType === 'crop') {
      // 骨頭題目:同一張人骨圖裁不同部位,用 background-position/-size
      // 顯示局部特寫,而不是整張圖縮小(那樣會看不清楚細節)。
      textEl.classList.remove('emojiPrompt');
      textEl.innerHTML = '';
      const crop = document.createElement('div');
      crop.className = 'animalPhoto boneCrop';
      crop.style.backgroundImage = `url('${q.prompt}')`;
      if (q.cropStyle) {
        crop.style.backgroundSize = q.cropStyle.backgroundSize;
        crop.style.backgroundPosition = q.cropStyle.backgroundPosition;
      }
      textEl.appendChild(crop);
    } else {
      textEl.textContent = q.prompt;
      textEl.classList.toggle('emojiPrompt', q.promptType === 'emoji');
    }
  }

  function render(state, settings) {
    el.panelAName.textContent = settings.teamNames.A;
    el.panelBName.textContent = settings.teamNames.B;
    el.panelAScore.textContent = `${state.scores.A} / ${settings.targetScore}`;
    el.panelBScore.textContent = `${state.scores.B} / ${settings.targetScore}`;
    renderRope(state.scores, settings.targetScore);

    document.querySelectorAll('.sidePanel').forEach(p => p.classList.remove('active'));
    if (state.phase === 'answer') {
      $(state.activeTeam === 'A' ? 'panelA' : 'panelB').classList.add('active');
    }

    el.statusLine.textContent = statusText(state, settings);

    const q = state.currentQuestion;
    if (q) {
      renderPrompt(el.promptLabel, el.promptText, q);
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
      if (r.correct) pulseTug(r.team);
    }

    if (state.phase === 'gameover') {
      celebrateTug(state.winner);
    }
  }

  function showGameOver(state, settings) {
    const name = state.winner === 'A' ? settings.teamNames.A : settings.teamNames.B;
    el.winnerText.textContent = `${name} 獲勝!`;
    showScreen('gameover');
  }

  function soloStatusText(state) {
    if (state.phase !== 'result') return '選一個答案吧!';
    const r = state.lastResult;
    if (r.timeup) return '時間到!';
    return r.correct ? '答對了!🎉' : '答錯了,再接再厲';
  }

  function renderSolo(state, settings, cumulativeStats) {
    el.soloStatusLine.textContent = soloStatusText(state);
    const sessionAcc = state.sessionAnswered ? Math.round((state.sessionCorrect / state.sessionAnswered) * 100) : 0;
    el.soloSessionScore.textContent = `本次 ${state.sessionCorrect} / ${state.sessionAnswered}${state.sessionAnswered ? `(${sessionAcc}%)` : ''}`;
    const totalAcc = cumulativeStats.totalAnswered ? Math.round((cumulativeStats.totalCorrect / cumulativeStats.totalAnswered) * 100) : 0;
    el.soloTotalScore.textContent = `累計 ${cumulativeStats.totalCorrect} / ${cumulativeStats.totalAnswered}${cumulativeStats.totalAnswered ? `(${totalAcc}%)` : ''}`;

    const q = state.currentQuestion;
    if (q) {
      renderPrompt(el.soloPromptLabel, el.soloPromptText, q);
      el.soloChoiceBtns.forEach((btn, idx) => {
        btn.querySelector('.choiceText').textContent = q.choices[idx];
        btn.classList.remove('correct', 'wrong');
        btn.disabled = state.phase !== 'answering';
      });
    }

    if (state.phase === 'result' && q) {
      const r = state.lastResult;
      el.soloChoiceBtns[q.correctIndex].classList.add('correct');
      if (!r.timeup && typeof r.index === 'number' && r.index >= 0 && r.index !== q.correctIndex) {
        el.soloChoiceBtns[r.index].classList.add('wrong');
      }
      stopTimerBar();
    }
  }

  return {
    cacheEls, showScreen, setDictStatus, startTimerBar, stopTimerBar, render, showGameOver, resetTug,
    applyGameTypeVisibility, renderSoloStats, startSoloTimerBar, renderSolo,
  };
})();
