// Câmera 2D de cima. (x, y) = ponto do mundo no centro da tela.
// Valores t* são o destino; x, y, zoom seguem o destino com suavização.
class Camera {
  constructor(cfg, map) {
    this.cfg = cfg; this.map = map;
    this.vw = 1; this.vh = 1;
    this.x = this.tx = map.width / 2;
    this.y = this.ty = map.height / 2;
    this.zoom = this.tz = 1;
    this.minZoom = 0.1; this.maxZoom = cfg.maxZoom;
    this._started = false;
  }

  resize(vw, vh) {
    this.vw = vw; this.vh = vh;
    const fit = Math.min(vw / this.map.width, vh / this.map.height);
    this.minZoom = fit * this.cfg.minZoomFactor;
    this.maxZoom = Math.max(this.cfg.maxZoom, this.minZoom);
    if (!this._started) { this.zoom = this.tz = fit; this._started = true; } // começa enquadrando o mapa
    this._clampTarget(); this._clampCurrent();
  }

  // --- comandos (chamados pelo Game) ---
  move(dirX, dirY, dt, fast) {
    const s = this.cfg.panSpeed * (fast ? this.cfg.fastMultiplier : 1) * dt;
    this.tx += dirX * s / this.tz;
    this.ty += dirY * s / this.tz;
    this._clampTarget();
  }

  dragBy(dsx, dsy) {              // arrastar: sem atraso
    this.tx -= dsx / this.tz; this.ty -= dsy / this.tz;
    this.x -= dsx / this.zoom; this.y -= dsy / this.zoom;
    this._clampTarget(); this._clampCurrent();
  }

  zoomAt(factor, sx, sy) {        // zoom mantendo o ponto sob o cursor
    const wx = this.tx + (sx - this.vw / 2) / this.tz;
    const wy = this.ty + (sy - this.vh / 2) / this.tz;
    this.tz = Math.min(this.maxZoom, Math.max(this.minZoom, this.tz * factor));
    this.tx = wx - (sx - this.vw / 2) / this.tz;
    this.ty = wy - (sy - this.vh / 2) / this.tz;
    this._clampTarget();
  }

  update(dt) {
    const k = 1 - Math.exp(-this.cfg.smoothing * dt);
    this.zoom += (this.tz - this.zoom) * k;
    this.x += (this.tx - this.x) * k;
    this.y += (this.ty - this.y) * k;
    this._clampCurrent();
  }

  // --- conversões / desenho ---
  screenToWorld(sx, sy) {
    return { x: this.x + (sx - this.vw / 2) / this.zoom, y: this.y + (sy - this.vh / 2) / this.zoom };
  }

  visibleRect() {
    const hw = this.vw / 2 / this.zoom, hh = this.vh / 2 / this.zoom;
    return { left: this.x - hw, top: this.y - hh, right: this.x + hw, bottom: this.y + hh };
  }

  apply(ctx, dpr) {
    const z = this.zoom * dpr;
    ctx.setTransform(z, 0, 0, z, (this.vw / 2 - this.x * this.zoom) * dpr, (this.vh / 2 - this.y * this.zoom) * dpr);
  }

  // --- limites: a tela nunca mostra além da borda do mapa (se o mapa é menor que a tela, centraliza) ---
  _axis(v, half, size) { return half * 2 >= size ? size / 2 : Math.min(size - half, Math.max(half, v)); }
  _clampTarget() {
    this.tx = this._axis(this.tx, this.vw / 2 / this.tz, this.map.width);
    this.ty = this._axis(this.ty, this.vh / 2 / this.tz, this.map.height);
  }
  _clampCurrent() {
    this.x = this._axis(this.x, this.vw / 2 / this.zoom, this.map.width);
    this.y = this._axis(this.y, this.vh / 2 / this.zoom, this.map.height);
  }
}
