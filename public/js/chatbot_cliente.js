// ── Escopo externo: acessível pelas funções de API ───────────────────────────
let idConversa = null;
let idTicket = null;

// ── Referências do DOM ────────────────────────────────────────────────────────
const chatMessages = document.getElementById("chatMessages");
const optionsContainer = document.getElementById("optionsContainer");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const chatToggle = document.getElementById("chatToggle");
const chatWidget = document.getElementById("chatWidget");
const closeChat = document.getElementById("closeChat");
const minimizeChat = document.getElementById("minimizeChat");
const restartChat = document.getElementById("restartChat");

// ── Estado do bot ─────────────────────────────────────────────────────────────
let etapaAtual = "menuInicial";
let chatIniciado = false;
let modoAtendente = false;       // true = chat ao vivo com atendente
let pollingAtendente = null;     // referência ao setInterval
let ultimoIdMensagem = 0;        // cursor para o polling

const dadosAtendimento = {
  nome: "",
  email: "",
  pedido: "",
  dataCompra: "",
  motivo: "",
  submotivo: "",
  descricao: "",
  prioridade: "",
  status: "Aberto",
  protocolo: "",
  notaAvaliacao: "",
  comentarioFinal: ""
};

function resetarDados() {
  dadosAtendimento.nome = "";
  dadosAtendimento.email = "";
  dadosAtendimento.pedido = "";
  dadosAtendimento.dataCompra = "";
  dadosAtendimento.motivo = "";
  dadosAtendimento.submotivo = "";
  dadosAtendimento.descricao = "";
  dadosAtendimento.prioridade = "";
  dadosAtendimento.status = "Aberto";
  dadosAtendimento.protocolo = "";
  dadosAtendimento.notaAvaliacao = "";
  dadosAtendimento.comentarioFinal = "";
}

