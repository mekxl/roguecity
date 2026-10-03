// Validação de posição. Cada regra recebe { def, rect, map, manager } e devolve
// null (ok) ou um texto com o motivo da recusa. Regras futuras (terreno, estradas,
// distritos, distância mínima, regras por construção) entram com validator.addRule(fn).
const PlacementRules = {
  insideMap({ rect, map }) {
    const ok = rect.x >= 0 && rect.y >= 0 && rect.x + rect.w <= map.width && rect.y + rect.h <= map.height;
    return ok ? null : 'Fora do mapa';
  },
  noOverlap({ rect, manager }) {
    const hit = manager.all().some(b =>
      rect.x < b.x + b.w / 2 && rect.x + rect.w > b.x - b.w / 2 &&
      rect.y < b.y + b.h / 2 && rect.y + rect.h > b.y - b.h / 2);
    return hit ? 'Sobrepõe outra construção' : null;
  }
};

class PlacementValidator {
  constructor(map, manager) {
    this.map = map; this.manager = manager;
    this.rules = [PlacementRules.insideMap, PlacementRules.noOverlap];
  }
  addRule(fn) { this.rules.push(fn); }
  check(def, rect) {
    const ctx = { def, rect, map: this.map, manager: this.manager };
    for (const rule of this.rules) {
      const reason = rule(ctx);
      if (reason) return { valid: false, reason };
    }
    return { valid: true, reason: null };
  }
}
