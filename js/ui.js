// Interface mínima (DOM sobre o canvas). Novos painéis entram como novos elementos em #hud.
class UI {
  constructor() {
    this.phaseEl = document.getElementById('hud-phase');
    this.clockEl = document.getElementById('hud-clock');
    this.readoutEl = document.getElementById('hud-readout');
    this.noticeEl = document.getElementById('notice');
    this.loadingEl = document.getElementById('loading');
  }
  setPhase(name, paused) { this.phaseEl.textContent = `Fase: ${name}${paused ? ' (pausado)' : ''}`; }
  setClock(text) { this.clockEl.textContent = `TEMPO: ${text}`; }
  setReadout(world, zoom, inMap) {
    const pos = inMap ? `${Math.round(world.x)}, ${Math.round(world.y)}` : '—';
    this.readoutEl.textContent = `Mundo: ${pos}   Zoom: ${zoom.toFixed(2)}x`;
  }
  notice(msg) { this.noticeEl.textContent = msg; this.noticeEl.hidden = false; }
  hideLoading() { this.loadingEl.classList.add('done'); }
}
