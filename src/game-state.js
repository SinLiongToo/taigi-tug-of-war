// 遊戲狀態機,不碰 DOM。流程:
//   buzz(搶答中) -> answer(取得作答權的隊伍選答案)
//     -> 答對: result(該回合結束) 或 gameover(達到 N 題)
//     -> 答錯且還沒偷答過: 換對方隊伍進 answer(偷答機會)
//     -> 答錯且已經是偷答: result(該題作廢)
//   timeout() 代表整回合共用的時限到了,不管在 buzz 還是 answer 階段都直接結束該題。
class GameState {
  constructor({ settings, onChange }) {
    this.onChange = onChange || (() => {});
    this.settings = settings;
    this.scores = { A: 0, B: 0 };
    this.phase = 'idle'; // idle|buzz|answer|result|gameover
    this.currentQuestion = null;
    this.activeTeam = null;
    this.isSteal = false;
    this.lastResult = null;
    this.winner = null;
  }

  startRound(question) {
    this.currentQuestion = question;
    this.phase = 'buzz';
    this.activeTeam = null;
    this.isSteal = false;
    this.lastResult = null;
    this._emit();
  }

  buzz(team) {
    if (this.phase !== 'buzz') return false;
    this.activeTeam = team;
    this.phase = 'answer';
    this._emit();
    return true;
  }

  answer(team, index) {
    if (this.phase !== 'answer' || team !== this.activeTeam) return false;
    const correct = index === this.currentQuestion.correctIndex;

    if (correct) {
      this.scores[team]++;
      this.lastResult = { correct: true, team, index };
      if (this.scores[team] >= this.settings.targetScore) {
        this.winner = team;
        this.phase = 'gameover';
      } else {
        this.phase = 'result';
      }
    } else if (!this.isSteal) {
      this.isSteal = true;
      this.activeTeam = team === 'A' ? 'B' : 'A';
      this.lastResult = { correct: false, team, index, steal: true };
      this.phase = 'answer';
    } else {
      this.lastResult = { correct: false, team, index, steal: true, final: true };
      this.phase = 'result';
    }
    this._emit();
    return true;
  }

  timeout() {
    if (this.phase !== 'buzz' && this.phase !== 'answer') return;
    this.lastResult = { timeup: true, team: this.activeTeam };
    this.phase = 'result';
    this._emit();
  }

  _emit() {
    this.onChange(this);
  }
}
