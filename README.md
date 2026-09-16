# 台語搶答拔河

兩隊搶答台語語彙題目的拔河遊戲。誰先搶到答題權、答對,拔河繩就往那隊拉一格;
先答對 N 題的隊伍獲勝(N 可在開始畫面設定)。純前端網頁,無框架、無需安裝,
瀏覽器打開就能玩。

**線上玩**: https://sinliongtoo.github.io/taigi-tug-of-war/

## 玩法

1. 開始畫面設定:目標題數 N、每題時限、兩隊隊名、出題模式(可複選=混合出題)、
   羅馬字系統(台羅 / 白話字)。
2. 每題畫面同時顯示題目與四個選項。
3. **搶答**:A隊按 `D`、B隊按 `K`,誰先按誰取得作答權(畫面上的搶答鈕也可以點,適合觸控)。
4. **作答**:取得作答權的隊伍在時限內按 `1`~`4` 選答案。
   - 答對 → 得一分,拔河繩往該隊拉。
   - 答錯 → 換對方隊伍有一次「偷答」機會(不用再搶,直接可以選)。
   - 偷答也答錯,或時間到都沒人成功作答 → 這題作廢,直接出下一題。
5. 任一隊答對數先達到 N → 遊戲結束,顯示獲勝隊伍。

## 出題模式

- **詞義**:題目一律是台語詞(漢字),四個選項是中文意思——題目本身永遠是台語,
  中文只會出現在答案選項裡,不會出「題目是中文、選項是台語詞」的反方向。
- **漢字 ↔ 羅馬字**:看漢字選羅馬字,或看羅馬字選漢字,羅馬字依設定用台羅或白話字呈現。
- **聲調**:專門考聲調,題目與選項都是台語羅馬字,不含中文翻譯。
  - **本調**:詞的第一字單獨唸是第幾聲。
  - **連讀變調**:詞的第一字在連讀時該變成第幾聲(僅雙音節以上的詞才會出這題);
    干擾選項一定包含「忘記變調、直接唸本調」這個最常見的誤答。
- **動物**:題目是一個動物 emoji 或照片(不是中文字),猜這個動物的台語漢字或
  羅馬字。干擾選項也是從動物題庫裡挑的,比較有「猜動物」的主題感。題庫是一份
  精選清單(`src/lib/questions.js` 裡的 `ANIMAL_WORDS`),跟教育部辭典資料
  比對過漢字確實查得到才收錄。
  - 其中 7 種是**台灣野生保育動物照片**(台灣黑熊、梅花鹿、台灣獼猴、長鬃
    山羊、山豬、水獺、飛鼠)。辭典裡沒有「台灣黑熊」「石虎」這種物種專有
    名詞,所以熊/鹿/猴/羊這幾張照片配的是辭典裡真正存在的**通用詞**,用台灣
    特有種的照片示意,不是宣稱該物種有專屬的台語詞;山豬、水獺、飛鼠則是
    辭典裡本來就有、詞跟物種剛好對得上的乾淨案例。照片授權見下方「圖片授權」。

開始畫面可複選多種模式,複選時每題隨機挑一種出題,等於混合模式。

## 執行方式

直接用瀏覽器雙擊開啟 `index.html` 就能玩,不需要架任何伺服器。題庫是用
`<script src="data/questions.js">` 載入(不是 `fetch()` 讀 JSON),瀏覽器的
同源限制不會擋這種本機檔案讀取方式,所以 `file://` 直開也沒問題。

