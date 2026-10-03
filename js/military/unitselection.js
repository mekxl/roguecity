// Seleção e ordens de unidades.
//  Botão esquerdo: clique seleciona · arrastar desenha uma caixa · Shift soma/alterna · clique no chão limpa.
//  Botão direito (sem arrastar): move as unidades selecionadas. Arrastar com o direito continua movendo a câmera.
class UnitSelection {
  constructor(input, camera, units, builder, buildingSelection, movement) {
    this.input = input; this.camera = camera; this.units = units; this.builder = builder;
    this.buildingSelection = buildingSelection; this.movement = movement;
    this.selected = [];
    this.box = null;                       // caixa de seleção em coordenadas do mundo, enquanto arrasta
    this._down = null; this._rightDown = null;

    input.on('down', e => {
      if (builder.mode !== 'idle') return;                    // construindo/demolindo: não mexe nas unidades
      if (e.button === 0) this._down = { sx: e.x, sy: e.y, w: camera.screenToWorld(e.x, e.y) };
      else if (e.button === 2) this._rightDown = { x: e.x, y: e.y };
    });
    input.on('move', e => {
      if (!this._down || !(e.buttons & 1)) return;
      if (this.box || Math.hypot(e.x - this._down.sx, e.y - this._down.sy) >= Config.military.dragSelectTolerance) {
        const w = camera.screenToWorld(e.x, e.y);
        this.box = { x0: this._down.w.x, y0: this._down.w.y, x1: w.x, y1: w.y };
      }
    });
    input.on('up', e => {
      const add = input.isDown('ShiftLeft', 'ShiftRight');
      if (e.button === 0 && this._down) {
        if (this.box) this._set(units.inRect(this.box.x0, this.box.y0, this.box.x1, this.box.y1), add);
        else { const w = camera.screenToWorld(e.x, e.y); this._click(units.at(w.x, w.y, camera.zoom), add); }
        this.box = null; this._down = null;
      } else if (e.button === 2 && this._rightDown) {
        const moved = Math.hypot(e.x - this._rightDown.x, e.y - this._rightDown.y) >= Config.build.cancelClickTolerance;
        if (!moved && this.selected.length && builder.mode === 'idle') {
          const w = camera.screenToWorld(e.x, e.y);
          movement.orderMove(this.selected, w.x, w.y);
        }
        this._rightDown = null;
      }
    });
    input.on('key', e => { if (e.code === 'Escape') this.selected = []; });
  }

  _click(u, add) {
    if (u) {
      if (add) this.selected = this.selected.includes(u) ? this.selected.filter(s => s !== u) : [...this.selected, u];
      else this.selected = [u];
      this.buildingSelection.selected = null;               // unidade e construção não ficam selecionadas juntas
    } else if (!add) this.selected = [];
  }
  _set(list, add) {
    this.selected = add ? [...new Set([...this.selected, ...list])] : list;
    if (list.length) this.buildingSelection.selected = null;
  }

  update() {
    const alive = new Set(this.units.all());
    this.selected = this.selected.filter(u => alive.has(u));
    if (this.builder.mode !== 'idle') { this.selected = []; this.box = null; this._down = null; }
  }
}
