/*
  javascript.js
  Implementa o Jogo da Memória com:
  - Alternar tema (dark-mode)
  - Pedir dica (revela um par por 3s)
  - Contagem regressiva de tentativas e Game Over
*/

// Configurações
const pares = 8; // número de pares no tabuleiro
const limiteTentativas = 20; // limite de tentativas antes do GAME OVER

// Estado do jogo
let valores = []; // array com valores das cartas (pares)
let cartasViradas = []; // guarda as cartas atualmente viradas (elementos DOM)
let cartasMatched = 0; // número de pares encontrados
let tentativasRestantes = limiteTentativas;
let bloqueado = false; // quando true evita interação (ex: durante animação ou game over)

// Referências DOM
const tabuleiro = document.getElementById('tabuleiro');
const resultado = document.getElementById('resultado');
const btnComecar = document.getElementById('comecar');
const btnAlternarTema = document.getElementById('alternarTema');
const btnPedirDica = document.getElementById('pedirDica');
const indicadorTentativas = document.getElementById('tentativas');

// Utilidades
function embaralhar(array) {
  // Fisher-Yates shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Cria os pares (números ou emojis)
function gerarValores() {
  const base = ['🍎','🚗','🐶','⚽','🎵','🌟','🍕','🎲','📚','🌈','🍩','✈️','🧩','🔔','🦄','🔑'];
  const selecionados = base.slice(0, pares);
  const arr = [...selecionados, ...selecionados]; // duplica para pares
  return embaralhar(arr);
}

// Renderiza o tabuleiro
function renderizarTabuleiro() {
  tabuleiro.innerHTML = '';
  valores = gerarValores();
  cartasMatched = 0;
  resultado.textContent = `${cartasMatched} pares encontrados`;
  tentativasRestantes = limiteTentativas;
  indicadorTentativas.textContent = `Tentativas Restantes: ${tentativasRestantes}`;
  bloqueado = false;

  valores.forEach((val, idx) => {
    const carta = document.createElement('button');
    carta.className = 'card';
    carta.setAttribute('data-value', val);
    carta.setAttribute('data-index', idx);
    carta.setAttribute('aria-label', 'Carta do jogo');
    carta.innerHTML = `
      <div class="card-inner">
        <div class="card-front">?</div>
        <div class="card-back">${val}</div>
      </div>
    `;
    carta.addEventListener('click', onCardClick);
    tabuleiro.appendChild(carta);
  });
}

// Lógica ao clicar em uma carta
function onCardClick(e) {
  if (bloqueado) return;
  const carta = e.currentTarget;

  // Não permitir virar carta já matched ou já virada
  if (carta.classList.contains('matched') || carta.classList.contains('flipped')) return;

  // Adiciona ao array de cartas viradas
  cartasViradas.push(carta);
  carta.classList.add('flipped');

  if (cartasViradas.length === 2) {
    bloqueado = true; // evita cliques extras até verificar
    const [c1, c2] = cartasViradas;
    const v1 = c1.getAttribute('data-value');
    const v2 = c2.getAttribute('data-value');

    if (v1 === v2) {
      // Encontrou par
      c1.classList.add('matched');
      c2.classList.add('matched');
      cartasMatched++;
      resultado.textContent = `${cartasMatched} pares encontrados`;
      // limpar e reabrir interações
      cartasViradas = [];
      bloqueado = false;
      checarVitoria();
    } else {
      // Erro: conta tentativa e verifica limite
      tentativasRestantes--;
      indicadorTentativas.textContent = `Tentativas Restantes: ${tentativasRestantes}`;

      setTimeout(() => {
        // vira as cartas para baixo novamente
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
        cartasViradas = [];
        bloqueado = false;

        // Checa se chegou ao limite de tentativas
        if (tentativasRestantes <= 0) {
          bloqueado = true;
          alert('GAME OVER');
        }
      }, 800); // tempo para ver a segunda carta
    }
  }
}

// Checa se ganhou (todos os pares encontrados)
function checarVitoria() {
  if (cartasMatched === pares) {
    bloqueado = true;
    setTimeout(() => {
      alert('Parabéns! Você venceu!');
    }, 200);
  }
}

// Função para alternar tema (Funcionalidade 1)
function alternarTema() {
  const ativo = document.body.classList.toggle('dark-mode');
  btnAlternarTema.textContent = ativo ? 'Desativar Modo Escuro' : 'Ativar Modo Escuro';
}

// Função Pedir Dica (Funcionalidade 2)
// Deve encontrar um par que NÃO tenha .matched, virar as duas cartas por 3 segundos.
function pedirDica() {
  if (bloqueado) return;
  // encontra todas as cartas não-matched e que não estejam viradas
  const todasCartas = Array.from(document.querySelectorAll('.card'));
  const candidatas = todasCartas.filter(c => !c.classList.contains('matched') && !c.classList.contains('flipped'));

  if (candidatas.length < 2) return; // nada para mostrar

  // procurar um par entre as candidatas
  let parEncontrado = null;
  for (let i = 0; i < candidatas.length; i++) {
    for (let j = i + 1; j < candidatas.length; j++) {
      if (candidatas[i].getAttribute('data-value') === candidatas[j].getAttribute('data-value')) {
        parEncontrado = [candidatas[i], candidatas[j]];
        break;
      }
    }
    if (parEncontrado) break;
  }

  // Se não encontrou par entre não-matched, tentar usar cartas não-matched mesmo que alguma esteja virada
  if (!parEncontrado) {
    // tenta encontrar par entre todas não-matched (mesmo que estejam viradas)
    const naoMatched = todasCartas.filter(c => !c.classList.contains('matched'));
    for (let i = 0; i < naoMatched.length; i++) {
      for (let j = i + 1; j < naoMatched.length; j++) {
        if (naoMatched[i].getAttribute('data-value') === naoMatched[j].getAttribute('data-value')) {
          parEncontrado = [naoMatched[i], naoMatched[j]];
          break;
        }
      }
      if (parEncontrado) break;
    }
  }

  if (!parEncontrado) return;

  // usa a variável cartasViradas como requisitado: adiciona .flipped temporariamente
  // bloqueia interações durante a dica
  bloqueado = true;
  cartasViradas = parEncontrado;
  parEncontrado.forEach(c => c.classList.add('flipped'));

  // após 3 segundos remove o flipped (se não estiverem matched)
  setTimeout(() => {
    parEncontrado.forEach(c => {
      if (!c.classList.contains('matched')) c.classList.remove('flipped');
    });
    cartasViradas = [];
    bloqueado = false;
  }, 3000);
}

// Bind de eventos
btnComecar.addEventListener('click', renderizarTabuleiro);
btnAlternarTema.addEventListener('click', alternarTema);
btnPedirDica.addEventListener('click', pedirDica);

// Inicializa o jogo ao carregar
document.addEventListener('DOMContentLoaded', renderizarTabuleiro);

