let chamados = []
let chamadoAtual = null

document.addEventListener('DOMContentLoaded', function () {

    const isAdmin = sessionStorage.getItem('is_admin');

    if (isAdmin === 'true') {
        document.getElementById('menuLista').insertAdjacentHTML('afterbegin', `
            <li><a href="gerenciamento_adm.html">🧑‍💼 Gerenciamento de Usuários</a></li>
        `);
    }

});

function capitalize(str) {
    const map = {
        'aberto': 'Aberto',
        'em_andamento': 'Em Andamento',
        'resolvido': 'Resolvido',
        'encerrado': 'Encerrado',
        'fechado': 'Encerrado'
    };
    return map[str] || str;
}

function formatarData(data) {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
}


async function carregarEstatisticasHomePage() {

    const idsLojas = sessionStorage.getItem('ids_lojas');
    if (!idsLojas) {
        alert('Sessão expirada. Faça login novamente.');
        windows.location.href('/login.html')
    }

    try {
        const response = await fetch(`http://localhost:3000/homepage/cards?ids_lojas=${encodeURIComponent(idsLojas)}`, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error('Erro ao buscar estatísticas');
        }

        const dados = await response.json();
        const totalChamados = dados.totalChamados;
        const chamadosResolvidos = dados.chamadosResolvidos;
        const chamadosEmAndamento = dados.chamadosEmAndamento;
        const chamadosAbertos = dados.chamadosAbertos;

        document.getElementById('totaltickets_homepage').textContent = totalChamados || '-';
        document.getElementById('ticketsresolvidos_homepage').textContent = chamadosResolvidos || '-';
        document.getElementById('ticketsandamento_homepage').textContent = chamadosEmAndamento || '-';
        document.getElementById('ticketsabertos_homepage').textContent = chamadosAbertos || '-';


    } catch (erro) {
        console.error('Erro ao carregar KPIs', erro);
    }
}

// Gera as iniciais do nome para o avatar
function iniciais(nome) {
    if (!nome) return '??';
    return nome.trim().split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

// Paleta de cores para os avatares
const avatarColors = [
    'var(--gradient-primary)',
    'linear-gradient(135deg, #f0abfc, #d946ef)',
    'linear-gradient(135deg, #34d399, #059669)',
    'linear-gradient(135deg, #60a5fa, #2563eb)',
];

function statusClass(status) {
    const map = {
        'aberto': 'status-open',
        'em_andamento': 'status-progress',
        'resolvido': 'status-resolved',
        'encerrado': 'status-resolved',
    };
    return map[status] || '';
}

function renderizarChamadosRecentes() {
    const container = document.getElementById('recentes-lista');
    container.innerHTML = '';

    if (chamados.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#aaa;">Nenhum chamado encontrado.</p>';
        return;
    }

    chamados.forEach((chamado, index) => {
        const cor = avatarColors[index % avatarColors.length];
        container.innerHTML += `
            <div class= "ticket-item">
            <div class="ticket-avatar" style="background: ${cor};">${iniciais(chamado.nome_completo)}</div>
            <div class="ticket-info">
                <div class="ticket-title">${chamado.assunto || 'Sem título'}</div>
                <div class="ticket-meta">#TK-${String(chamado.id_ticket).padStart(4, '0')} · ${chamado.nome_completo || '-'} · ${formatarData(chamado.data_inicio)}</div>
            </div>
            <span class="ticket-status ${statusClass(chamado.status)}">${capitalize(chamado.status)}</span>
        </div >
            `;
    });
}

async function carregarChamadosRecentes() {

    const idsLojas = sessionStorage.getItem('ids_lojas');
    if (!idsLojas) {
        alert('Sessão expirada. Faça login novamente.');
        windows.location.href('/login.html')
    }

    try {
        const response = await fetch(`http://localhost:3000/homepage/chamadosRecentes?ids_lojas=${encodeURIComponent(idsLojas)}`, {
            method: 'GET',
        });

        if (!response.ok) throw new Error('Erro ao buscar chamados recentes');
        chamados = await response.json();   // atualiza o array global
        renderizarChamadosRecentes();
    } catch (erro) {
        console.error('Erro ao carregar chamados recentes:', erro);
        const container = document.getElementById('recentes-lista');
        if (container) container.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar chamados recentes.</p>';
    }
}

async function inicializarPagina() {
    await carregarEstatisticasHomePage();
    await carregarChamadosRecentes();
}

window.onload = inicializarPagina;