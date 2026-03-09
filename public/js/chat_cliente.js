document.addEventListener("DOMContentLoaded", function () {
  const chatBtn = document.getElementById("chat-btn");
  const chatWindow = document.getElementById("chat-window");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");
  const closeBtn = document.getElementById("chat-close-btn");

  let etapa = "inicio";
  let nomeCliente = "";
  let emailCliente = "";
  let tipoSolicitacao = "";
  let pedido = "";
  let descricao = "";
  let idCliente = null;

  chatBtn.addEventListener("click", () => {
    chatWindow.style.display = "flex";
    if (chatMessages.children.length === 0) iniciarConversa();
  });

  closeBtn.addEventListener("click", () => {
    chatWindow.style.display = "none";
  });

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const mensagem = chatInput.value.trim();
    if (mensagem !== "") {
      adicionarMensagemUsuario(mensagem);
      processarMensagem(mensagem);
      chatInput.value = "";
    }
  });

  function iniciarConversa() {
    etapa = "nome";
    adicionarMensagemBot("Olá! Qual é o seu nome?");
  }

  function adicionarMensagemUsuario(mensagem) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "user-message";
    msgDiv.innerHTML = mensagem;
    chatMessages.appendChild(msgDiv);
    rolarChat();
  }

  function adicionarMensagemBot(texto, opcoes = []) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "bot-message";
    msgDiv.innerHTML = texto;
    chatMessages.appendChild(msgDiv);

    if (opcoes.length > 0) {
      const botoesDiv = document.createElement("div");
      botoesDiv.className = "quick-reply";

      opcoes.forEach(opcao => {
        const btn = document.createElement("button");
        btn.textContent = opcao;
        btn.addEventListener("click", () => {
          botoesDiv.remove();
          adicionarMensagemUsuario(opcao);
          processarMensagem(opcao);
        });
        botoesDiv.appendChild(btn);
      });

      chatMessages.appendChild(botoesDiv);
    }

    rolarChat();
  }

  function validarEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  async function processarMensagem(mensagem) {
    const msg = mensagem.toLowerCase();

    switch (etapa) {
      case "nome":
        nomeCliente = mensagem;
        etapa = "email";
        adicionarMensagemBot(`Prazer, ${nomeCliente}. Agora, digite seu e-mail:`);
        break;

      case "email":
        if (!validarEmail(mensagem)) {
          adicionarMensagemBot("E-mail inválido. Por favor, digite um e-mail válido.");
        } else {
          emailCliente = mensagem;
          etapa = "motivo";
          adicionarMensagemBot("Como posso te ajudar?", [
            "Problema com entrega",
            "Produto com defeito",
            "Quero cancelar meu pedido",
            "Outro"
          ]);
        }
        break;

      case "motivo":
        if (msg.includes("entrega")) {
          etapa = "pedido_entrega";
          adicionarMensagemBot("Por favor, informe o número do seu pedido:");
        } else if (msg.includes("defeito")) {
          etapa = "pedido_defeito";
          adicionarMensagemBot("Informe o número do pedido com defeito:");
        } else if (msg.includes("cancelar")) {
          etapa = "cancelamento_tipo";
          adicionarMensagemBot("Você deseja cancelar o pedido inteiro ou apenas parte dele?", [
            "Pedido inteiro", "Apenas alguns produtos"
          ]);
        } else {
          etapa = "descricao_outro";
          adicionarMensagemBot("Descreva com mais detalhes sua solicitação:");
        }
        break;

      case "pedido_entrega":
        pedido = mensagem;
        tipoSolicitacao = "entrega";
        etapa = "final";
        finalizarAtendimento();
        break;

      case "pedido_defeito":
        pedido = mensagem;
        tipoSolicitacao = "defeito";
        etapa = "descricao_defeito";
        adicionarMensagemBot("Descreva o defeito encontrado no produto:");
        break;

      case "descricao_defeito":
        etapa = "final";
        descricao = mensagem;
        finalizarAtendimento();
        break;

      case "cancelamento_tipo":
        etapa = "final";
        tipoSolicitacao = "cancelamento";
        finalizarAtendimento();
        break;

      case "descricao_outro":
        etapa = "final";
        tipoSolicitacao = "outro";
        descricao = mensagem;
        finalizarAtendimento();
        break;

      case "avaliacao":
        // Após o cliente avaliar, agora pergunta se quer encerrar ou reiniciar
        adicionarMensagemBot("Muito obrigado! Sua avaliação foi registrada. Deseja encerrar ou reiniciar o atendimento?", [
          "Encerrar", "Reiniciar"
        ]);
        etapa = "fim";
        break;

      case "fim":
        if (msg.includes("encerrar")) {
          adicionarMensagemBot("Atendimento encerrado. Até logo!");

          try {
            const response = await fetch('http://localhost:3000/clientes', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({nomeCliente, emailCliente})
            });

            const result = await response.json();
            idCliente = result.idCliente;
            
          } catch {
            adicionarMensagemBot("Erro de rede ao registrar o cliente.");
          }

          const dados = {idCliente , nomeCliente, emailCliente, pedido, descricao, tipoSolicitacao};

          try {
            const response = await fetch('http://localhost:3000/encerramento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            });
            if (!response.ok) adicionarMensagemBot("Falha ao reistrar o encerramento.");
          } catch {
            adicionarMensagemBot("Erro de rede ao encerrar atendimento.");
          }
        } else if (msg.includes("reiniciar")) {
          resetarChat();
        }
        break;

      default:
        adicionarMensagemBot("Obrigado. Nossa equipe analisará sua solicitação.");
    }
  }

  function finalizarAtendimento() {
    adicionarMensagemBot("Obrigado pelo seu relato, entraremos em contato em breve.");
    etapa = "avaliacao";
    setTimeout(() => {
      adicionarMensagemBot("Como você avalia nosso atendimento?", [
        "⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"
      ]);
    }, 800);
  }

  function resetarChat() {
    chatMessages.innerHTML = "";
    nomeCliente = "";
    emailCliente = "";
    pedido = "";
    iniciarConversa();
  }

  function rolarChat() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
