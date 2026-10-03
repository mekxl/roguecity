// Fluxo econômico. update(dt) recebe o tempo de JOGO do frame (clock.delta), então
// respeita a pausa e usa o mesmo relógio de todos os sistemas. Não há timers próprios.
// Ciclo a cada frame: construções produzem → estoques atualizam → população consome.
class Economy {
  constructor(resources, population, buildings, cfg) {
    this.resources = resources; this.population = population;
    this.buildings = buildings; this.cfg = cfg;
    this.rates = {};            // por segundo, por recurso: { produced, consumed, net } (só leitura, para a interface)
    this.outOfFood = false;     // estoque zerado e consumo maior que a produção
    this.recompute();
  }

  // Calcula os fluxos por segundo a partir do estado atual (construções e população).
  recompute() {
    const r = {};
    for (const id in ResourceDefs) r[id] = { produced: 0, consumed: 0, net: 0 };
    for (const b of this.buildings.all()) {
      for (const [res, p] of Object.entries(b.def.production)) r[res].produced += (p.perWorker || 0) * b.workers;
    }
    r.food.consumed = this.population.total * this.cfg.foodPerPerson;
    for (const id in r) r[id].net = r[id].produced - r[id].consumed;
    this.rates = r;
  }

  update(dt) {
    this.recompute();
    if (dt > 0) {
      for (const id in this.rates) this.resources.add(id, this.rates[id].produced * dt);   // produzir
      this.resources.add('food', -this.rates.food.consumed * dt);                            // consumir
    }
    this.outOfFood = this.resources.get('food') <= 0 && this.rates.food.net < 0;
  }
}
