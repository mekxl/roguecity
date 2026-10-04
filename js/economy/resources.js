// ÚNICA fonte de verdade dos estoques. Interface, construções e outros sistemas
// leem e alteram os recursos apenas por aqui: resources.get('food'), resources.add('wood', 5).
const ResourceDefs = {
  food:  { name: 'Comida',  icon: '🍖' },
  wood:  { name: 'Madeira', icon: '🪵' },
  stone: { name: 'Pedra',   icon: '🪨' },
  gold:  { name: 'Ouro',    icon: '🪙' }
};

class Resources {
  constructor(start) {
    this.stock = {};
    for (const id in ResourceDefs) this.stock[id] = start[id] ?? 0;
  }
  _check(id) { if (!(id in this.stock)) throw new Error(`Recurso desconhecido: "${id}"`); }
  get(id) { this._check(id); return this.stock[id]; }
  // Custos: { wood: 10, stone: 5 }
  missing(cost) { return Object.entries(cost).filter(([id, n]) => this.get(id) < n).map(([id, n]) => [id, n - this.get(id)]); }
  canAfford(cost) { return this.missing(cost).length === 0; }
  spend(cost) {
    if (!this.canAfford(cost)) return false;
    for (const [id, n] of Object.entries(cost)) this.stock[id] -= n;
    return true;
  }

  // Soma (ou subtrai, se negativo). O estoque nunca fica abaixo de zero.
  add(id, amount) {
    this._check(id);
    this.stock[id] = Math.max(0, this.stock[id] + amount);
    return this.stock[id];
  }
}
