// 鍵盤搶答/作答輸入。預設鍵位(見 README):
//   A隊搶答 = D   B隊搶答 = K   作答選項 = 1 2 3 4
const Keyboard = (() => {
  const DEFAULT_KEYS = { buzzA: 'd', buzzB: 'k', answers: ['1', '2', '3', '4'] };
  let handlers = null;
  let keys = DEFAULT_KEYS;
  let bound = false;

  function onKeydown(e) {
    if (!handlers) return;
    const key = e.key.toLowerCase();
    if (key === keys.buzzA) { handlers.onBuzz('A'); return; }
    if (key === keys.buzzB) { handlers.onBuzz('B'); return; }
    const idx = keys.answers.indexOf(key);
    if (idx !== -1) { handlers.onAnswer(idx); }
  }

  function start(customKeys, h) {
    keys = Object.assign({}, DEFAULT_KEYS, customKeys || {});
    handlers = h;
    if (!bound) {
      document.addEventListener('keydown', onKeydown);
      bound = true;
    }
  }

  function stop() {
    handlers = null;
  }

  return { start, stop, DEFAULT_KEYS };
})();
