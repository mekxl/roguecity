// Traduz o mouse para o mundo do jogo. Base para seleção, construção e unidades.
// Uso futuro: interaction.on('click', ({x, y, inMap}) => ...); interaction.world = posição atual.
class Interaction {
  constructor(input, camera, map) {
    this.camera = camera; this.map = map; this.input = input;
    this.world = { x: 0, y: 0 };
    this.inMap = false;
    this.lastClick = null;
    this._h = {};
    input.on('down', e => {
      if (e.button !== 0) return;               // botão esquerdo = ação do jogo
      const w = camera.screenToWorld(e.x, e.y);
      const click = { x: w.x, y: w.y, inMap: map.contains(w.x, w.y) };
      this.lastClick = { ...click, time: performance.now() };
      this.emit('click', click);
    });
  }

  update() {                                     // recalcula todo frame (a câmera pode se mover com o mouse parado)
    const m = this.input.mouse;
    this.world = this.camera.screenToWorld(m.x, m.y);
    this.inMap = m.inside && this.map.contains(this.world.x, this.world.y);
  }

  draw(ctx, zoom) {                              // marca visual do último clique (some em 0,8 s)
    if (!this.lastClick) return;
    const age = (performance.now() - this.lastClick.time) / 800;
    if (age >= 1) return;
    ctx.strokeStyle = `rgba(233, 220, 192, ${1 - age})`;
    ctx.lineWidth = 2 / zoom;
    ctx.beginPath();
    ctx.arc(this.lastClick.x, this.lastClick.y, (8 + age * 24) / zoom, 0, Math.PI * 2);
    ctx.stroke();
  }

  on(type, fn) { (this._h[type] ||= []).push(fn); }
  emit(type, data) { (this._h[type] || []).forEach(fn => fn(data)); }
}
