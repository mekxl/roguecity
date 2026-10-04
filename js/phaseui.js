// Painel de estado da partida (onda, fase, contador) e avisos de fim da preparação.
// Só LÊ de PhaseSystem; escuta o evento de término para mostrar que o sinal foi recebido.
function formatCountdown(sec) {
  // Formato pedido: 00:60, 00:59 … 00:00. Acima de 99 s cai para MM:SS (ex.: 01:40).
  if (sec < 100) return `00:${String(sec).padStart(2, '0')}`;
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}

class PhasePanel {
  constructor(phases, events) {
    this.phases = phases;
    const $ = id => document.getElementById(id);
    this.wave = $('ph-wave'); this.name = $('ph-name'); this.count = $('ph-count'); this.box = $('hud-phase');
    this.banner = $('phase-banner'); this.main = $('pb-main'); this.sub = $('pb-sub'); this.note = $('pb-note');
    this.signal = false;
    events.on(GameEvents.PREPARATION_FINISHED, () => { this.signal = true; });   // prova de que o sinal chegou
  }

  update(paused) {
    const p = this.phases, c = p.cfg, sec = Math.ceil(p.remaining);
    if (p.phase === Phases.PREPARATION) this.signal = false;
    this.wave.textContent = `ONDA ${p.wave}` + (c.testOverride ? `   (teste: ${c.preparationDuration} s)` : '');
    const pausedTag = paused ? ' (PAUSADO)' : '';

    if (p.phase === Phases.PREPARATION) {
      this.name.textContent = 'PREPARAÇÃO' + pausedTag;
      this.count.textContent = `PRÓXIMA HORDA: ${formatCountdown(sec)}`;
      const warn = sec <= c.warningSeconds, final = sec <= c.countdownSeconds;
      this.box.classList.toggle('warn', warn);
      this.banner.hidden = !warn;
      this.banner.classList.toggle('final', final);
      this.banner.classList.remove('ended');
      this.main.textContent = final ? String(sec) : `${sec} segundos restantes`;
      this.sub.textContent = final ? 'HORDA SE APROXIMA' : '';
      this.note.textContent = '';
    } else {                                                  // TRANSIÇÃO
      this.name.textContent = 'TRANSIÇÃO' + pausedTag;
      this.count.textContent = 'PREPARAÇÃO ENCERRADA';
      this.box.classList.add('warn');
      this.banner.hidden = false;
      this.banner.classList.add('ended'); this.banner.classList.remove('final');
      this.main.textContent = 'PREPARAÇÃO ENCERRADA';
      this.sub.textContent = 'HORDA SE APROXIMA';
      this.note.textContent = (this.signal ? 'Sinal interno recebido: preparationFinished · ' : '') + 'N: iniciar nova preparação (teste)';
    }
  }
}
