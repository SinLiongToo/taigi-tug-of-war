// 深色/淺色模式切換。index.html(遊戲)跟 find.html(辭典查詢)共用同一份,
// 靠 localStorage 的 'theme' 這個 key 讓兩個頁面切換的深淺色模式一致。
(function () {
  function initTheme() {
    const root = document.documentElement;
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const current = root.dataset.theme
        || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = current === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      localStorage.setItem('theme', next);
    });
  }
  document.addEventListener('DOMContentLoaded', initTheme);
})();
