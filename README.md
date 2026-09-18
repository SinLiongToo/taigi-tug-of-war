# 台語搶答拔河

台語詞彙練習遊戲。預設是「一人刷題」模式,不用搶答、不分隊,單純練習
台語詞彙,成績累計永久保存在瀏覽器裡;也可以切換成兩隊搶答拔河模式——
誰先搶到答題權、答對,拔河繩就往那隊拉一格,先答對 N 題的隊伍獲勝
(N 可在開始畫面設定)。純前端網頁,無框架、無需安裝,瀏覽器打開就能玩。

**線上玩**: https://sinliongtoo.github.io/taigi-tug-of-war/

## 玩法

### 一人刷題(預設模式)

開始畫面「遊戲模式」預設就是「一人刷題」,不用設目標題數跟隊名,設定跟
雙人模式其餘部分大致相同。沒有搶答,出題後直接按 `1`~`4` 或點選項作答,
馬上看到對/錯跟正解,1.2 秒後自動出下一題,可以拿來單純練習。畫面上方
「本次」是這次開啟頁面以來的統計,「累計」是永久保存在瀏覽器裡的總成績
(`localStorage`,換瀏覽器/清瀏覽器資料不會保留),設定畫面可以按
「清除累計紀錄」重置(會先跳確認對話框)。

### 雙人搶答拔河

開始畫面「遊戲模式」切換成「雙人搶答拔河」即可。

1. 設定:目標題數 N、每題時限、兩隊隊名、出題模式(可複選=混合出題)、
   難易度(國小/國中/高中/大學,可複選)、羅馬字系統(台羅 / 白話字)。
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
  羅馬字。「看漢字」「看羅馬字」是兩個獨立的勾選框(`animal-hanzi`/
  `animal-roman`),只想練羅馬字或只想練漢字可以只勾一個,兩個都勾就混合出。
  干擾選項也是從動物題庫裡挑的,比較有「猜動物」的主題感。題庫是一份
  精選清單(`src/lib/questions.js` 裡的 `ANIMAL_WORDS`),跟教育部辭典資料
  比對過漢字確實查得到才收錄。
  - 其中 7 種是**台灣野生保育動物照片**(台灣黑熊、梅花鹿、台灣獼猴、長鬃
    山羊、山豬、水獺、飛鼠)。辭典裡沒有「台灣黑熊」「石虎」這種物種專有
    名詞,所以熊/鹿/猴/羊這幾張照片配的是辭典裡真正存在的**通用詞**,用台灣
    特有種的照片示意,不是宣稱該物種有專屬的台語詞;山豬、水獺、飛鼠則是
    辭典裡本來就有、詞跟物種剛好對得上的乾淨案例。
  - 2026-09-18 再加 24 種常見動物照片(狗、貓、牛、水牛、馬、豬、雞、鴨、
    鵝、魚、蝦、蟳、鳥、兔、象、虎、獅、蛇、龜、蜂、鼠、駱駝、蜘蛛、
    田蛤仔),emoji 保留不刪,照片跟 emoji 並存增加出題變化。這些漢字本來
    就是題庫既有詞(emoji 清單裡都有),不需要另外查證。照片授權見下方
    「圖片授權」。
- **身體部位**:題目是身體部位 emoji 或照片,猜台語漢字或羅馬字。跟動物模式
  一樣拆成 `body-hanzi`/`body-roman` 兩個獨立勾選框。清單裡每個詞都逐一查證
  過教育部辭典是否收錄(`src/lib/questions.js`
  的 `BODY_WORDS`)。骨頭類詞彙特別多,除了基本的骨、手骨、跤骨、頭殼,還有
  一份詳細人骨部位(頭殼碗、牙槽骨、飯匙骨、胸掛骨、胸坎骨、龍骨、尻川骨、
  大腿骨、跤肚骨、跤胴骨……共 18 個)是照使用者提供的骨骼圖(作者:藍采琍)
  加入的。這份圖上的詞有 15 個辭典裡也查得到、讀音跟圖上完全一致(互相驗證
  過);另外 8 個(鼻骨、頂胘骨、算仔骨、尾錐、腸骨、盆胲骨、跤頭碗、跤指頭仔骨)
  辭典沒收錄,直接用圖片標示的羅馬字(`BODY_WORDS` 裡帶 `poj` 欄位的那幾筆),
  只做過格式驗證,沒辦法像辭典詞一樣逐字確認發音。
  - 骨頭類的題目圖不是每題都長一樣:同一張沒有文字標籤的人骨全身圖(1896年
    出版、已公版,見下方「圖片授權」),依骨頭所在部位裁成 12 種不同的局部
    特寫(頭骨上/下半、胸腔、脊椎、骨盆、大腿、膝蓋、小腿、腳、上臂、整隻
    手臂、整條腿),同一區域裡好幾根骨頭共用同一張裁圖是刻意的(例如胸掛骨/
    胸坎骨/算仔骨本來就在畫面同一塊區域),不是敷衍。裁切座標是拿 Playwright
    對著真實圖片反覆截圖校正出來的,規則跟座標表在 `src/lib/questions.js`
    的 `BONE_CROPS`。
- **樹仔/草仔**:題目是植物 emoji 或照片,猜台語漢字或羅馬字。跟動物模式做法
  一樣拆成 `plant-hanzi`/`plant-roman` 兩個獨立勾選框,每個詞都查證過教育部
  辭典確實收錄才收(`src/lib/questions.js` 的
  `PLANT_WORDS`)。常見植物(樹、草、花、竹、番麥、稻穗...)用現成 emoji;
  相思仔、茄苳、林投、木麻黃、檳榔這幾種有台灣鄉土特色、但沒有對應 emoji
  的樹種改用照片,授權見下方「圖片授權」。「七里香」「福木」「芙蓉」這
  三個詞教育部辭典(主辭典+擴充辭典,共 21,282 筆)查無此詞,常見同義詞
  (月橘、九里香、十里香、木芙蓉)也查不到,三個姐妹專案也沒有這類植物
  資料;如實回報給使用者之後,使用者直接提供羅馬字,只做過格式驗證,不是
  辭典查來的。
