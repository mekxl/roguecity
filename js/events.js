// Sinais internos do jogo. Um sistema avisa (emit) e quem se interessar escuta (on),
// sem que um conheça o outro. Ex.: a preparação emite 'preparationFinished' e, na
// próxima etapa, o sistema de ondas poderá escutar esse sinal.
const GameEvents = Object.freeze({
  PREPARATION_FINISHED: 'preparationFinished'      // dados: { wave }
});

class EventBus {
  constructor() { this._h = {}; }
  on(type, fn) { (this._h[type] ||= []).push(fn); return () => this.off(type, fn); }
  off(type, fn) { this._h[type] = (this._h[type] || []).filter(f => f !== fn); }
  emit(type, data) { for (const fn of [...(this._h[type] || [])]) fn(data); }
}
