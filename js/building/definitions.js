// Dados das construções. Para criar um tipo novo, basta adicionar uma entrada aqui.
// Tamanhos em unidades do mundo (pixels do mapa). Escala do mapa: ~4,5 px por metro.
// Campos em uso: housing (capacidade de população), workers.max (vagas) e
// production.<recurso>.perWorker (produção por segundo, por trabalhador).
// Campos reservados (cost, consumption, hp, defense, effects) ainda sem efeito.
function defineBuilding(def) {
  return {
    housing: 0, workers: { max: 0 }, production: {},
    cost: {}, consumption: {}, hp: null, defense: 0, effects: {},   // reservados
    ...def
  };
}

const BuildingDefs = {
  house: defineBuilding({
    id: 'house', name: 'Casa', category: 'Residencial',
    description: 'Moradia para a população.',
    housing: 5,                                   // +5 de capacidade populacional
    size: { w: 90, h: 90 }, visual: { kind: 'house', color: '#a8693c' }
  }),
  farm: defineBuilding({
    id: 'farm', name: 'Fazenda', category: 'Alimentos',
    description: 'Produção de alimentos.',
    workers: { max: 4 }, production: { food: { perWorker: 0.4 } },
    size: { w: 220, h: 160 }, visual: { kind: 'farm', color: '#8aa03e' }
  }),
  sawmill: defineBuilding({
    id: 'sawmill', name: 'Serraria', category: 'Madeira',
    description: 'Processamento de madeira.',
    workers: { max: 3 }, production: { wood: { perWorker: 0.3 } },
    size: { w: 160, h: 120 }, visual: { kind: 'sawmill', color: '#7a5230' }
  }),
  infirmary: defineBuilding({
    id: 'infirmary', name: 'Enfermaria', category: 'Saúde',
    description: 'Cuidados com a saúde.',
    // Sem trabalhadores nem efeito por enquanto. Futuro: workers.max, capacidade de atendimento, saúde.
    size: { w: 140, h: 120 }, visual: { kind: 'infirmary', color: '#e8e2d2' }
  }),
  tower: defineBuilding({
    id: 'tower', name: 'Torre', category: 'Defesa',
    description: 'Estrutura defensiva elevada.',
    size: { w: 80, h: 80 }, visual: { kind: 'tower', color: '#6d6a64' }
  }),
  wall: defineBuilding({
    id: 'wall', name: 'Muralha', category: 'Defesa',
    description: 'Segmento de muralha. Use R para girar.',
    size: { w: 200, h: 40 }, visual: { kind: 'wall', color: '#8a867d' }
  })
};

// Tamanho ocupado no mapa, considerando a rotação de 90°.
function getFootprint(def, rotated) {
  return rotated ? { w: def.size.h, h: def.size.w } : { w: def.size.w, h: def.size.h };
}
