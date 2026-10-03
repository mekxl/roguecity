// Interface militar (HTML): resumo das forças, painel de recrutamento e informações da seleção.
// Só mostra dados e repassa cliques ao Recruitment; não guarda estado próprio.
const costText = cost => Object.entries(cost).map(([id, n]) => `${ResourceDefs[id].icon} ${n}`).join('  ') || 'grátis';

class MilitaryPanel {
  constructor(recruitment, units, input) {
    this.recruitment = recruitment; this.units = units;
    const $ = id => document.getElementById(id);
    this.forces = $('hud-forces'); this.panel = $('military-panel'); this.btn = $('btn-military'); this.head = $('mil-head');
    this.rows = {};
    for (const def of Object.values(UnitDefs)) {
      const row = document.createElement('div');
      row.className = 'mil-row';
      row.innerHTML = `<div class="mil-name">${def.icon} ${def.name}: <b class="mil-count"></b></div>` +
        `<button type="button">Recrutar</button><div class="mil-meta"></div><div class="mil-why"></div>`;
      row.title = def.role;
      row.querySelector('button').addEventListener('click', () => recruitment.recruit(def.id));
      this.panel.appendChild(row);
      this.rows[def.id] = { count: row.querySelector('.mil-count'), btn: row.querySelector('button'), meta: row.querySelector('.mil-meta'), why: row.querySelector('.mil-why') };
      this.rows[def.id].meta.textContent = `Custo: ${costText(def.cost)}   População: ${def.population}`;
    }
    this.btn.addEventListener('click', () => this.toggle());
    input.on('key', e => { if (e.code === 'KeyM') this.toggle(); else if (e.code === 'Escape') this.close(); });
  }

  toggle() { this.panel.hidden = !this.panel.hidden; }
  close() { this.panel.hidden = true; }

  update() {
    const r = this.recruitment, parts = Object.values(UnitDefs).map(d => `${d.plural}: ${this.units.count(d.id)}`);
    this.forces.textContent = `⚔️ Forças   ${parts.join('   ')}   (soldados ${r.count} / ${r.capacity})`;
    this.btn.classList.toggle('active', !this.panel.hidden);
    if (this.panel.hidden) return;
    this.head.textContent = `⚔️ Recrutamento   soldados ${r.count} / ${r.capacity}   livres para recrutar: ${r.population.available}`;
    for (const id in this.rows) {
      const row = this.rows[id], c = r.check(id);
      row.count.textContent = this.units.count(id);
      row.btn.disabled = !c.ok;
      row.why.textContent = c.ok ? '' : c.reason;
    }
  }
}

class UnitInfoPanel {
  constructor(selection) {
    this.selection = selection;
    const $ = id => document.getElementById(id);
    this.el = $('unit-info'); this.title = $('un-title'); this.state = $('un-state'); this.stats = $('un-stats');
  }

  update() {
    const list = this.selection.selected;
    this.el.hidden = list.length === 0;
    if (!list.length) return;
    if (list.length === 1) {
      const u = list[0], d = u.def;
      this.title.textContent = `${d.icon} ${d.name} #${u.id}`;
      this.state.textContent = `Estado: ${u.state === 'moving' ? 'Movendo-se' : 'Parado'}   Posição: ${Math.round(u.x)}, ${Math.round(u.y)}`;
      this.stats.textContent = `Vida ${d.hp} · Dano ${d.damage} · Alcance ${d.range}\nDefesa ${d.defense} · Velocidade ${d.speed}\n(atributos de combate ainda sem efeito)\nBotão direito no mapa: mover`;
    } else {
      const parts = Object.values(UnitDefs).filter(d => list.some(u => u.type === d.id)).map(d => `${d.plural}: ${list.filter(u => u.type === d.id).length}`);
      this.title.textContent = `${list.length} unidades selecionadas`;
      this.state.textContent = `Em movimento: ${list.filter(u => u.state === 'moving').length}`;
      this.stats.textContent = `${parts.join(' · ')}\nBotão direito no mapa: mover`;
    }
  }
}
