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
    animalPool = buildPicturePool(ANIMAL_WORDS);
    bodyPool = buildPicturePool(BODY_WORDS);
    plantPool = buildPicturePool(PLANT_WORDS);
    vehiclePool = buildPicturePool(VEHICLE_WORDS);
    // PLACE_RAW 的羅馬字不是辭典查來的,要自己 parse 成 skeleton/tone(跟
    // build-questions.js 對一般辭典詞條做的事一樣),parse 失敗的直接跳過。
    placePool = PLACE_RAW
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
  // 動物、身體部位都是這個形狀的題庫(見 ANIMAL_WORDS/BODY_WORDS),抽出來
  // 共用,避免兩份幾乎一樣的程式碼。
  function genFromPicturePool(pool, mode, direction, toRoman, labels, system) {
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const entry = pick.entry;
    const others = pool.filter(a => a.entry !== entry);
    // 'crop' 類題目(目前只有身體部位的骨頭)要另外帶裁圖用的 CSS 座標。
    const cropStyle = pick.type === 'crop' ? BONE_CROPS[pick.region] : undefined;

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