// ── Renderização de mensagens ─────────────────────────────────────────────────
function adicionarMensagem(texto, tipo) {
  const mensagem = document.createElement("div");
  mensagem.classList.add("message");
  mensagem.classList.add(tipo === "bot" ? "bot-message" : "user-message");
  mensagem.textContent = texto;
  chatMessages.appendChild(mensagem);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function adicionarMensagemAtendente(texto) {
  const mensagem = document.createElement("div");
  mensagem.classList.add("message", "bot-message");
  mensagem.style.borderLeft = "3px solid #4f46e5";
  mensagem.innerHTML = `<span style="font-size:0.72rem;font-weight:700;color:#4f46e5;display:block;margin-bottom:3px;">👤 Atendente</span>${texto}`;
  chatMessages.appendChild(mensagem);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function adicionarMensagemSistema(texto, id = null) {
  const el = document.createElement("div");
  el.classList.add("message");
  if (id) el.id = id;
  el.style.cssText = "text-align:center;color:#888;font-style:italic;font-size:0.8rem;margin:8px auto;background:transparent;";
  el.textContent = texto;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function adicionarCardResumo() {
  const card = document.createElement("div");
  card.classList.add("system-card");

  card.innerHTML = `
    <h3>Resumo do atendimento</h3>
    <p><strong>Nome:</strong> ${dadosAtendimento.nome}</p>
    <p><strong>E-mail:</strong> ${dadosAtendimento.email}</p>
    <p><strong>Pedido:</strong> ${dadosAtendimento.pedido || "Não informado"}</p>
    <p><strong>Data da compra:</strong> ${dadosAtendimento.dataCompra || "Não informada"}</p>
    <p><strong>Motivo:</strong> ${dadosAtendimento.motivo}</p>
    <p><strong>Submotivo:</strong> ${dadosAtendimento.submotivo}</p>
    <p><strong>Descrição:</strong> ${dadosAtendimento.descricao}</p>
    <p><strong>Prioridade:</strong> ${dadosAtendimento.prioridade}</p>
    <p><strong>Status inicial:</strong> ${dadosAtendimento.status}</p>
  `;

  chatMessages.appendChild(card);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function adicionarCardProtocolo(idTicketGerado = null) {
  const card = document.createElement("div");
  card.classList.add("system-card");

  const protocolo = idTicketGerado
    ? `#${idTicketGerado}`
    : dadosAtendimento.protocolo;

  card.innerHTML = `
    <h3>Atendimento registrado com sucesso</h3>
    <p>Agradecemos pelo seu contato. Sua solicitação foi registrada com sucesso no sistema Omega.</p>
    <p>Para consultar o andamento do atendimento futuramente, utilize o número de protocolo abaixo.</p>

    <div class="protocol-highlight">
      <strong>Ticket: ${protocolo}</strong>
      <p><strong>Status inicial:</strong> ${dadosAtendimento.status}</p>
      <p><strong>Prioridade:</strong> ${dadosAtendimento.prioridade}</p>
    </div>

    <p>Guarde esse número, pois ele será necessário para consultar o status do seu atendimento.</p>
  `;

  chatMessages.appendChild(card);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ── Controle de opções ────────────────────────────────────────────────────────
function mostrarOpcoes(opcoes) {
  optionsContainer.innerHTML = "";

  opcoes.forEach((opcao) => {
    const botao = document.createElement("button");
    botao.classList.add("option-btn");
    botao.textContent = opcao;
    botao.onclick = () => processarEntrada(opcao);
    optionsContainer.appendChild(botao);
  });
}

function limparOpcoes() {
  optionsContainer.innerHTML = "";
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function definirPrioridade(motivo, submotivo) {
  if (
    submotivo === "Não recebi" ||
    submotivo === "Cobrança duplicada" ||
    submotivo === "Produto com defeito" ||
    submotivo === "Produto não funciona" ||
    submotivo === "Conta bloqueada"
  ) {
    return "Alta";
  }

  if (
    submotivo === "Atraso" ||
    submotivo === "Pagamento não aprovado" ||
    submotivo === "Troca" ||
    submotivo === "Devolução" ||
    motivo === "Garantia ou assistência"
  ) {
    return "Média";
  }

  return "Baixa";
}

// ── API: Registra cliente + ticket + conversa no banco ────────────────────────
async function registrarAtendimentoNoBanco() {
  try {
    // 1. Registrar/buscar cliente
    const resCliente = await fetch("http://localhost:3000/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomeCliente: dadosAtendimento.nome,
        emailCliente: dadosAtendimento.email
      })
    });
    const dadosCliente = await resCliente.json();
    const idCliente = dadosCliente.idCliente;

    // 2. Criar ticket em TICKETS_EMPRESA
    const resTicket = await fetch("http://localhost:3000/encerramento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idCliente,
        nomeCliente: dadosAtendimento.nome,
        emailCliente: dadosAtendimento.email,
        pedido: dadosAtendimento.pedido,
        descricao: dadosAtendimento.descricao,
        tipoSolicitacao: dadosAtendimento.motivo,
        prioridade: dadosAtendimento.prioridade
      })
    });
    const dadosTicket = await resTicket.json();
    idTicket = dadosTicket.id_ticket;

    // 3. Criar conversa atrelada ao ticket
    const resConversa = await fetch("http://localhost:3000/conversas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_ticket: idTicket })
    });
    const dadosConversa = await resConversa.json();
    idConversa = dadosConversa.id_conversa;

    return true;
  } catch (err) {
    console.error("Erro ao registrar atendimento:", err);
    adicionarMensagem("Ocorreu um erro ao registrar o atendimento. Tente novamente.", "bot");
    return false;
  }
}

// ── API: Salva uma mensagem na conversa ───────────────────────────────────────
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

