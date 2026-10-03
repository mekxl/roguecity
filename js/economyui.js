// Interface da economia. Só LÊ de Resources / Population / Economy: não guarda valores próprios.
class ResourceBar {
  constructor(resources, population, economy) {
    this.resources = resources; this.population = population; this.economy = economy;
    const root = document.getElementById('hud-resources');
    const make = html => {
      const el = document.createElement('span'); el.className = 'res'; el.innerHTML = html; root.appendChild(el);
      return { el, val: el.querySelector('.val'), rate: el.querySelector('.rate') };
    };
    this.cells = {};
    for (const [id, d] of Object.entries(ResourceDefs)) {
      this.cells[id] = make(`<span>${d.icon} ${d.name}: <b class="val"></b></span><span class="rate"></span>`);
    }
    this.pop = make('<span>👥 População: <b class="val"></b></span><span class="rate"></span>');
  }

  update() {
    for (const id in this.cells) {
      const c = this.cells[id], net = this.economy.rates[id].net;
      c.val.textContent = Math.floor(this.resources.get(id));
      c.rate.textContent = Math.abs(net) < 0.005 ? '' : `${net > 0 ? '+' : ''}${net.toFixed(2)}/s`;
      c.rate.className = 'rate ' + (net > 0 ? 'pos' : 'neg');
    }
    const food = this.cells.food;
    food.el.classList.toggle('empty', this.economy.outOfFood);
    if (this.economy.outOfFood) { food.rate.textContent = 'sem comida'; food.rate.className = 'rate neg'; }

    const p = this.population;
    this.pop.val.textContent = `${p.total} / ${p.capacity}`;
    this.pop.rate.textContent = p.overCapacity ? 'acima da capacidade' : `ocupados ${p.occupied} · livres ${p.available}`;
    this.pop.rate.className = 'rate ' + (p.overCapacity ? 'neg' : '');
  }
}

// Painel da construção selecionada: informações e atribuição de trabalhadores.
class BuildingInfoPanel {
  constructor(selection, population) {
    this.selection = selection; this.population = population;
    const $ = id => document.getElementById(id);
    this.el = $('building-info'); this.title = $('bi-title'); this.desc = $('bi-desc'); this.stats = $('bi-stats');
    this.row = $('bi-workers'); this.count = $('bi-count'); this.minus = $('bi-minus'); this.plus = $('bi-plus'); this.hint = $('bi-hint');
    this.plus.addEventListener('click', () => { const b = selection.selected; if (b) population.assign(b); });
    this.minus.addEventListener('click', () => { const b = selection.selected; if (b) population.unassign(b); });
  }

  update() {
    const b = this.selection.selected;
    this.el.hidden = !b;
    if (!b) return;
    const d = b.def, lines = [];
    if (d.housing) lines.push(`Capacidade: +${d.housing} de população`);
    for (const [res, p] of Object.entries(d.production)) {
      const name = ResourceDefs[res].name.toLowerCase();
      lines.push(`Por trabalhador: +${p.perWorker}/s de ${name}`);
      lines.push(`Produção atual: +${(p.perWorker * b.workers).toFixed(2)}/s`);
    }
    this.title.textContent = d.name;
    this.desc.textContent = d.description;
    this.stats.textContent = lines.join('\n');
    const max = d.workers.max;
    this.row.hidden = max === 0;
    this.count.textContent = `Trabalhadores: ${b.workers} / ${max}`;
    const can = this.population.canAssign(b);
    this.plus.disabled = !can.ok;
    this.minus.disabled = b.workers <= 0;
    this.hint.textContent = max && !can.ok ? can.reason : '';
  }
}
