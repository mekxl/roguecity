// Gerenciador geral: cria os sistemas, liga um ao outro e roda o loop.
class Game {
  async start() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.ui = new UI();

    this.map = new GameMap();
    const loaded = await this.map.load(Config.map.src);
    if (!loaded) this.ui.notice(`Mapa não encontrado em "${Config.map.src}". Coloque a imagem lá ou ajuste Config.map.src em js/config.js.`);

    this.phase = Phases.PREPARATION;
    this.clock = new GameClock(Config.time.timeScale);
    this.camera = new Camera(Config.camera, this.map);
    this.input = new Input(this.canvas);
    this.interaction = new Interaction(this.input, this.camera, this.map);

    this.buildings = new BuildingManager();
    this.validator = new PlacementValidator(this.map, this.buildings);
    this.builder = new BuildController(this.input, this.interaction, this.buildings, this.validator);
    this.buildMenu = new BuildMenu(this.builder, this.input, this.canvas);

    // Ligações entre entrada e câmera
    this.input.on('wheel', e => this.camera.zoomAt(e.dir < 0 ? Config.camera.zoomStep : 1 / Config.camera.zoomStep, e.x, e.y));
    this.input.on('move', e => { if (e.buttons & 6) this.camera.dragBy(e.dx, e.dy); }); // botão direito/meio arrasta
    this.input.on('key', e => { if (e.code === 'KeyP') this.clock.togglePause(); });

    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.ui.hideLoading();
    this.last = performance.now();
    requestAnimationFrame(t => this.frame(t));
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
    this.buildMenu.update();

    this.ui.setPhase(this.phase, this.clock.paused);
    this.ui.setClock(this.clock.format());
    this.ui.setReadout(this.interaction.world, this.camera.zoom, this.interaction.inMap);
  }

  render() {
    const { ctx, canvas, camera } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#1b1712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    camera.apply(ctx, this.dpr);
    this.map.draw(ctx, camera.visibleRect(), camera.zoom);
    BuildingView.drawAll(ctx, this.buildings, this.builder);
    this.interaction.draw(ctx, camera.zoom);
  }
}

window.addEventListener('load', () => new Game().start());
