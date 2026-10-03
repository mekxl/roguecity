// ÚNICA fonte de verdade da população.
//  - total: guardado aqui.
//  - capacidade: derivada (base + moradia de cada construção) — nunca guardada em duas partes.
//  - ocupados: derivado (soma dos trabalhadores guardados em cada construção).
//  - disponíveis = total - ocupados.
// Crescimento, mortes, profissões etc. entrarão como novos métodos desta classe.
class Population {
  constructor(buildings, start) {
    this.buildings = buildings;
    this.baseCapacity = start.populationCapacity;      // capacidade da cidade sem nenhuma casa
    this.total = Math.min(start.population, this.capacity);
  }

  get capacity() { return this.baseCapacity + this.buildings.all().reduce((s, b) => s + b.def.housing, 0); }
  get occupied() { return this.buildings.all().reduce((s, b) => s + b.workers, 0); }
  get available() { return Math.max(0, this.total - this.occupied); }
  get overCapacity() { return this.total > this.capacity; }   // possível após demolir casas (ainda sem consequências)

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
