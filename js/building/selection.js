// Seleção de construção já colocada (clique no modo normal). Usada pelo painel de trabalhadores.
class BuildingSelection {
  constructor(input, interaction, manager, builder) {
    this.manager = manager; this.builder = builder;
    this.selected = null;
    interaction.on('click', e => { if (builder.mode === 'idle') this.selected = manager.at(e.x, e.y); });
    input.on('key', e => { if (e.code === 'Escape') this.selected = null; });
  }
  update() {
    if (this.builder.mode !== 'idle' || (this.selected && !this.manager.all().includes(this.selected))) this.selected = null;
  }
}
