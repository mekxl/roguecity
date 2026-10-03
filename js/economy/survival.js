// Sobrevivência: fome → saúde → crescimento/morte. FONTE ÚNICA de verdade de fome e saúde.
// Lê comida/produção (Resources + Economy), população e construções; altera a população
// só por population.grow() / population.remove(). Todos os números vêm de Config.survival.
// Interface e construções apenas LEEM os campos públicos abaixo.
class Survival {
  constructor(resources, population, economy, buildings, cfg) {
    this.resources = resources; this.population = population;
    this.economy = economy; this.buildings = buildings; this.cfg = cfg;

    this.hunger = cfg.start.hunger;       // 0 = alimentada · 100 = fome extrema
    this.health = cfg.start.health;       // 100 = excelente · 0 = crítico
    this.hungerTrend = 0;                 // +1 subindo · -1 descendo · 0 estável
    this.healthTrend = 0;
    this.deaths = 0;                      // mortes acumuladas
    this.dying = false;                   // condições de morte ativas agora
    this.growthProgress = 0;              // 0..1 até o próximo habitante
    this.deathProgress = 0;

    // Estado derivado (recalculado por _refresh), só leitura para a interface:
    this.foodStatus = 'ok';               // 'ok' | 'low' (acaba logo) | 'empty'
    this.foodReserveSeconds = Infinity;   // segundos até a comida acabar (se o saldo é negativo)
    this.infirmary = { count: 0, lossReduction: 0, recoveryBonus: 0 };
    this.growth = { blocked: null, multiplier: 0, perMinute: 0 };   // blocked: null | 'food' | 'reserve' | 'hunger' | 'health' | 'capacity'
    this.alerts = [];
    this._refresh();
  }

  update(dt) {                            // dt = tempo de JOGO (0 se pausado)
    this._refresh();
    if (dt > 0) {
      this._updateHunger(dt);
      this._updateHealth(dt);
      this.growth = this._growthInfo();
      this._applyGrowth(dt);
      this._applyDeath(dt);
    }
    this._refresh();
  }

  // ---------- fome ----------
  _updateHunger(dt) {
    const h = this.cfg.hunger, scarcity = this.foodStatus === 'empty';
    this.hunger = clamp(this.hunger + (scarcity ? h.risePerSecond : -h.recoverPerSecond) * dt, 0, 100);
    this.hungerTrend = scarcity ? 1 : (this.hunger > 0 ? -1 : 0);
  }

  // ---------- saúde ----------
  _updateHealth(dt) {
    const h = this.cfg.health, inf = this.infirmary;
    const severity = clamp((this.hunger - h.lossHungerThreshold) / (100 - h.lossHungerThreshold), 0, 1);
    let delta = -h.maxLossPerSecond * severity * (1 - inf.lossReduction);        // perda por fome (a Enfermaria reduz)
    if (this.foodStatus !== 'empty' && this.hunger <= h.recoveryMaxHunger) {      // recuperação: precisa de comida e pouca fome
      delta += (h.recoveryPerSecond + inf.recoveryBonus) * (this.foodStatus === 'low' ? h.lowFoodRecoveryMultiplier : 1);
    }
    this.health = clamp(this.health + delta * dt, 0, 100);
    this.healthTrend = delta < -1e-6 ? -1 : (delta > 1e-6 ? 1 : 0);
  }

  // ---------- crescimento ----------
  _growthInfo() {
    const g = this.cfg.growth, p = this.population;
    let blocked = null;
    if (this.foodStatus === 'empty') blocked = 'food';
    else if (this.foodReserveSeconds < g.minFoodSeconds) blocked = 'reserve';
    else if (this.hunger > g.maxHunger) blocked = 'hunger';
    else if (this.health < g.minHealth) blocked = 'health';
    else if (p.total >= p.capacity) blocked = 'capacity';
    // Quanto melhor a saúde e menor a fome, mais rápido. Chega a zero nos limites.
    let multiplier = blocked ? 0 : clamp((this.health / 100) * (1 - this.hunger / g.maxHunger), 0, 1);
    if (!blocked && multiplier <= 0) blocked = 'hunger';
    return { blocked, multiplier, perMinute: 60 * multiplier / g.secondsPerPerson };
  }

  _applyGrowth(dt) {
    const info = this.growth, p = this.population;
    if (info.blocked) return;
    this.growthProgress += dt * info.multiplier / this.cfg.growth.secondsPerPerson;
    while (this.growthProgress >= 1 && p.total < p.capacity) { p.grow(1); this.growthProgress -= 1; }
    this.growthProgress = Math.min(this.growthProgress, 0.999);
  }

  // ---------- mortes (lentas: uma pessoa a cada secondsPerPerson) ----------
  _applyDeath(dt) {
    const d = this.cfg.death, p = this.population;
    this.dying = (this.hunger >= d.hunger || this.health <= d.health) && p.total > d.minPopulation;
    if (!this.dying) { this.deathProgress = 0; return; }
    this.deathProgress += dt / d.secondsPerPerson;
    while (this.deathProgress >= 1 && p.total > d.minPopulation) { p.remove(1); this.deaths++; this.deathProgress -= 1; }
    this.deathProgress = Math.min(this.deathProgress, 0.999);
  }

  // ---------- estado derivado ----------
  _refresh() {
    const c = this.cfg, net = this.economy.rates.food.net;
    this.foodReserveSeconds = net >= 0 ? Infinity : this.resources.get('food') / -net;
    this.foodStatus = this.economy.outOfFood ? 'empty' : (this.foodReserveSeconds < c.lowFoodSeconds ? 'low' : 'ok');

    let keep = 1, bonus = 0, count = 0;                   // efeito da(s) Enfermaria(s): definitions.js → effects.health
    for (const b of this.buildings.all()) {
      const e = b.def.effects.health;
      if (!e) continue;
      count++; keep *= 1 - (e.lossReduction || 0); bonus += e.recoveryBonus || 0;
    }
    this.infirmary = { count, lossReduction: Math.min(c.infirmary.maxLossReduction, 1 - keep), recoveryBonus: bonus };

    this.growth = this._growthInfo();

    const a = [];                                         // códigos; a interface escolhe os textos
    if (this.foodStatus === 'empty') a.push({ code: 'food_empty' });
    else if (this.foodStatus === 'low') a.push({ code: 'food_low', seconds: this.foodReserveSeconds });
    if (this.hungerTrend > 0 && this.hunger > 0) a.push({ code: 'hunger_rising' });
    if (this.health < c.alerts.lowHealth) a.push({ code: 'health_low' });
    else if (this.healthTrend < 0) a.push({ code: 'health_falling' });
    if (this.dying) a.push({ code: 'dying', deaths: this.deaths });
    this.alerts = a;
  }
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
