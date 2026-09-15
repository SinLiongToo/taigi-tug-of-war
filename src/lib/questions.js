// 出題引擎:讀取 data/questions.js(<script> 標籤載入的全域 TAIGI_QUESTIONS,
// 由 data/build-questions.js 產生),在瀏覽器執行期依「已啟用的模式」與
// 「羅馬字系統(台羅/白話字)」動態組出一題四選一。
//
// 用 <script> 載入而不是 fetch() 讀 JSON,是為了讓雙擊開啟 index.html(file://)
// 也能直接玩,不需要架本機伺服器——瀏覽器的同源限制只擋 fetch/XHR 讀本機檔案,
// 不擋 <script src> 載入本機 .js。
//
// 依賴全域 Romanize(src/lib/romanize.js,未修改的原始複製檔)。
const Questions = (() => {
  let entries = null;
  let bySyllCount = null;

  async function load() {
    if (typeof TAIGI_QUESTIONS === 'undefined') {
      throw new Error('找不到題庫(data/questions.js 沒載入或載入順序不對)');
    }
    const data = TAIGI_QUESTIONS;
    entries = data.entries;
    bySyllCount = new Map();
    for (const e of entries) {
      const n = e.sylls.length;
      if (!bySyllCount.has(n)) bySyllCount.set(n, []);
      bySyllCount.get(n).push(e);
    }
    return { count: entries.length, source: data.source };
  }

  function isReady() {
    return !!entries && entries.length > 0;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function randomEntry(filterFn) {
    if (!filterFn) return entries[Math.floor(Math.random() * entries.length)];
    for (let i = 0; i < 80; i++) {
      const e = entries[Math.floor(Math.random() * entries.length)];
      if (filterFn(e)) return e;
    }
    return entries[Math.floor(Math.random() * entries.length)];
  }

  function shortDef(s) {
    let d = (s || '').trim();
    const firstClause = d.split(/[;;]/)[0].trim();
    if (firstClause) d = firstClause;
    if (d.length > 44) d = d.slice(0, 44) + '…';
    return d;
  }

  function buildChoices(correctLabel, distractors) {
    const options = shuffle([correctLabel, ...distractors]);
    return { options, correctIndex: options.indexOf(correctLabel) };
  }

  function pickDistractorDefs(exclude, correctText, n) {
    const out = [];
    const seen = new Set([correctText]);
    let guard = 0;
    while (out.length < n && guard < 300) {
      guard++;
      const e = entries[Math.floor(Math.random() * entries.length)];
      if (e === exclude) continue;
      const text = shortDef(e.defs[0].def);
      if (seen.has(text)) continue;
      seen.add(text);
      out.push(text);
    }
    return out;
  }

  function pickDistractorHanzi(exclude, correctHanzi, n, preferSyllCount) {
    const out = [];
    const seen = new Set([correctHanzi]);
    const pool = (preferSyllCount && bySyllCount.get(preferSyllCount)) || entries;
    let guard = 0;
    while (out.length < n && guard < 300) {
      guard++;
      const arr = guard < 150 ? pool : entries;
      const e = arr[Math.floor(Math.random() * arr.length)];
      if (e === exclude || seen.has(e.hanzi)) continue;
      seen.add(e.hanzi);
      out.push(e.hanzi);
    }
    return out;
  }

  function renderWord(sylls, system) {
    return system === 'poj' ? Romanize.wordToPojMark(sylls) : Romanize.wordToTailoMark(sylls);
  }

  // ---- 模式一:詞義(題目一律是台語詞,答案選項才是中文意思) ----
  // 刻意只出這個方向,不出「題目是中文釋義、選項是台語詞」的反方向——
  // 題目本身應該永遠是台語,中文只能出現在用來測驗理解程度的答案選項裡。
  function genMeaning(entry) {
    const correctDef = shortDef(entry.defs[0].def);
    const distractors = pickDistractorDefs(entry, correctDef, 3);
    const { options, correctIndex } = buildChoices(correctDef, distractors);
    return { mode: 'meaning', direction: 'word2def', promptLabel: '意思是?', prompt: entry.hanzi, choices: options, correctIndex };
  }

  // ---- 模式二:漢字 <-> 羅馬字 ----
  function genRomanization(entry, direction, system) {
    const correctLabel = renderWord(entry.sylls, system);
    if (direction === 'roman2hanzi') {
      const distractors = pickDistractorHanzi(entry, entry.hanzi, 3, entry.sylls.length);
      const { options, correctIndex } = buildChoices(entry.hanzi, distractors);
      return { mode: 'romanization', direction, promptLabel: '這是漢字?', prompt: correctLabel, choices: options, correctIndex };
    }
    const distractors = [];
    const seen = new Set([correctLabel]);
    const pool = bySyllCount.get(entry.sylls.length) || entries;
    let guard = 0;
    while (distractors.length < 3 && guard < 300) {
      guard++;
      const arr = guard < 150 ? pool : entries;
      const e = arr[Math.floor(Math.random() * arr.length)];
      if (e === entry) continue;
      const label = renderWord(e.sylls, system);
      if (seen.has(label)) continue;
      seen.add(label);
      distractors.push(label);
    }
    const { options, correctIndex } = buildChoices(correctLabel, distractors);
    return { mode: 'romanization', direction, promptLabel: '羅馬字怎麼寫?', prompt: entry.hanzi, choices: options, correctIndex };
  }

  // ---- 模式三:聲調(本調 / 連讀變調) ----
  const REGULAR_TONES = [1, 2, 3, 4, 5, 7, 8];

  function genTone(entry, sub, system) {
    const renderFn = system === 'poj' ? Romanize.toPojMark : Romanize.toTailoMark;
    const first = entry.sylls[0];
    const distractors = [];
    const seen = new Set();
    let correctSkeleton = first.skeleton;
    let correctTone = first.tone;
    let promptLabel;

    if (sub === 'sandhi') {
      const sandhi = Romanize.sandhiTone(first.skeleton, first.tone);
      correctSkeleton = sandhi.skeleton;
      correctTone = sandhi.tone;
      promptLabel = `「${entry.hanzi}」連讀時,第一字要唸做?`;
      const baseLabel = renderFn(first.skeleton, first.tone);
      seen.add(baseLabel);
      distractors.push(baseLabel); // 最常見的誤答:忘記變調、直接唸本調
    } else {
      promptLabel = `「${entry.hanzi}」第一字單獨唸(本調)是?`;
    }

    const correctLabel = renderFn(correctSkeleton, correctTone);
    seen.add(correctLabel);
    for (const t of shuffle(REGULAR_TONES)) {
      if (distractors.length >= 3) break;
      const label = renderFn(first.skeleton, t);
      if (seen.has(label)) continue;
      seen.add(label);
      distractors.push(label);
    }

    const { options, correctIndex } = buildChoices(correctLabel, distractors.slice(0, 3));
    return { mode: 'tone', direction: sub, promptLabel, prompt: entry.hanzi, choices: options, correctIndex };
  }

  function generate(enabledModes, system) {
    const modes = enabledModes && enabledModes.length ? enabledModes : ['meaning'];
    const mode = modes[Math.floor(Math.random() * modes.length)];

    if (mode === 'meaning') {
      const entry = randomEntry();
      return genMeaning(entry);
    }
    if (mode === 'romanization') {
      const entry = randomEntry();
      const direction = Math.random() < 0.5 ? 'hanzi2roman' : 'roman2hanzi';
      return genRomanization(entry, direction, system);
    }
    // tone
    const entry = randomEntry(e => e.sylls.length >= 2);
    const canSandhi = entry.sylls.length >= 2;
    const sub = canSandhi && Math.random() < 0.6 ? 'sandhi' : 'base';
    return genTone(entry, sub, system);
  }

  return { load, isReady, generate };
})();
