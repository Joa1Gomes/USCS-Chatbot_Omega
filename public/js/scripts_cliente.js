// 📦 Busca o carrinho salvo no navegador (localStorage). 
// Se não tiver nada salvo, inicia como uma lista vazia ([]).
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

// 💾 Função para salvar o estado atual do carrinho no navegador do usuário
function salvarCarrinho() {
  // Transforma a lista (array) em texto (string) e salva no localStorage
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// 🛒 Função responsável por exibir os produtos na tela principal
function render(lista) {
  const el = document.getElementById("produtos");
  el.innerHTML = ""; // Limpa a tela antes de mostrar os produtos

  // Percorre cada produto da lista e cria o HTML dele (o "card")
  lista.forEach(p => {
    el.innerHTML += `
      <div class="card">
        <img src="${p.img}">
        <h3>${p.nome}</h3>
        <p class="preco">${formatarPreco(p.preco)}</p>
        <button class="detalhes" onclick="verProduto(${p.id})">Ver detalhes</button>
        <button class="buy" onclick="addCarrinho(${p.id})">Comprar</button>
      </div>
    `;
  });
}

// 🔍 Função para ver os detalhes de um único produto
function verProduto(id) {
  // Encontra o produto específico na lista de produtos usando o ID
  const p = produtos.find(x => x.id === id);

  // Substitui a tela de produtos pela tela de detalhes do produto selecionado
  document.getElementById("produtos").innerHTML = `
    <div class="produto-page">
      <img src="${p.img}">
      <div>
        <h1>${p.nome}</h1>
        <p>${p.desc}</p>
        <h2>${formatarPreco(p.preco)}</h2>
        <button class="buy" onclick="addCarrinho(${p.id})">Comprar</button> 
        <button class="voltar" onclick="render(produtos)">Voltar</button>
      </div>
    </div>
  `;
}

// 🔄 Função que atualiza o menu lateral do carrinho
function atualizarCarrinho() {
  const lista = document.getElementById("itens-carrinho");
  lista.innerHTML = ""; // Limpa os itens antigos para não duplicar

  let total = 0; // Variável para guardar o valor total da compra

  // Percorre os itens que estão no carrinho
  carrinho.forEach((item, index) => {
    const subtotal = item.preco * item.qtd; // Calcula Preço x Quantidade
    total += subtotal; // Soma o subtotal ao valor total do carrinho

    // Cria a caixinha (div) de cada item no carrinho
    const div = document.createElement("div");
    div.classList.add("item-cart");

    div.innerHTML = `
      <div class="cart-info">
        <span>${item.nome}</span>
        <small>${formatarPreco(item.preco)} x ${item.qtd}</small>
        <strong>${formatarPreco(subtotal)}</strong>
      </div>
      <div class="cart-actions">
        <button class="minus-btn">-</button>
        <span class="qtd">${item.qtd}</span>
        <button class="plus-btn">+</button>
        <button class="remove-btn">&times;</button>
      </div>
    `;

    // ➕ Botão de Aumentar a Quantidade
    div.querySelector(".plus-btn").addEventListener("click", () => {
      item.qtd++; // Aumenta 1
      salvarCarrinho(); // Salva no navegador
      atualizarCarrinho(); // Atualiza a tela
    });

    // ➖ Botão de Diminuir a Quantidade
    div.querySelector(".minus-btn").addEventListener("click", () => {
      item.qtd--; // Diminui 1

      // Se a quantidade chegar a zero, remove o item da lista
      if (item.qtd <= 0) {
        carrinho.splice(index, 1);
      }

      salvarCarrinho();
      atualizarCarrinho();
    });

    // ❌ Botão de Remover o item completamente
    div.querySelector(".remove-btn").addEventListener("click", () => {
      carrinho.splice(index, 1); // Corta o item da lista
      salvarCarrinho();
      atualizarCarrinho();
    });

    // Adiciona o item pronto dentro da lista do carrinho no HTML
    lista.appendChild(div);
  });

  // Atualiza o texto do valor Total na tela
  document.getElementById("total").innerText = formatarPreco(total);

  // Calcula o total de itens (soma das quantidades) para a "bolinha" do carrinho
  const totalItens = carrinho.reduce((acc, item) => acc + item.qtd, 0);
  document.getElementById("cart-count").innerText = totalItens;
}

// 🗑️ Função para esvaziar todo o carrinho
function limparCarrinho() {
  // Se já estiver vazio, não faz nada
  if (carrinho.length === 0) {
    return;
  }

  // Pede confirmação ao usuário
  if (confirm("Deseja limpar o carrinho?")) {
    carrinho = []; // Zera a lista
    localStorage.removeItem("carrinho"); // Apaga do navegador
    atualizarCarrinho(); // Atualiza a tela
  }
}

// 🔎 Função da barra de pesquisa
function buscar() {
  const termo = document.getElementById("search").value.toLowerCase(); // Pega o que foi digitado
  // Filtra os produtos que contém o termo digitado e renderiza novamente
  render(produtos.filter(p => p.nome.toLowerCase().includes(termo)));
}

// 🗂️ Função para filtrar por categoria no menu
function filtrar(cat) {
  if (cat === "todos") render(produtos); // Mostra tudo
  else render(produtos.filter(p => p.cat === cat)); // Mostra só a categoria escolhida
}

// 🚪 Função para abrir/fechar o menu lateral do carrinho
function toggleCarrinho() {
  document.getElementById("carrinho").classList.toggle("active");
}

// 🔥 Inicialização: Renderiza os produtos e atualiza o carrinho assim que a página carrega
render(produtos);
atualizarCarrinho();

// 🛍️ Função chamada quando o usuário clica em "Comprar"
function addCarrinho(id) {
  const produto = produtos.find(p => p.id === id); // Acha qual produto foi clicado

  // Verifica se o produto já existe no carrinho
  const itemExistente = carrinho.find(item => item.id === id);

  if (itemExistente) {
    itemExistente.qtd += 1; // Se já existe, só aumenta a quantidade
  } else {
    // Se não existe, adiciona o produto com quantidade 1
    carrinho.push({
      ...produto,
      qtd: 1
    });
  }

  salvarCarrinho(); // Salva
  atualizarCarrinho(); // Atualiza
  mostrarToast("Produto adicionado ao carrinho!"); // Mostra o aviso na tela
}

// 💵 Função auxiliar para formatar números para o padrão de moeda do Brasil (R$)
function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// 🍞 Função para mostrar aquelas notificações rápidas no canto da tela (Toast)
function mostrarToast(mensagem) {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.innerText = mensagem; // Define a mensagem do aviso

  container.appendChild(toast); // Coloca na tela

  // Remove o aviso automaticamente depois de 3 segundos (3000 milissegundos)
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ✅ Função para ir para a tela de pagamento
function finalizarCompra() {
  // Impede de finalizar se estiver vazio
  if (!carrinho || carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  salvarCarrinho(); // Garante que tudo está salvo

  const dados = localStorage.getItem("carrinho");

  if (!dados) {
    alert("Erro ao processar o carrinho.");
    return;
  }

  // 🔥 Salva os dados numa nova chave chamada "checkout" para a página de pagamento ler
  localStorage.setItem("checkout", dados);

  // Redireciona o usuário para a página de checkout
  window.location.href = "../html/checkout_cliente.html";
}

function irLogin() {
  window.location.href = "../html/login.html";
}

// VERIFICA SE USUÁRIO ESTÁ LOGADO
function verificarUsuario() {
  const user = JSON.parse(localStorage.getItem("usuario"));

  const area = document.getElementById("user-area");

  if (user) {
    area.innerHTML = `
      <span style="margin-right:10px;">👤 ${user.nome}</span>
      <button class="login-btn" onclick="logout()">Sair</button>
    `;
  }
}

function logout() {
  localStorage.removeItem("usuario");
  location.reload();
}

// roda quando abrir o site
verificarUsuario();

function renderUser() {
  const area = document.getElementById("user-area");
  const user = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (user) {
    area.innerHTML = `
      <span style="margin-right:10px;">👤 ${user.nome}</span>
      <button class="login-btn" onclick="logout()">Sair</button>
    `;
  } else {
    area.innerHTML = `
      <button class="login-btn" onclick="window.location.href='../html/login.html'">Login</button>
    `;
  }
}

renderUser();

function trocarImg(img) {
  document.getElementById("img-principal").src = img.src;
}

function verProduto(id) {
  localStorage.setItem("produtoSelecionado", id);
  window.location.href = "../html/produtos_cliente.html";
}

