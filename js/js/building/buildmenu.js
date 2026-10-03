// Menu de construção (HTML). Só mostra opções e repassa as escolhas ao BuildController.
class BuildMenu {
  constructor(builder, input, canvas) {
    this.builder = builder; this.canvas = canvas;
    this.panel = document.getElementById('build-panel');
    this.statusEl = document.getElementById('build-status');
    this.btnBuild = document.getElementById('btn-build');
    this.btnDemolish = document.getElementById('btn-demolish');
    this.btnCancel = document.getElementById('btn-cancel');
    this.items = {};

    for (const def of Object.values(BuildingDefs)) {
      const b = document.createElement('button');
      b.className = 'build-item';
      b.title = def.description;
      b.innerHTML = `<span class="swatch" style="background:${def.visual.color}"></span>` +
                    `<span class="name">${def.name}</span><span class="meta">${def.category}</span>`;
      b.addEventListener('click', () => { builder.select(def.id); this.close(); });
      this.panel.appendChild(b);
      this.items[def.id] = b;
    }
    this.btnBuild.addEventListener('click', () => this.toggle());
    this.btnDemolish.addEventListener('click', () => { builder.toggleDemolish(); this.close(); });
    this.btnCancel.addEventListener('click', () => { builder.cancel(); this.close(); });
    input.on('key', e => {
      if (e.code === 'KeyB') this.toggle();
      else if (e.code === 'Escape') this.close();
    });
  }

  toggle() { this.panel.hidden = !this.panel.hidden; }
  close() { this.panel.hidden = true; }

  update() {
    const b = this.builder;
    for (const id in this.items) this.items[id].classList.toggle('active', b.mode === 'place' && b.defId === id);
    this.btnDemolish.classList.toggle('active', b.mode === 'demolish');
    this.btnBuild.classList.toggle('active', !this.panel.hidden);
    this.btnCancel.disabled = b.mode === 'idle';
    const s = b.status();
    this.statusEl.textContent = s.text;
    this.statusEl.classList.toggle('bad', s.bad);
    this.statusEl.hidden = !s.text;
    this.canvas.style.cursor = b.mode === 'idle' ? '' : 'crosshair';
  }
}
