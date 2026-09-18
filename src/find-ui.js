// find.html 的畫面渲染跟事件綁定,依賴 src/find.js 的 Find 模組(純查詢邏輯,
// 不碰 DOM,方便用 Node vm 測試)。這支檔案才是真的操作 DOM 的地方。
(function () {
  const LEVEL_LABEL = { elementary: '國小', junior: '國中', senior: '高中', university: '大學' };

  function entryCard(entry) {
    const tailo = Romanize.wordToTailoMark(entry.sylls);
    const poj = Romanize.wordToPojMark(entry.sylls);
    const levelLabel = LEVEL_LABEL[entry.level] || entry.level;
    const defsHtml = entry.defs
      .map((d) => `<li>${d.pos ? `<span class="findDefPos">${escapeHtml(d.pos)}</span>` : ''}${escapeHtml(d.def)}</li>`)
      .join('');
    return `
      <div class="findCard">
        <div class="findCardHanzi">${escapeHtml(entry.hanzi)}</div>
        <div class="findCardRoman">
          <span><span class="findRomanLabel">台羅</span>${escapeHtml(tailo)}</span>
          <span><span class="findRomanLabel">白話字</span>${escapeHtml(poj)}</span>
        </div>
        <ul class="findCardDefs">${defsHtml}</ul>
        <div class="findCardLevel">難易度:${escapeHtml(levelLabel)}(AI 依字數與辭典釋義概略判斷,非官方分級)</div>
      </div>`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function section(title, entries, emptyNote) {
    if (!entries.length) return emptyNote ? `<p class="findSectionEmpty">${emptyNote}</p>` : '';
    const capped = entries.slice(0, 50);
    const more = entries.length > 50 ? `<p class="hint">還有 ${entries.length - 50} 筆,請輸入更精確的關鍵字縮小範圍。</p>` : '';
    return `<h2 class="findSectionTitle">${title}(${entries.length})</h2>${capped.map(entryCard).join('')}${more}`;
  }

  function renderResult(q, result) {
    const el = document.getElementById('findResults');
    if (!result) {
      el.innerHTML = '';
      return;
    }
    if (result.type === 'hanzi') {
      const { exact, partial, defMatch } = result;
      if (!exact.length && !partial.length && !defMatch.length) {
        el.innerHTML = `<p class="findSectionEmpty">查無「${escapeHtml(q)}」,教育部辭典沒有收錄這個漢字或這個中文意思關鍵字。</p>`;
        return;
      }
      el.innerHTML = [
        section('台語漢字完全符合', exact),
        section('台語漢字部分符合', partial),
        section('中文意思裡有出現這個關鍵字', defMatch),
      ].join('');
      return;
    }

    // roman
    const { exact, toneless, fuzzy, parsedOk } = result;
    if (exact.length) {
      el.innerHTML = section('完全符合(含調號)', exact);
      return;
    }
    if (toneless.length) {
      el.innerHTML =
        `<p class="findSectionEmpty">沒有調號完全符合的,以下是同音節、不同調號的詞:</p>` +
        section('同音節(不分調號)', toneless);
      return;
    }
    if (fuzzy.length) {
      el.innerHTML =
        `<p class="findSectionEmpty">沒有精確符合的,以下是羅馬字包含這段文字的詞:</p>` +
        section('羅馬字部分符合', fuzzy);
      return;
    }
    el.innerHTML = `<p class="findSectionEmpty">查無「${escapeHtml(q)}」。${
      parsedOk ? '' : '這個字串沒辦法解析成合法的台語音節,'
    }教育部辭典沒有收錄符合的詞。</p>`;
  }

  function renderMeta() {
    const el = document.getElementById('findMeta');
    const src = TAIGI_QUESTIONS.source || {};
    el.innerHTML = `題庫共 ${TAIGI_QUESTIONS.count} 詞 · 資料來源:` +
      `<a href="${src.url}" target="_blank" rel="noopener">${escapeHtml(src.name || '教育部臺灣台語常用詞辭典開放資料')}</a>`;
  }

  function wireDom() {
    document.getElementById('findForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('findInput').value;
      renderResult(q, Find.search(q));
    });
  }

  function showVersion() {
    const el = document.getElementById('appVersion');
    if (!el || typeof APP_VERSION === 'undefined') return;
    el.textContent = APP_VERSION.updatedAt
      ? `${APP_VERSION.version} · 更新於 ${APP_VERSION.updatedAt}`
      : APP_VERSION.version;
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderMeta();
    wireDom();
    showVersion();
  });
})();
