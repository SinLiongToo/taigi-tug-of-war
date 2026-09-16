// 一人刷題模式的狀態機,不碰 DOM。比兩隊搶答簡單很多——沒有搶答、沒有偷答,
// 直接出題、作答、看結果、自動出下一題,循環到玩家按「結束練習」為止。
class SoloState {
  constructor({ onChange }) {
    this.onChange = onChange || (() => {});
    this.phase = 'idle'; // idle|answering|result
    this.currentQuestion = null;
    this.lastResult = null;
    this.sessionAnswered = 0;
    this.sessionCorrect = 0;
    this.currentStreak = 0;
  }

  startRound(question) {
    this.currentQuestion = question;
    this.phase = 'answering';
    this.lastResult = null;
    this._emit();
  }

  answer(index) {
    if (this.phase !== 'answering') return false;
    const correct = index === this.currentQuestion.correctIndex;
    this.sessionAnswered++;
    if (correct) {
      this.sessionCorrect++;
      this.currentStreak++;
    } else {
      this.currentStreak = 0;
    }
    this.lastResult = { correct, index };
    this.phase = 'result';
    this._emit();
    return true;
  }

  timeout() {
    if (this.phase !== 'answering') return;
    this.sessionAnswered++;
    this.currentStreak = 0;
    this.lastResult = { correct: false, timeup: true };
    this.phase = 'result';
    this._emit();
  }

  _emit() {
    this.onChange(this);
  }
}
