// Diagnóstico de inicialização. Precisa ser o PRIMEIRO script do index.html.
// Se algum arquivo faltar ou der erro antes do jogo iniciar, a tela diz o que houve
// (antes ficava parada em "Carregando mapa…" sem explicação).
const Boot = {
  started: false,
  failed: false,
  fail(msg) {
    if (this.failed || this.started) return;     // vale o primeiro erro: é o que causou os demais
    this.failed = true;
    const el = document.getElementById('loading');
    if (el) { el.classList.remove('done'); el.classList.add('error'); el.textContent = msg; }
    console.error(msg);
  }
};
window.addEventListener('error', e => {
  if (e.target && e.target.tagName === 'SCRIPT') {
    Boot.fail(`Não foi possível carregar o arquivo:\n${e.target.getAttribute('src')}\n\nConfira se ele existe nessa pasta do repositório e recarregue com Ctrl+F5.`);
  } else if (e.message) {
    Boot.fail(`Erro ao iniciar o jogo:\n${e.message}\n\nVeja detalhes no Console (F12).`);
  }
}, true);
