const BASE_URL = 'http://localhost:3000';
let ticketAtivo = null;
let idConversaAtiva = null;
let pollingInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
    await carregarTicketsSidebar();

    // Se vier de chamado.html com um ticket pré-selecionado
    const ticketPreSelecionado = sessionStorage.getItem('ticket_chat_ativo');
    if (ticketPreSelecionado) {
        sessionStorage.removeItem('ticket_chat_ativo');
        await abrirTicket(parseInt(ticketPreSelecionado));
    }
});

// Carrega a lista de tickets na sidebar esquerda
async function carregarTicketsSidebar() {
    const idsLojasRaw = sessionStorage.getItem('ids_lojas');
    if (!idsLojasRaw) return;

    try {
        const res = await fetch(`${BASE_URL}/chamados?ids_lojas=${encodeURIComponent(idsLojasRaw)}`);
        const tickets = await res.json();
        renderizarSidebar(tickets);
    } catch (err) {
        console.error('Erro ao carregar tickets:', err);
    }
}

function renderizarSidebar(tickets) {
    const lista = document.querySelector('.tickets-list');
    lista.innerHTML = '';

    tickets.forEach(ticket => {
        const div = document.createElement('div');
        div.className = 'ticket-item';
        div.dataset.id = ticket.id_ticket;
        div.innerHTML = `
      <div class="ticket-id">TK-${ticket.id_ticket}</div>
      <div class="ticket-title">${ticket.titulo}</div>
      <div class="ticket-date">${new Date(ticket.data).toLocaleString('pt-BR')}</div>
      <span class="ticket-status ${ticket.status}">${capitalize(ticket.status)}</span>
    `;
        div.addEventListener('click', () => abrirTicket(ticket.id_ticket));
        lista.appendChild(div);
    });
}

// Abre a conversa de um ticket específico
async function abrirTicket(idTicket) {
    // Limpa polling anterior
    if (pollingInterval) clearInterval(pollingInterval);

    ticketAtivo = idTicket;

    // Marca como ativo na sidebar
    document.querySelectorAll('.ticket-item').forEach(el => {
        el.classList.toggle('active', parseInt(el.dataset.id) === idTicket);
    });

    // Busca a conversa ligada ao ticket
    try {
        const res = await fetch(`${BASE_URL}/conversas/ticket/${idTicket}`);
        if (!res.ok) {
            document.getElementById('chatMessages').innerHTML =
                '<p style="text-align:center;color:#aaa;padding:2rem;">Nenhuma conversa registrada para este ticket.</p>';
            return;
        }
        const conversa = await res.json();
        idConversaAtiva = conversa.id_conversa;

        // Atualiza header do chat
        const headerTitle = document.getElementById('chatHeaderTitle');
        const headerMeta = document.getElementById('chatHeaderMeta');
        if (headerTitle) headerTitle.textContent = `TK-${idTicket}`;
        if (headerMeta) headerMeta.textContent = `Ticket #${idTicket}`;

        // Carrega mensagens e inicia polling
        await carregarMensagens();
        pollingInterval = setInterval(carregarMensagens, 3000); // Atualiza a cada 3s
    } catch (err) {
        console.error('Erro ao abrir ticket:', err);
    }
}

// Carrega as mensagens do banco e renderiza
async function carregarMensagens() {
    if (!idConversaAtiva) return;

    try {
        const res = await fetch(`${BASE_URL}/conversas/${idConversaAtiva}/mensagens`);
        const mensagens = await res.json();
        renderizarMensagens(mensagens);
    } catch (err) {
        console.error('Erro ao carregar mensagens:', err);
    }
}

function renderizarMensagens(mensagens) {
    const container = document.getElementById('chatMessages');
    const eraNoFundo = container.scrollTop + container.clientHeight >= container.scrollHeight - 10;

    container.innerHTML = '';

    mensagens.forEach(msg => {
        const div = document.createElement('div');
        // 'atendente' → classe 'agent' (CSS existente); 'cliente'/'bot' → 'user'
        const cssClass = msg.remetente === 'atendente' ? 'agent' : 'user';
        div.className = `message ${cssClass}`;
        div.innerHTML = `
      <div class="message-bubble">
        ${msg.conteudo}
        <div class="message-time">${new Date(msg.data_envio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    `;
        container.appendChild(div);
    });

    // Só rola para o fim se já estava no fim antes da atualização
    if (eraNoFundo) container.scrollTop = container.scrollHeight;
}

// Enviar mensagem do atendente
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const conteudo = input.value.trim();
    if (!conteudo || !idConversaAtiva) return;

    input.value = '';
    input.style.height = 'auto';

    try {
        await fetch(`${BASE_URL}/conversas/${idConversaAtiva}/mensagens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ remetente: 'atendente', conteudo })
        });
        await carregarMensagens(); // Atualiza imediatamente após envio
    } catch (err) {
        console.error('Erro ao enviar mensagem:', err);
    }
}

function capitalize(str) {
    const map = {
        'aberto': 'Aberto', 'em_andamento': 'Em Andamento',
        'resolvido': 'Resolvido', 'encerrado': 'Encerrado'
    };
    return map[str] || str;
}
