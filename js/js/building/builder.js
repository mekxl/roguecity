// Controlador do fluxo de construção: selecionar → prévia → confirmar/cancelar, e demolir.
// Não desenha nada e não mexe em HTML: a interface só lê o estado e chama os métodos.
class BuildController {
  constructor(input, interaction, manager, validator) {
    this.input = input; this.interaction = interaction;
    this.manager = manager; this.validator = validator;
    this.mode = 'idle';            // 'idle' | 'place' | 'demolish'
    this.defId = null;
    this.rotated = false;
    this.preview = null;           // { def, cx, cy, rect, valid, reason }
    this.hover = null;             // construção sob o cursor no modo demolir
    this._rightDown = null;

    interaction.on('click', e => this._click(e));
    input.on('key', e => {
      if (e.code === 'Escape') this.cancel();
      else if (e.code === 'KeyX') this.toggleDemolish();
      else if (e.code === 'KeyR') this.rotate();
    });
    // clique direito SEM arrastar cancela (arrastar com o direito continua movendo a câmera)
    input.on('down', e => { if (e.button === 2) this._rightDown = { x: e.x, y: e.y }; });
    input.on('up', e => {
      if (e.button !== 2) return;
      const d = this._rightDown;
      if (d && Math.hypot(e.x - d.x, e.y - d.y) < Config.build.cancelClickTolerance) this.cancel();
      this._rightDown = null;
    });
  }

  select(defId) { this.mode = 'place'; this.defId = defId; this.rotated = false; }
  toggleDemolish() { this.mode === 'demolish' ? this.cancel() : this._enter('demolish'); }
  cancel() { this._enter('idle'); }
  rotate() { if (this.mode === 'place') this.rotated = !this.rotated; }
  _enter(mode) { this.mode = mode; this.defId = null; this.rotated = false; }

  update() {
    this.preview = null; this.hover = null;
    if (!this.input.mouse.inside) return;
    const w = this.interaction.world;
    if (this.mode === 'place') {
      const def = BuildingDefs[this.defId], fp = getFootprint(def, this.rotated), g = Config.build.gridSize;
      const cx = Math.round(w.x / g) * g, cy = Math.round(w.y / g) * g;
      const rect = { x: cx - fp.w / 2, y: cy - fp.h / 2, w: fp.w, h: fp.h };
      this.preview = { def, cx, cy, rect, ...this.validator.check(def, rect) };
    } else if (this.mode === 'demolish') {
      this.hover = this.manager.at(w.x, w.y);
    }
  }

  _click(e) {
    if (this.mode === 'place' && this.preview && this.preview.valid) {
      this.manager.add(this.defId, this.preview.cx, this.preview.cy, this.rotated); // continua no modo: construa várias
    } else if (this.mode === 'demolish') {
      const b = this.manager.at(e.x, e.y);
      if (b) this.manager.remove(b.id);
    }
  }

  // Texto de ajuda para a interface.
  status() {
    if (this.mode === 'place') {
      const name = BuildingDefs[this.defId].name;
      if (this.preview && !this.preview.valid) return { text: `${name}: ${this.preview.reason}`, bad: true };
      return { text: `${name}: clique para construir · R gira · Esc cancela`, bad: false };
    }
    if (this.mode === 'demolish') return { text: 'Demolição: clique numa construção · Esc cancela', bad: false };
    return { text: '', bad: false };
  }
}