(如果你偏好還是想跑本機伺服器,例如要用瀏覽器開發工具的 network 面板除錯,
一樣可以: `python -m http.server 8000`,再連到 http://localhost:8000。)

## 題庫來源與授權

題庫資料來自教育部《臺灣台語常用詞辭典》開放資料,經
[g0v/moedict-data-twblg](https://github.com/g0v/moedict-data-twblg) 整理成的
`dict-twblg.json`(萌典的資料來源)。使用前請確認該資料集當下的授權條款並保留出處標示。

重新產生題庫:

```bash
curl -L -o data/raw/dict-twblg.json \
  https://raw.githubusercontent.com/g0v/moedict-data-twblg/master/dict-twblg.json
node data/build-questions.js
```

`data/build-questions.js` 會篩選出 1~4 字、羅馬字可正確解析、至少有一則中文釋義的
詞條,輸出成 `data/questions.js`(離線,不需要網路;內容是一份指定給全域變數
`TAIGI_QUESTIONS` 的 JS 檔,遊戲用 `<script>` 標籤直接載入,不是 `fetch()` 讀 JSON)。

## 圖片授權

`data/images/tw-wildlife/` 底下 7 張台灣野生動物照片,全部來自
[Wikimedia Commons](https://commons.wikimedia.org),都是 CC BY 或 CC BY-SA
授權(可自由使用、修改、散布,但要保留出處標示,這裡照著做):

| 檔案 | 動物 | 授權 | 攝影者 | 來源 |
|---|---|---|---|---|
| `bear.jpg` | 台灣黑熊(配「熊」) | CC BY-SA 3.0 | smartneddy | [File:Formosan Black Bear01.jpg](https://commons.wikimedia.org/wiki/File:Formosan_Black_Bear01.jpg) |
| `deer.jpg` | 梅花鹿(配「鹿」) | CC BY-SA 3.0 | 玄史生 | [File:Formosan Sika Deer Rest beside Wall in Taipei Zoo 20131002.jpg](https://commons.wikimedia.org/wiki/File:Formosan_Sika_Deer_Rest_beside_Wall_in_Taipei_Zoo_20131002.jpg) |
| `monkey.jpg` | 台灣獼猴(配「猴」) | CC BY 2.0 | ufoncz | [File:Formosan rock macaque 2013-06-10 01.jpg](https://commons.wikimedia.org/wiki/File:Formosan_rock_macaque_2013-06-10_01.jpg) |
| `goat.jpg` | 長鬃山羊(配「羊」) | CC BY 4.0 | Licheng Shih | [File:Capricornis swinhoei 206048818.jpg](https://commons.wikimedia.org/wiki/File:Capricornis_swinhoei_206048818.jpg) |
| `boar.jpg` | 台灣野豬(配「山豬」) | CC BY-SA 3.0 | Lord Koxinga | [File:2010 07 19400 7206 ... Sus scrofa taivanus.JPG](https://commons.wikimedia.org/wiki/File:2010_07_19400_7206_Wenshan_District,_Taipei,_Zoo,_Sus_scrofa_taivanus,_Formosan_wild_boar,_Taiwan.JPG) |
| `otter.jpg` | 歐亞水獺(配「水獺」) | CC BY 4.0 | Bouke ten Cate | [File:Otter - Eurasian otter - Lutra lutra.jpg](https://commons.wikimedia.org/wiki/File:Otter_-_Eurasian_otter_-_Lutra_lutra.jpg) |
| `flying-squirrel.jpg` | 白面鼯鼠(配「飛鼠」) | CC BY 4.0 | Rejoice Gassah | [File:Petaurista alborufus 114800059.jpg](https://commons.wikimedia.org/wiki/File:Petaurista_alborufus_114800059.jpg) |

這幾張都是 480px 寬的縮圖(從 Commons 的 thumbnail API 抓的),不是原始全解析度檔案,
單張約 50~90KB,適合網頁載入。

**已知限制**:原始資料中少數詞條用空白分隔音節而非連字號(例如片語式的「一口灶」
寫作 `tsi̍t kháu tsàu`),建置腳本會把空白當連字號處理以便解析,但這是簡化寫法,
跨越原本空白的連讀變調分組不保證跟真實語感完全一致。多音詞條若有多種唸法
(用 `/` 分隔),目前只取第一種。

## 台羅/白話字轉換與變調邏輯

[`src/lib/romanize.js`](src/lib/romanize.js) **原封不動複製自** `project_claude_TTS_SST`
專案的同名檔案(未修改任何一行),提供:

- 台羅拼音 ⇄ 白話字(POJ)互轉與調號變音標標示規則。
- 連讀變調(本調 → 變調)規則:標準循環 1→7→3→2→1、第5聲另外分支到7、
  入聲(韻尾 p/t/k)4↔8 對調、喉塞韻尾 `-h` 入聲則去掉 h 變成舒聲(4h→2、8h→3)。

日後若 `project_claude_TTS_SST` 那份原始檔案有更新,可以重新複製覆蓋這份
vendored 檔案,不需要修改遊戲其他程式碼。

## 專案結構

```
index.html                 遊戲頁面(設定/遊戲/結算三個畫面)
src/style.css               樣式
src/main.js                  進入點,串接各模組、管理回合計時器
src/game-state.js            狀態機(搶答/作答/偷答/勝負判定),不碰 DOM
src/keyboard.js              鍵盤搶答/作答輸入
src/ui.js                    畫面渲染(拔河繩、面板、題目卡)
src/settings.js               讀取設定表單
src/lib/romanize.js          台羅/白話字轉換 + 變調邏輯(vendored,未修改)
src/lib/questions.js         出題引擎(讀題庫 + 動態組四選一)
data/raw/                    下載下來的教育部辭典原始資料(不進版控)
data/build-questions.js       題庫建置腳本
data/questions.js            遊戲實際載入的離線題庫(<script> 標籤載入,非 fetch)
```

## 開發紀錄

- 2026-09-16:「動物」模式加入 7 張台灣野生保育動物照片(台灣黑熊、梅花鹿、
  台灣獼猴、長鬃山羊、山豬、水獺、飛鼠),取代原本純 emoji 題目的一部分。
  照片全部從 Wikimedia Commons 找 CC BY / CC BY-SA 授權的圖,下載存進
  `data/images/tw-wildlife/`,授權與攝影者列在「圖片授權」章節。辭典查不到
  「台灣黑熊」「石虎」這種物種專有詞,熊/鹿/猴/羊這四張改成配辭典裡真正
  存在的通用詞,誠實呈現、不假裝有物種專屬台語詞;山豬/水獺/飛鼠則是辭典
  本來就有的乾淨對應。`Questions` 出題引擎新增 `promptType`(`'emoji'` 或
  `'image'`),`ui.js` 依此決定題目要 render 文字還是 `<img>`。
- 2026-09-16:新增「動物」出題模式——題目是動物 emoji,猜台語漢字或羅馬字
  (兩個方向隨機)。動物清單是手動精選、逐一跟題庫資料核對漢字確實存在
  (`src/lib/questions.js` 的 `ANIMAL_WORDS`,共 27 種常見動物),不是用
  詞性或關鍵字自動篩,避免抓到不相關或奇怪的詞條。
- 2026-09-15:兩處調整。(1) 詞義模式改成只出「題目是台語詞、選項才是中文意思」
  這個方向,拿掉原本反方向(題目本身是中文釋義)的出題,因為題目本身理應
  永遠是台語,中文只該出現在測驗理解程度的選項裡。(2) 拔河角色加上動畫:
  待機時雙方持續掙扎搖晃(角色錯開時間,看起來像輪流較量)、答對時獲勝隊伍
  用力一拉、另一隊踉蹌,遊戲結束時獲勝隊伍歡呼跳動、落敗隊伍癱倒。角色還是
  用 SVG 畫,但透過 CSS keyframes 動畫讓畫面更生動;技術上是把角色的定位
  transform 跟動畫用的旋轉 transform 拆到兩層 `<g>`,避免 CSS 動畫蓋掉原本
  的座標定位。
- 2026-09-15:遊戲畫面改版,參考市面上拔河類教育遊戲(edugames.uz 的
  Tug of War: Mathematics)的版面概念——左右分邊配色的隊伍面板 + 中間插畫
  拔河場景 + 大顆計時徽章,但**搶答/偷答機制維持不變**,只換視覺呈現(角色
  插畫是自己畫的簡單火柴人 SVG,不是複製對方的美術素材)。順手修正一個潛在
  bug:拔河繩結原本在某隊領先時會往「錯的方向」滑(滑向落後那隊的顏色區),
  現在改成正確地往領先隊伍那側靠。
- 2026-09-15:題庫改成用 `<script src="data/questions.js">` 載入(原本是
  `fetch('data/questions.json')`)。原因:`fetch()` 讀本機檔案在 `file://`
  底下會被瀏覽器同源限制擋下來(「Failed to fetch」),使用者不能直接雙擊
  `index.html` 玩,得知道要架本機伺服器才行——但 `<script src>` 本來就不受
  這個限制,改用它之後雙擊開啟就能直接玩,不需要伺服器,也更符合這個專案
  「純前端、無需安裝」的定位。
- 2026-09-15:加上右上角深色/淺色模式切換鈕(記在 localStorage,預設跟隨系統),
  補強手機寬度(375px)下的版面(隊伍面板、按鈕、標題字級)。
- 2026-09-15:初版完成。四種出題模式(詞義/漢字羅馬字/聲調/混合)、單畫面鍵盤
  搶答拔河、可設定目標題數與每題時限。題庫從 g0v/moedict-data-twblg 篩選出
  13,876 詞(其中 11,470 詞可出聲調模式)。台羅/白話字轉換與連讀變調邏輯
  vendored 自 `project_claude_TTS_SST/romanize.js`。
