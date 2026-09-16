// 把教育部臺灣台語常用詞辭典開放資料(經 g0v/moedict-data-twblg 整理的
// dict-twblg.json + dict-twblg-ext.json 擴充辭典)整理成遊戲用的題庫
// data/questions.js。
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
// 擴充辭典:一樣是 g0v/moedict-data-twblg 專案的資料,跟主辭典是分開的兩個
// 檔案(參考自 project_claude_TTS_SST/dict.js 的做法,它也是 main+ext 兩份
// 合併使用)。扣掉跟主辭典重複的詞,實測多出約 6,100 個全新詞條。
const EXT_SOURCE_PATH = path.join(ROOT, 'data', 'raw', 'dict-twblg-ext.json');
// .js 而不是 .json:用 <script> 標籤載入,瀏覽器在 file:// 底下開頁面也能讀,
// 不像 fetch() 一份本機 JSON 那樣會被瀏覽器的同源限制擋下來,不需要架本機伺服器。
const OUTPUT_PATH = path.join(ROOT, 'data', 'questions.js');
const ROMANIZE_PATH = path.join(ROOT, 'src', 'lib', 'romanize.js');
const SOURCE_URL = 'https://raw.githubusercontent.com/g0v/moedict-data-twblg/master/dict-twblg.json';
const EXT_SOURCE_URL = 'https://raw.githubusercontent.com/g0v/moedict-data-twblg/master/dict-twblg-ext.json';

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

// ---- 年級難易度估算(國小/國中/高中/大學) ----
// 這一段不是查表來的,是 Claude(LLM)自己判斷的近似分級,不是教育部或任何
// 官方機構的正式分級資料——已跟使用者確認過,教育部辭典本身沒有難易度欄位,
// 唯一查得到的官方分級來源(國家教育研究院台語教科書詞彙系統)有分級欄位
// 但被網站介面隱藏、也沒有批次匯出功能,撈不到,所以退而求其次用這套規則。
//
// 判斷邏輯:
//   1. 先查詞是不是在手動整理的「國小常用詞」清單裡,是的話直接算國小,
//      不管字數(避免像「阿公」「食飯」這種兩三字的基礎詞被字數規則誤判)。
//   2. 否則看釋義文字有沒有專業/書面語關鍵字,有的話拉高一級(最高到大學)。
//   3. 最後用字數當基礎訊號:1字國小、2字國中、3字高中、4字大學。
// 這只是概略分類,不保證每個詞都準,使用者可以直接改這裡的清單微調。
const LEVEL_ORDER = ['elementary', 'junior', 'senior', 'university'];
const LEVEL_LABEL = { elementary: '國小', junior: '國中', senior: '高中', university: '大學' };

const ELEMENTARY_WORDS = new Set([
  // 家人稱謂
  '阿公', '阿媽', '阿爸', '阿母', '爸爸', '媽媽', '兄哥', '阿兄', '阿姊', '小妹', '小弟', '序大人',
  // 身體部位
  '目睭', '嘴齒', '鼻仔', '耳仔', '手指頭', '跤指頭', '頭毛', '喙', '手股', '跤脊骿',
  // 日常動作/招呼
  '食飯', '洗身軀', '睏覺', '款行李', '起床', '歇睏', '恁好', '多謝', '歹勢', '拜託', '再會',
  // 學校生活
  '老師', '學生', '同學', '學校', '冊包', '鉛筆', '椅仔', '桌仔', '運動埕',
  // 食物
  '西瓜', '芎蕉', '柑仔', '菜脯', '飯丸', '便當', '冰枝', '滷肉飯', '麭', '牛奶',
  // 交通工具
  '跤踏車', '公車', '火車', '飛行機', '計程車',
  // 天氣/自然
  '天頂', '月娘', '日頭', '海邊', '公園', '落雨', '好天',
  // 顏色
  '紅色', '黃色', '青色', '白色', '烏色',
  // 家居用品
  '電視', '電火', '冰箱', '雨傘', '眠床',
]);

// 出現這些關鍵字代表釋義比較專業/書面/正式,拉高難易度。
const DEFINITION_UNIVERSITY_KEYWORDS = [
  '學名', '生物學', '化學', '物理學', '醫學', '解剖', '藥理', '病理',
  '植物學', '動物學', '礦物學', '地質學', '天文學', '哲學', '心理學',
  '法律用語', '法律名詞', '宗教', '佛教', '道教', '基督教',
  '文言', '書面語', '雅稱', '謙稱', '敬稱', '學術', '專有名詞', '術語',
];
const DEFINITION_SENIOR_KEYWORDS = [
  '正式', '書面', '比喻', '轉指', '引申', '古稱', '舊稱', '尊稱',
];

function maxLevel(a, b) {
  return LEVEL_ORDER.indexOf(a) >= LEVEL_ORDER.indexOf(b) ? a : b;
}

function levelByLength(len) {
  if (len <= 1) return 'elementary';
  if (len === 2) return 'junior';
  if (len === 3) return 'senior';
  return 'university';
}

