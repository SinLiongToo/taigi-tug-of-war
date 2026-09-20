// 台語辭典查詢頁面(find.html)專用,獨立於搶答拔河遊戲的出題邏輯之外——依賴
// data/questions.js 的 TAIGI_QUESTIONS 全域、src/lib/romanize.js 的 Romanize
// 全域,以及 src/lib/curated-words.js 的 CURATED_WORDS 全域(不載入
// src/lib/questions.js 本身,那支才是出題引擎,這頁用不到)。查詢邏輯:
//   - 輸入含漢字(中日韓統一表意文字)-> 當作「台語漢字」或「中文意思關鍵字」
//     查,兩種都查、分開列出,因為單看字面沒辦法百分之百分辨使用者是要
//     查漢字本身還是查中文意思。
//   - 輸入不含漢字(拉丁字母)-> 用 Romanize.parseWord() 解析成音節骨架+調號,
//     這支函式本來就同時吃白話字/台羅兩種拼法、變音標或數字調都可以(見
//     romanize.js 開頭的註解),解析成功就用 Romanize.wordToKey() 算出跟
//     辭典建索引時同一套 key 直接比對,不需要每筆辭典資料都預先轉成兩種
//     拼法字串再逐一比對字串。找不到完全符合調號的才退而求其次比對「骨架
//     相同、不管調號」,再找不到才對原始字串做寬鬆的去變音符號比對(处理
//     使用者輸入不合法音節字串,例如打錯字或打注音的情況)。
//
// 2026-09-20 新增:除了教育部辭典本身(TAIGI_QUESTIONS.entries),也把
// 「動物/身體部位/植物/工程車/地名」五個出題模式裡、辭典查不到、只做過
// Romanize.parseWord() 格式驗證的詞(CURATED_WORDS)一併收進一個獨立的
// 「curated」索引,讓這些詞在這裡也查得到——見 buildCuratedIndex() 的
// 說明。辭典本身查得到的詞(不管是不是也被某個出題模式借去當俗稱用,例如
// 山貓/干樂/田螺/塗龍)已經在主索引裡,不會重複建立 curated 條目。
const Find = (() => {
  let index = null; // [{ entry, key, skeletonKey }]
  let curatedIndex = null; // [{ hanzi, sylls, key, skeletonKey, modes: Set, poj }]

  const MODE_LABEL = { animal: '動物', body: '身體部位', plant: '植物', vehicle: '工程車', place: '地名/溪流' };

  function buildIndex() {
    index = TAIGI_QUESTIONS.entries.map((entry) => ({
      entry,
      key: Romanize.wordToKey(entry.sylls),
      skeletonKey: entry.sylls.map((s) => s.skeleton).join('-'),
    }));
  }

  // 「動物/身體部位/植物/工程車」四個模式優先用辭典讀音(byHanzi 查得到就
  // 不需要另外建 curated 條目,主索引本來就找得到);只有辭典查不到、退而
  // 求其次用清單自己的 `poj` 的詞,才需要在這裡另外建一份索引。「地名/溪流」
  // 模式則不管辭典查不查得到都一律用清單自己的 poj(跟 questions.js 的
  // placePool 邏輯一致——地名即使剛好跟某個辭典詞同形,遊戲裡出的題目也是
  // 用地名自己的讀音,不是辭典讀音,查詢頁跟著用同一套讀音才不會兜不起來)。
  function buildCuratedIndex() {
    const byHanzi = new Map();
    for (const e of TAIGI_QUESTIONS.entries) {
      if (!byHanzi.has(e.hanzi)) byHanzi.set(e.hanzi, e);
    }
    const map = new Map();
    function addWord(poolName, hanzi, poj, alwaysAdd) {
      if (!alwaysAdd && byHanzi.has(hanzi)) return;
      if (!poj) return;
      const sylls = Romanize.parseWord(poj.replace(/\s+/g, '-'));
      if (!sylls) return;
      const cleanSylls = sylls.map((s) => ({ skeleton: s.skeleton, tone: s.tone, neutral: !!s.neutral }));
      let rec = map.get(hanzi);
      if (!rec) {
        rec = {
          hanzi,
          sylls: cleanSylls,
          key: Romanize.wordToKey(cleanSylls),
          skeletonKey: cleanSylls.map((s) => s.skeleton).join('-'),
          modes: new Set(),
          poj,
        };
        map.set(hanzi, rec);
      }
      rec.modes.add(poolName);
    }
    for (const w of CURATED_WORDS.animal) addWord('animal', w.hanzi, w.poj, false);
    for (const w of CURATED_WORDS.body) addWord('body', w.hanzi, w.poj, false);
    for (const w of CURATED_WORDS.plant) addWord('plant', w.hanzi, w.poj, false);
    for (const w of CURATED_WORDS.vehicle) addWord('vehicle', w.hanzi, w.poj, false);
    for (const p of CURATED_WORDS.place) addWord('place', p.hanzi, p.poj, true);
    curatedIndex = [...map.values()];
  }

  function isHanRequest(q) {
    return /[一-鿿㐀-䶿]/.test(q);
  }

  function stripDiacritics(s) {
    return s.normalize('NFD').replace(/[̀-ͯ͘ⁿ]/g, '').toLowerCase();
  }

  function modeLabels(modes) {
    return [...modes].map((m) => MODE_LABEL[m] || m).join('、');
  }

  // 中文/漢字查詢:同一個輸入同時比對「台語漢字本身」(完全符合優先、再來是
  // 部分符合)跟「中文釋義文字裡有沒有出現這個字串」,三組結果分開回傳,
  // 畫面上分成三個區塊顯示,不強迫使用者只能查到其中一種。另外也比對一次
  // curated 索引(見 buildCuratedIndex 說明),完全符合的話另外列一區,並
  // 清楚標明「非教育部辭典收錄」。
  function searchHanzi(q) {
    const exact = [];
    const partial = [];
    const defMatch = [];
    for (const row of index) {
      const { entry } = row;
      if (entry.hanzi === q) {
        exact.push(entry);
      } else if (entry.hanzi.includes(q)) {
        partial.push(entry);
      } else if (entry.defs.some((d) => d.def.includes(q))) {
        defMatch.push(entry);
      }
    }
    const curated = curatedIndex.filter((r) => r.hanzi === q);
    return { type: 'hanzi', exact, partial, defMatch, curated };
  }

  // 羅馬字查詢:白話字/台羅、有調號沒調號都接受,見檔案開頭註解。curated
  // 索引一樣走完全符合 -> 骨架符合(不分調號)兩層,不另外做去變音符號模糊
  // 比對(curated 詞量小,模糊比對容易誤配,交給使用者改用漢字查更準)。
  function searchRoman(q) {
    const normalized = q.trim().replace(/\s+/g, '-');
    const parsed = Romanize.parseWord(normalized);
    const exact = [];
    const toneless = [];
    const fuzzy = [];
    const curatedExact = [];
    const curatedToneless = [];

    if (parsed) {
      const qKey = Romanize.wordToKey(parsed);
      const qSkeleton = parsed.map((p) => p.skeleton).join('-');
      for (const row of index) {
        if (row.key === qKey) exact.push(row.entry);
        else if (row.skeletonKey === qSkeleton) toneless.push(row.entry);
      }
      for (const row of curatedIndex) {
        if (row.key === qKey) curatedExact.push(row);
        else if (row.skeletonKey === qSkeleton) curatedToneless.push(row);
      }
    }

    if (exact.length === 0 && toneless.length === 0) {
      const qNorm = stripDiacritics(normalized);
      for (const row of index) {
        const tl = stripDiacritics(Romanize.wordToTailoMark(row.entry.sylls));
        const poj = stripDiacritics(Romanize.wordToPojMark(row.entry.sylls));
        if (tl.includes(qNorm) || poj.includes(qNorm)) fuzzy.push(row.entry);
      }
    }

    return { type: 'roman', exact, toneless, fuzzy, parsedOk: !!parsed, curatedExact, curatedToneless };
  }

  // 「工程車」(VEHICLE_WORDS)跟「動物」(ANIMAL_WORDS)模式裡,各有幾個詞是把
  // 辭典本來就有的漢字借去當另一個意思用,讀音跟辭典一致、但辭典本身的
  // 釋義是完全不同的東西(工程車那 4 個跟英語把 skid loader 暱稱叫
  // "Bobcat" 是同一種構詞方式;動物的「塗龍」則是山椒魚的台語俗稱,辭典
  // 本身收錄的「塗龍」定義是另一種魚——蛇鰻)。這裡查到的是辭典本身的
  // 釋義,沒問題、不是錯誤,但使用者如果是想確認這個借用義,光看辭典釋義
  // 會看不出來,所以額外附註一下,避免誤會成查詢結果錯誤。來源見
  // questions.js 裡 VEHICLE_WORDS/ANIMAL_WORDS 上方對應的說明跟 README
  // 的開發紀錄。
  const BORROWED_HANZI_NOTE = {
    山貓: '這個漢字在工程車俗稱裡也用來指「鏟裝機(skid loader)」,跟英語把同款機具暱稱叫「Bobcat」是同一種構詞方式,跟下面辭典本身的釋義是不同的用法。',
    豬哥牙: '這個漢字在工程車俗稱裡也用來指「堆高機前面放貨的貨叉」,跟下面辭典本身的釋義是不同的用法。',
    干樂: '這個漢字在工程車俗稱裡也用來指「混凝土攪拌車」的暱稱之一,跟下面辭典本身的釋義是不同的用法。',
    田螺: '這個漢字在工程車俗稱裡也用來指「混凝土攪拌車」的另一個暱稱,跟下面辭典本身的釋義是不同的用法。',
    塗龍: '這個漢字在「動物」出題模式裡也用來指瀕危保育類的台灣山椒魚,是使用者提供的保育卡片上的台語俗稱,跟下面辭典本身的釋義(土龍、蛇鰻,一種魚類)是不同的用法。',
  };

  function search(q) {
    q = (q || '').trim();
    if (!q) return null;
    if (!index) buildIndex();
    if (!curatedIndex) buildCuratedIndex();
    return isHanRequest(q) ? searchHanzi(q) : searchRoman(q);
  }

  return { search, BORROWED_HANZI_NOTE, modeLabels };
})();