- **工程車**:題目是工程車照片,猜台語漢字或羅馬字,一樣拆成 `vehicle-hanzi`/
  `vehicle-roman` 兩個獨立勾選框(`src/lib/questions.js` 的 `VEHICLE_WORDS`,
  共 15 個詞、16 張照片——「豬哥牙」對應兩張不同照片,見下方說明)。使用者
  提供了一份台語工程車詞彙的參考資料
  (`reference/《常見的工程車台語1》.md`,一份臉書貼文截圖整理),裡面每種車
  列了好幾個台語同義詞。查證方式:
  - 吊車、攄塗機、怪手、卡車、發財仔車、油罐車這 6 個詞,辭典查得到、
    定義也對得上,直接用辭典本身的讀音。
  - 堆高機、流籠車、沙石仔車、鴨母車、鐵輪這 5 個詞辭典查不到,改用參考
    資料本身的羅馬字,只做過 `Romanize.parseWord()` 格式驗證。
  - 山貓、鋼牙、豬哥牙、干樂、田螺這 5 個工程車俗稱,辭典裡剛好都有同樣的
    漢字,但定義完全是別的東西(山貓是雲豹/石虎、鋼牙是假牙、豬哥牙是虎齒、
    干樂是陀螺、田螺是水生螺類)——**這是同一個漢字被借去當工程車暱稱用,
    跟英語把 skid loader 暱稱叫「Bobcat」是同一種構詞方式(山貓就是台語版
    的「Bobcat」哏),不是辭典本身承認這個字有工程車的意思**。使用者確認
    這種用法可以收錄,只要清楚標明來源就好。有實際核對過這 5 個詞辭典裡的
    讀音跟參考資料標注的羅馬字完全一致(不是另外查到的其他發音),所以發音
    沒有疑慮,問題只在字義跟辭典本身的主要義項不同,這裡老實說明來源跟
    這個限制。其中「鋼牙」(液壓剪/破碎爪)沒找到乾淨、授權清楚的照片,
    這批沒收錄,純粹是圖片素材問題;「干樂」「田螺」是同一種車(混凝土
    攪拌車)的不同暱稱,各自配一張不同照片。另外「拖車」查證得過,但一樣
    找不到跟卡車視覺上有明顯區隔、授權又乾淨的照片,這批也沒收錄。
- **地名/溪流**:題目是台灣的車站名、山脈、溪流或地標,猜台語漢字或羅馬字。
  **這個模式完全不是查教育部辭典來的**——辭典裡標記「地名」的詞條只有 12 筆,
  扣掉「地號名」這種泛稱,真正的具體地名只剩「淡水」「西門町」兩個,溪流
  一個都沒有(辭典本質是常用語彙辭典,不是地名辭典)。題庫改用本機另外兩個
  專案已經整理好的資料:
  - 全台鐵路車站名 73 筆,來自「台灣鐵路四界行」專案的車站資料庫。
  - 山脈/溪流/地標 14 筆,來自「geo地理,動物,人體,車,蟲」專案。
  這兩份資料都不是教育部辭典本身收錄的,是另外兩個本機專案整理的,已經用
  `Romanize.parseWord()` 逐筆驗證過羅馬字格式能正確解析、也跟已知的台語地名
  讀音慣例(例:台北 Tâi-pak、高雄 Ko-hiông)核對過看起來合理,但沒辦法像
  其他模式一樣逐字對照教育部辭典確認發音,所以請比較保留地看待——如果哪個
  地名的讀音有問題,歡迎回報修正,資料在 `src/lib/questions.js` 的 `PLACE_RAW`。
- **九九乘法**:題目是一個乘法算式(阿拉伯數字,如「4 × 9 = ?」),選項是答案的
  台語唸法。**這個模式的數字讀音不是查辭典來的**(辭典只有一~十的單字,沒有
  「二十」「三十六」這種組合數字詞),是照傳統台語九九乘法歌慣用的讀法手動
  刻的:
  - 個位數用文讀音:一 it、二 jī、三 sam、四 sù、五 ngóo、六 lio̍k、七 tshit、
    八 pat、九 kiú、十 si̍p。
  - 兩位數用「X十Y」組字規則(跟中文數字組成方式一樣規律,例如 25 = 二十五 =
    jī-si̍p-ngóo,36 = 三十六 = sam-si̍p-lio̍k)。
  - 逐字報數不套用連讀變調,跟報電話號碼一樣一字一字唸本調,不會混音。
  - 如果哪個數字讀音跟你熟悉的唸法不一樣,`src/lib/questions.js` 裡的
    `NUM_READINGS`/`TEN_READING` 就是全部的讀音資料,改那裡就好。

開始畫面可複選多種模式,複選時每題隨機挑一種出題,等於混合模式。

## 難易度分級(國小/國中/高中/大學)

**這不是教育部或任何官方機構的正式分級**——教育部辭典本身沒有難易度欄位。
實際查證過唯一有「詞彙分級」概念的官方資料源(國家教育研究院「臺灣台語語料庫
應用檢索系統」的教科書詞彙檢索,收錄約 1,400 個國小+國中課本詞彙),該系統
資料庫欄位裡確實有分級,但目前網頁介面把這欄位隱藏、也沒有批次匯出或 API,
撈不到;而且這個系統本來就只到國中,高中/大學台語沒有統一官方課綱詞彙表。

因此這裡的難易度是 **Claude(LLM)自己的近似判斷**,規則見
`data/build-questions.js` 的 `classifyLevel()`:

1. 先查詞是否在手動整理的「國小常用詞」清單(`ELEMENTARY_WORDS`)裡,是的話
   直接算國小,不看字數(避免「阿公」「食飯」這種 2~3 字基礎詞被字數規則
   誤判成國中以上)。
2. 否則看辭典釋義文字裡有沒有「學名」「醫學」「宗教」「文言」「書面語」…
   這類專業/正式用語關鍵字,有的話拉高到高中或大學。
3. 都沒命中的話,用字數當基礎訊號:1字→國小、2字→國中、3字→高中、4字→大學。

19,821 詞目前的分佈:國小 3,985、國中 12,306、高中 2,731、大學 799。這只是
概略分類,不保證每個詞都準——想微調的話直接改 `build-questions.js` 裡的
`ELEMENTARY_WORDS`/`DEFINITION_UNIVERSITY_KEYWORDS`/`DEFINITION_SENIOR_KEYWORDS`
清單,再重跑 `node data/build-questions.js` 就會套用。

難易度篩選只影響「詞義/漢字↔羅馬字/聲調」這幾個查辭典的模式(篩的是題目考
哪個詞,干擾選項還是照樣從全部詞庫挑,沒有跟著篩);「動物」「身體部位」
「樹仔/草仔」「工程車」「地名/溪流」「九九乘法」都是獨立的固定題庫,不受難易度設定影響。

## 執行方式

直接用瀏覽器雙擊開啟 `index.html` 就能玩,不需要架任何伺服器。題庫是用
`<script src="data/questions.js">` 載入(不是 `fetch()` 讀 JSON),瀏覽器的
同源限制不會擋這種本機檔案讀取方式,所以 `file://` 直開也沒問題。