function classifyLevel(hanzi, defText) {
  if (ELEMENTARY_WORDS.has(hanzi)) return 'elementary';
  let level = levelByLength(hanzi.length);
  if (DEFINITION_UNIVERSITY_KEYWORDS.some(kw => defText.includes(kw))) {
    level = maxLevel(level, 'university');
  } else if (DEFINITION_SENIOR_KEYWORDS.some(kw => defText.includes(kw))) {
    level = maxLevel(level, 'senior');
  }
  return level;
}

// 處理一批原始辭典詞條(main 或 ext 都用這支),邊處理邊累加進共用的
// entries/seenHanzi/stats,讓兩個來源檔案用同一套篩選規則、同一份查重集合
// (先處理的來源優先——main 先跑,ext 裡跟 main 重複的詞會被 seenHanzi 擋掉)。
function processItems(items, Romanize, seenHanzi, entries, stats) {
  for (const item of items) {
    const hanzi = (item.title || '').trim();
    if (!hanzi || hanzi.length > MAX_HANZI_LEN || !HANZI_ONLY.test(hanzi)) {
      stats.skippedLength++;
      continue;
    }
    if (seenHanzi.has(hanzi)) { stats.skippedDup++; continue; }
    const heteronym = (item.heteronyms || [])[0];
    if (!heteronym || !heteronym.trs) { stats.skippedParse++; continue; }

    // 來源資料裡常見兩種 romanize.js 原生不處理的寫法,在這裡(建置腳本)先
    // 正規化,不去動 romanize.js 本身:
    //  1. 多種唸法用 "/" 分隔(如 "tsi̍t-puànn-ji̍t-á/tsi̍t-puànn-li̍t-á")-> 取第一種。
    //  2. 片語式詞條音節間用空白分隔而非連字號(如 "tsi̍t kháu tsàu")-> 空白視同連字號。
    //     這是簡化:跨空白的連讀變調分組跟真實語感不一定完全一致,但對這款
    //     猜詞遊戲已經足夠堪用,見 README 的已知限制說明。
    const trsNormalized = heteronym.trs.split('/')[0].trim().replace(/\s+/g, '-');
    const sylls = Romanize.parseWord(trsNormalized);
    if (!sylls) { stats.skippedParse++; continue; }

    const defs = (heteronym.definitions || [])
      .map(d => ({ pos: (d.type || '').trim(), def: (d.def || '').trim() }))
      .filter(d => d.def)
      .slice(0, 2);
    if (!defs.length) { stats.skippedNoDef++; continue; }

    seenHanzi.add(hanzi);
    const level = classifyLevel(hanzi, defs.map(d => d.def).join(' '));
    entries.push({
      id: entries.length,
      hanzi,
      sylls: sylls.map(s => ({ skeleton: s.skeleton, tone: s.tone, neutral: !!s.neutral })),
      defs,
      level,
    });
  }
}

function main() {
  const Romanize = loadRomanize();

  if (!fs.existsSync(SOURCE_PATH)) {
    console.error(`找不到來源檔案: ${SOURCE_PATH}`);
    console.error(`請先下載: curl -L -o data/raw/dict-twblg.json ${SOURCE_URL}`);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));
  console.log(`主辭典詞條數: ${raw.length}`);

  let extRaw = [];
  if (fs.existsSync(EXT_SOURCE_PATH)) {
    extRaw = JSON.parse(fs.readFileSync(EXT_SOURCE_PATH, 'utf8'));
    console.log(`擴充辭典詞條數: ${extRaw.length}`);
  } else {
    console.warn(`找不到擴充辭典(略過,題庫會比較少): ${EXT_SOURCE_PATH}`);
    console.warn(`可以下載: curl -L -o data/raw/dict-twblg-ext.json ${EXT_SOURCE_URL}`);
  }

  const seenHanzi = new Set();
  const entries = [];
  const stats = { skippedLength: 0, skippedParse: 0, skippedNoDef: 0, skippedDup: 0 };

  processItems(raw, Romanize, seenHanzi, entries, stats);
  processItems(extRaw, Romanize, seenHanzi, entries, stats);

  console.log(`略過(長度/非漢字): ${stats.skippedLength}`);
  console.log(`略過(重複詞): ${stats.skippedDup}`);
  console.log(`略過(羅馬字無法解析): ${stats.skippedParse}`);
  console.log(`略過(無中文釋義): ${stats.skippedNoDef}`);
  console.log(`最終題庫詞數: ${entries.length}`);

  const toneEligible = entries.filter(e => e.sylls.length >= 2).length;
  console.log(`可出「聲調模式」(雙音節以上)的詞數: ${toneEligible}`);

  console.log('難易度分佈(LLM 主觀判斷,非官方資料):');
  for (const lv of LEVEL_ORDER) {
    const n = entries.filter(e => e.level === lv).length;
    console.log(`  ${LEVEL_LABEL[lv]}(${lv}): ${n}`);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    source: {
      name: 'g0v/moedict-data-twblg (教育部臺灣台語常用詞辭典開放資料,主辭典+擴充辭典)',
      url: SOURCE_URL,
      extUrl: EXT_SOURCE_URL,
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
