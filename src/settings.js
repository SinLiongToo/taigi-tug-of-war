// 從設定畫面表單讀出一份 settings 物件。
const Settings = (() => {
  function readForm() {
    const targetScore = Math.max(1, parseInt(document.getElementById('targetScore').value, 10) || 5);
    const questionSeconds = Math.max(5, parseInt(document.getElementById('questionSeconds').value, 10) || 15);
    const teamAName = document.getElementById('teamAName').value.trim() || 'A隊';
    const teamBName = document.getElementById('teamBName').value.trim() || 'B隊';
    const modes = Array.from(document.querySelectorAll('.modeCheckbox:checked')).map(cb => cb.value);
    const levels = Array.from(document.querySelectorAll('.levelCheckbox:checked')).map(cb => cb.value);
    const romanSystem = document.querySelector('input[name="romanSystem"]:checked').value;

    return {
      targetScore,
      questionSeconds,
      teamNames: { A: teamAName, B: teamBName },
      modes: modes.length ? modes : ['meaning'],
      levels,
      romanSystem,
    };
  }

  return { readForm };
})();
