// Representação visual simples de cada construção (sem arte final).
// Troque por sprites depois mexendo só neste arquivo.
const BuildingView = (() => {
  const OUTLINE = '#1b1712';

  const kinds = {
    house(c, r, def) {
      fillRect(c, r, def.visual.color);
      c.strokeStyle = 'rgba(27,23,18,.7)'; c.lineWidth = 3; c.beginPath();
      const a = r.x + r.w * 0.25, b = r.x + r.w * 0.75, m = r.y + r.h / 2;
      c.moveTo(a, m); c.lineTo(b, m);
      c.moveTo(r.x, r.y); c.lineTo(a, m); c.moveTo(r.x + r.w, r.y); c.lineTo(b, m);
      c.moveTo(r.x, r.y + r.h); c.lineTo(a, m); c.moveTo(r.x + r.w, r.y + r.h); c.lineTo(b, m);
      c.stroke();
    },
    farm(c, r, def) {
      fillRect(c, r, def.visual.color);
      c.strokeStyle = '#5f7226'; c.lineWidth = 3; c.beginPath();
      for (let y = r.y + r.h / 6; y < r.y + r.h - 1; y += r.h / 6) { c.moveTo(r.x, y); c.lineTo(r.x + r.w, y); }
      c.stroke();
    },
    sawmill(c, r, def) {
      fillRect(c, r, def.visual.color);
      c.strokeStyle = '#4a3320'; c.lineWidth = 3; c.beginPath();
      for (let i = 1; i <= 3; i++) { const y = r.y + r.h * i / 4; c.moveTo(r.x, y); c.lineTo(r.x + r.w * 0.35, y); }
      c.stroke();
      c.fillStyle = '#cfc6b3'; c.beginPath();
      c.arc(r.x + r.w * 0.68, r.y + r.h / 2, Math.min(r.w, r.h) * 0.25, 0, Math.PI * 2); c.fill(); c.stroke();
    },
    infirmary(c, r, def) {
      fillRect(c, r, def.visual.color);
      const s = Math.min(r.w, r.h) * 0.6, t = s / 3, cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      c.fillStyle = '#b3342c';
      c.fillRect(cx - s / 2, cy - t / 2, s, t); c.fillRect(cx - t / 2, cy - s / 2, t, s);
    },
    tower(c, r, def) {
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = Math.min(r.w, r.h) / 2;
      c.fillStyle = def.visual.color; c.strokeStyle = OUTLINE; c.lineWidth = 3;
      c.beginPath(); c.arc(cx, cy, rad, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = '#9a968d'; c.beginPath(); c.arc(cx, cy, rad * 0.55, 0, Math.PI * 2); c.fill(); c.stroke();
    },
    wall(c, r, def) {
      fillRect(c, r, def.visual.color);
      c.strokeStyle = 'rgba(27,23,18,.55)'; c.lineWidth = 2; c.beginPath();
      const long = r.w >= r.h, step = 25;
      if (long) for (let x = r.x + step; x < r.x + r.w; x += step) { c.moveTo(x, r.y); c.lineTo(x, r.y + r.h); }
      else for (let y = r.y + step; y < r.y + r.h; y += step) { c.moveTo(r.x, y); c.lineTo(r.x + r.w, y); }
      c.stroke();
    }
  };

  function fillRect(c, r, color) {
    c.fillStyle = color; c.strokeStyle = OUTLINE; c.lineWidth = 3;
    c.fillRect(r.x, r.y, r.w, r.h); c.strokeRect(r.x, r.y, r.w, r.h);
  }
  const rectOf = b => ({ x: b.x - b.w / 2, y: b.y - b.h / 2, w: b.w, h: b.h });

  function drawBuilding(ctx, def, rect) { kinds[def.visual.kind](ctx, rect, def); }

  function tint(ctx, rect, color, fillAlpha) {
    ctx.fillStyle = color; ctx.globalAlpha = fillAlpha; ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.globalAlpha = 1; ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  }

  function drawAll(ctx, manager, builder, selected) {
    for (const b of manager.all()) drawBuilding(ctx, b.def, rectOf(b));
    if (selected) {
      const r = rectOf(selected);
      ctx.strokeStyle = '#e9dcc0'; ctx.lineWidth = 5; ctx.strokeRect(r.x - 4, r.y - 4, r.w + 8, r.h + 8);
    }
    if (builder.hover) tint(ctx, rectOf(builder.hover), '#c0392b', 0.45);   // demolição
    const p = builder.preview;
    if (p) {
      ctx.globalAlpha = 0.75; drawBuilding(ctx, p.def, p.rect); ctx.globalAlpha = 1;
      tint(ctx, p.rect, p.valid ? '#3fae5a' : '#c0392b', 0.25);
    }
  }

  return { drawAll };
})();
