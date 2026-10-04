// ÚNICA fonte de verdade da população.
//  - total: guardado aqui.
//  - capacidade: derivada (base + moradia de cada construção) — nunca guardada em duas partes.
//  - ocupados: derivado (soma dos trabalhadores guardados em cada construção).
//  - soldados: derivado (quantidade de unidades militares). A população só CONTA; o movimento é do sistema militar.
//  - disponíveis = total - ocupados - soldados.
// Crescimento, mortes, profissões etc. entrarão como novos métodos desta classe.
class Population {
  constructor(buildings, start, units) {
    this.buildings = buildings; this.units = units;
    this.baseCapacity = start.populationCapacity;      // capacidade da cidade sem nenhuma casa
    this.total = Math.min(start.population, this.capacity);
  }

  get capacity() { return this.baseCapacity + this.buildings.all().reduce((s, b) => s + b.def.housing, 0); }
  get occupied() { return this.buildings.all().reduce((s, b) => s + b.workers, 0); }
  get soldiers() { return this.units.count(); }
  get available() { return Math.max(0, this.total - this.occupied - this.soldiers); }
  get overCapacity() { return this.total > this.capacity; }   // possível após demolir casas (ainda sem consequências)

  // Crescimento e mortes passam por aqui para manter a regra total <= capacidade.
  grow(n = 1) {
    const added = Math.max(0, Math.min(n, this.capacity - this.total));
    this.total += added;
    return added;
  }
  remove(n = 1) {
    const removed = Math.min(n, this.total);
    this.total -= removed;
    const over = () => this.occupied + this.soldiers - this.total;      // primeiro morrem os livres; depois trabalhadores; por fim soldados
    for (const b of this.buildings.all().slice().reverse()) {
      while (over() > 0 && b.workers > 0) b.workers--;
    }
    if (over() > 0) this.units.removeLast(over());
    return removed;
  }

  canAssign(b) {
    const max = b.def.workers.max;
    if (!max) return { ok: false, reason: 'Esta construção não usa trabalhadores' };
    if (b.workers >= max) return { ok: false, reason: 'Máximo de trabalhadores atingido' };
    if (this.available <= 0) return { ok: false, reason: 'Sem população disponível' };
    return { ok: true, reason: null };
  }
  assign(b) { const c = this.canAssign(b); if (c.ok) b.workers++; return c; }
  unassign(b) {
    if (b.workers <= 0) return { ok: false, reason: 'Nenhum trabalhador nesta construção' };
    b.workers--;
    return { ok: true, reason: null };
  }
}
