// Gerenciador geral: cria os sistemas, liga um ao outro e roda o loop.
class Game {
  async start() {
    this.checkFiles();
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.ui = new UI();

    this.map = new GameMap();
    const loaded = await this.map.load(Config.map.src);
    if (!loaded) this.ui.notice(`Mapa não encontrado em "${Config.map.src}". Coloque a imagem lá ou ajuste Config.map.src em js/config.js.`);

    this.events = new EventBus();
    this.phases = new PhaseSystem(this.events, Config.phases);   // começa na ONDA 1, em PREPARAÇÃO
    this.events.on(GameEvents.PREPARATION_FINISHED, e => console.log(`[evento] ${GameEvents.PREPARATION_FINISHED} (onda ${e.wave})`));
    this.clock = new GameClock(Config.time.timeScale);
    this.camera = new Camera(Config.camera, this.map);
    this.input = new Input(this.canvas);
    this.interaction = new Interaction(this.input, this.camera, this.map);

    this.buildings = new BuildingManager();
    this.validator = new PlacementValidator(this.map, this.buildings);
    this.builder = new BuildController(this.input, this.interaction, this.buildings, this.validator);
    this.buildMenu = new BuildMenu(this.builder, this.input, this.canvas);

    this.selection = new BuildingSelection(this.input, this.interaction, this.buildings, this.builder);

    // Economia e população: fontes únicas de verdade
    this.resources = new Resources(Config.start);
    this.units = new UnitManager();
    this.population = new Population(this.buildings, Config.start, this.units);
    this.economy = new Economy(this.resources, this.population, this.buildings, Config.economy);
    this.survival = new Survival(this.resources, this.population, this.economy, this.buildings, Config.survival);
    this.resourceBar = new ResourceBar(this.resources, this.population, this.economy, this.survival);
    this.infoPanel = new BuildingInfoPanel(this.selection, this.population);

    // Forças militares
    this.movement = new MovementSystem(this.units, this.map);
    this.recruitment = new Recruitment(this.units, this.population, this.resources, this.buildings, Config.military);
    this.unitSelection = new UnitSelection(this.input, this.camera, this.units, this.builder, this.selection, this.movement);
    this.militaryPanel = new MilitaryPanel(this.recruitment, this.units, this.input);
    this.unitInfoPanel = new UnitInfoPanel(this.unitSelection);
    this.phasePanel = new PhasePanel(this.phases, this.events);

    // Ligações entre entrada e câmera
    this.input.on('wheel', e => this.camera.zoomAt(e.dir < 0 ? Config.camera.zoomStep : 1 / Config.camera.zoomStep, e.x, e.y));
    this.input.on('move', e => { if (e.buttons & 6) this.camera.dragBy(e.dx, e.dy); }); // botão direito/meio arrasta
    this.input.on('key', e => {
      if (e.code === 'KeyP') this.clock.togglePause();
      if (e.code === 'KeyN') this.phases.nextPreparation();   // ferramenta de teste: nova preparação após o fim
      if (e.code === 'KeyF') {   // ferramenta de teste: acelera o tempo do jogo
        const T = Config.time;
        this.clock.timeScale = this.clock.timeScale === T.timeScale ? T.fastScale : T.timeScale;
      }
    });

    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.ui.hideLoading();
    Boot.started = true;
    this.last = performance.now();
    requestAnimationFrame(t => this.frame(t));
  }

  // Avisa na tela se algum arquivo estiver faltando ou desatualizado.
  checkFiles() {
    const need = ['Config', 'Phases', 'GameClock', 'GameMap', 'Camera', 'Input', 'Interaction', 'UI',
      'BuildingDefs', 'BuildingManager', 'PlacementValidator', 'BuildingView', 'BuildController',
      'BuildingSelection', 'BuildMenu', 'ResourceDefs', 'Resources', 'Population', 'Economy',
      'Survival', 'ResourceBar', 'BuildingInfoPanel',
      'EventBus', 'GameEvents', 'PhaseSystem', 'PhasePanel',
      'UnitDefs', 'UnitManager', 'MovementSystem', 'Recruitment', 'UnitSelection', 'UnitView', 'MilitaryPanel', 'UnitInfoPanel'];
    const missing = need.filter(n => { try { return typeof eval(n) === 'undefined'; } catch (e) { return true; } });
    if (missing.length) throw new Error(`Arquivos faltando ou desatualizados. Não encontrei: ${missing.join(', ')}.\nEnvie todos os arquivos do projeto para o repositório.`);
  }

  resize() {
    this.dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth, h = window.innerHeight;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.camera.resize(w, h);
  }

  frame(now) {
    const realDt = Math.min((now - this.last) / 1000, Config.time.maxFrameDelta);
    this.last = now;
    this.update(realDt);
    this.render();
    requestAnimationFrame(t => this.frame(t));
  }

  update(realDt) {
    const gameDt = this.clock.update(realDt);   // sistemas futuros baseados em tempo recebem gameDt
    const i = this.input;
    const dx = (i.isDown('KeyD', 'ArrowRight') ? 1 : 0) - (i.isDown('KeyA', 'ArrowLeft') ? 1 : 0);
    const dy = (i.isDown('KeyS', 'ArrowDown') ? 1 : 0) - (i.isDown('KeyW', 'ArrowUp') ? 1 : 0);
    if (dx || dy) this.camera.move(dx, dy, realDt, i.isDown('ShiftLeft', 'ShiftRight'));
    this.camera.update(realDt);
    this.interaction.update();
    this.builder.update();
    this.selection.update();
    this.economy.update(gameDt);              // produção e consumo, no tempo de jogo (parado se pausado)
    this.survival.update(gameDt);             // fome, saúde, crescimento e mortes
    this.phases.update(gameDt);               // contador da preparação (tempo de jogo, para na pausa)
    this.movement.update(gameDt);             // unidades andam no tempo de jogo
    this.unitSelection.update();
    this.buildMenu.update();
    this.resourceBar.update();
    this.infoPanel.update();
    this.militaryPanel.update();
    this.unitInfoPanel.update();

    this.phasePanel.update(this.clock.paused);
    this.ui.setClock(this.clock.format() + (this.clock.timeScale !== Config.time.timeScale ? `  ×${this.clock.timeScale}` : ''));
    this.ui.setReadout(this.interaction.world, this.camera.zoom, this.interaction.inMap);
  }

  render() {
    const { ctx, canvas, camera } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#1b1712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    camera.apply(ctx, this.dpr);
    this.map.draw(ctx, camera.visibleRect(), camera.zoom);
    BuildingView.drawAll(ctx, this.buildings, this.builder, this.selection.selected);
    UnitView.drawAll(ctx, this.units, this.unitSelection, camera.zoom);
    this.interaction.draw(ctx, camera.zoom);
  }
}

window.addEventListener('load', () => {
  window.game = new Game();     // acessível no Console (F12) para testes: game.resources, game.population...
  window.game.start().catch(err => Boot.fail(`Erro ao iniciar o jogo:\n${err.message}\n\nVeja detalhes no Console (F12).`));
});
