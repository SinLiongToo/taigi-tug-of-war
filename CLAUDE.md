# 台語搶答拔河 — 專案規則

給未來在這個 repo 工作的 Claude 看。怎麼「執行/測試」這個專案的細節在
[`.claude/skills/run-taigi-tug-of-war/SKILL.md`](.claude/skills/run-taigi-tug-of-war/SKILL.md),
這份檔案講的是「動手改之前要遵守的規則」。

## 語言

跟使用者一律用**繁體中文**溝通,不要用簡體字——使用者是台灣人,對這件事很在意。
程式碼裡的中文註解、README、UI 文字同樣一律繁體中文。

## 資料誠實原則(這個專案最重要的規則)

**每一種出題模式的詞彙,都必須查證過真的存在,不能用語言知識「推測」發音就
放進題庫。** 這個專案從第一天就是這樣要求的,之後新增任何模式都要延續:

1. **優先查教育部《臺灣台語常用詞辭典》**(`data/raw/dict-twblg.json` /
   `data/questions.js` 的 `entries`)。要確認一個詞存不存在,用
   SKILL.md 裡的 `vm` 載入方式把 `data/questions.js` 讀進 Node,對
   `TAIGI_QUESTIONS.entries` 做 `byHanzi.get('詞')` 查詢,不要用記憶或猜的。
2. **辭典查不到的詞,不要自己編發音。** 這個專案已經好幾次遇到辭典沒收錄
   的情況(地名、溪流、部分人骨部位)——處理方式一律是:
   - 先如實跟使用者報告「辭典查不到多少筆、只剩哪幾個」,不要默默跳過或
     默默瞎猜。
   - 如果使用者提供其他可信來源(例如本機另一個專案、使用者自己給的圖片),
     可以採用該來源的羅馬字,但要:(a) 用 `Romanize.parseWord()` 做格式
     驗證,(b) 在程式註解跟 README 清楚標明「這不是辭典查來的,來源是
     XXX,只做過格式驗證,沒有逐字確認發音」,不要含糊帶過。
   - 絕對不要自己憑語感編一個羅馬字塞進題庫又不說明來源。
3. 難易度分級(`classifyLevel()`)、九九乘法數字讀音(`NUM_READINGS`)這種
   Claude 自己判斷、非官方資料的東西,也一律要在 README 明確標示「這是
   AI 主觀判斷/手動規則,不是官方資料」,不能包裝成好像是查表查來的。

## 圖片授權原則

新增照片(動物/植物/身體部位)一律只能用確認過授權的公開圖庫(目前都是
Wikimedia Commons):搜尋 → 用 `imageinfo` + `iiprop=url|extmetadata` 確認
`LicenseShortName` 是 `CC BY`/`CC BY-SA`/`CC0`/`Public Domain` 才下載,
授權不明或看起來像機構自訂授權(例如曾經遇過的某動物園照片)一律換掉。
下載後一定要在 README「圖片授權」章節列出:檔名、內容、授權、作者、
Commons 連結。

## 跨專案讀取:只讀,絕對不要修改

這個專案借用過另外三個本機專案(同一個 OneDrive 上層資料夾)的內容:
`project_claude_TTS_SST`(`romanize.js` 來源)、`台灣鐵路四界行`、
`geo地理,動物,人體,車,蟲`(地名/溪流資料來源)。**只能用 Read/Glob/Grep
讀取,絕對不能用 Write/Edit 動到那些專案的任何檔案**,即使只是「順手
修一下」也不行。`romanize.js` 更新的話是整份重新複製覆蓋,不是手動改。

## 測試紀律

改完程式碼、寫 commit 之前,一定要照 SKILL.md 的方式實際測過,不能只憑
讀程式碼判斷「應該沒問題」:

1. 先用 `vm` 把改過的 `.js` 檔載入 Node 檢查語法沒有壞掉。
2. 跑一輪邏輯測試(`Questions.generate()` 批次呼叫,檢查沒有壞掉的選項、
   沒有重複、correctIndex 合法)。
3. 有視覺相關的改動(新模式、新圖片、新動畫、CSS 版面),一定要開瀏覽器
   (Playwright,見 SKILL.md 的 scratch dir 用法)實際截圖看過,不能只憑
   CSS 數字猜結果——這個專案已經好幾次證明「數學算起來應該對」但實際截圖
   發現裁切位置整個歪掉(參考人骨圖裁切那次抓到的 Y 軸公式 bug)。
4. 手機寬度(375px)要確認沒有橫向捲動。

## Commit 與部署

- 只有使用者明確要求才 commit/push(這是全域規則,不是這個專案特有的)。
- 改動如果值得反映在畫面版本號上,commit 前先跑
  `node data/bump-version.js [major|minor|patch]`。
- push 到 `master` 會自動觸發 GitHub Pages 重新部署(`.github` 沒有自訂
  workflow,是 GitHub 內建的 Pages 部署),不需要額外的 deploy 指令,但
  push 完最好用 `gh api repos/SinLiongToo/taigi-tug-of-war/pages/builds/latest`
  輪詢確認 build 成功、再視需要用 curl 打線上網址確認新檔案有生效。
- 每次新增/調整功能都要在 README 的「開發紀錄」補一條(帶日期),說清楚
  改了什麼、為什麼改、資料來源與限制——這份紀錄是為了讓之後回來看這個
  專案的人(包含未來的 Claude)不用重新爬一次 git log 才能懂脈絡。

## 技術棧邊界

純前端 HTML/CSS/JS,**不要**引入框架、bundler、或執行期 npm 依賴——這是
專案從一開始就定調的方向。`data/build-questions.js`、
`data/bump-version.js` 這種「建置期腳本」用 Node 執行沒問題(不進到瀏覽器
執行期),但瀏覽器實際載入的檔案要維持零依賴、`<script>` 標籤直接載入即可
執行,不能需要 `fetch()` 或伺服器(這是為了讓使用者能直接雙擊 `index.html`
玩,不需要架伺服器,之前就因為誤用 `fetch()` 讀本機 JSON 出過問題)。
