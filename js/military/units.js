// Registro das unidades existentes no mundo (entidades reais).
// Cada unidade: { id, type, def, x, y, state: 'idle' | 'moving', path: [{x,y}, ...] }
class UnitManager {
  constructor() { this.list = []; this._nextId = 1; }

  add(typeId, x, y) {
    const u = { id: this._nextId++, type: typeId, def: UnitDefs[typeId], x, y, state: 'idle', path: [] };
    this.list.push(u);
    return u;
  }
  remove(id) { this.list = this.list.filter(u => u.id !== id); }
  removeLast(n) { this.list.splice(Math.max(0, this.list.length - n), n); }   // usado quando soldados morrem de fome

  all() { return this.list; }
  ofType(typeId) { return this.list.filter(u => u.type === typeId); }
  count(typeId = null) { return typeId ? this.ofType(typeId).length : this.list.length; }

  // Unidade sob um ponto do mundo. O raio de clique tem um mínimo em pixels de TELA, para dar para clicar com zoom afastado.
  at(wx, wy, zoom) {
    let best = null, bestD = Infinity;
    for (const u of this.list) {
      const d = Math.hypot(wx - u.x, wy - u.y), hit = Math.max(u.def.radius, Config.military.minHitRadius / zoom);
      if (d <= hit && d <= bestD) { best = u; bestD = d; }
    }
    return best;
  }
  inRect(x0, y0, x1, y1) {
    const l = Math.min(x0, x1), r = Math.max(x0, x1), t = Math.min(y0, y1), b = Math.max(y0, y1);
    return this.list.filter(u => u.x >= l && u.x <= r && u.y >= t && u.y <= b);
  }
}
