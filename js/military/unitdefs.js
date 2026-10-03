// Dados dos tipos de unidade. Para criar um tipo novo, basta adicionar uma entrada aqui.
// Em uso nesta etapa: nome, ícone, custo, população, velocidade, tamanho e visual.
// Atributos de combate (hp, damage, range, defense, targetPriority, abilities, behavior)
// existem só como dados: NENHUM sistema os usa ainda.
function defineUnit(def) {
  return {
    population: 1,                                   // cidadãos consumidos ao recrutar
    cost: {},
    hp: null, damage: 0, range: 0, defense: 0,        // dados de combate (sem efeito)
    targetPriority: 'nearest', abilities: [], behavior: 'hold',
    ...def
  };
}

const UnitDefs = {
  lancer: defineUnit({
    id: 'lancer', name: 'Lanceiro', plural: 'Lanceiros', icon: '🗡️',
    role: 'Corpo a corpo: resistência razoável, alcance curto, boa defesa',
    cost: { wood: 10 }, speed: 220, radius: 34,
    hp: 100, damage: 12, range: 40, defense: 6,
    visual: { kind: 'lancer', color: '#4a78b5' }
  }),
  archer: defineUnit({
    id: 'archer', name: 'Arqueiro', plural: 'Arqueiros', icon: '🏹',
    role: 'À distância: alcance alto, resistência menor',
    cost: { wood: 12 }, speed: 250, radius: 32,
    hp: 60, damage: 15, range: 300, defense: 2,
    visual: { kind: 'archer', color: '#4f9a5a' }
  }),
  guard: defineUnit({
    id: 'guard', name: 'Guarda', plural: 'Guardas', icon: '🛡️',
    role: 'Defesa pesada: muita resistência, lento, defesa elevada',
    cost: { wood: 15, stone: 5 }, speed: 160, radius: 40,
    hp: 220, damage: 8, range: 40, defense: 14,
    visual: { kind: 'guard', color: '#8a5ab0' }
  })
};
