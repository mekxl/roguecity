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
  // Fome, saúde, crescimento e morte (valores por segundo de jogo). Ajuste aqui para balancear.
  survival: {
    start: { hunger: 0, health: 100 },
    lowFoodSeconds: 60,            // "comida baixa": a reserva acaba em menos de X segundos
    hunger: {
      risePerSecond: 1.0,          // velocidade da fome quando a cidade está sem comida (0→100 em 100 s)
      recoverPerSecond: 2.0        // velocidade com que a fome some quando há comida
    },
    health: {
      lossHungerThreshold: 40,     // fome acima disso começa a tirar saúde
      maxLossPerSecond: 1.0,       // perda com fome em 100 (sem Enfermaria); cresce de 0 até este valor
      recoveryPerSecond: 0.3,      // recuperação base
      recoveryMaxHunger: 25,       // só recupera se a fome estiver até este valor e houver comida
      lowFoodRecoveryMultiplier: 0.5   // recuperação com comida baixa
    },
    infirmary: { maxLossReduction: 0.6 },   // teto da redução de perda somando várias Enfermarias
    growth: {
      secondsPerPerson: 20,        // tempo para um novo habitante com saúde 100 e fome 0
      maxHunger: 30,               // fome acima disso: sem crescimento (abaixo disso, cresce mais devagar)
      minHealth: 40,               // saúde abaixo disso: sem crescimento
      minFoodSeconds: 30           // reserva de comida mínima (segundos) para crescer
    },
    death: {
      hunger: 90,                  // fome a partir daqui causa mortes
      health: 15,                  // saúde até aqui causa mortes
      secondsPerPerson: 15,        // uma morte a cada X segundos enquanto durar a condição
      minPopulation: 1             // a população nunca cai abaixo disso (sem game over ainda)
    },
    alerts: { lowHealth: 40 }      // saúde abaixo disso mostra aviso de saúde baixa
  },
  // Ciclo de fases da partida
  phases: {
    preparationDuration: 60,   // duração da PREPARAÇÃO em segundos (padrão do jogo)
    warningSeconds: 10,        // aviso visual nos últimos X segundos
    countdownSeconds: 5        // contagem grande nos últimos X segundos
  },
  // Forças militares
  military: {
    baseCapacity: 10,              // máximo de soldados (construções podem somar via def.militaryCapacity)
    spawn: { x: 2650, y: 2620 },   // onde os recrutas aparecem (Castelo, no mapa bakers_cliff.png)
    formationSpacing: 70,          // distância entre unidades ao mover um grupo
    minScreenRadius: 7,            // tamanho mínimo na tela (px) para enxergar com zoom afastado
    minHitRadius: 12,              // área mínima de clique (px de tela)
    dragSelectTolerance: 6         // px arrastados até virar caixa de seleção
  },
  build: {
    gridSize: 10,               // a construção se encaixa numa grade de 10 px do mapa
    cancelClickTolerance: 4     // clique direito com menos de 4 px de movimento = cancelar
  },
  time: {
    timeScale: 1,         // velocidade do relógio do jogo
    fastScale: 5,         // velocidade ao apertar F (ferramenta de teste)
    maxFrameDelta: 0.25   // evita saltos de tempo ao voltar de outra aba
  }
};

// Teste rápido SEM mexer no código: abra o jogo com ?prep=10 (ex.: index.html?prep=10)
// para uma preparação de 10 s. Sem o parâmetro vale o padrão acima (60 s).
{
  const prep = Number(new URLSearchParams(window.location.search).get('prep'));
  if (prep > 0) { Config.phases.preparationDuration = prep; Config.phases.testOverride = true; }
}

// Fases do ciclo: preparação → onda → resultado → nova preparação.
// Nesta etapa só PREPARATION e TRANSITION são usadas.
const Phases = Object.freeze({
  PREPARATION: 'Preparação',
  TRANSITION: 'Transição',      // fim da preparação; será substituída pela horda
  WAVE: 'Onda',
  RESULT: 'Resultado'
});
