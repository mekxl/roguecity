// Mapa principal. Unidades do mundo = pixels da imagem original (sem redimensionar).
class GameMap {
  constructor() {
    this.image = null;
    this.width = Config.map.fallbackSize.w;
    this.height = Config.map.fallbackSize.h;
  }

  load(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        this.image = img;
        this.width = img.naturalWidth;
        this.height = img.naturalHeight;
        resolve(true);
      };
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  contains(x, y) { return x >= 0 && y >= 0 && x <= this.width && y <= this.height; }

  // Desenha apenas a parte visível (rect em coordenadas do mundo).
  draw(ctx, rect, zoom) {
    if (!this.image) return this._drawMissing(ctx, zoom);
    const l = Math.max(0, rect.left), t = Math.max(0, rect.top);
    const r = Math.min(this.width, rect.right), b = Math.min(this.height, rect.bottom);
    if (r <= l || b <= t) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this.image, l, t, r - l, b - t, l, t, r - l, b - t);
  }

  // Só aparece se o arquivo do mapa não foi encontrado: área de teste para a câmera.
  _drawMissing(ctx, zoom) {
    ctx.fillStyle = '#2a2620';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.strokeStyle = '#4a4236';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    for (let x = 0; x <= this.width; x += 250) { ctx.moveTo(x, 0); ctx.lineTo(x, this.height); }
    for (let y = 0; y <= this.height; y += 250) { ctx.moveTo(0, y); ctx.lineTo(this.width, y); }
    ctx.stroke();
    ctx.strokeStyle = '#b08d3c';
    ctx.lineWidth = 4 / zoom;
    ctx.strokeRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#b08d3c';
    ctx.font = '60px serif';
    ctx.textAlign = 'center';
    ctx.fillText('MAPA NÃO ENCONTRADO', this.width / 2, this.height / 2);
  }
}
