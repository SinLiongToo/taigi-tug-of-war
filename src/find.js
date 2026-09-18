// 台語辭典查詢頁面(find.html)專用,獨立於搶答拔河遊戲的邏輯之外——只依賴
// data/questions.js 的 TAIGI_QUESTIONS 全域跟 src/lib/romanize.js 的 Romanize
// 全域,不載入 src/lib/questions.js(那支是搶答拔河遊戲的出題引擎,這頁用
// 不到)。查詢邏輯:
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
const Find = (() => {
  let index = null; // [{ entry, key, skeletonKey }]

  function buildIndex() {
    index = TAIGI_QUESTIONS.entries.map((entry) => ({
      entry,
      key: Romanize.wordToKey(entry.sylls),
      skeletonKey: entry.sylls.map((s) => s.skeleton).join('-'),
    }));
  }

  function isHanRequest(q) {
    return /[一-鿿㐀-䶿]/.test(q);
  }

  function stripDiacritics(s) {
    return s.normalize('NFD').replace(/[̀-ͯ͘ⁿ]/g, '').toLowerCase();
  }

  // 中文/漢字查詢:同一個輸入同時比對「台語漢字本身」(完全符合優先、再來是
  // 部分符合)跟「中文釋義文字裡有沒有出現這個字串」,三組結果分開回傳,
  // 畫面上分成三個區塊顯示,不強迫使用者只能查到其中一種。
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
    return { type: 'hanzi', exact, partial, defMatch };
  }

  // 羅馬字查詢:白話字/台羅、有調號沒調號都接受,見檔案開頭註解。
  function searchRoman(q) {
    const normalized = q.trim().replace(/\s+/g, '-');
    const parsed = Romanize.parseWord(normalized);
    const exact = [];
    const toneless = [];
    const fuzzy = [];

    if (parsed) {
      const qKey = Romanize.wordToKey(parsed);
      const qSkeleton = parsed.map((p) => p.skeleton).join('-');
      for (const row of index) {
        if (row.key === qKey) exact.push(row.entry);
        else if (row.skeletonKey === qSkeleton) toneless.push(row.entry);
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

    return { type: 'roman', exact, toneless, fuzzy, parsedOk: !!parsed };
  }

  function search(q) {
    q = (q || '').trim();
    if (!q) return null;
    if (!index) buildIndex();
    return isHanRequest(q) ? searchHanzi(q) : searchRoman(q);
  }

  return { search };
})();
