document.addEventListener("DOMContentLoaded", () => {
  const lista = document.getElementById("lista");
  const totalEl = document.getElementById("total");

  // 1. Puxa os dados da chave "checkout" (e não "carrinho")
  const carrinho = JSON.parse(localStorage.getItem("checkout")) || [];

  lista.innerHTML = "";
  let total = 0;

  // 2. Se o carrinho estiver vazio, avisa na tela
  if (carrinho.length === 0) {
    lista.innerHTML = "<p style='color: #aaa;'>Nenhum item no pedido.</p>";
    totalEl.innerText = "0,00";
    return;
  }

  // 3. Percorre os itens e renderiza na tela de checkout
  carrinho.forEach(produto => {
    const subtotal = produto.preco * produto.qtd;
    total += subtotal;

    const div = document.createElement("div");
    div.classList.add("item");
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.marginBottom = "15px";
    div.style.borderBottom = "1px solid #333";
    div.style.paddingBottom = "10px";

    div.innerHTML = `
      <div style="display: flex; gap: 10px; align-items: center;">
        <img src="${produto.img}" style="width: 50px; border-radius: 5px;">
        <div>
          <span style="display: block; font-weight: bold;">${produto.nome}</span>
          <span style="font-size: 12px; color: #888;">Quantidade: ${produto.qtd}</span>
        </div>
      </div>
      <strong style="color: #ff6600;">
        ${subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </strong>
    `;

    lista.appendChild(div);
  });

  // 4. Atualiza o valor total formatado em Reais
  totalEl.innerText = total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
});

// Função para o botão "Confirmar Compra"
function finalizarPedido() {
  const carrinho = JSON.parse(localStorage.getItem("checkout")) || [];

  if (carrinho.length === 0) {
    alert("Não há itens para finalizar a compra.");
    return;
  }

  // 🔒 AQUI FAZ A VALIDAÇÃO DE LOGIN
  if (!localStorage.getItem("usuarioLogado")) {
    alert("Faça login para concluir o pagamento!");

    // 💾 salva que ele precisa voltar pro checkout
    localStorage.setItem("redirectAposLogin", "../html/checkout_cliente.html");

    // 🔁 vai pro login
    window.location.href = "../html/login.html";
    return;
  }

  // ✅ Se estiver logado, finaliza normal
  alert("Compra confirmada com sucesso! Obrigado por comprar na TechStore.");

  localStorage.removeItem("carrinho");
  localStorage.removeItem("checkout");

  window.location.href = "../html/site_cliente.html";
}