// ── Polling: verifica novas mensagens do atendente ────────────────────────────
async function verificarNovasMensagens() {
  if (!idConversa) return;

  try {
    const res = await fetch(`http://localhost:3000/conversas/${idConversa}/mensagens`);
    const mensagens = await res.json();

    const novas = mensagens.filter(m => m.id_mensagem > ultimoIdMensagem);

    novas.forEach(msg => {
      if (msg.remetente === "atendente") {
        // Remove o indicador de "aguardando" na primeira mensagem do atendente
        const aguardando = document.getElementById("msg-aguardando");
        if (aguardando) aguardando.remove();

        adicionarMensagemAtendente(msg.conteudo);
      }
      ultimoIdMensagem = Math.max(ultimoIdMensagem, msg.id_mensagem);
    });
  } catch (err) {
    console.error("Erro no polling:", err);
  }
}

// ── Inicia modo chat ao vivo ──────────────────────────────────────────────────
function iniciarModoAtendente() {
  modoAtendente = true;
  limparOpcoes();

  adicionarMensagemSistema("⏳ Aguardando um atendente livre...", "msg-aguardando");

  // Garante que o input está habilitado
  userInput.disabled = false;
  sendBtn.disabled = false;
  userInput.placeholder = "Digite sua mensagem...";

  ultimoIdMensagem = 0;
  pollingAtendente = setInterval(verificarNovasMensagens, 3000);
}

// ── Fluxo do bot ──────────────────────────────────────────────────────────────
function mostrarMenuInicial() {
  etapaAtual = "menuInicial";
  adicionarMensagem(
    "Olá. Eu sou o Omega. Selecione uma das opções para continuar.",
    "bot"
  );
  mostrarOpcoes([
    "Iniciar atendimento",
    "Consultar protocolo",
    "Dúvidas frequentes"
  ]);
}

function mostrarDuvidasFrequentes() {
  adicionarMensagem(
    "Principais assuntos:\n1. Prazo de entrega\n2. Troca e devolução\n3. Problemas com pagamento\n4. Garantia e assistência",
    "bot"
  );
  adicionarMensagem(
    "Para registrar um atendimento formal, selecione a opção de iniciar atendimento.",
    "bot"
  );
  mostrarOpcoes([
    "Iniciar atendimento",
    "Consultar protocolo",
    "Voltar ao menu"
  ]);
  etapaAtual = "menuInicial";
}

function carregarSubmotivos(motivo) {
  let opcoes = [];

  switch (motivo) {
    case "Entrega":
      adicionarMensagem("O que aconteceu com sua entrega?", "bot");
      opcoes = ["Atraso", "Não recebi", "Endereço incorreto", "Produto chegou danificado", "Outro problema"];
      break;
    case "Produto":
      adicionarMensagem("Qual problema você teve com o produto?", "bot");
      opcoes = ["Produto com defeito", "Produto diferente do esperado", "Faltou item", "Não gostei", "Outro problema"];
      break;
    case "Pagamento":
      adicionarMensagem("Qual problema ocorreu com o pagamento?", "bot");
      opcoes = ["Cobrança duplicada", "Pagamento não aprovado", "Problema com Pix", "Problema com boleto", "Outro problema"];
      break;
    case "Troca ou devolução":
      adicionarMensagem("O que você deseja solicitar?", "bot");
      opcoes = ["Troca", "Devolução", "Cancelamento", "Prazo para troca", "Outro"];
      break;
    case "Garantia ou assistência":
      adicionarMensagem("Qual é o problema que você deseja relatar?", "bot");
      opcoes = ["Produto não funciona", "Falha técnica", "Produto quebrou", "Peça ou acessório", "Outro"];
      break;
    case "Conta ou cadastro":
      adicionarMensagem("O que está acontecendo com sua conta?", "bot");
      opcoes = ["Não consigo entrar", "Esqueci a senha", "Dados incorretos", "Conta bloqueada", "Outro"];
      break;
    case "Outros":
      adicionarMensagem("Qual dessas áreas mais se aproxima do seu problema?", "bot");
      opcoes = ["Entrega", "Produto", "Pagamento", "Troca ou devolução", "Garantia ou assistência", "Conta ou cadastro", "Não sei informar"];
      break;
  }

  mostrarOpcoes(opcoes);
}

function iniciarAtendimento() {
  etapaAtual = "nome";
  limparOpcoes();
  adicionarMensagem("Qual é o seu nome?", "bot");
}

