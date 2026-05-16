const produtos = [
  // 🟢 CPU
  {
    id: 1,
    nome: "Ryzen 5 5600X",
    preco: 899,
    cat: "cpu",
    img: "img/ryzen5.jpg",
    desc: "Processador AMD Ryzen 5 5600X com excelente desempenho para jogos e multitarefas."
  },
  {
    id: 2,
    nome: "Intel Core i5 12400F",
    preco: 999,
    cat: "cpu",
    img: "img/intel.jpg",
    desc: "Processador Intel Core i5 de 12ª geração com ótimo custo-benefício."
  },
  {
    id: 3,
    nome: "Ryzen 7 5700X",
    preco: 1299,
    cat: "cpu",
    img: "img/ryzen7.jpg",
    desc: "Processador AMD Ryzen 7 para alto desempenho e produtividade."
  },

  // 🔵 GPU
  {
    id: 4,
    nome: "RTX 3060",
    preco: 1799,
    cat: "gpu",
    img: "img/RTX3060.jpg",
    desc: "Placa de vídeo NVIDIA RTX 3060 com Ray Tracing e DLSS."
  },
  {
    id: 5,
    nome: "Radeon RX 6600",
    preco: 1599,
    cat: "gpu",
    img: "img/radeon6600.jpg",
    desc: "Placa AMD RX 6600 com excelente desempenho em Full HD."
  },
  {
    id: 6,
    nome: "RTX 4060",
    preco: 2199,
    cat: "gpu",
    img: "img/RTX4060.jpg",
    desc: "Nova geração NVIDIA RTX 4060 com DLSS 3."
  },

  // 🟣 RAM
  {
    id: 7,
    nome: "Corsair 16GB",
    preco: 299,
    cat: "ram",
    img: "img/corsair.jpg",
    desc: "Memória Corsair 16GB DDR4 de alta performance."
  },
  {
    id: 8,
    nome: "Kingston 8GB",
    preco: 159,
    cat: "ram",
    img: "img/kingston.jpg",
    desc: "Memória Kingston confiável e eficiente."
  },
  {
    id: 9,
    nome: "XPG Spectrix",
    preco: 349,
    cat: "ram",
    img: "img/Spectrix.jpg",
    desc: "Memória RGB XPG Spectrix com design gamer."
  },

  // 🟠 FONTES
  {
    id: 10,
    nome: "MSI MAG 650W",
    preco: 350,
    cat: "fonte",
    img: "img/MSIMAG.jpg",
    desc: "Fonte MSI 650W com certificação 80 Plus."
  },
  {
    id: 11,
    nome: "Corsair CV550",
    preco: 320,
    cat: "fonte",
    img: "img/CV550.jpg",
    desc: "Fonte Corsair 550W confiável."
  },
  {
    id: 12,
    nome: "XPG 850W",
    preco: 650,
    cat: "fonte",
    img: "img/XPG850.jpg",
    desc: "Fonte XPG 850W para setups de alto desempenho."
  },

  // 🟡 PLACAS MÃE
  {
    id: 13,
    nome: "Gigabyte B550M Aorus",
    preco: 850,
    cat: "placa",
    img: "img/B55MAorus.jpg",
    desc: "Placa mãe B550M Aorus com suporte a Ryzen."
  },
  {
    id: 14,
    nome: "ASUS TUF",
    preco: 920,
    cat: "placa",
    img: "img/ASUSTUF.jpg",
    desc: "Placa mãe ASUS TUF resistente e confiável."
  },
  {
    id: 15,
    nome: "MSI A520M",
    preco: 450,
    cat: "placa",
    img: "img/MSIA520M.jpg",
    desc: "Placa mãe MSI A520M custo-benefício."
  },

  // 🔴 GABINETES
  {
    id: 16,
    nome: "NZXT H510",
    preco: 500,
    cat: "gabinete",
    img: "img/NZXTH510.jpg",
    desc: "Gabinete NZXT minimalista e elegante."
  },
  {
    id: 17,
    nome: "Corsair 4000D",
    preco: 650,
    cat: "gabinete",
    img: "img/4000DAIRFLOW.jpg",
    desc: "Gabinete Corsair com excelente airflow."
  },
  {
    id: 18,
    nome: "Redragon Superion",
    preco: 300,
    cat: "gabinete",
    img: "img/REDRAGONSUP.jpg",
    desc: "Gabinete gamer Redragon com ótimo custo."
  }
];


// 🔥 FUNÇÃO NOVA (ESSENCIAL)
function buscarProdutoPorId(id){
  return produtos.find(p => p.id == id);
}

function abrirZoom(){
  const modal = document.getElementById("zoomModal");
  const img = document.getElementById("zoomImg");

  img.src = document.getElementById("imgPrincipal").src;
  modal.style.display = "flex";
}

// fechar ao clicar (só executa se o modal existir na página)
const zoomModalEl = document.getElementById("zoomModal");
if (zoomModalEl) {
  zoomModalEl.onclick = function(){
    this.style.display = "none";
  };
}

function abrirZoom(){
  const modal = document.getElementById("zoomModal");
  const img = document.getElementById("img-principal");
  const zoomImg = document.getElementById("zoomImg");

  zoomImg.src = img.src;
  modal.style.display = "flex";
}

function fecharZoom(){
  document.getElementById("zoomModal").style.display = "none";
}

function buscarProdutoPorId(id){
  return produtos.find(p => p.id == id);
}