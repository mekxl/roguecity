// Registro lógico das construções existentes. Outros sistemas consultam aqui:
//   buildings.count('farm')  ·  buildings.ofType('house')  ·  buildings.all()
// Cada construção: { id, type, def, x, y (centro), w, h, rotated, workers }
class BuildingManager {
  constructor() { this.list = []; this._nextId = 1; }

  add(typeId, cx, cy, rotated = false) {
    const def = BuildingDefs[typeId];
    const fp = getFootprint(def, rotated);
    const b = { id: this._nextId++, type: typeId, def, x: cx, y: cy, w: fp.w, h: fp.h, rotated, workers: 0 };
    this.list.push(b);
    return b;
  }

  remove(id) { this.list = this.list.filter(b => b.id !== id); }

  all() { return this.list; }
  ofType(typeId) { return this.list.filter(b => b.type === typeId); }
  count(typeId = null) { return typeId ? this.ofType(typeId).length : this.list.length; }

  // Construção sob um ponto do mundo (a mais recente, se houver sobreposição).
  at(wx, wy) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const b = this.list[i];
      if (Math.abs(wx - b.x) <= b.w / 2 && Math.abs(wy - b.y) <= b.h / 2) return b;
    }
    return null;
  }
}
