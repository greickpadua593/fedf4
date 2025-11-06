const tabuleiro = document.getElementById("tabuleiro");
const resultado = document.getElementById("resultado");
const comecar = document.getElementById("comecar");

const cartas = [
  { id: 1, nome: "Java" },
  { id: 2, nome: "JS" },
  { id: 3, nome: "Kotlin" },
  { id: 4, nome: "React" }
];

// use caminhos relativos (coloque as imagens dentro da pasta "img" ou ajuste os caminhos)
const imagensMap = {
  1: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='280'><rect fill='%23f8981d' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='40' fill='white'>Java</text></svg>",
  2: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='280'><rect fill='%23f0db4f' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='48' fill='%23000'>JS</text></svg>",
  3: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='280'><rect fill='%237f52ff' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='32' fill='white'>Kotlin</text></svg>",
  4: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='280'><rect fill='%2361dafb' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='32' fill='%23000'>React</text></svg>"
};

// imagem do verso (fundo) como data URI SVG
const verso = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='280'><rect fill='%23ddd' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='48' fill='%23666'>?</text></svg>";

let baralho = [];         // cartas duplicadas e embaralhadas
let primeiro = null;      // índice da primeira carta virada
let travado = false;      // evita clicar enquanto verifica
let paresEncontrados = 0; // contador de pares

function embaralhar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function criarBaralho() {
  // duplica as cartas para formar pares e embaralha
  baralho = embaralhar([...cartas, ...cartas].map((c, idx) => ({ ...c, _idx: idx })));
  primeiro = null;
  travado = false;
  paresEncontrados = 0;
  resultado.textContent = "0 pares encontrados";
}

function criarTabuleiro() {
  tabuleiro.innerHTML = "";
  baralho.forEach((carta, i) => {
    const img = document.createElement("img");
    img.src = verso; // usa data URI do verso
    img.dataset.index = i;
    img.className = "carta";
    img.addEventListener("click", virarCarta);
    tabuleiro.appendChild(img);
  });
}

function virarCarta(e) {
  if (travado) return;
  const img = e.currentTarget;
  const idx = Number(img.dataset.index);

  // se já estiver virada (classe acertou) ou for a mesma carta, ignora
  if (img.classList.contains("acertou") || primeiro === idx) return;

  // mostra imagem real
  img.src = imagensMap[baralho[idx].id];

  if (primeiro === null) {
    primeiro = idx;
    return;
  }

  // segunda carta escolhida
  travado = true;
  const segundo = idx;
  const primeiraCarta = baralho[primeiro];
  const segundaCarta = baralho[segundo];

  setTimeout(() => {
    const imgs = tabuleiro.querySelectorAll("img");

    if (primeiraCarta.id === segundaCarta.id) {
      // acerto: marca as duas cartas
      imgs[primeiro].classList.add("acertou");
      imgs[segundo].classList.add("acertou");
      paresEncontrados++;
      resultado.textContent = `${paresEncontrados} pares encontrados`;
    } else {
      // erro: vira as duas de volta
      imgs[primeiro].src = verso;
      imgs[segundo].src = verso;
    }

    // resetar estados
    primeiro = null;
    travado = false;

    // vitória
    if (paresEncontrados === cartas.length) {
      resultado.textContent = "Parabéns! Você encontrou todas as cartas.";
    }
  }, 700);
}

comecar.addEventListener("click", () => {
  criarBaralho();
  criarTabuleiro();
});

document.addEventListener("DOMContentLoaded", () => {
  criarBaralho();
  criarTabuleiro();
});

