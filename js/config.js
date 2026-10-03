// Todos os valores ajustáveis do jogo ficam aqui.
const Config = {
  map: {
    src: 'assets/bakers_cliff.png',       // <- caminho do mapa principal
    fallbackSize: { w: 4000, h: 3000 }     // usado só se o arquivo do mapa não for encontrado
  },
  camera: {
    panSpeed: 900,        // pixels de tela por segundo (WASD/setas)
    fastMultiplier: 2,    // com Shift
    smoothing: 12,        // maior = câmera mais "seca"; menor = mais suave
    zoomStep: 1.15,       // fator por tick da roda do mouse
    maxZoom: 2,
    minZoomFactor: 0.8    // zoom mínimo = (zoom que enquadra o mapa inteiro) * este fator
  },
  // Estado inicial do jogo (ajuste aqui para balancear)
  start: {
    food: 50, wood: 50, stone: 20, gold: 10,
    population: 10,
    populationCapacity: 10    // capacidade da cidade ANTES de construir qualquer casa
  },
  // Balanceamento global da economia (valores por segundo de jogo).
  // Produção, moradia e vagas de trabalho de cada construção ficam em building/definitions.js
  economy: {
    foodPerPerson: 0.05       // comida consumida por pessoa por segundo
  },
  build: {
    gridSize: 10,               // a construção se encaixa numa grade de 10 px do mapa
    cancelClickTolerance: 4     // clique direito com menos de 4 px de movimento = cancelar
  },
  time: {
    timeScale: 1,         // velocidade do relógio do jogo
    maxFrameDelta: 0.25   // evita saltos de tempo ao voltar de outra aba
  }
};

// Fases do ciclo: preparação → onda → resultado → nova preparação.
// Nesta etapa apenas PREPARATION é usada.
const Phases = Object.freeze({
  PREPARATION: 'Preparação',
  WAVE: 'Onda',
  RESULT: 'Resultado'
});
