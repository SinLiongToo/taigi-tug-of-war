// 把教育部臺灣台語常用詞辭典開放資料(經 g0v/moedict-data-twblg 整理的
// dict-twblg.json)整理成遊戲用的題庫 data/questions.json。
//
// 只做「篩選 + 解析 + 留存必要欄位」,實際出題(選項組合、台羅/白話字呈現、
// 變調計算)留到瀏覽器執行期用 src/lib/romanize.js 動態產生,這樣切換
// 台羅/白話字設定不需要重新跑這支腳本。
//
// 用法: node data/build-questions.js
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SOURCE_PATH = path.join(ROOT, 'data', 'raw', 'dict-twblg.json');
// .js 而不是 .json:用 <script> 標籤載入,瀏覽器在 file:// 底下開頁面也能讀,
// 不像 fetch() 一份本機 JSON 那樣會被瀏覽器的同源限制擋下來,不需要架本機伺服器。
const OUTPUT_PATH = path.join(ROOT, 'data', 'questions.js');
const ROMANIZE_PATH = path.join(ROOT, 'src', 'lib', 'romanize.js');
const SOURCE_URL = 'https://raw.githubusercontent.com/g0v/moedict-data-twblg/master/dict-twblg.json';

// romanize.js 是給瀏覽器 <script> 標籤用的全域變數寫法(const Romanize = (()=>{...})()),
// 這裡透過 vm 執行同一份「未修改」的原始碼來取得 Romanize,而不是改寫這個檔案
// 加 module.exports——保持這份 vendored 檔案跟來源逐位元組一致。
function loadRomanize() {
  const src = fs.readFileSync(ROMANIZE_PATH, 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(src + '\nthis.__Romanize = Romanize;', sandbox);
  return sandbox.__Romanize;
}

const HANZI_ONLY = /^[一-鿿ㄅ-ㄩ・．]+$/;
const MAX_HANZI_LEN = 4;

function main() {
  const Romanize = loadRomanize();

  if (!fs.existsSync(SOURCE_PATH)) {
    console.error(`找不到來源檔案: ${SOURCE_PATH}`);
    console.error(`請先下載: curl -L -o data/raw/dict-twblg.json ${SOURCE_URL}`);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));
  console.log(`來源詞條數: ${raw.length}`);

  const seenHanzi = new Set();
  const entries = [];
  let skippedLength = 0, skippedParse = 0, skippedNoDef = 0, skippedDup = 0;

  for (const item of raw) {
    const hanzi = (item.title || '').trim();
    if (!hanzi || hanzi.length > MAX_HANZI_LEN || !HANZI_ONLY.test(hanzi)) {
      skippedLength++;
      continue;
    }
    if (seenHanzi.has(hanzi)) { skippedDup++; continue; }
    const heteronym = (item.heteronyms || [])[0];
    if (!heteronym || !heteronym.trs) { skippedParse++; continue; }

    // 來源資料裡常見兩種 romanize.js 原生不處理的寫法,在這裡(建置腳本)先
    // 正規化,不去動 romanize.js 本身:
    //  1. 多種唸法用 "/" 分隔(如 "tsi̍t-puànn-ji̍t-á/tsi̍t-puànn-li̍t-á")-> 取第一種。
    //  2. 片語式詞條音節間用空白分隔而非連字號(如 "tsi̍t kháu tsàu")-> 空白視同連字號。
    //     這是簡化:跨空白的連讀變調分組跟真實語感不一定完全一致,但對這款
    //     猜詞遊戲已經足夠堪用,見 README 的已知限制說明。
    const trsNormalized = heteronym.trs.split('/')[0].trim().replace(/\s+/g, '-');
    const sylls = Romanize.parseWord(trsNormalized);
    if (!sylls) { skippedParse++; continue; }

    const defs = (heteronym.definitions || [])
      .map(d => ({ pos: (d.type || '').trim(), def: (d.def || '').trim() }))
      .filter(d => d.def)
      .slice(0, 2);
    if (!defs.length) { skippedNoDef++; continue; }

    seenHanzi.add(hanzi);
    entries.push({
      id: entries.length,
      hanzi,
      sylls: sylls.map(s => ({ skeleton: s.skeleton, tone: s.tone, neutral: !!s.neutral })),
      defs,
    });
  }

  console.log(`略過(長度/非漢字): ${skippedLength}`);
  console.log(`略過(重複詞): ${skippedDup}`);
  console.log(`略過(羅馬字無法解析): ${skippedParse}`);
  console.log(`略過(無中文釋義): ${skippedNoDef}`);
  console.log(`最終題庫詞數: ${entries.length}`);

  const toneEligible = entries.filter(e => e.sylls.length >= 2).length;
  console.log(`可出「聲調模式」(雙音節以上)的詞數: ${toneEligible}`);

  const output = {
    generatedAt: new Date().toISOString(),
    source: {
      name: 'g0v/moedict-data-twblg (教育部臺灣台語常用詞辭典開放資料)',
      url: SOURCE_URL,
    },
    count: entries.length,
    entries,
  };
  const js = `// 自動產生,勿手動編輯。重新產生: node data/build-questions.js\nconst TAIGI_QUESTIONS = ${JSON.stringify(output)};\n`;
  fs.writeFileSync(OUTPUT_PATH, js);
  const sizeMb = (fs.statSync(OUTPUT_PATH).size / 1024 / 1024).toFixed(2);
  console.log(`已寫入 ${OUTPUT_PATH} (${sizeMb} MB)`);
}

main();
