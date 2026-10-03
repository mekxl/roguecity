// Desenho simples das unidades (sem arte final): lanceiro = círculo com lança,
// arqueiro = triângulo, guarda = quadrado com escudo. Troque por sprites só neste arquivo.
const UnitView = (() => {
  const OUT = '#1b1712';

  function drawUnit(ctx, u, zoom) {
    const r = Math.max(u.def.radius, Config.military.minScreenRadius / zoom), k = u.def.visual.kind, lw = 2.5 / zoom;
    ctx.fillStyle = u.def.visual.color; ctx.strokeStyle = OUT; ctx.lineWidth = lw;
    ctx.beginPath();
    if (k === 'archer') { ctx.moveTo(u.x, u.y - r * 1.15); ctx.lineTo(u.x + r, u.y + r * 0.85); ctx.lineTo(u.x - r, u.y + r * 0.85); ctx.closePath(); }
    else if (k === 'guard') ctx.rect(u.x - r, u.y - r, r * 2, r * 2);
    else ctx.arc(u.x, u.y, r, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    if (k === 'lancer') { ctx.moveTo(u.x + r * 0.6, u.y - r * 1.8); ctx.lineTo(u.x + r * 0.6, u.y + r * 0.9); }
    if (k === 'guard') { ctx.moveTo(u.x - r * 0.5, u.y); ctx.lineTo(u.x + r * 0.5, u.y); ctx.moveTo(u.x, u.y - r * 0.5); ctx.lineTo(u.x, u.y + r * 0.5); }
    ctx.stroke();
  }

  function drawAll(ctx, units, selection, zoom) {
    const sel = new Set(selection.selected);
    for (const u of sel) {                                   // anel de seleção (por baixo)
      ctx.strokeStyle = '#e9dcc0'; ctx.lineWidth = 3 / zoom; ctx.beginPath();
      ctx.arc(u.x, u.y, Math.max(u.def.radius, Config.military.minScreenRadius / zoom) + 7 / zoom, 0, Math.PI * 2); ctx.stroke();
    }
    for (const u of units.all()) drawUnit(ctx, u, zoom);
    ctx.strokeStyle = 'rgba(233, 220, 192, 0.7)'; ctx.lineWidth = 2 / zoom; ctx.setLineDash([10 / zoom, 8 / zoom]);
    for (const u of sel) {                                   // destino das unidades em movimento
      if (!u.path.length) continue;
      const d = u.path[u.path.length - 1];
      ctx.beginPath(); ctx.moveTo(u.x, u.y); ctx.lineTo(d.x, d.y); ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const u of sel) {
      if (!u.path.length) continue;
      const d = u.path[u.path.length - 1];
      ctx.beginPath(); ctx.arc(d.x, d.y, 8 / zoom, 0, Math.PI * 2); ctx.stroke();
    }
    const b = selection.box;                                 // caixa de seleção
    if (b) {
      ctx.fillStyle = 'rgba(176, 141, 60, 0.18)'; ctx.strokeStyle = '#b08d3c'; ctx.lineWidth = 2 / zoom;
      ctx.fillRect(Math.min(b.x0, b.x1), Math.min(b.y0, b.y1), Math.abs(b.x1 - b.x0), Math.abs(b.y1 - b.y0));
      ctx.strokeRect(Math.min(b.x0, b.x1), Math.min(b.y0, b.y1), Math.abs(b.x1 - b.x0), Math.abs(b.y1 - b.y0));
    }
  }
  return { drawAll };
})();
