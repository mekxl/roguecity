// Relógio do jogo. Sistemas futuros (preparação, ondas, produção, população)
// devem consumir `clock.delta` (tempo de jogo do frame) ou `clock.elapsed`.
class GameClock {
  constructor(timeScale = 1) {
    this.elapsed = 0;   // segundos de jogo acumulados
    this.delta = 0;     // segundos de jogo deste frame
    this.timeScale = timeScale;
    this.paused = false;
  }
  update(realDt) {
    this.delta = this.paused ? 0 : realDt * this.timeScale;
    this.elapsed += this.delta;
    return this.delta;
  }
  togglePause() { this.paused = !this.paused; }
  format() {
    const t = Math.floor(this.elapsed);
    const mm = String(Math.floor(t / 60)).padStart(2, '0');
    const ss = String(t % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }
}
