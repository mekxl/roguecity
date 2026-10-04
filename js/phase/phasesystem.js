// Estado e relógio das fases da partida. NÃO conhece economia, população, tropas,
// construções nem inimigos: só controla fase, onda, contador e o sinal de término.
// Usa o tempo de JOGO (dt vindo do relógio principal): pausa e aceleração funcionam sozinhas.
//
// Hoje:   PREPARAÇÃO → (contador chega a 0) → TRANSIÇÃO   (emite 'preparationFinished')
// Futuro: TRANSIÇÃO será substituída pela horda; depois RESULTADO e nova PREPARAÇÃO.
class PhaseSystem {
  constructor(events, cfg) {
    this.events = events; this.cfg = cfg;
    this.wave = 1; this.phase = Phases.PREPARATION; this.remaining = 0;
    this.startPreparation(1);                        // início da partida: onda 1, preparação, contador cheio
  }

  startPreparation(wave = 1) {
    this.wave = wave;
    this.phase = Phases.PREPARATION;
    this.remaining = this.cfg.preparationDuration;   // lido aqui: mudar a config vale na próxima preparação
  }

  // Passa para a próxima preparação (onda + 1). Só faz sentido depois do fim da preparação.
  // Hoje é acionado pela tecla de teste N; no futuro, quem fechar o ciclo da onda chama isto.
  nextPreparation() {
    if (this.phase !== Phases.TRANSITION) return false;
    this.startPreparation(this.wave + 1);
    return true;
  }

  update(dt) {                                       // dt = segundos de jogo (0 se pausado)
    if (dt <= 0 || this.phase !== Phases.PREPARATION) return;
    this.remaining = Math.max(0, this.remaining - dt);
    if (this.remaining === 0) {
      this.phase = Phases.TRANSITION;                // fica aqui até alguém iniciar a próxima fase
      this.events.emit(GameEvents.PREPARATION_FINISHED, { wave: this.wave });
    }
  }
}
