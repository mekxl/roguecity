// Movimento das unidades. Usa o tempo de JOGO (para se o jogo estiver pausado).
// Hoje: linha reta até o destino. Obstáculos, muralhas, construções, outras unidades e
// áreas inacessíveis entrarão em planPath(), que devolve a lista de pontos a seguir.
class MovementSystem {
  constructor(units, map) { this.units = units; this.map = map; }

  // Ordena que um grupo vá até (x, y), espalhado numa grade para não ficar empilhado.
  orderMove(group, x, y) {
    const n = group.length, cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols), s = Config.military.formationSpacing;
    group.forEach((u, i) => {
      const ox = ((i % cols) - (cols - 1) / 2) * s, oy = (Math.floor(i / cols) - (rows - 1) / 2) * s;
      u.path = this.planPath(u, { x: x + ox, y: y + oy });
      u.state = u.path.length ? 'moving' : 'idle';
    });
  }

  planPath(unit, target) {
    const r = unit.def.radius, m = this.map;
    return [{ x: Math.min(m.width - r, Math.max(r, target.x)), y: Math.min(m.height - r, Math.max(r, target.y)) }];
  }

  update(dt) {
    if (dt <= 0) return;
    for (const u of this.units.all()) {
      if (u.state !== 'moving') continue;
      let step = u.def.speed * dt;
      while (step > 0 && u.path.length) {
        const t = u.path[0], dx = t.x - u.x, dy = t.y - u.y, dist = Math.hypot(dx, dy);
        if (dist <= step) { u.x = t.x; u.y = t.y; u.path.shift(); step -= dist; }
        else { u.x += dx / dist * step; u.y += dy / dist * step; step = 0; }
      }
      if (!u.path.length) u.state = 'idle';     // chegou: fica parada até receber outra ordem
    }
  }
}
