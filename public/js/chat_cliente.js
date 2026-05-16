// ── Escopo externo: acessível por salvarMensagem (fora do DOMContentLoaded) ──
let idConversa = null;
let idTicket = null;

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

  // Controle do modo chat ao vivo
  let modoChat = false;
  let pollingAtendente = null;
  let ultimoIdMensagem = 0;

  // ── Eventos do widget ────────────────────────────────────────────────────
  chatBtn.addEventListener("click", () => {
    chatWindow.style.display = "flex";
    if (chatMessages.children.length === 0) iniciarConversa();
  });

  closeBtn.addEventListener("click", () => {
    chatWindow.style.display = "none";
  });

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const mensagem = chatInput.value.trim();
    if (mensagem === "") return;

    if (modoChat) {
      // Modo chat ao vivo: envia direto para o banco sem passar pelo bot
      adicionarMensagemUsuario(mensagem);
      chatInput.value = "";
      await salvarMensagem("cliente", mensagem);
    } else {
      // Modo bot: fluxo guiado normal
      adicionarMensagemUsuario(mensagem);
      processarMensagem(mensagem);
      chatInput.value = "";
    }
  });

  // ── Renderização de mensagens ────────────────────────────────────────────
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

  // Mensagem do atendente humano (visual diferente do bot)
  function adicionarMensagemAtendente(texto) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "bot-message";
    msgDiv.style.cssText = "border-left: 3px solid #4f46e5;";
    msgDiv.innerHTML = `<span style="font-size:0.75rem;font-weight:600;color:#4f46e5;display:block;margin-bottom:4px;">👤 Atendente</span>${texto}`;
    chatMessages.appendChild(msgDiv);
    rolarChat();
  }

  // Mensagem de status do sistema (centralizada, em itálico)
  function adicionarMensagemSistema(texto, id = null) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "system-chat-status";
    if (id) msgDiv.id = id;
    msgDiv.style.cssText = "text-align:center;color:#888;font-style:italic;font-size:0.82rem;margin:10px 0;padding:6px 12px;";
    msgDiv.innerHTML = texto;
    chatMessages.appendChild(msgDiv);
    rolarChat();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  function validarEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function rolarChat() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // ── Registra cliente + ticket + conversa no banco ────────────────────────
  async function registrarAtendimento() {
    try {
      // 1. Registrar/buscar cliente
      const responseCliente = await fetch("http://localhost:3000/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeCliente, emailCliente })
      });
      const resultCliente = await responseCliente.json();
      idCliente = resultCliente.idCliente;

      // 2. Criar ticket em TICKETS_EMPRESA
      const dados = { idCliente, nomeCliente, emailCliente, pedido, descricao, tipoSolicitacao };
      const responseTicket = await fetch("http://localhost:3000/encerramento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });
      const resultTicket = await responseTicket.json();
      idTicket = resultTicket.id_ticket;

      // 3. Criar conversa atrelada ao ticket
      const responseConversa = await fetch("http://localhost:3000/conversas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_ticket: idTicket })
      });
      const resultConversa = await responseConversa.json();
      idConversa = resultConversa.id_conversa;

      return true;
    } catch (err) {
      console.error("Erro ao registrar atendimento:", err);
      adicionarMensagemBot("Ocorreu um erro ao registrar o atendimento. Tente novamente.");
      return false;
    }
  }

  // ── Inicia modo de chat ao vivo com atendente ────────────────────────────
  async function iniciarModoAtendente() {
    modoChat = true;

    // Remove qualquer grupo de botões que ainda esteja visível
    document.querySelectorAll(".quick-reply").forEach(el => el.remove());

    // Mostra mensagem de espera (com ID para remover depois)
    adicionarMensagemSistema("⏳ Aguardando um atendente livre...", "msg-aguardando");

    // Habilita input para o cliente digitar
    chatInput.disabled = false;
    chatInput.placeholder = "Digite sua mensagem...";

    // Inicia o polling a cada 3s
    ultimoIdMensagem = 0;
    pollingAtendente = setInterval(verificarNovasMensagens, 3000);
  }

  // ── Polling: verifica novas mensagens do atendente ───────────────────────
  async function verificarNovasMensagens() {
    if (!idConversa) return;

    try {
      const res = await fetch(`http://localhost:3000/conversas/${idConversa}/mensagens`);
      const mensagens = await res.json();

      // Filtra apenas mensagens novas (id maior que o último processado)
      const novas = mensagens.filter(m => m.id_mensagem > ultimoIdMensagem);

      novas.forEach(msg => {
        if (msg.remetente === "atendente") {
          // Remove mensagem de "aguardando" na primeira resposta do atendente
          const aguardando = document.getElementById("msg-aguardando");
          if (aguardando) aguardando.remove();

          adicionarMensagemAtendente(msg.conteudo);
        }
        // Mensagens do 'cliente' já estão no DOM (enviadas localmente), não re-renderiza
        // Atualiza o cursor do último ID processado para ambos os remetentes
        ultimoIdMensagem = Math.max(ultimoIdMensagem, msg.id_mensagem);
      });
    } catch (err) {
      console.error("Erro no polling:", err);
    }
  }

  // ── Fluxo do bot ─────────────────────────────────────────────────────────
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
        adicionarMensagemBot("Muito obrigado pela avaliação! O que deseja fazer agora?", [
          "Falar com atendente",
          "Encerrar",
          "Reiniciar"
        ]);
        etapa = "fim";
        break;

      case "fim":
        if (msg.includes("falar com atendente")) {
          adicionarMensagemSistema("Registrando seu atendimento...");
          const sucesso = await registrarAtendimento();
          // Remove mensagem de "registrando..."
          const registrando = chatMessages.querySelector(".system-chat-status:not(#msg-aguardando)");
          if (registrando) registrando.remove();

          if (sucesso) {
            adicionarMensagemBot(
              `Seu atendimento foi registrado! 🎫 Ticket <strong>#${idTicket}</strong>.<br>
               Você também pode acompanhar o status pelo número do ticket quando quiser.`
            );
            await iniciarModoAtendente();
          }
        } else if (msg.includes("encerrar")) {
          adicionarMensagemSistema("Registrando seu atendimento...");
          const sucesso = await registrarAtendimento();
          const registrando = chatMessages.querySelector(".system-chat-status");
          if (registrando) registrando.remove();

          if (sucesso) {
            adicionarMensagemBot(
              `Atendimento registrado com sucesso! 🎫 Ticket <strong>#${idTicket}</strong>.<br>
               Guarde esse número para acompanhar o status. Até logo!`
            );
          }
        } else if (msg.includes("reiniciar")) {
          resetarChat();
        }
        break;
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
    // Para o polling se estiver ativo
    if (pollingAtendente) {
      clearInterval(pollingAtendente);
      pollingAtendente = null;
    }

    chatMessages.innerHTML = "";
    nomeCliente = "";
    emailCliente = "";
    pedido = "";
    descricao = "";
    tipoSolicitacao = "";
    idCliente = null;
    idConversa = null;
    idTicket = null;
    modoChat = false;
    ultimoIdMensagem = 0;
    chatInput.disabled = false;
    chatInput.placeholder = "Digite sua mensagem...";

    iniciarConversa();
  }
});

// ── Salva mensagem no banco (usa idConversa do escopo externo) ───────────────
async function salvarMensagem(remetente, conteudo) {
  if (!idConversa) return;
  try {
    await fetch(`http://localhost:3000/conversas/${idConversa}/mensagens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remetente, conteudo })
    });
  } catch (err) {
    console.error("Erro ao salvar mensagem:", err);
  }
}
