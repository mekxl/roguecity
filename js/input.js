// Entrada bruta (teclado e mouse). Não conhece câmera nem regras do jogo.
// Eventos: 'move' {x,y,dx,dy,buttons}, 'down' {x,y,button}, 'up', 'wheel' {x,y,dir}, 'key' {code}
class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, inside: false };
    this._h = {};
    const pos = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

    window.addEventListener('mousemove', e => {
      const p = pos(e);
      const dx = p.x - this.mouse.x, dy = p.y - this.mouse.y;
      this.mouse.x = p.x; this.mouse.y = p.y;
      this.emit('move', { ...p, dx, dy, buttons: e.buttons });
    });
    canvas.addEventListener('mouseenter', () => this.mouse.inside = true);
    canvas.addEventListener('mouseleave', () => this.mouse.inside = false);
    canvas.addEventListener('mousedown', e => { e.preventDefault(); this.emit('down', { ...pos(e), button: e.button }); });
    window.addEventListener('mouseup', e => this.emit('up', { ...pos(e), button: e.button }));
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      this.emit('wheel', { ...pos(e), dir: Math.sign(e.deltaY) });
    }, { passive: false });

    window.addEventListener('keydown', e => {
      if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
      this.keys.add(e.code);
      if (!e.repeat) this.emit('key', { code: e.code });
    });
    window.addEventListener('keyup', e => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
  }

  isDown(...codes) { return codes.some(c => this.keys.has(c)); }
  on(type, fn) { (this._h[type] ||= []).push(fn); }
  emit(type, data) { (this._h[type] || []).forEach(fn => fn(data)); }
}
