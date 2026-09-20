// 「動物/身體部位/植物/工程車/地名」五個出題模式共用的手動整理詞庫,從
// src/lib/questions.js 抽出來獨立成這支檔案(2026-09-20),原因是
// find.html(辭典查詢頁)原本刻意不載入 src/lib/questions.js(那支還有出題
// generate() 邏輯,find.html 用不到),但使用者的詞這五個模式裡有不少詞
// (尤其非辭典收錄、只做過格式驗證的那些)在 find.html 查不到,體驗上像是
// 「查無此詞」的假警報。抽成這支純資料檔案後,questions.js(出題引擎)跟
// find.js(查詢頁)都能各自載入,不用把出題邏輯也一起搬進查詢頁。
//
// 每個詞來源的查證方式見各清單上方的註解,原則不變(見專案 CLAUDE.md「資料
// 誠實原則」):優先查教育部辭典,查不到的才用其他來源的羅馬字,並且清楚
// 標明來源、只做過 Romanize.parseWord() 格式驗證,不是逐字核對發音。

  // 「動物」模式的題庫:題目是emoji或照片(不是中文字),挑漢字剛好等於常見
  // 動物名、且在題庫裡查得到的詞。用圖像而不是中文動物名當題目,一樣避開
  // 題目是中文的問題,而且對這個主題來說比文字更直覺。
  const ANIMAL_WORDS = [
    { type: 'emoji', value: '🐶', hanzi: '狗' }, { type: 'emoji', value: '🐱', hanzi: '貓' },
    { type: 'emoji', value: '🐮', hanzi: '牛' }, { type: 'emoji', value: '🐃', hanzi: '水牛' },
    { type: 'emoji', value: '🐴', hanzi: '馬' }, { type: 'emoji', value: '🐷', hanzi: '豬' },
    { type: 'emoji', value: '🐑', hanzi: '羊' }, { type: 'emoji', value: '🐔', hanzi: '雞' },
    { type: 'emoji', value: '🦆', hanzi: '鴨' }, { type: 'emoji', value: '🦢', hanzi: '鵝' },
    { type: 'emoji', value: '🐟', hanzi: '魚' }, { type: 'emoji', value: '🦐', hanzi: '蝦' },
    { type: 'emoji', value: '🦀', hanzi: '蟳' }, { type: 'emoji', value: '🐦', hanzi: '鳥' },
    { type: 'emoji', value: '🐰', hanzi: '兔' }, { type: 'emoji', value: '🐘', hanzi: '象' },
    { type: 'emoji', value: '🐯', hanzi: '虎' }, { type: 'emoji', value: '🦁', hanzi: '獅' },
    { type: 'emoji', value: '🐵', hanzi: '猴' }, { type: 'emoji', value: '🐍', hanzi: '蛇' },
    { type: 'emoji', value: '🐢', hanzi: '龜' }, { type: 'emoji', value: '🐝', hanzi: '蜂' },
    { type: 'emoji', value: '🐭', hanzi: '鼠' }, { type: 'emoji', value: '🐻', hanzi: '熊' },
    { type: 'emoji', value: '🦌', hanzi: '鹿' }, { type: 'emoji', value: '🐫', hanzi: '駱駝' },
    { type: 'emoji', value: '🕷️', hanzi: '蜘蛛' }, { type: 'emoji', value: '🐸', hanzi: '田蛤仔' },

    // 台灣野生保育動物照片(CC BY / CC BY-SA,授權與出處見 README「圖片授權」)。
    // 辭典裡沒有「台灣黑熊」「石虎」這種物種專有名詞,所以這些照片配的是辭典
    // 裡真正存在的通用詞(熊、鹿、猴、羊),用台灣的特有種照片來示意——不是
    // 宣稱有一個專屬該物種的台語詞。山豬/水獺/飛鼠則是辭典裡本來就有、剛好
    // 詞跟物種對得上的乾淨案例。
    { type: 'image', value: 'data/images/tw-wildlife/bear.jpg', hanzi: '熊' },
    { type: 'image', value: 'data/images/tw-wildlife/deer.jpg', hanzi: '鹿' },
    { type: 'image', value: 'data/images/tw-wildlife/monkey.jpg', hanzi: '猴' },
    { type: 'image', value: 'data/images/tw-wildlife/goat.jpg', hanzi: '羊' },
    { type: 'image', value: 'data/images/tw-wildlife/boar.jpg', hanzi: '山豬' },
    { type: 'image', value: 'data/images/tw-wildlife/otter.jpg', hanzi: '水獺' },
    { type: 'image', value: 'data/images/tw-wildlife/flying-squirrel.jpg', hanzi: '飛鼠' },

    // 2026-09-18 新增:原本只用 emoji 的常見動物(家畜/家禽/水產/野生動物)
    // 也補上真實照片,emoji 保留不刪,兩者並存增加出題變化——跟樹仔/草仔、
    // 工程車模式同一套做法。每個漢字都已經是題庫既有詞(見上面的 emoji
    // 清單),不需要另外查證,直接讓 buildPicturePool() 用 byHanzi 查到的
    // 辭典讀音。照片授權見 README「圖片授權」。
    { type: 'image', value: 'data/images/tw-wildlife/dog.jpg', hanzi: '狗' },
    { type: 'image', value: 'data/images/tw-wildlife/cat.jpg', hanzi: '貓' },
    { type: 'image', value: 'data/images/tw-wildlife/cattle.jpg', hanzi: '牛' },
    { type: 'image', value: 'data/images/tw-wildlife/buffalo.jpg', hanzi: '水牛' },
    { type: 'image', value: 'data/images/tw-wildlife/horse.jpg', hanzi: '馬' },
    { type: 'image', value: 'data/images/tw-wildlife/pig.jpg', hanzi: '豬' },
    { type: 'image', value: 'data/images/tw-wildlife/chicken.jpg', hanzi: '雞' },
    { type: 'image', value: 'data/images/tw-wildlife/duck.jpg', hanzi: '鴨' },
    { type: 'image', value: 'data/images/tw-wildlife/goose.jpg', hanzi: '鵝' },
    { type: 'image', value: 'data/images/tw-wildlife/fish.jpg', hanzi: '魚' },
    { type: 'image', value: 'data/images/tw-wildlife/shrimp.jpg', hanzi: '蝦' },
    { type: 'image', value: 'data/images/tw-wildlife/crab.jpg', hanzi: '蟳' },
    { type: 'image', value: 'data/images/tw-wildlife/bird.jpg', hanzi: '鳥' },
    { type: 'image', value: 'data/images/tw-wildlife/rabbit.jpg', hanzi: '兔' },
    { type: 'image', value: 'data/images/tw-wildlife/elephant.jpg', hanzi: '象' },
    { type: 'image', value: 'data/images/tw-wildlife/tiger.jpg', hanzi: '虎' },
    { type: 'image', value: 'data/images/tw-wildlife/lion.jpg', hanzi: '獅' },
    { type: 'image', value: 'data/images/tw-wildlife/snake.jpg', hanzi: '蛇' },
    { type: 'image', value: 'data/images/tw-wildlife/turtle.jpg', hanzi: '龜' },
    { type: 'image', value: 'data/images/tw-wildlife/bee.jpg', hanzi: '蜂' },
    { type: 'image', value: 'data/images/tw-wildlife/mouse.jpg', hanzi: '鼠' },
    { type: 'image', value: 'data/images/tw-wildlife/camel.jpg', hanzi: '駱駝' },
    { type: 'image', value: 'data/images/tw-wildlife/spider.jpg', hanzi: '蜘蛛' },
    { type: 'image', value: 'data/images/tw-wildlife/frog.jpg', hanzi: '田蛤仔' },

    // 2026-09-20 新增:使用者提供一組保育類動物解說卡片照片(圖案+台語漢字+
    // 羅馬字),逐張核對教育部辭典查證結果如下——
    //   - 兩個乾淨案例,辭典本身收錄的詞義就是同一個物種,直接用辭典讀音,
    //     不帶額外的 `poj`:「羌仔」(kiunn-á,辭典釋義就是山羌/台灣羌仔,
    //     只是辭典沒收錄「台灣」這個字首,卡片本身的「台灣羌仔」改成辭典
    //     既有的「羌仔」);「鯪鯉」(lâ-lí,辭典釋義就是穿山甲,卡片的
    //     「台灣鯪鯉」同樣改成辭典既有的「鯪鯉」)。
    //   - 一個「同一個漢字、辭典另有其他意思」的借用案例:「塗龍」
    //     (thôo-liông)辭典查得到,但釋義是「土龍、蛇鰻」(一種魚類),
    //     不是山椒魚;卡片上的讀音跟辭典讀音完全一致,只是拿來指山椒魚的
    //     台語俗稱,跟工程車模式的山貓/干樂/田螺是同一種「借字」模式,
    //     已經加進 find.js 的 `BORROWED_HANZI_NOTE`,查到時會加警示註記。
    //   - 剩下 9 個辭典完全查不到,改用卡片本身標示的羅馬字,只做過
    //     `Romanize.parseWord()` 格式驗證,沒有逐字跟辭典核對發音——
    //     台灣烏熊、梅花鹿、烏雉雞(帝雉,卡片上的漢字經使用者確認)、
    //     華雞(藍腹鷴的卡片俗名)、石虎、台灣猴、青腰仔、石龜、紋斑。
    //   - 「媽祖魚」(Má-tsóo-hî,台灣白海豚)也是辭典查無、只做格式驗證
    //     這一類,但額外要說明配圖:Wikimedia Commons 上找不到 CC 授權、
    //     拍到台灣西部沿海這個瀕危族群(僅存數十隻)的照片,配圖用的是同
    //     物種(Sousa chinensis)在香港大嶼山海域拍攝的野生個體,不是台灣
    //     族群本身的照片,這裡老實說清楚,不要讓人誤以為是台灣拍到的。
    //     使用者問「可以用我提供的圖片嗎」(卡片本身是出版品,不是使用者
    //     自己拍的照片,不符合專案圖片授權原則)之後,再找一輪 Commons 時
    //     也發現原本選的候選照片(Pink Dolphin.JPG)分類標籤寫著
    //     「Captive mammals」「Cetaceans of Thailand」,其實是泰國圈養
    //     個體,換成現在這張野生個體的照片。
    // 照片授權見 README「圖片授權」。
    { type: 'image', value: 'data/images/tw-wildlife/muntjac.jpg', hanzi: '羌仔' },
    { type: 'image', value: 'data/images/tw-wildlife/pangolin.jpg', hanzi: '鯪鯉' },
    { type: 'image', value: 'data/images/tw-wildlife/salamander.jpg', hanzi: '塗龍' },
    { type: 'image', value: 'data/images/tw-wildlife/formosan-black-bear.jpg', hanzi: '台灣烏熊', poj: 'Tâi-uân-oo-hîm' },
    { type: 'image', value: 'data/images/tw-wildlife/sika-deer.jpg', hanzi: '梅花鹿', poj: 'muî-hue-lo̍k' },
    { type: 'image', value: 'data/images/tw-wildlife/mikado-pheasant.jpg', hanzi: '烏雉雞', poj: 'oo-thî-ke' },
    { type: 'image', value: 'data/images/tw-wildlife/swinhoe-pheasant.jpg', hanzi: '華雞', poj: 'huâ-ke' },
    { type: 'image', value: 'data/images/tw-wildlife/leopard-cat.jpg', hanzi: '石虎', poj: 'tsioh-hóo' },
    { type: 'image', value: 'data/images/tw-wildlife/formosan-macaque.jpg', hanzi: '台灣猴', poj: 'Tâi-uân-kâu' },
    { type: 'image', value: 'data/images/tw-wildlife/tree-frog.jpg', hanzi: '青腰仔', poj: 'tshenn-io-á' },
    { type: 'image', value: 'data/images/tw-wildlife/green-turtle.jpg', hanzi: '石龜', poj: 'tsioh-ku' },
    { type: 'image', value: 'data/images/tw-wildlife/white-dolphin.jpg', hanzi: '媽祖魚', poj: 'Má-tsóo-hî' },
    { type: 'image', value: 'data/images/tw-wildlife/landlocked-salmon.jpg', hanzi: '紋斑', poj: 'bûn-pan' },
  ];

  // 「樹仔/草仔」模式的題庫:跟動物模式做法一樣,先逐一查證教育部辭典確實
  // 收錄才放進來。常見的植物有現成 emoji;比較有台灣特色、沒有對應 emoji
  // 的樹種改用照片(CC BY / CC BY-SA,授權與出處見 README「圖片授權」)。
  const PLANT_WORDS = [
    { type: 'emoji', value: '🌳', hanzi: '樹' },
    { type: 'emoji', value: '🌱', hanzi: '草' },
    { type: 'emoji', value: '🌸', hanzi: '花' },
    { type: 'emoji', value: '🍃', hanzi: '葉' },
    { type: 'emoji', value: '🎋', hanzi: '竹' },
    { type: 'emoji', value: '🥭', hanzi: '檨仔' },
    { type: 'emoji', value: '🌽', hanzi: '番麥' },
    { type: 'emoji', value: '🌾', hanzi: '稻穗' },
    { type: 'emoji', value: '🥥', hanzi: '椰子' },
    { type: 'emoji', value: '🧄', hanzi: '蒜' },
    { type: 'emoji', value: '🫚', hanzi: '薑' },
    { type: 'emoji', value: '🥬', hanzi: '菜' },

    // 台灣常見原生/鄉土樹種照片,辭典裡沒有現成 emoji 可以配,改用照片示意。
    { type: 'image', value: 'data/images/tw-plants/acacia.jpg', hanzi: '相思仔' },
    { type: 'image', value: 'data/images/tw-plants/bischofia.jpg', hanzi: '茄苳' },
    { type: 'image', value: 'data/images/tw-plants/pandanus.jpg', hanzi: '林投' },
    { type: 'image', value: 'data/images/tw-plants/casuarina.jpg', hanzi: '木麻黃' },
    { type: 'image', value: 'data/images/tw-plants/areca.jpg', hanzi: '檳榔' },

    // 更多常見樹種照片(2026-09-17 新增),同樣是辭典裡查得到詞、但沒有
    // 對應 emoji 的情況。
    { type: 'image', value: 'data/images/tw-plants/banyan.jpg', hanzi: '榕' },
    { type: 'image', value: 'data/images/tw-plants/camphor.jpg', hanzi: '樟' },
    { type: 'image', value: 'data/images/tw-plants/pine.jpg', hanzi: '松' },
    { type: 'image', value: 'data/images/tw-plants/willow.jpg', hanzi: '柳' },
    { type: 'image', value: 'data/images/tw-plants/flame.jpg', hanzi: '鳳凰木' },
    { type: 'image', value: 'data/images/tw-plants/bodhi.jpg', hanzi: '菩提樹' },
    { type: 'image', value: 'data/images/tw-plants/longan.jpg', hanzi: '龍眼' },
    { type: 'image', value: 'data/images/tw-plants/litchi.jpg', hanzi: '荔枝' },

    // 水果類照片(2026-09-17 新增)。同一套查證流程:先確認教育部辭典有
    // 收錄這個詞才找圖。「鳳梨」辭典查無此字,改用辭典實際收錄的台語正字
    // 「王梨」;「番石榴」「百香果」同理改用辭典正字「菝仔」「時計果」;
    // 辭典裡的「釋迦」詞條定義是「釋迦牟尼佛」,不是水果,所以沒有收錄
    // 這個常見水果詞,避免掛錯圖配錯義。
    { type: 'image', value: 'data/images/tw-plants/banana.jpg', hanzi: '弓蕉' },
    { type: 'image', value: 'data/images/tw-plants/watermelon.jpg', hanzi: '西瓜' },
    { type: 'image', value: 'data/images/tw-plants/pineapple.jpg', hanzi: '王梨' },
    { type: 'image', value: 'data/images/tw-plants/grape.jpg', hanzi: '葡萄' },
    { type: 'image', value: 'data/images/tw-plants/guava.jpg', hanzi: '菝仔' },
    { type: 'image', value: 'data/images/tw-plants/papaya.jpg', hanzi: '木瓜' },
    { type: 'image', value: 'data/images/tw-plants/persimmon.jpg', hanzi: '柿仔' },
    { type: 'image', value: 'data/images/tw-plants/loquat.jpg', hanzi: '枇杷' },
    { type: 'image', value: 'data/images/tw-plants/strawberry.jpg', hanzi: '草莓' },
    { type: 'image', value: 'data/images/tw-plants/waxapple.jpg', hanzi: '蓮霧' },
    { type: 'image', value: 'data/images/tw-plants/starfruit.jpg', hanzi: '楊桃' },
    { type: 'image', value: 'data/images/tw-plants/passionfruit.jpg', hanzi: '時計果' },

    // 七里香、福木、芙蓉(2026-09-18 新增)。教育部辭典(主辭典+擴充辭典,
    // 共 21,282 筆原始資料)完全查不到這三個詞,常見同義詞(月橘、九里香、
    // 十里香、木芙蓉)也查不到,三個姐妹專案(project_claude_TTS_SST、
    // 台灣鐵路四界行、geo地理,動物,人體,車,蟲)也都沒有這類植物資料。
    // 如實跟使用者回報查無此詞之後,使用者直接提供白話字/教部羅雙欄對照的
    // 羅馬字,只做過 `Romanize.parseWord()` 格式驗證,不是辭典查來的,也
    // 沒有逐字跟辭典核對發音(因為辭典根本沒收這三個詞可以核對)。
    { type: 'image', value: 'data/images/tw-plants/murraya.jpg', hanzi: '七里香', poj: 'tshit-lí-hiong' },
    { type: 'image', value: 'data/images/tw-plants/fukugi.jpg', hanzi: '福木', poj: 'hok-bo̍k' },
    { type: 'image', value: 'data/images/tw-plants/hibiscus-mutabilis.jpg', hanzi: '芙蓉', poj: 'Phû-iông' },
  ];

  // 工程車照片(2026-09-18 新增)。使用者提供 reference/《常見的工程車台語1》.md
  // (一份台語工程車詞彙的臉書貼文截圖整理),裡面每種車都列了好幾種同義詞。
  // 查證方式:先逐一查教育部辭典有沒有收錄同一個漢字詞——
  //   - 有收錄、而且辭典定義就是這個工程車意思的 6 個詞,直接讓
  //     buildPicturePool() 用辭典本身的讀音(不用這份參考資料的羅馬字):
  //     吊車、攄塗機、怪手、卡車、發財仔車、油罐車。
  //   - 辭典查得到同一個漢字、但定義完全是另一件事的 5 個詞——「山貓」
  //     辭典是雲豹/石虎、「鋼牙」辭典是不鏽鋼假牙、「豬哥牙」辭典是犬齒、
  //     「干樂」辭典是陀螺、「田螺」辭典是水生螺類——工程車俗稱這個義項
  //     辭典完全沒收。使用者確認可以直接用 reference 檔案裡的漢字,只要
  //     清楚標明來源,所以還是收錄了,但這裡要老實講清楚:這是「同一個
  //     漢字被借去當工程車暱稱用」(跟英語把 skid loader 暱稱叫 "Bobcat"
  //     是同一種構詞方式——山貓正是台語版的「Bobcat」哏),不是辭典本身
  //     承認這個字有工程車的意思。實際核對過這 5 個詞在辭典裡的讀音跟
  //     reference 檔案標注的羅馬字完全一致(山貓 suann-niau、鋼牙 kǹg-gê、
  //     豬哥牙 ti-ko-gê、干樂 kan-lo̍k、田螺 tshân-lê),所以還是讓
  //     buildPicturePool() 用 byHanzi 查到的辭典讀音(不用另外帶 poj)——
  //     發音沒有問題,問題只在辭典的字義跟這裡的工程車用法不同,已經在
  //     README「出題模式」跟這裡說明。找不到「鋼牙」(液壓剪/破碎爪)的
  //     乾淨、授權清楚的照片,這批沒收錄,純粹是圖片素材問題。「干樂」
  //     「田螺」都是同一種車(混凝土攪拌車)的不同暱稱,各自配一張不同的
  //     照片,不是重複用同一張圖硬湊兩題。
  //   - 剩下辭典完全查不到的常見工程車,改用參考資料本身的羅馬字,只做過
  //     Romanize.parseWord() 格式驗證,沒有逐字跟辭典核對發音,帶 `poj`
  //     欄位標明來源:堆高機、流籠車、沙石仔車、鴨母車、鐵輪。
  //   - 「lâm-a-khóng 車」(混凝土攪拌車的其中一種俗稱)沒有對應的正式漢字
  //     寫法(是外來語借音,參考資料本身也是用羅馬字代替漢字),沒辦法放進
  //     只接受「hanzi」欄位的題庫格式,所以沒有收錄這個詞。
  //     「拖車」雖然辭典查無此字且格式驗證得過,但找不到跟卡車/貨車照片
  //     視覺上有明顯區隔、授權又乾淨的拖車照片(找到的候選不是被拖車上又
  //     載了別的機具造成混淆,就是跟卡車外觀太像沒有辨識度),所以這批
  //     沒有收錄,不是查證失敗,是圖片素材沒找到夠好的。
  //   - 2026-09-18 修正:原本配「怪手」的輪式挖土機照片(CAT M315C)其實
  //     使用者是要拿來配「豬哥牙」的,所以改名成 `wheeled-excavator.jpg`
  //     並改標「豬哥牙」,跟 `fork-tines.jpg` 並列成兩張不同照片、同一個
  //     漢字答案(使用者確認保留 `fork-tines.jpg` 不用動)。「怪手」另外
  //     換一張新的履帶式挖土機照片(`excavator.jpg`,檔名不變、內容換掉)。
  //   - 2026-09-18 修正:原本配「卡車」的照片(香港 Isuzu 箱型貨車)使用者
  //     反應「看起來像三噸半」——三噸半是參考資料裡「發財仔車」的同義詞
  //     (輕型貨車等級),跟「卡車」該有的大型貨車不是同一個量級,容易讓人
  //     誤會兩題根本是同一種車。換成一張明顯更大型的多軸貨車照片(Isuzu
  //     GIGA,`truck.jpg`,檔名不變、內容換掉),跟 `pickup.jpg`(發財仔車)
  //     在車型量級上有明顯區隔。
  const VEHICLE_WORDS = [
    { type: 'image', value: 'data/images/tw-vehicles/crane.jpg', hanzi: '吊車' },
    { type: 'image', value: 'data/images/tw-vehicles/excavator.jpg', hanzi: '怪手' },
    { type: 'image', value: 'data/images/tw-vehicles/bulldozer.jpg', hanzi: '攄塗機' },
    { type: 'image', value: 'data/images/tw-vehicles/truck.jpg', hanzi: '卡車' },
    { type: 'image', value: 'data/images/tw-vehicles/pickup.jpg', hanzi: '發財仔車' },
    { type: 'image', value: 'data/images/tw-vehicles/tanker.jpg', hanzi: '油罐車' },
    { type: 'image', value: 'data/images/tw-vehicles/forklift.jpg', hanzi: '堆高機', poj: 'tui-ko-ki' },
    { type: 'image', value: 'data/images/tw-vehicles/aerial-platform.jpg', hanzi: '流籠車', poj: 'liû-lông-tshia' },
    { type: 'image', value: 'data/images/tw-vehicles/dump-truck.jpg', hanzi: '沙石仔車', poj: 'sua-tsio̍h-á-tshia' },
    { type: 'image', value: 'data/images/tw-vehicles/skid-loader.jpg', hanzi: '山貓' },
    { type: 'image', value: 'data/images/tw-vehicles/fork-tines.jpg', hanzi: '豬哥牙' },
    { type: 'image', value: 'data/images/tw-vehicles/wheeled-excavator.jpg', hanzi: '豬哥牙' },
    { type: 'image', value: 'data/images/tw-vehicles/mixer-truck-1.jpg', hanzi: '干樂' },
    { type: 'image', value: 'data/images/tw-vehicles/mixer-truck-2.jpg', hanzi: '田螺' },
    { type: 'image', value: 'data/images/tw-vehicles/concrete-pump.jpg', hanzi: '鴨母車', poj: 'ah-bó-tshia' },
    { type: 'image', value: 'data/images/tw-vehicles/roller.jpg', hanzi: '鐵輪', poj: 'thih-lián' },
  ];

  // 骨頭類題目共用同一張人骨全身圖(見 data/images/tw-body/,來源與授權見
  // README「圖片授權」),裁成 12 個不同部位的局部特寫,而不是每題都長一樣。
  // 座標是拿 Playwright 對著真實圖片反覆截圖校正出來的(校正過程見開發紀錄),
  // 不是憑感覺猜的。cx/cy 是裁圖中心點、w/h 是裁圖範圍,單位是圖片的比例
  // (0~1);backgroundSize/backgroundPosition 是照這個公式換算出來的 CSS 值
  // (uiJs 直接拿去當 <img> 的 style 用,cover 式裁切、不變形):
  //   r = 圖片寬/高;zoomX = max(1/w, r/h);zoomY = zoomX / r
  //   backgroundSize = 100*zoomX + '% auto'
  //   backgroundPosition = 100*(0.5-cx*zoomX)/(1-zoomX) + '% ' + 100*(0.5-cy*zoomY)/(1-zoomY) + '%'
  const BONE_IMAGE = 'data/images/tw-body/skeleton.webp';
  const BONE_CROPS = {
    'skull-upper': { backgroundSize: '676.2% auto', backgroundPosition: '41.2% 6.6%' },
    'skull-lower': { backgroundSize: '1014.3% auto', backgroundPosition: '42.2% 13.8%' },
    chest: { backgroundSize: '380.4% auto', backgroundPosition: '40.5% 23.8%' },
    spine: { backgroundSize: '1000.0% auto', backgroundPosition: '44.4% 30.8%' },
    pelvis: { backgroundSize: '760.7% auto', backgroundPosition: '41.9% 46.7%' },
    thigh: { backgroundSize: '434.7% auto', backgroundPosition: '40.9% 57.0%' },
    knee: { backgroundSize: '1014.3% auto', backgroundPosition: '43.3% 67.0%' },
    lowerleg: { backgroundSize: '476.2% auto', backgroundPosition: '41.8% 81.0%' },
    feet: { backgroundSize: '869.4% auto', backgroundPosition: '41.0% 90.3%' },
    upperarm: { backgroundSize: '555.6% auto', backgroundPosition: '24.4% 29.8%' },
    fullarm: { backgroundSize: '500.0% auto', backgroundPosition: '18.8% 38.6%' },
    fullleg: { backgroundSize: '714.3% auto', backgroundPosition: '37.2% 68.6%' },
  };

  // 「身體部位」模式的題庫:跟動物模式做法一樣,題目是emoji或照片,挑辭典裡
  // 查得到的身體部位詞。都是逐一查證過教育部辭典確實有收錄才放進來的,不是
  // 猜的(骨頭類的來源見上方 BONE_CROPS 註解)。
  const BODY_WORDS = [
    { type: 'emoji', value: '👁️', hanzi: '目睭' },
    { type: 'emoji', value: '👂', hanzi: '耳仔' },
    { type: 'emoji', value: '👃', hanzi: '鼻仔' },
    { type: 'emoji', value: '👄', hanzi: '喙' },
    { type: 'emoji', value: '🦷', hanzi: '喙齒' },
    { type: 'emoji', value: '👅', hanzi: '舌' },
    { type: 'emoji', value: '✋', hanzi: '手' },
    { type: 'emoji', value: '🦵', hanzi: '跤' },
    { type: 'emoji', value: '❤️', hanzi: '心臟' },
    { type: 'emoji', value: '🫁', hanzi: '肺' },
    { type: 'emoji', value: '🩸', hanzi: '血' },
    { type: 'image', value: BONE_IMAGE, hanzi: '骨' },
    { type: 'crop', value: BONE_IMAGE, region: 'fullarm', hanzi: '手骨' },
    { type: 'crop', value: BONE_IMAGE, region: 'fullleg', hanzi: '跤骨' },
    { type: 'crop', value: BONE_IMAGE, region: 'skull-upper', hanzi: '頭殼' },
    { type: 'emoji', value: '🍑', hanzi: '尻川' },

    // 人骨圖詳細部位(使用者提供的骨骼圖,作者:藍采琍)。大部分辭典裡也查
    // 得到、讀音跟圖上完全一致(等於互相驗證過);辭典沒收錄的幾個(鼻骨、
    // 頂胘骨、算仔骨、尾錐、腸骨、盆胲骨、跤頭碗、跤指頭仔骨)才用 `poj`
    // 欄位——這幾個是圖片本身標示的羅馬字,不是辭典查來的,只做過格式驗證
    // (Romanize.parseWord 解析得出來),沒辦法像辭典詞一樣逐字確認發音,
    // 請比較保留地看待。
    //
    // 題目圖片:一張沒有文字標籤的人骨全身圖(1896年出版,已公版/Public
    // Domain,Arthur Thomson 繪、Henry Frowde 出版),依骨頭所在的身體部位
    // 裁出 12 種不同的局部特寫(見 BONE_CROPS),不會每一題都長一樣。同一
    // 部位裡好幾根骨頭共用同一張裁圖是刻意的(例如胸掛骨/胸坎骨/算仔骨都
    // 共用「chest」裁圖),不是偷懶——那些骨頭本來就在畫面同一塊區域。
    { type: 'crop', value: BONE_IMAGE, region: 'skull-upper', hanzi: '頭殼碗' },
    { type: 'crop', value: BONE_IMAGE, region: 'skull-lower', hanzi: '牙槽骨' },
    { type: 'crop', value: BONE_IMAGE, region: 'skull-lower', hanzi: '鼻骨', poj: 'phīnn-kut' },
    { type: 'crop', value: BONE_IMAGE, region: 'upperarm', hanzi: '飯匙骨' },
    { type: 'crop', value: BONE_IMAGE, region: 'upperarm', hanzi: '頂胘骨', poj: 'tíng-kong-kut' },
    { type: 'crop', value: BONE_IMAGE, region: 'chest', hanzi: '胸掛骨' },
    { type: 'crop', value: BONE_IMAGE, region: 'chest', hanzi: '胸坎骨' },
    { type: 'crop', value: BONE_IMAGE, region: 'chest', hanzi: '算仔骨', poj: 'pín-á-kut' },
    { type: 'crop', value: BONE_IMAGE, region: 'spine', hanzi: '龍骨' },
    { type: 'crop', value: BONE_IMAGE, region: 'pelvis', hanzi: '尾胴骨' },
    { type: 'crop', value: BONE_IMAGE, region: 'pelvis', hanzi: '尾錐', poj: 'bué-tsui' },
    { type: 'crop', value: BONE_IMAGE, region: 'pelvis', hanzi: '腸骨', poj: 'tn̄g-kut' },
    { type: 'crop', value: BONE_IMAGE, region: 'pelvis', hanzi: '盆胲骨', poj: 'phûn-kha-kut' },
    { type: 'crop', value: BONE_IMAGE, region: 'pelvis', hanzi: '尻川骨' },
    { type: 'crop', value: BONE_IMAGE, region: 'thigh', hanzi: '大腿骨' },
    { type: 'crop', value: BONE_IMAGE, region: 'knee', hanzi: '跤頭碗', poj: 'kha-thâu-uánn' },
    { type: 'crop', value: BONE_IMAGE, region: 'lowerleg', hanzi: '跤肚骨' },
    { type: 'crop', value: BONE_IMAGE, region: 'lowerleg', hanzi: '跤胴骨' },
    { type: 'crop', value: BONE_IMAGE, region: 'feet', hanzi: '跤指頭仔骨', poj: 'kha-tsíng-thâu-á-kut' },
  ];

  // 「地名/溪流」模式的題庫:教育部辭典幾乎沒收錄具體地名(查證過,標記
  // 「地名」的詞條全辭典只有 12 筆,扣掉「地號名」這種泛稱,真正的地名只有
  // 「淡水」「西門町」兩個;溪流一個都沒有)——這裡改用本機另外兩個專案已經
  // 整理好的地名/地理資料:
  //   - 全台鐵路車站名(73筆):來自「台灣鐵路四界行」專案的車站資料庫。
  //   - 山脈/溪流/地標(14筆):來自「geo地理,動物,人體,車,蟲」專案。
  // 這兩份都不是教育部辭典本身的資料,是另外兩個本機專案整理的,已經用
  // Romanize.parseWord() 逐筆驗證過羅馬字格式解析得出來、且跟已知的台語
  // 讀音慣例(例:台北 Tâi-pak、高雄 Ko-hiông)核對過看起來合理,但沒辦法像
  // 其他模式一樣對照教育部辭典本身逐字確認發音,所以請比較保留地看待,如果
  // 哪個地名的讀音有問題,歡迎回報修正,見 README「地名/溪流資料來源」。
  const PLACE_RAW = [
    { hanzi: '基隆', poj: 'Kî-liông' }, { hanzi: '八堵', poj: 'Pat-tóo' },
    { hanzi: '暖暖', poj: 'Luán-luán' }, { hanzi: '瑞芳', poj: 'Sūi-hong' },
    { hanzi: '雙溪', poj: 'Siang-khoe' }, { hanzi: '福隆', poj: 'Hok-liông' },
    { hanzi: '宜蘭', poj: 'Gî-lân' }, { hanzi: '蘇澳', poj: 'So-ò' },
    { hanzi: '東澳', poj: 'Tang-ò' }, { hanzi: '新城', poj: 'Sin-siâⁿ' },
    { hanzi: '花蓮', poj: 'Hua-liân' }, { hanzi: '吉安', poj: 'Kiat-an' },
    { hanzi: '壽豐', poj: 'Siū-hong' }, { hanzi: '富源', poj: 'Hù-gôan' },
    { hanzi: '玉里', poj: 'Gio̍k-lí' }, { hanzi: '富里', poj: 'Hù-lí' },
    { hanzi: '池上', poj: 'Tî-siōng' }, { hanzi: '關山', poj: 'Kuan-san' },
    { hanzi: '鹿野', poj: 'Lo̍k-iá' }, { hanzi: '台東', poj: 'Tâi-tang' },
    { hanzi: '知本', poj: 'Ti-pún' }, { hanzi: '大武', poj: 'Tāi-bú' },
    { hanzi: '屏東', poj: 'Pîn-tong' }, { hanzi: '林邊', poj: 'Nâ-pinn' },
    { hanzi: '東港', poj: 'Tang-káng' }, { hanzi: '仁武', poj: 'Jîn-bú' },
    { hanzi: '鳳山', poj: 'Hōng-san' }, { hanzi: '高雄', poj: 'Ko-hiông' },
    { hanzi: '左營', poj: 'Chó-iâⁿ' }, { hanzi: '楠梓', poj: 'Lâm-chú' },
    { hanzi: '岡山', poj: 'Kong-san' }, { hanzi: '大湖', poj: 'Tāi-ôo' },
    { hanzi: '保安', poj: 'Pó-an' }, { hanzi: '台南', poj: 'Tâi-lâm' },
    { hanzi: '沙崙', poj: 'Sua-lūn' }, { hanzi: '永康', poj: 'Íng-khong' },
    { hanzi: '新市', poj: 'Sin-tshī' }, { hanzi: '善化', poj: 'Siān-hoà' },
    { hanzi: '柳營', poj: 'Liú-iâⁿ' }, { hanzi: '新營', poj: 'Sin-iâⁿ' },
    { hanzi: '嘉義', poj: 'Ka-gī' }, { hanzi: '斗南', poj: 'Táu-lâm' },
    { hanzi: '斗六', poj: 'Táu-la̍k' }, { hanzi: '林內', poj: 'Nâ-lāi' },
    { hanzi: '二水', poj: 'Jī-tsuí' }, { hanzi: '田中', poj: 'Tshân-tiong' },
    { hanzi: '員林', poj: 'Uân-lîm' }, { hanzi: '彰化', poj: 'Chiong-hoà' },
    { hanzi: '大慶', poj: 'Tāi-khìng' }, { hanzi: '台中', poj: 'Tâi-tiong' },
    { hanzi: '豐原', poj: 'Hong-gôan' }, { hanzi: '三義', poj: 'Sam-gī' },
    { hanzi: '銅鑼', poj: 'Tâng-lô' }, { hanzi: '苗栗', poj: 'Biâu-le̍k' },
    { hanzi: '頭份', poj: 'Thâu-hūn' }, { hanzi: '竹南', poj: 'Tek-lâm' },
    { hanzi: '六家', poj: 'La̍k-ke' }, { hanzi: '新竹', poj: 'Sin-tek' },
    { hanzi: '竹北', poj: 'Tek-pak' }, { hanzi: '湖口', poj: 'Ôo-kháu' },
    { hanzi: '楊梅', poj: 'Iûⁿ-mn̂g' }, { hanzi: '中壢', poj: 'Tiong-le̍k' },
    { hanzi: '桃園', poj: 'Thô-hn̂g' }, { hanzi: '鶯歌', poj: 'Ing-ko' },
    { hanzi: '三峽', poj: 'Sam-kiap' }, { hanzi: '板橋', poj: 'Pang-kiô' },
    { hanzi: '萬華', poj: 'Bān-huà' }, { hanzi: '台北', poj: 'Tâi-pak' },
    { hanzi: '清水', poj: 'Tshin-tsuí' }, { hanzi: '沙鹿', poj: 'Sua-lo̍k' },
    { hanzi: '龍井', poj: 'Liông-tsínn' }, { hanzi: '南港', poj: 'Lâm-káng' },
    { hanzi: '雲林', poj: 'Hûn-lîm' },
    // 山脈/溪流/地標
    { hanzi: '中央山脈', poj: 'Tiong-iong San-me̍h' },
    { hanzi: '玉山山脈', poj: 'Gio̍k-san san-me̍h' },
    { hanzi: '雪山山脈', poj: 'Suat-suann san-me̍h' },
    { hanzi: '阿里山山脈', poj: 'A-lî-san san-me̍h' },
    { hanzi: '海岸山脈', poj: 'Hái-gān san-me̍h' },
    { hanzi: '淡水河', poj: 'Tām-tsúi-hô' },
    { hanzi: '濁水溪', poj: 'Lô-tsúi-khe' },
    { hanzi: '曾文溪', poj: 'Tsan-bûn-khe' },
    { hanzi: '高屏溪', poj: 'Ko-pîng-khe' },
    { hanzi: '日月潭', poj: 'Ji̍t-gue̍h-thâm' },
    { hanzi: '太魯閣', poj: 'Thài-ló͘-ko̍k' },
    { hanzi: '澎湖群島', poj: 'Phînn-ôo kûn-tó' },
    { hanzi: '台灣海峽', poj: 'Tâi-uân hái-kiap' },
    { hanzi: '花東縱谷', poj: 'Hua-tang tsong-kok' },
  ];

// 五個模式共用的匯出物件。questions.js 的 buildPicturePool()/load() 用
// byHanzi 查辭典、查不到才 fallback 到 poj 的邏輯保留在 questions.js 裡
// (那是出題邏輯的一部分),這支檔案只負責提供原始詞庫資料。
const CURATED_WORDS = {
  animal: ANIMAL_WORDS,
  plant: PLANT_WORDS,
  vehicle: VEHICLE_WORDS,
  body: BODY_WORDS,
  place: PLACE_RAW,
  boneImage: BONE_IMAGE,
  boneCrops: BONE_CROPS,
};