(如果你偏好還是想跑本機伺服器,例如要用瀏覽器開發工具的 network 面板除錯,
一樣可以: `python -m http.server 8000`,再連到 http://localhost:8000。)

## 題庫來源與授權

題庫資料來自教育部《臺灣台語常用詞辭典》開放資料,經
[g0v/moedict-data-twblg](https://github.com/g0v/moedict-data-twblg) 整理成兩個
檔案:主辭典 `dict-twblg.json`(萌典的資料來源)跟擴充辭典
`dict-twblg-ext.json`(參考自 `project_claude_TTS_SST/dict.js` 的做法,它
也是把這兩份合併使用)。擴充辭典扣掉跟主辭典重複的詞,實際多帶來約 6,100
個全新詞條。使用前請確認該資料集當下的授權條款並保留出處標示。

重新產生題庫:

```bash
curl -L -o data/raw/dict-twblg.json \
  https://raw.githubusercontent.com/g0v/moedict-data-twblg/master/dict-twblg.json
curl -L -o data/raw/dict-twblg-ext.json \
  https://raw.githubusercontent.com/g0v/moedict-data-twblg/master/dict-twblg-ext.json
node data/build-questions.js
```

擴充辭典是可選的——沒有這個檔案時建置腳本只印警告、照樣用主辭典建出題庫,
不會壞掉,只是詞會少很多。

`data/build-questions.js` 會篩選出 1~4 字、羅馬字可正確解析、至少有一則中文釋義的
詞條(主辭典跟擴充辭典用同一套規則,先處理主辭典、擴充辭典裡重複的詞會被
跳過,主辭典優先),輸出成 `data/questions.js`(離線,不需要網路;內容是一份
指定給全域變數 `TAIGI_QUESTIONS` 的 JS 檔,遊戲用 `<script>` 標籤直接載入,
不是 `fetch()` 讀 JSON)。目前(主辭典+擴充辭典)共 19,821 詞,其中 15,769
詞可出聲調模式。

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
| `dog.jpg` | 狗(配「狗」) | CC BY-SA 4.0 | PattayaPatrol | [File:DFC 0440 Portrait of a sandy-coated dog...jpg](https://commons.wikimedia.org/wiki/File:DFC_0440_Portrait_of_a_sandy-coated_dog_with_a_weathered_collar_looking_off_to_the_side_against_a_beach_backdrop.jpg) |
| `cat.jpg` | 貓(配「貓」) | CC BY 4.0 | Anish Anilkumar | [File:Domestic Cat Black Sitting.jpg](https://commons.wikimedia.org/wiki/File:Domestic_Cat_Black_Sitting.jpg) |
| `cattle.jpg` | 牛(配「牛」) | CC BY-SA 4.0 | Weyham | [File:Cattle (Cows) in the field grazing 03.jpg](https://commons.wikimedia.org/wiki/File:Cattle_(Cows)_in_the_field_grazing_03.jpg) |
| `buffalo.jpg` | 水牛(配「水牛」) | CC BY-SA 4.0 | Gannu03 | [File:Asian water buffalo (Bubalus bubalis) in shallow water 01.jpg](https://commons.wikimedia.org/wiki/File:Asian_water_buffalo_(Bubalus_bubalis)_in_shallow_water_01.jpg) |
| `horse.jpg` | 馬(配「馬」) | CC0 | Halyna Feshchak | [File:Beautiful Brown Horse (198516275).jpeg](https://commons.wikimedia.org/wiki/File:Beautiful_Brown_Horse_(198516275).jpeg) |
| `pig.jpg` | 迷你豬(配「豬」) | CC BY 4.0 | Schlurcher | [File:Hängebauchschwein.jpg](https://commons.wikimedia.org/wiki/File:H%C3%A4ngebauchschwein.jpg) |
| `chicken.jpg` | 雞(配「雞」) | CC BY 3.0 | Aleksei Belta | [File:Chicken Posing (209225885).jpeg](https://commons.wikimedia.org/wiki/File:Chicken_Posing_(209225885).jpeg) |
| `duck.jpg` | 鴨(配「鴨」) | CC BY-SA 4.0 | Oak Atsume | [File:Domestic Duck Resting with one leg in muddies water.jpg](https://commons.wikimedia.org/wiki/File:Domestic_Duck_Resting_with_one_leg_in_muddies_water.jpg) |
| `goose.jpg` | 鵝(配「鵝」) | CC0 | Wilfredor | [File:Anser anser domesticus 2.jpg](https://commons.wikimedia.org/wiki/File:Anser_anser_domesticus_2.jpg) |
| `fish.jpg` | 尼羅吳郭魚(配「魚」) | CC BY-SA 2.0 | Bernard DUPONT | [File:Nile Tilapia (Oreochromis niloticus) - Carwash Cenote QR.jpg](https://commons.wikimedia.org/wiki/File:Nile_Tilapia_(Oreochromis_niloticus)_-_Carwash_Cenote_QR.jpg) |
| `shrimp.jpg` | 蝦(配「蝦」) | CC BY-SA 4.0 | Dappasolomon001 | [File:Fresh sea prawns.jpg](https://commons.wikimedia.org/wiki/File:Fresh_sea_prawns.jpg) |
| `crab.jpg` | 鋸緣青蟳(配「蟳」) | CC BY-SA 2.5 | OpenCage | [File:Scylla serrata by OpenCage.jpg](https://commons.wikimedia.org/wiki/File:Scylla_serrata_by_OpenCage.jpg) |
| `bird.jpg` | 麻雀(配「鳥」) | CC BY 4.0 | Rafal Brys | [File:Eurasian Tree Sparrow (Passer montanus) perched on a Thuja branch.jpg](https://commons.wikimedia.org/wiki/File:Eurasian_Tree_Sparrow_(Passer_montanus)_perched_on_a_Thuja_branch.jpg) |
| `rabbit.jpg` | 兔(配「兔」) | CC BY-SA 4.0 | NasserHalaweh | [File:Leporidae Oryctolagus cuniculus domesticus 7.2.jpg](https://commons.wikimedia.org/wiki/File:Leporidae_Oryctolagus_cuniculus_domesticus_7.2.jpg) |
| `elephant.jpg` | 象(配「象」) | CC BY 4.0 | Stephen Jacobs (Why Steve) | [File:African elephant standing.jpg](https://commons.wikimedia.org/wiki/File:African_elephant_standing.jpg) |
| `tiger.jpg` | 虎(配「虎」) | CC0 | Joselodos | [File:Bengal tiger looking at the camera.jpg](https://commons.wikimedia.org/wiki/File:Bengal_tiger_looking_at_the_camera.jpg) |
| `lion.jpg` | 獅(配「獅」) | CC BY 2.0 | GollyGforce | [File:Lion portrait.jpg](https://commons.wikimedia.org/wiki/File:Lion_portrait.jpg) |
| `snake.jpg` | 蛇(配「蛇」) | CC BY 2.0 | photochem_PA | [File:Side view portrait of a snake (7032053613).jpg](https://commons.wikimedia.org/wiki/File:Side_view_portrait_of_a_snake_(7032053613).jpg) |
| `turtle.jpg` | 陸龜(配「龜」) | CC BY-SA 4.0 | van Leeuwen | [File:Yellowfooted turtle-1539382134.jpg](https://commons.wikimedia.org/wiki/File:Yellowfooted_turtle-1539382134.jpg) |
| `bee.jpg` | 蜂(配「蜂」) | CC BY 4.0 | Conall | [File:Honey bee on oregano flower.jpg](https://commons.wikimedia.org/wiki/File:Honey_bee_on_oregano_flower.jpg) |
| `mouse.jpg` | 鼠(配「鼠」) | CC BY-SA 4.0 | Garst, Warren | [File:Four-striped grass mouse sitting on ground - DPLA.jpg](https://commons.wikimedia.org/wiki/File:Four-striped_grass_mouse_sitting_on_ground_-_DPLA_-_670c2b1540dfbdcccadcdad942597f3b.jpg) |
| `camel.jpg` | 駱駝(配「駱駝」) | CC BY-SA 4.0 | KuwaitiG | [File:Desert camel in Jahra.jpg](https://commons.wikimedia.org/wiki/File:Desert_camel_in_Jahra.jpg) |
| `spider.jpg` | 蜘蛛(配「蜘蛛」) | CC BY-SA 4.0 | Basile Morin | [File:Argiope spider female adult on her web dorsal view black background Don Det Laos.jpg](https://commons.wikimedia.org/wiki/File:Argiope_spider_female_adult_on_her_web_dorsal_view_black_background_Don_Det_Laos.jpg) |
| `frog.jpg` | 綠沼蛙(配「田蛤仔」) | CC BY-SA 4.0 | Vengolis | [File:Green pond frog (Euphlyctis hexadactylus) 5341.jpg](https://commons.wikimedia.org/wiki/File:Green_pond_frog_(Euphlyctis_hexadactylus)_5341.jpg) |

上面這 24 張(狗~田蛤仔)跟樹種/水果/工程車照片同一批做法,本機用 Pillow
等比縮到長邊 900px、JPEG 品質 78 壓縮,單張約 37~235KB。

`data/images/tw-plants/` 底下 5 張台灣鄉土樹種照片,一樣來自 Wikimedia Commons、
CC BY 或 CC BY-SA 授權:

| 檔案 | 植物 | 授權 | 攝影者 | 來源 |
|---|---|---|---|---|
| `acacia.jpg` | 相思樹(配「相思仔」) | CC BY-SA 4.0 | FireFeather | [File:Acacia confusa, Taichung, Taiwan.jpg](https://commons.wikimedia.org/wiki/File:Acacia_confusa,_Taichung,_Taiwan.jpg) |
| `bischofia.jpg` | 茄苳(配「茄苳」) | CC BY-SA 4.0 | Dolon Prova | [File:Bischofia javanica (1).jpg](https://commons.wikimedia.org/wiki/File:Bischofia_javanica_(1).jpg) |
| `pandanus.jpg` | 林投果實(配「林投」) | CC BY-SA 4.0 | AntanO | [File:Pandanus tectorius fruit (riped).JPG](https://commons.wikimedia.org/wiki/File:Pandanus_tectorius_fruit_(riped).JPG) |
| `casuarina.jpg` | 木麻黃(配「木麻黃」) | CC BY 3.0 | Ethel Aardvark | [File:Casuarina equesitifolia tree.jpg](https://commons.wikimedia.org/wiki/File:Casuarina_equesitifolia_tree.jpg) |
| `areca.jpg` | 檳榔(配「檳榔」) | CC BY 2.0 | Dick Culbert | [File:Areca catechu, Betel Nut (14436668393).jpg](https://commons.wikimedia.org/wiki/File:Areca_catechu,_Betel_Nut_(14436668393).jpg) |
| `banyan.jpg` | 榕樹(配「榕」) | CC0 | noroi | [File:Old Ficus Banyan tree in Fengyuan, Taichung.jpg](https://commons.wikimedia.org/wiki/File:Old_Ficus_Banyan_tree_in_Fengyuan,_Taichung.jpg) |
| `camphor.jpg` | 樟樹(配「樟」) | CC BY-SA 4.0 | Martinvl | [File:Cinnamomum camphora Vergelegen.jpg](https://commons.wikimedia.org/wiki/File:Cinnamomum_camphora_Vergelegen.jpg) |
| `pine.jpg` | 台灣二葉松(配「松」) | CC0 | leaf0605 | [File:Pinus taiwanensis, Guanwu, Miaoli, Taiwan 01.jpg](https://commons.wikimedia.org/wiki/File:Pinus_taiwanensis,_Guanwu,_Miaoli,_Taiwan_01.jpg) |
| `willow.jpg` | 柳樹(配「柳」) | CC BY-SA 4.0 | Joseolgon | [File:Salix babylonica in Braga.jpg](https://commons.wikimedia.org/wiki/File:Salix_babylonica_in_Braga.jpg) |
| `flame.jpg` | 鳳凰木(配「鳳凰木」) | CC BY-SA 4.0 | Vengolis | [File:Delonix regia 09297.jpg](https://commons.wikimedia.org/wiki/File:Delonix_regia_09297.jpg) |
| `bodhi.jpg` | 菩提樹(配「菩提樹」) | CC BY-SA 3.0 | Mokkie | [File:Sacred fig (Ficus religiosa), College Green, Singapore Management University - 20131209.jpg](https://commons.wikimedia.org/wiki/File:Sacred_fig_(Ficus_religiosa),_College_Green,_Singapore_Management_University_-_20131209.jpg) |
| `longan.jpg` | 龍眼樹(配「龍眼」) | CC BY-SA 3.0 | Pouletic | [File:Longan tree at Pine Island Nursery.jpg](https://commons.wikimedia.org/wiki/File:Longan_tree_at_Pine_Island_Nursery.jpg) |
| `litchi.jpg` | 荔枝樹(配「荔枝」) | CC BY-SA 4.0 | Nishantv069 | [File:A litchi tree.jpg](https://commons.wikimedia.org/wiki/File:A_litchi_tree.jpg) |
| `banana.jpg` | 香蕉(配「弓蕉」) | CC BY-SA 4.0 | Samsule2 | [File:A Bunch of Bananas displayed by a roadside seller 02.jpg](https://commons.wikimedia.org/wiki/File:A_Bunch_of_Bananas_displayed_by_a_roadside_seller_02.jpg) |
| `watermelon.jpg` | 西瓜(配「西瓜」) | CC BY-SA 4.0 | ChimaBee | [File:Whole Watermelons At Local Fruit Vendor.jpg](https://commons.wikimedia.org/wiki/File:Whole_Watermelons_At_Local_Fruit_Vendor.jpg) |
| `pineapple.jpg` | 台灣鳳梨(配「王梨」) | CC0 | Syced | [File:Taiwan pineapples sold out despite being much more expensive, they are delicious though.jpg](https://commons.wikimedia.org/wiki/File:Taiwan_pineapples_sold_out_despite_being_much_more_expensive,_they_are_delicious_though.jpg) |
| `grape.jpg` | 葡萄(配「葡萄」) | CC BY-SA 4.0 | Jules Verne Times Two | [File:Bunch of grapes amidst vine leaves, Ponte de Sor...jpg](https://commons.wikimedia.org/wiki/File:Bunch_of_grapes_amidst_vine_leaves,_Ponte_de_Sor_(approx._GPS_location)_julesvernex2.jpg) |
| `guava.jpg` | 芭樂(配「菝仔」) | CC BY-SA 4.0 | Thamizhpparithi Maari | [File:Guava - Psidium guajava fruit of Tamilnadu.jpg](https://commons.wikimedia.org/wiki/File:Guava_-_Psidium_guajava_fruit_of_Tamilnadu.jpg) |
| `papaya.jpg` | 木瓜(配「木瓜」) | CC BY-SA 4.0 | Anak Sago | [File:Papaya fruit hanging from the tree.jpg](https://commons.wikimedia.org/wiki/File:Papaya_fruit_hanging_from_the_tree.jpg) |
| `persimmon.jpg` | 柿子(配「柿仔」) | CC BY-SA 4.0 | Rhododendrites | [File:Persimmon (fuyu).jpg](https://commons.wikimedia.org/wiki/File:Persimmon_(fuyu).jpg) |
| `loquat.jpg` | 枇杷(配「枇杷」) | CC BY 2.0 | Ed Uthman | [File:Loquat fruit and foliage (Eriobotrya japonica).jpg](https://commons.wikimedia.org/wiki/File:Loquat_fruit_and_foliage_(Eriobotrya_japonica).jpg) |
| `strawberry.jpg` | 草莓(配「草莓」) | CC BY-SA 4.0 | Ivar Leidus | [File:Garden strawberry (Fragaria × ananassa) single2.jpg](https://commons.wikimedia.org/wiki/File:Garden_strawberry_(Fragaria_%C3%97_ananassa)_single2.jpg) |
| `waxapple.jpg` | 蓮霧(配「蓮霧」) | CC BY-SA 4.0 | Salil Kumar Mukherjee | [File:Wax apple (Syzygium samarangense).jpg](https://commons.wikimedia.org/wiki/File:Wax_apple_(Syzygium_samarangense).jpg) |
| `starfruit.jpg` | 楊桃(配「楊桃」) | CC BY-SA 4.0 | Salil Kumar Mukherjee | [File:Star fruit (Averrhoa carambola) 01.jpg](https://commons.wikimedia.org/wiki/File:Star_fruit_(Averrhoa_carambola)_01.jpg) |
| `passionfruit.jpg` | 百香果(配「時計果」) | CC BY-SA 4.0 | Ivar Leidus | [File:Passion fruits - whole and halved.jpg](https://commons.wikimedia.org/wiki/File:Passion_fruits_-_whole_and_halved.jpg) |
| `murraya.jpg` | 七里香樹(配「七里香」) | CC BY 4.0 | Shuvaev | [File:Murraya paniculata, Longwood Gardens 2023 01.jpg](https://commons.wikimedia.org/wiki/File:Murraya_paniculata,_Longwood_Gardens_2023_01.jpg) |
| `fukugi.jpg` | 福木葉子(配「福木」) | CC BY-SA 3.0 | Mokkie | [File:Fukugi Tree (Garcinia subelliptica).jpg](https://commons.wikimedia.org/wiki/File:Fukugi_Tree_(Garcinia_subelliptica).jpg) |
| `hibiscus-mutabilis.jpg` | 木芙蓉花(配「芙蓉」) | CC BY-SA 4.0 | Wee Hong | [File:Hibiscus mutabilis (190111-1618).jpg](https://commons.wikimedia.org/wiki/File:Hibiscus_mutabilis_(190111-1618).jpg) |

這些跟野生動物照片一樣都是縮圖,不是原始全解析度檔案,單張約 60~230KB,適合網頁載入
(前 5 張是 480px 寬的 Commons thumbnail API 縮圖;2026-09-17 新增的樹種與水果照片是
本機用 Pillow 等比縮到長邊 900px、JPEG 品質 78 壓縮出來的,原始檔案解析度較高,
縮圖方式不同但同樣符合授權條款的再散布要求)。

`data/images/tw-vehicles/` 底下 11 張工程車照片(2026-09-18 新增),同樣來自
Wikimedia Commons、CC0/CC BY-SA 授權:

| 檔案 | 工程車 | 授權 | 攝影者 | 來源 |
|---|---|---|---|---|
| `crane.jpg` | 吊車(配「吊車」) | CC BY-SA 4.0 | Tbatb | [File:A Liebherr LTM 1500-8.1 crane truck lifting a Genie S-85 Lift Crane.jpg](https://commons.wikimedia.org/wiki/File:A_Liebherr_LTM_1500-8.1_crane_truck_lifting_a_Genie_S-85_Lift_Crane.jpg) |
| `excavator.jpg` | 履帶式挖土機(配「怪手」) | CC0 | Daderot | [File:Komatsu excavator - Arlington, MA.jpg](https://commons.wikimedia.org/wiki/File:Komatsu_excavator_-_Arlington,_MA.jpg) |
| `bulldozer.jpg` | 推土機(配「攄塗機」) | CC BY-SA 4.0 | Srđan Popović | [File:Caterpillar dozer.jpg](https://commons.wikimedia.org/wiki/File:Caterpillar_dozer.jpg) |
| `truck.jpg` | 大型貨車(配「卡車」) | CC BY-SA 3.0 | Mj-bird | [File:ISUZU GIGA, Full-cab type, Yellow Truck.jpg](https://commons.wikimedia.org/wiki/File:ISUZU_GIGA,_Full-cab_type,_Yellow_Truck.jpg) |
| `pickup.jpg` | 輕型小貨車(配「發財仔車」) | CC0 | ITakePhotosOfCars | [File:Autozam Scrum Pickup left side view.jpg](https://commons.wikimedia.org/wiki/File:Autozam_Scrum_Pickup_left_side_view.jpg) |
| `tanker.jpg` | 油罐車(配「油罐車」) | CC BY-SA 3.0 | Horacio Cambeiro | [File:Shell Fuel Tanker Truck at Capioví Service Station, Misiones, Argentina.jpg](https://commons.wikimedia.org/wiki/File:Shell_Fuel_Tanker_Truck_at_Capiov%C3%AD_Service_Station,_Misiones,_Argentina.jpg) |
| `forklift.jpg` | 堆高機(配「堆高機」) | CC BY 4.0 | Goterrestrial | [File:Container loading with forklift at warehouse in Thailand.jpg](https://commons.wikimedia.org/wiki/File:Container_loading_with_forklift_at_warehouse_in_Thailand.jpg) |
| `aerial-platform.jpg` | 剪式高空作業車(配「流籠車」) | CC BY-SA 4.0 | Wasiul Bahar | [File:JCB S1930E Scissor Lift at Rajiv Gandhi International Airport, hyderabad.jpg](https://commons.wikimedia.org/wiki/File:JCB_S1930E_Scissor_Lift_at_Rajiv_Gandhi_International_Airport,_hyderabad.jpg) |
| `dump-truck.jpg` | 砂石車(配「沙石仔車」) | CC0 | Retired electrician | [File:Moscow, Scania 4-axle dump truck, tight squeeze, Mar 2026 01.jpg](https://commons.wikimedia.org/wiki/File:Moscow,_Scania_4-axle_dump_truck,_tight_squeeze,_Mar_2026_01.jpg) |
| `concrete-pump.jpg` | 混凝土泵浦車(配「鴨母車」) | CC0 | Daderot | [File:Concrete pump truck - Arlington, MA.jpg](https://commons.wikimedia.org/wiki/File:Concrete_pump_truck_-_Arlington,_MA.jpg) |
| `roller.jpg` | 壓路機(配「鐵輪」) | CC BY-SA 4.0 | Cjp24 | [File:Ammann road roller, Boulleret.jpg](https://commons.wikimedia.org/wiki/File:Ammann_road_roller,_Boulleret.jpg) |
| `skid-loader.jpg` | Bobcat 鏟裝機(配「山貓」) | CC BY 3.0 | Gabinho | [File:Bobcat 751 Compact Skid Steer Loader in Bucharest January 2011.jpg](https://commons.wikimedia.org/wiki/File:Bobcat_751_Compact_Skid_Steer_Loader_in_Bucharest_January_2011.jpg) |
| `fork-tines.jpg` | 堆高機貨叉載貨(配「豬哥牙」) | CC BY-SA 2.0 | Anne Burgess | [File:The Last Palletload - geograph.org.uk - 763432.jpg](https://commons.wikimedia.org/wiki/File:The_Last_Palletload_-_geograph.org.uk_-_763432.jpg) |
| `mixer-truck-1.jpg` | 混凝土攪拌車(配「干樂」) | CC0 | Spielvogel | [File:CAMC concrete mixer truck Xing Kaima. Spielvogel 1.jpg](https://commons.wikimedia.org/wiki/File:CAMC_concrete_mixer_truck_Xing_Kaima._Spielvogel_1.jpg) |
| `mixer-truck-2.jpg` | 混凝土攪拌車(配「田螺」) | CC0 | Spielvogel | [File:CAMC concrete mixer truck Xing Kaima. Spielvogel 2.jpg](https://commons.wikimedia.org/wiki/File:CAMC_concrete_mixer_truck_Xing_Kaima._Spielvogel_2.jpg) |
| `wheeled-excavator.jpg` | 輪式挖土機(配「豬哥牙」) | CC BY 3.0 de | High Contrast | [File:Caterpillar M315C excavator.JPG](https://commons.wikimedia.org/wiki/File:Caterpillar_M315C_excavator.JPG) |

這批一樣是本機用 Pillow 等比縮到長邊 900px、JPEG 品質 78 壓縮出來的,單張約
85~240KB。

`data/images/tw-body/skeleton.webp` 是身體部位模式骨頭類題目共用的人骨全身圖:

| 檔案 | 說明 | 授權 | 作者 | 來源 |
|---|---|---|---|---|
| `skeleton.webp` | 沒有文字標籤的人骨全身正面圖,1896 年出版 | Public Domain(已公版) | Arthur Thomson(繪者)、Henry Frowde(出版) | [File:Thomson plate 01 - male skeleton, front view.webp](https://commons.wikimedia.org/wiki/File:Thomson_plate_01_-_male_skeleton,_front_view.webp) |

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

## 版本資訊

畫面最下方會顯示版本號跟最後更新時間(例:`v1.0.0 · 更新於 2026-09-16 10:35`,
台灣時區),資料來自 `data/version.js`。每次要發新版本前手動跑:

```bash
node data/bump-version.js          # patch 版號 +1(預設)
node data/bump-version.js minor    # minor 版號 +1,patch 歸零
node data/bump-version.js major    # major 版號 +1,minor/patch 歸零
```

這支腳本會重寫 `data/version.js`,commit 時一併帶上就會反映在畫面上。純粹是
給人看的版本標示,跟遊戲邏輯無關。

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
data/build-questions.js       題庫建置腳本(含難易度分級 classifyLevel())
data/questions.js            遊戲實際載入的離線題庫(<script> 標籤載入,非 fetch)
data/bump-version.js          更新 data/version.js 版本號/時間戳記的小工具
data/version.js               目前版本號/最後更新時間,畫面最下方顯示用
data/images/tw-wildlife/      台灣保育動物照片(動物模式用)
data/images/tw-plants/        台灣鄉土樹種照片(樹仔/草仔模式用)
```

## 開發紀錄

- 2026-09-18:「一人刷題」改成開始畫面的預設遊戲模式(原本預設是雙人搶答
  拔河)。使用者的說法是「為一人刷題(台語練習,積分永久累計)」,呼應
  這個模式的重點是可以隨時打開就單純練習、成績長期累積。技術上是
  `index.html` 的 `gameType` radio 把 `checked` 從 `team` 換到 `solo`、
  `main.js` 的 `init()` 呼叫 `UI.applyGameTypeVisibility('solo')`,另外
  把 `teamOnlyFields`/`soloStatsBox`/`teamKeyHint`/`soloKeyHint` 這幾個
  容器的原始 `hidden` 屬性也對調,避免 JS 執行前有一瞬間顯示錯的畫面
  (雖然這個閃爍幾乎不可見,但既然要改就順手做乾淨)。雙人模式邏輯完全
  沒動,只要切換勾選框照樣能玩。
- 2026-09-18:使用者問「動物可以有實際的圖嗎?」——動物模式原本只有 7 種
  台灣野生動物有照片,其餘 21 種常見動物(狗、貓、牛...)都只用 emoji。
  這次一口氣把剩下 24 個 emoji-only 的動物都補上真實照片(狗、貓、牛、
  水牛、馬、豬、雞、鴨、鵝、魚、蝦、蟳、鳥、兔、象、虎、獅、蛇、龜、蜂、
  鼠、駱駝、蜘蛛、田蛤仔),emoji 保留不刪,照片跟 emoji 並存增加出題
  變化,做法跟之前樹種/水果/工程車照片批次一致。這些漢字全部是題庫既有
  詞(emoji 清單本來就有),不需要另外查證,只需要找對應的 CC 授權照片。
  過程中踩到一個小坑:第一輪選的豬照片(英國農場遠景,豬只是畫面裡幾個
  小點)實際截圖看太小根本認不出來,換成一張近拍的迷你豬才行——這也是
  CLAUDE.md 測試紀律裡強調「有視覺相關改動要實際截圖看過」的原因之一,
  單看檔名跟授權資訊猜不出實際構圖好不好。批次邏輯測試 8000 題零錯誤,
  Playwright 確認 24 張圖全部正確載入顯示。
- 2026-09-18:使用者反應「卡車的圖,是三噸半貨車」——原本配「卡車」的照片
  (香港 Isuzu 箱型貨車)看起來像參考資料裡「發財仔車」的同義詞「三噸半」
  那個等級的輕型貨車,跟「卡車」該有的大型貨車量級不符,容易讓「卡車」跟
  「發財仔車」兩題看起來像同一種車。換成一張明顯更大型的多軸貨車照片
  (Isuzu GIGA,CC BY-SA 3.0,Mj-bird),`truck.jpg` 檔名不變、內容換掉。
- 2026-09-18:「樹仔/草仔」模式加 3 個常見台灣行道樹/園藝植物:七里香、
  福木、芙蓉(木芙蓉)。教育部辭典(主辭典+擴充辭典,共 21,282 筆原始
  資料)完全查不到這三個詞,常見同義詞(月橘、九里香、十里香、木芙蓉)
  也查不到;順手查了三個姐妹專案(project_claude_TTS_SST、台灣鐵路
  四界行、geo地理,動物,人體,車,蟲)確認也沒有這類植物資料。如實跟
  使用者回報查證結果之後,使用者直接提供白話字/教部羅雙欄對照的羅馬字
  (七里香 tshit-lí-hiong、福木 hok-bo̍k、芙蓉 Phû-iông),只做過
  `Romanize.parseWord()` 格式驗證,不是辭典查來的,程式碼註解跟這裡都
  有清楚標明。照片一樣是 Wikimedia Commons CC BY/CC BY-SA 授權,列在
  「圖片授權」。
- 2026-09-18:使用者反應「怪手的照片應該是豬哥牙」,追問後確認:原本配
  「怪手」的輪式挖土機照片(CAT M315C)其實是要拿來配「豬哥牙」的。
  處理方式:把那張照片改名成 `wheeled-excavator.jpg`,改標「豬哥牙」,
  跟原本已經有的 `fork-tines.jpg`(堆高機貨叉載貨那張)並列——現在「豬哥牙」
  對應兩張不同照片,使用者確認 `fork-tines.jpg` 不用動。「怪手」另外換一張
  新的履帶式挖土機照片(Komatsu excavator,CC0,Daderot)。工程車題庫維持
  15 個詞,但照片變成 16 張。技術上確認過:兩個「豬哥牙」項目雖然共用同一個
  辭典 entry 物件參考,但 `genFromPicturePool()` 的干擾選項過濾邏輯是比對
  entry 物件參考(不是比對漢字字串),所以不會出現「豬哥牙」同時是正解又是
  自己的干擾選項這種重複情形,批次測試 3000 題零重複選項。
- 2026-09-18:「工程車」模式補回「山貓」「豬哥牙」「干樂」「田螺」4 個詞
  (原本因為辭典裡同樣的漢字定義是別的東西而排除,見下一條紀錄)。使用者
  確認:這幾個是工程車圈子把辭典本來就有的字借去當暱稱用(跟英語把
  skid loader 暱稱叫「Bobcat」同一種構詞方式),只要清楚標明來源就可以
  收錄,不用因為辭典主要義項對不上就整個排除。動手前先逐一核對這幾個詞
  在辭典裡的實際讀音跟參考資料標注的羅馬字是否一致——山貓 suann-niau、
  豬哥牙 ti-ko-gê、干樂 kan-lo̍k、田螺 tshân-lê,全部一致,確認發音沒有
  疑慮才收錄(還是用 `byHanzi` 查到的辭典讀音,不是另外編的)。「鋼牙」
  (液壓剪/破碎爪這種挖土機用的拆除工具)因為找不到授權乾淨的照片,這次
  還是沒收錄,純粹是圖片素材問題,不是資料查證問題。「干樂」「田螺」
  指的是同一種車(混凝土攪拌車)的不同暱稱,刻意各配一張不同照片,不是
  同一張圖重複掛兩題。工程車題庫現在共 15 個詞。
- 2026-09-18:新增「工程車」出題模式(11 張照片,`vehicle-hanzi`/`vehicle-roman`
  兩個獨立勾選框,做法跟動物/身體部位/樹仔草仔一致)。使用者把一份台語工程車
  詞彙整理(臉書貼文截圖)放進 `reference/《常見的工程車台語1》.md`,裡面
  每種工程車列了好幾個台語同義詞。查證時發現這份資料裡有幾個常見俗稱——
  「山貓」(鏟裝機)、「鋼牙」(液壓剪)、「豬哥牙」(堆高機貨叉)、「干樂」
  「田螺」(混凝土攪拌車暱稱)——雖然辭典裡查得到同樣的漢字,但辭典對這幾個
  字的定義完全是別的東西(雲豹/假牙/虎牙/陀螺/水生螺類),不是這裡要的工程車
  意思,所以沒有收錄,不能因為「漢字剛好存在」就當作查證通過。最後收錄
  11 個詞:吊車、攄塗機、怪手、卡車、發財仔車、油罐車這 6 個辭典查得到且
  定義對得上;堆高機、流籠車、沙石仔車、鴨母車、鐵輪這 5 個辭典沒收錄,改用
  參考資料本身的羅馬字,只做過 `Romanize.parseWord()` 格式驗證。混凝土攪拌車
  的其中一個俗稱是外來語借音、沒有對應漢字寫法,格式上放不進題庫,所以沒收;
  「拖車」查證得過,但找不到跟卡車照片有明顯區隔、授權又乾淨的圖,這批也沒收。
  照片一樣是 Wikimedia Commons CC0/CC BY-SA,授權列在「圖片授權」。
- 2026-09-18:「動物」「身體部位」「樹仔/草仔」三個看圖模式,原本各自是一個
  勾選框、每題內部隨機決定考漢字還是考羅馬字;使用者反應想要能分開只選一種
  方向練習,所以拆成 `-hanzi`/`-roman` 兩個獨立勾選框(例如「動物(看圖猜台語
  漢字)」「動物(看圖猜羅馬字)」),兩個都勾就跟以前一樣混合出。技術上
  `Questions.generate()` 的 dispatch 邏輯從「命中 `animal` 就內部擲骰子選
  方向」改成「命中 `animal-hanzi`/`animal-roman` 就直接對應方向,不用再擲
  骰子」,`genAnimal`/`genBody`/`genPlant` 本身邏輯沒動。「漢字↔羅馬字」
  「聲調」「地名/溪流」這三個仍然維持原本單一勾選框、內部隨機兩個方向的
  做法沒有改,只有這三個看圖模式拆開。
- 2026-09-18:「樹仔/草仔」模式加 12 種水果照片:弓蕉(香蕉)、西瓜、
  王梨(鳳梨)、葡萄、菝仔(芭樂)、木瓜、柿仔、枇杷、草莓、蓮霧、楊桃、
  時計果(百香果)。查證過程中發現「鳳梨」「番石榴」「百香果」都不是
  辭典正字,改用辭典實際收錄的台語詞「王梨」「菝仔」「時計果」;另外
  「釋迦」這個詞在辭典裡的定義是「釋迦牟尼佛」,不是水果,所以沒有收錄
  這個常見水果詞,避免掛錯圖配錯義(資料誠實原則,寧可少收一個常見詞,
  不要把辭典裡意思不對的詞硬套上水果照片)。圖片一樣是 Wikimedia Commons
  CC0/CC BY/CC BY-SA 授權,本機用 Pillow 等比縮到長邊 900px 壓縮。
- 2026-09-17:「樹仔/草仔」模式再加 8 個常見樹種照片:榕、樟、松、柳、
  鳳凰木、菩提樹、龍眼、荔枝。做法跟原本 5 種鄉土樹種一樣——先查證教育部
  辭典確實收錄這 8 個詞(都有,詳細定義見 `src/lib/questions.js` 的
  `PLANT_WORDS` 註解對應),再到 Wikimedia Commons 搜圖、用 `imageinfo`
  確認授權是 CC0/CC BY-SA 才下載。這批圖片跟先前 5 張不同的是直接抓原始檔、
  用 Pillow 在本機等比縮到長邊 900px、JPEG 品質 78 壓縮(先前 5 張是直接用
  Commons 的 480px thumbnail API),兩種縮圖方式效果接近,壓縮後單張
  110~230KB,一樣適合網頁載入。詳細授權/攝影者列在「圖片授權」章節。
- 2026-09-17:新增「一人刷題」模式,設定畫面可以切換「雙人搶答拔河」/
  「一人刷題」。一人模式沒有搶答/隊伍機制,單純出題→按 1~4 或點按鈕作答
  →立刻看到對/錯與正解→自動跳下一題,可以拿來單純練習台語詞彙。成績分
  兩層:「本次」是這次開啟頁面到現在的統計,離開就歸零;「累計」用
  `localStorage`(key: `taigiTugOfWar.soloStats.v1`)永久保存在瀏覽器裡
  (換瀏覽器/清瀏覽器資料/無痕模式不會保留,純前端沒有帳號系統也不會同步
  到別的裝置),設定畫面有「清除累計紀錄」按鈕,按下去會先跳確認對話框
  才真的清除。技術上新增 `SoloState`(狀態機,跟既有的 `GameState` 平行,
  answering→result 兩階段,沒有搶答/連坐盜答那些隊伍才有的狀態)、
  `SoloStats`(純 localStorage 存取模組)兩個檔案;`ui.js`/`main.js` 把
  原本只給團隊模式用的計時器、題目呈現邏輯抽出共用函式(`renderPrompt()`、
  泛型化的 `armTimer()`/`startTimerBar()`),讓一人模式重用而不是複製一份。
  出題邏輯(`Questions.generate()`)完全沒動,兩種模式共用同一套題庫跟同一套
  資料誠實/授權規範。測試時抓到一個 CSS 規範小 bug:`#soloStatsBox` 原本
  只靠 `hidden` 屬性切換顯示,但同時又有 `#soloStatsBox { display: flex }`
  這條 ID 選擇器規則,specificity 比瀏覽器內建的 `[hidden]{display:none}`
  高,導致團隊模式下這個累計數據框其實還是顯示著——這是實際開瀏覽器截圖
  比對「team mode 應該看不到」才抓到的,單看程式碼邏輯看不出來,補了一條
  `#soloStatsBox[hidden] { display: none; }`。
- 2026-09-16:題庫從 13,876 詞擴充到 19,821 詞(+43%)。使用者記得
  `project_claude_TTS_SST/dict.js` 有合併兩個辭典檔案,查了一下確實
  如此——除了原本用的主辭典 `dict-twblg.json`,g0v/moedict-data-twblg
  專案還有一份 `dict-twblg-ext.json` 擴充辭典(6,793 筆,扣掉跟主辭典
  重複的 678 筆,淨增 6,115 個全新詞)。`build-questions.js` 的篩選邏輯
  抽成 `processItems()` 共用函式,主辭典跟擴充辭典都跑同一套規則、共用
  同一份查重集合(主辭典先處理,重複詞以主辭典為準)。擴充辭典的羅馬字
  格式跟主辭典相容,19,821 詞全部零解析失敗。4000 題跨全部 8 種模式的
  批次測試零錯誤。
- 2026-09-16:骨頭類題目原本全部共用同一顆 🦴 emoji,使用者反應「圖片都一樣」
  沒有辨識度。改成用一張沒有文字標籤、已公版的人骨全身圖(1896年出版),
  依骨頭部位裁成頭骨上/下半、胸腔、脊椎、骨盆、大腿、膝蓋、小腿、腳、上臂、
  整隻手臂、整條腿共 12 種局部特寫,同一區域的骨頭共用同一張裁圖(例如
  胸掛骨/胸坎骨/算仔骨都用胸腔裁圖)。裁切用 CSS `background-size`/
  `background-position` 做「cover」式縮放定位,座標是拿 Playwright 對著
  真實圖片反覆截圖校正出來的(先畫方格對照座標,再迭代調整,過程中修正了
  一個 Y 軸公式的 bug——`background-size:X% auto` 的高度是照圖片比例
  自動算的,不能直接套用 X 軸的縮放倍率去算 Y 軸位置,兩者要分開算)。
  技術上新增 `promptType: 'crop'`,`ui.js` 用一個 `<div>` 設
  background-image 系列樣式呈現,跟原本的 `<img>` 方式(emoji/完整照片)
  並存。
- 2026-09-16:「身體部位」模式擴充 18 個人骨部位詞彙,照使用者提供的骨骼圖
  (作者:藍采琍)加入。跟辭典交叉比對:圖上 22 個詞裡有 15 個辭典也查得到,
  讀音完全一致(互相驗證過,提高對這張圖整體可信度的信心);其餘 8 個辭典
  沒收錄,改用圖片本身標示的羅馬字,只做過 `Romanize.parseWord()` 格式驗證,
  README 有標明這幾個的來源限制。技術上把三個圖片題庫(動物/身體部位/植物)
  共用的組池邏輯抽成 `buildPicturePool()`,支援「辭典查不到但清單自己帶
  `poj` 羅馬字」的 fallback,之後其他模式要混用「部分查辭典、部分用手動
  羅馬字」也能重用同一套機制。
- 2026-09-16:新增「樹仔/草仔」出題模式,做法跟動物模式一樣(逐一查證教育部
  辭典收錄)。加上版本資訊顯示——畫面最下方顯示版本號+最後更新時間
  (`data/version.js`,用 `data/bump-version.js` 手動更新),跟遊戲邏輯無關,
  純粹方便判斷玩的是不是最新版。也把 `run-taigi-tug-of-war` skill 跟這份
  README 更新到反映目前所有 6 種出題模式與難易度分級功能。
- 2026-09-16:新增「身體部位」「地名/溪流」兩個出題模式。身體部位(含骨頭)
  做法跟動物模式一樣,每個詞都查證過教育部辭典確實收錄才收;地名/溪流查證
  過教育部辭典幾乎沒收錄具體地名(標記「地名」的詞條只有 12 筆,真正地名
  只有「淡水」「西門町」兩個,溪流是 0),所以改用本機另外兩個專案(「台灣
  鐵路四界行」的車站資料庫、「geo地理,動物,人體,車,蟲」的山脈/溪流/地標
  資料)整理好的地名清單,兩個都只讀取、沒有修改那兩個專案的任何內容。這些
  地名羅馬字已經用 `Romanize.parseWord()` 逐筆驗證過格式正確,但沒辦法像
  其他模式一樣對照教育部辭典逐字確認發音,README 有清楚標明這個限制。順手把
  「動物」模式原本的出題邏輯抽成共用函式 `genFromPicturePool`,身體部位模式
  直接複用,減少重複程式碼。
- 2026-09-16:加上難易度分級(國小/國中/高中/大學)篩選。查證過教育部辭典跟
  它的網頁都沒有難易度欄位;唯一有分級概念的官方來源(國家教育研究院台語
  教科書詞彙系統)欄位存在但被介面隱藏、沒有批次匯出,撈不到,而且該系統
  本來就只到國中。跟使用者確認後改用 Claude 自己的近似判斷規則(手動常用詞
  清單 + 辭典釋義關鍵字 + 字數當 fallback),在 `data/build-questions.js` 的
  `classifyLevel()`,誠實標示為 AI 主觀判斷、非官方資料。設定畫面新增難易度
  複選,只影響查辭典的三個模式(詞義/漢字羅馬字/聲調)。
- 2026-09-16:新增「九九乘法」出題模式。跟其他模式不同,這個完全不是查辭典
  來的(辭典沒有組合數字詞),數字讀音是手動刻的一套規則,採用傳統九九乘法歌
  慣用的文讀音(已跟使用者確認要用這套讀法,不是日常口語的 tsi̍t/nn̄g/peh)。
  兩位數用規律的「X十Y」組字,逐字報數不套用連讀變調。實測 500 題全部人工
  核對答案正確(8×5=40、9×8=72、5×9=45 等)。
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