function consultarProtocolo() {
  etapaAtual = "consultaProtocolo";
  limparOpcoes();
  adicionarMensagem("Digite o número do protocolo para consulta.", "bot");
}

function reiniciarFluxo() {
  // Para o polling se estiver rodando
  if (pollingAtendente) {
    clearInterval(pollingAtendente);
    pollingAtendente = null;
  }

  chatMessages.innerHTML = "";
  limparOpcoes();
  resetarDados();
  idConversa = null;
  idTicket = null;
  modoAtendente = false;
  ultimoIdMensagem = 0;
  etapaAtual = "menuInicial";
  userInput.disabled = false;
  sendBtn.disabled = false;
  userInput.placeholder = "Digite...";
  mostrarMenuInicial();
}

// ── Processamento central do bot ──────────────────────────────────────────────
async function processarEntrada(valor) {
  // Se está em modo atendente, mensagens vão direto para o banco
  if (modoAtendente) {
    adicionarMensagem(valor, "user");
    await salvarMensagem("cliente", valor);
    userInput.value = "";
    return;
  }

  adicionarMensagem(valor, "user");

  switch (etapaAtual) {
    case "menuInicial":
      if (valor === "Iniciar atendimento") {
        iniciarAtendimento();
      } else if (valor === "Consultar protocolo") {
        consultarProtocolo();
      } else {
        mostrarDuvidasFrequentes();
      }
      break;

    case "consultaProtocolo":
      adicionarMensagem(
        `Consulta simulada para o protocolo ${valor}.\nStatus atual: Em análise.\nSe desejar, você pode iniciar um novo atendimento ou voltar ao menu principal.`,
        "bot"
      );
      mostrarOpcoes(["Iniciar atendimento", "Voltar ao menu"]);
      etapaAtual = "menuInicial";
      break;

    case "nome":
      dadosAtendimento.nome = valor;
      etapaAtual = "email";
      adicionarMensagem("Agora informe seu e-mail.", "bot");
      break;

    case "email":
      if (!validarEmail(valor)) {
        adicionarMensagem("Por favor, informe um e-mail válido para continuar.", "bot");
        return;
      }
      dadosAtendimento.email = valor;
      etapaAtual = "pedido";
      adicionarMensagem("Você possui o número do pedido?", "bot");
      mostrarOpcoes(["Sim", "Não"]);
      break;

    case "pedido":
      if (valor === "Sim") {
        etapaAtual = "numeroPedido";
        limparOpcoes();
        adicionarMensagem("Digite o número do pedido.", "bot");
      } else {
        etapaAtual = "dataCompra";
        adicionarMensagem("Informe a data aproximada da compra.", "bot");
        mostrarOpcoes(["Hoje", "Esta semana", "Este mês", "Não sei informar"]);
      }
      break;

    case "numeroPedido":
      dadosAtendimento.pedido = valor;
      etapaAtual = "motivo";
      adicionarMensagem("Qual é o motivo do seu contato?", "bot");
      mostrarOpcoes(["Entrega", "Produto", "Pagamento", "Troca ou devolução", "Garantia ou assistência", "Conta ou cadastro", "Outros"]);
      break;

    case "dataCompra":
      dadosAtendimento.dataCompra = valor;
      etapaAtual = "motivo";
      adicionarMensagem("Qual é o motivo do seu contato?", "bot");
      mostrarOpcoes(["Entrega", "Produto", "Pagamento", "Troca ou devolução", "Garantia ou assistência", "Conta ou cadastro", "Outros"]);
      break;

    case "motivo":
      dadosAtendimento.motivo = valor;
      etapaAtual = "submotivo";
      carregarSubmotivos(valor);
      break;

    case "submotivo":
      dadosAtendimento.submotivo = valor;
      etapaAtual = "descricao";
      limparOpcoes();
      adicionarMensagem("Descreva rapidamente o problema.", "bot");
      break;

    case "descricao":
      dadosAtendimento.descricao = valor;
      dadosAtendimento.prioridade = definirPrioridade(
        dadosAtendimento.motivo,
        dadosAtendimento.submotivo
      );
      etapaAtual = "confirmacao";
      adicionarCardResumo();
      mostrarOpcoes(["Confirmar envio", "Editar informações"]);
      break;

    case "confirmacao":
      if (valor === "Confirmar envio") {
        etapaAtual = "avaliacao";
        limparOpcoes();
        adicionarMensagem("Como você avalia este atendimento?", "bot");
        mostrarOpcoes(["1", "2", "3", "4", "5"]);
      } else {
        etapaAtual = "nome";
        limparOpcoes();
        adicionarMensagem("Vamos reiniciar a coleta dos dados. Qual é o seu nome?", "bot");
      }
      break;

    case "avaliacao":
      dadosAtendimento.notaAvaliacao = valor;
      etapaAtual = "comentarioFinal";
      limparOpcoes();
      adicionarMensagem("Deseja deixar um comentário final? Se quiser, digite agora.", "bot");
      break;

    case "comentarioFinal":
      dadosAtendimento.comentarioFinal = valor;
      etapaAtual = "opcaoFinal";
      limparOpcoes();
      adicionarMensagem("O que deseja fazer agora?", "bot");
      mostrarOpcoes([
        "Falar com atendente",
        "Encerrar atendimento",
        "Reiniciar atendimento"
      ]);
      break;

    case "opcaoFinal":
      if (valor === "Falar com atendente") {
        limparOpcoes();
        adicionarMensagemSistema("Registrando seu atendimento...");
        const sucessoAoVivo = await registrarAtendimentoNoBanco();
        // Remove "Registrando..."
        const regEl = chatMessages.querySelector("[style*='text-align:center']");
        if (regEl && !regEl.id) regEl.remove();

        if (sucessoAoVivo) {
          adicionarCardProtocolo(idTicket);
          adicionarMensagem(
            "Conectando você a um atendente. Aguarde um momento.",
            "bot"
          );
          iniciarModoAtendente();
        }
      } else if (valor === "Encerrar atendimento") {
        limparOpcoes();
        adicionarMensagemSistema("Registrando seu atendimento...");
        const sucessoEncerrar = await registrarAtendimentoNoBanco();
        const regEl2 = chatMessages.querySelector("[style*='text-align:center']");
        if (regEl2 && !regEl2.id) regEl2.remove();

        if (sucessoEncerrar) {
          adicionarCardProtocolo(idTicket);
          adicionarMensagem(
            "Obrigado pelo contato! Você pode acompanhar o status pelo número do ticket. Até logo!",
            "bot"
          );
          mostrarOpcoes(["Reiniciar atendimento"]);
          etapaAtual = "posEncerramento";
        }
      } else {
        reiniciarFluxo();
      }
      break;

    case "posEncerramento":
      reiniciarFluxo();
      break;

    default:
      adicionarMensagem("O fluxo não pôde continuar corretamente.", "bot");
      break;
  }
}

// ── Inicialização do widget ───────────────────────────────────────────────────
function iniciarWidget() {
  if (chatIniciado) return;
  chatIniciado = true;
  mostrarMenuInicial();
}

// ── Eventos ───────────────────────────────────────────────────────────────────
sendBtn.addEventListener("click", () => {
  const valor = userInput.value.trim();
  if (!valor) return;

  processarEntrada(valor);
  userInput.value = "";
  userInput.focus();
});

userInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendBtn.click();
  }
});

chatToggle.addEventListener("click", () => {
  chatWidget.classList.toggle("hidden");

  if (!chatWidget.classList.contains("hidden")) {
    iniciarWidget();
    userInput.focus();
  }
});

closeChat.addEventListener("click", () => {
  chatWidget.classList.add("hidden");
});

minimizeChat.addEventListener("click", () => {
  chatWidget.classList.add("hidden");
});

restartChat.addEventListener("click", () => {
  reiniciarFluxo();
});