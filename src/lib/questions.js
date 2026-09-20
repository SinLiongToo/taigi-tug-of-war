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
  let animalPool = null;
  let bodyPool = null;
  let placePool = null;
  let plantPool = null;
  let vehiclePool = null;

  // 「動物/身體部位/植物/工程車/地名」五個模式的詞庫資料本身搬到
  // src/lib/curated-words.js(全域 CURATED_WORDS),原因見那支檔案開頭
  // 的註解——find.html 需要用到但不想連出題引擎一起載入。

  async function load() {
    if (typeof TAIGI_QUESTIONS === 'undefined') {
      throw new Error('找不到題庫(data/questions.js 沒載入或載入順序不對)');
    }
    const data = TAIGI_QUESTIONS;
    entries = data.entries;
    bySyllCount = new Map();
    const byHanzi = new Map();
    for (const e of entries) {
      const n = e.sylls.length;
      if (!bySyllCount.has(n)) bySyllCount.set(n, []);
      bySyllCount.get(n).push(e);
      if (!byHanzi.has(e.hanzi)) byHanzi.set(e.hanzi, e);
    }
    // 圖片題庫(動物/身體部位/植物)共用的組池邏輯:優先查辭典,辭典沒有
    // 但清單本身帶了 `poj`(例如人骨圖上有、辭典沒收錄的骨頭名)才退而求其次
    // 直接 parse 那個羅馬字——來源不是辭典,見各清單上方註解與 README。
    function buildPicturePool(words) {
      return words
        .map(a => {
          let entry = byHanzi.get(a.hanzi);
          if (!entry && a.poj) {
            const sylls = Romanize.parseWord(a.poj.replace(/\s+/g, '-'));
            if (sylls) entry = { hanzi: a.hanzi, sylls: sylls.map(s => ({ skeleton: s.skeleton, tone: s.tone, neutral: !!s.neutral })) };
          }
          return { type: a.type, value: a.value, region: a.region, entry };
        })
        .filter(a => a.entry);
    }
    animalPool = buildPicturePool(CURATED_WORDS.animal);
    bodyPool = buildPicturePool(CURATED_WORDS.body);
    plantPool = buildPicturePool(CURATED_WORDS.plant);
    vehiclePool = buildPicturePool(CURATED_WORDS.vehicle);
    // CURATED_WORDS.place 的羅馬字不是辭典查來的,要自己 parse 成 skeleton/tone
    // (跟 build-questions.js 對一般辭典詞條做的事一樣),parse 失敗的直接跳過。
    placePool = CURATED_WORDS.place
      .map(p => {
        const sylls = Romanize.parseWord(p.poj.replace(/\s+/g, '-'));
        return sylls ? { hanzi: p.hanzi, sylls: sylls.map(s => ({ skeleton: s.skeleton, tone: s.tone, neutral: !!s.neutral })) } : null;
      })
      .filter(Boolean);
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

  function randomEntry(pool, filterFn) {
    if (!filterFn) return pool[Math.floor(Math.random() * pool.length)];
    for (let i = 0; i < 80; i++) {
      const e = pool[Math.floor(Math.random() * pool.length)];
      if (filterFn(e)) return e;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // 依「已勾選的年級難易度」篩出候選詞池。level 是 build-questions.js 裡
  // classifyLevel() 估算出來的近似分級(LLM 主觀判斷,非官方資料),見 README。
  // 篩選只影響「題目本身考哪個詞」,干擾選項還是從全部詞庫挑,詳見程式註解。
  function levelPool(levels) {
    if (!levels || !levels.length) return entries;
    const set = new Set(levels);
    const filtered = entries.filter(e => set.has(e.level));
    return filtered.length ? filtered : entries;
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

  // ---- 共用:「題目是emoji或照片,答案選漢字或羅馬字」的出題邏輯 ----
  // 動物、身體部位都是這個形狀的題庫(見 CURATED_WORDS.animal/.body),抽出來
  // 共用,避免兩份幾乎一樣的程式碼。
  function genFromPicturePool(pool, mode, direction, toRoman, labels, system) {
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const entry = pick.entry;
    const others = pool.filter(a => a.entry !== entry);
    // 'crop' 類題目(目前只有身體部位的骨頭)要另外帶裁圖用的 CSS 座標。
    const cropStyle = pick.type === 'crop' ? CURATED_WORDS.boneCrops[pick.region] : undefined;

    if (toRoman) {
      const correctLabel = renderWord(entry.sylls, system);
      const distractors = [];
      const seen = new Set([correctLabel]);
      for (const a of shuffle(others)) {
        if (distractors.length >= 3) break;
        const label = renderWord(a.entry.sylls, system);
        if (seen.has(label)) continue;
        seen.add(label);
        distractors.push(label);
      }
      const { options, correctIndex } = buildChoices(correctLabel, distractors);
      return { mode, direction, promptLabel: labels.toRoman, prompt: pick.value, promptType: pick.type, cropStyle, choices: options, correctIndex };
    }

    const distractors = [];
    const seen = new Set([entry.hanzi]);
    for (const a of shuffle(others)) {
      if (distractors.length >= 3) break;
      if (seen.has(a.entry.hanzi)) continue;
      seen.add(a.entry.hanzi);
      distractors.push(a.entry.hanzi);
    }
    const { options, correctIndex } = buildChoices(entry.hanzi, distractors);
    return { mode, direction, promptLabel: labels.toHanzi, prompt: pick.value, promptType: pick.type, cropStyle, choices: options, correctIndex };
  }

  const PICTURE_LABELS = { toRoman: '台語按怎唸?', toHanzi: '台語漢字按怎寫?' };

  // ---- 模式:動物(題目是emoji或照片,答案選漢字或羅馬字) ----
  function genAnimal(direction, system) {
    return genFromPicturePool(animalPool, 'animal', direction, direction === 'animal2roman', PICTURE_LABELS, system);
  }

  // ---- 模式:身體部位(題目是emoji,答案選漢字或羅馬字) ----
  function genBody(direction, system) {
    return genFromPicturePool(bodyPool, 'body', direction, direction === 'body2roman', PICTURE_LABELS, system);
  }

  // ---- 模式:樹仔/草仔(題目是emoji或照片,答案選漢字或羅馬字) ----
  function genPlant(direction, system) {
    return genFromPicturePool(plantPool, 'plant', direction, direction === 'plant2roman', PICTURE_LABELS, system);
  }

  // ---- 模式:工程車(題目是照片,答案選漢字或羅馬字) ----
  function genVehicle(direction, system) {
    return genFromPicturePool(vehiclePool, 'vehicle', direction, direction === 'vehicle2roman', PICTURE_LABELS, system);
  }

  // ---- 模式:地名/溪流(題目是台語漢字或羅馬字文字,不是emoji/照片) ----
  function genPlace(direction, system) {
    const pick = placePool[Math.floor(Math.random() * placePool.length)];
    const others = placePool.filter(p => p !== pick);

    if (direction === 'place2roman') {
      const correctLabel = renderWord(pick.sylls, system);
      const distractors = [];
      const seen = new Set([correctLabel]);
      for (const p of shuffle(others)) {
        if (distractors.length >= 3) break;
        const label = renderWord(p.sylls, system);
        if (seen.has(label)) continue;
        seen.add(label);
        distractors.push(label);
      }
      const { options, correctIndex } = buildChoices(correctLabel, distractors);
      return { mode: 'place', direction, promptLabel: '台語按怎唸?', prompt: pick.hanzi, choices: options, correctIndex };
    }

    const distractors = [];
    const seen = new Set([pick.hanzi]);
    for (const p of shuffle(others)) {
      if (distractors.length >= 3) break;
      if (seen.has(p.hanzi)) continue;
      seen.add(p.hanzi);
      distractors.push(p.hanzi);
    }
    const { options, correctIndex } = buildChoices(pick.hanzi, distractors);
    const correctLabel = renderWord(pick.sylls, system);
    return { mode: 'place', direction, promptLabel: '這是佗位?', prompt: correctLabel, choices: options, correctIndex };
  }

  // ---- 模式:九九乘法(傳統乘法歌讀法) ----
  // 不是查辭典來的——辭典只有一~十的單字,沒有「二十」「三十六」這種組合
  // 數字詞。這裡自己刻台語數字組字規則(X十Y)+ 傳統九九乘法歌慣用的文讀音
  // (一it、二jī、八也用正式音pat,不是日常口語的tsi̍t/nn̄g/peh)。逐字報數
  // 不套用連讀變調,跟報電話號碼一樣一字一字唸原本的本調。
  const NUM_READINGS = {
    1: { skeleton: 'it', tone: 4 },
    2: { skeleton: 'ji', tone: 7 },
    3: { skeleton: 'sam', tone: 1 },
    4: { skeleton: 'su', tone: 3 },
    5: { skeleton: 'ngoo', tone: 2 },
    6: { skeleton: 'liok', tone: 8 },
    7: { skeleton: 'tshit', tone: 4 },
    8: { skeleton: 'pat', tone: 4 },
    9: { skeleton: 'kiu', tone: 2 },
  };
  const TEN_READING = { skeleton: 'sip', tone: 8 };

  function numberToSylls(n) {
    if (n <= 9) return [NUM_READINGS[n]];
    if (n === 10) return [TEN_READING];
    const tens = Math.floor(n / 10), ones = n % 10;
    const sylls = [];
    if (tens > 1) sylls.push(NUM_READINGS[tens]);
    sylls.push(TEN_READING);
    if (ones > 0) sylls.push(NUM_READINGS[ones]);
    return sylls;
  }

  function renderNumber(n, system) {
    const renderFn = system === 'poj' ? Romanize.toPojMark : Romanize.toTailoMark;
    return numberToSylls(n).map(s => renderFn(s.skeleton, s.tone)).join('-');
  }

  function genMultiplication(system) {
    const a = 1 + Math.floor(Math.random() * 9);
    const b = 1 + Math.floor(Math.random() * 9);
    const correct = a * b;
    const correctLabel = renderNumber(correct, system);

    const candidates = new Set();
    const addCand = (n) => { if (n >= 1 && n <= 81 && n !== correct) candidates.add(n); };
    addCand(a * (b - 1)); addCand(a * (b + 1));
    addCand((a - 1) * b); addCand((a + 1) * b);
    addCand(correct - a); addCand(correct + a);
    addCand(correct - b); addCand(correct + b);

    const distractorNums = shuffle([...candidates]).slice(0, 3);
    while (distractorNums.length < 3) {
      const n = 1 + Math.floor(Math.random() * 81);
      if (n !== correct && !distractorNums.includes(n)) distractorNums.push(n);
    }
    const distractors = distractorNums.map(n => renderNumber(n, system));
    const { options, correctIndex } = buildChoices(correctLabel, distractors);
    return {
      mode: 'multiplication', direction: 'guess-product',
      promptLabel: '用台語唸出答案:', prompt: `${a} × ${b} = ?`,
      choices: options, correctIndex,
    };
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

  function generate(enabledModes, system, levels) {
    const modes = enabledModes && enabledModes.length ? enabledModes : ['meaning'];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const pool = levelPool(levels);

    if (mode === 'meaning') {
      const entry = randomEntry(pool);
      return genMeaning(entry);
    }
    if (mode === 'romanization') {
      const entry = randomEntry(pool);
      const direction = Math.random() < 0.5 ? 'hanzi2roman' : 'roman2hanzi';
      return genRomanization(entry, direction, system);
    }
    if ((mode === 'animal-hanzi' || mode === 'animal-roman') && animalPool && animalPool.length >= 4) {
      const direction = mode === 'animal-roman' ? 'animal2roman' : 'animal2hanzi';
      return genAnimal(direction, system);
    }
    if ((mode === 'body-hanzi' || mode === 'body-roman') && bodyPool && bodyPool.length >= 4) {
      const direction = mode === 'body-roman' ? 'body2roman' : 'body2hanzi';
      return genBody(direction, system);
    }
    if (mode === 'place' && placePool && placePool.length >= 4) {
      const direction = Math.random() < 0.5 ? 'place2hanzi' : 'place2roman';
      return genPlace(direction, system);
    }
    if ((mode === 'plant-hanzi' || mode === 'plant-roman') && plantPool && plantPool.length >= 4) {
      const direction = mode === 'plant-roman' ? 'plant2roman' : 'plant2hanzi';
      return genPlant(direction, system);
    }
    if ((mode === 'vehicle-hanzi' || mode === 'vehicle-roman') && vehiclePool && vehiclePool.length >= 4) {
      const direction = mode === 'vehicle-roman' ? 'vehicle2roman' : 'vehicle2hanzi';
      return genVehicle(direction, system);
    }
    if (mode === 'multiplication') {
      return genMultiplication(system);
    }
    // tone(年級篩選 + 至少雙音節才能出連讀變調子題)
    const entry = randomEntry(pool, e => e.sylls.length >= 2);
    const canSandhi = entry.sylls.length >= 2;
    const sub = canSandhi && Math.random() < 0.6 ? 'sandhi' : 'base';
    return genTone(entry, sub, system);
  }

  return { load, isReady, generate };
})();
