// 一人刷題模式的永久累計成績,存在瀏覽器的 localStorage(不會上傳到任何
// 伺服器,換瀏覽器/清瀏覽器資料/無痕模式都不會保留)。讀寫都包一層
// try/catch——localStorage 在無痕模式或被瀏覽器設定擋掉時會直接丟例外,
// 這是真的會發生的情況,不是防禦性過度寫法。
const SoloStats = (() => {
  const KEY = 'taigiTugOfWar.soloStats.v1';
  const EMPTY = { totalAnswered: 0, totalCorrect: 0, bestStreak: 0, lastPlayedAt: null };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...EMPTY };
      const parsed = JSON.parse(raw);
      return {
        totalAnswered: Number(parsed.totalAnswered) || 0,
        totalCorrect: Number(parsed.totalCorrect) || 0,
        bestStreak: Number(parsed.bestStreak) || 0,
        lastPlayedAt: parsed.lastPlayedAt || null,
      };
    } catch {
      return { ...EMPTY };
    }
  }

  function save(stats) {
    try {
      localStorage.setItem(KEY, JSON.stringify(stats));
    } catch {
      // 存不了就算了(無痕模式/儲存空間被擋),不影響當次練習繼續玩。
    }
  }

  // 一題作答完之後呼叫,把這題的結果併入累計紀錄並存檔,回傳更新後的累計值。
  function recordAnswer(correct, streakAfterThisAnswer) {
    const stats = load();
    stats.totalAnswered += 1;
    if (correct) stats.totalCorrect += 1;
    if (streakAfterThisAnswer > stats.bestStreak) stats.bestStreak = streakAfterThisAnswer;
    stats.lastPlayedAt = new Date().toISOString();
    save(stats);
    return stats;
  }

  function reset() {
    save({ ...EMPTY });
    return { ...EMPTY };
  }

  return { load, save, recordAnswer, reset };
})();
