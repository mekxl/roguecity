// Dados das construções. Para criar um tipo novo, basta adicionar uma entrada aqui.
// Tamanhos em unidades do mundo (pixels do mapa). Escala do mapa: ~4,5 px por metro.
// Os campos abaixo de "Dados reservados" ainda não são usados por nenhum sistema:
// existem para que recursos, população, saúde e defesa leiam daqui nas próximas etapas.
function defineBuilding(def) {
  return {
    cost: {}, workers: 0, production: {}, consumption: {},
    hp: null, defense: 0, effects: {},                  // dados reservados (sem efeito nesta etapa)
    ...def
  };
}

const BuildingDefs = {
  house: defineBuilding({
    id: 'house', name: 'Casa', category: 'Residencial',
    description: 'Moradia para a população.',
    size: { w: 90, h: 90 }, visual: { kind: 'house', color: '#a8693c' }
  }),
  farm: defineBuilding({
    id: 'farm', name: 'Fazenda', category: 'Alimentos',
    description: 'Produção de alimentos.',
    size: { w: 220, h: 160 }, visual: { kind: 'farm', color: '#8aa03e' }
  }),
  sawmill: defineBuilding({
    id: 'sawmill', name: 'Serraria', category: 'Madeira',
    description: 'Processamento de madeira.',
    size: { w: 160, h: 120 }, visual: { kind: 'sawmill', color: '#7a5230' }
  }),
  infirmary: defineBuilding({
    id: 'infirmary', name: 'Enfermaria', category: 'Saúde',
    description: 'Cuidados com a saúde.',
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
