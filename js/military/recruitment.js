// Recrutamento. Consulta População e Recursos; não controla movimento.
// Regras (nesta ordem): capacidade militar → população disponível → recursos.
class Recruitment {
  constructor(units, population, resources, buildings, cfg) {
    this.units = units; this.population = population; this.resources = resources;
    this.buildings = buildings; this.cfg = cfg;
  }

  // Capacidade militar: base + o que cada construção somar (def.militaryCapacity, hoje 0 em todas).
  get capacity() { return this.cfg.baseCapacity + this.buildings.all().reduce((s, b) => s + (b.def.militaryCapacity || 0), 0); }
  get count() { return this.units.count(); }

  check(typeId) {
    const def = UnitDefs[typeId];
    if (this.count + def.population > this.capacity) return { ok: false, reason: 'Capacidade militar atingida' };
    if (this.population.available < def.population) return { ok: false, reason: 'Sem população disponível' };
    const missing = this.resources.missing(def.cost);
    if (missing.length) return { ok: false, reason: 'Faltam: ' + missing.map(([id, n]) => `${ResourceDefs[id].name.toLowerCase()} ${Math.ceil(n)}`).join(', ') };
    return { ok: true, reason: null };
  }

  recruit(typeId) {
    const c = this.check(typeId);
    if (!c.ok) return c;
    this.resources.spend(UnitDefs[typeId].cost);
    const n = this.units.count(), a = n * 2.4, r = 60 + (n % 4) * 25, s = this.cfg.spawn;   // espalha em volta do ponto de recrutamento
    return { ok: true, reason: null, unit: this.units.add(typeId, s.x + Math.cos(a) * r, s.y + Math.sin(a) * r) };
  }
}
