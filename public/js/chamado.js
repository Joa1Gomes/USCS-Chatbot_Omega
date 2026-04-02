
// Dados de exemplo
const chamados = [
    {
        id: '#CH-2401',
        titulo: 'Sistema não está respondendo',
        descricao: 'O painel administrativo não carrega as páginas corretamente.',
        cliente: 'Maria Silva',
        data: '2025-01-15',
        prioridade: 'alta',
        status: 'progresso'
    },
    {
        id: '#CH-2402',
        titulo: 'Erro ao fazer login',
        descricao: 'Usuários não conseguem acessar a plataforma com suas credenciais.',
        cliente: 'João Costa',
        data: '2025-01-16',
        prioridade: 'alta',
        status: 'aberto'
    },
    {
        id: '#CH-2403',
        titulo: 'Atualização de permissões',
        descricao: 'Necessário atualizar permissões de um grupo de usuários.',
        cliente: 'Ana Santos',
        data: '2025-01-14',
        prioridade: 'media',
        status: 'progresso'
    },
    {
        id: '#CH-2404',
        titulo: 'Integração com API externa',
        descricao: 'Implementar integração com sistema de pagamento externo.',
        cliente: 'Carlos Pereira',
        data: '2025-01-13',
        prioridade: 'media',
        status: 'resolvido'
    },
    {
        id: '#CH-2405',
        titulo: 'Recuperação de senha',
        descricao: 'Usuário esqueceu sua senha e precisa de ajuda para recuperá-la.',
        cliente: 'Patricia Lima',
        data: '2025-01-12',
        prioridade: 'baixa',
        status: 'resolvido'
    },
    {
        id: '#CH-2406',
        titulo: 'Backup de dados',
        descricao: 'Realizar backup de segurança dos dados do sistema.',
        cliente: 'Roberto Alves',
        data: '2025-01-11',
        prioridade: 'media',
        status: 'fechado'
    }
];

let chamadoAtual = null;
const modalChamado = new bootstrap.Modal(document.getElementById('modalChamado'));

// Renderizar chamados
function renderizarChamados() {
    const container = document.getElementById('chamadosContainer');
    container.innerHTML = '';

    chamados.forEach((chamado, index) => {
        const statusClass = `status-${chamado.status}`;
        const prioridadeClass = `prioridade-${chamado.prioridade}`;
        const icoPrioridade = chamado.prioridade === 'alta' ? '⚡' : chamado.prioridade === 'media' ? '⚠️' : '✓';

        const chamadoHTML = `
    <div class="chamado-card">
        <div class="chamado-header">
            <span class="chamado-id">${chamado.id}</span>
            <span class="chamado-status ${statusClass}">${capitalize(chamado.status)}</span>
        </div>
        <div class="chamado-titulo">${chamado.titulo}</div>
        <div class="chamado-descricao">${chamado.descricao}</div>
        <div class="chamado-meta">
            <div class="chamado-meta-item">
                <i class="fas fa-user"></i>
                <span>${chamado.cliente}</span>
            </div>
            <div class="chamado-meta-item">
                <i class="fas fa-calendar"></i>
                <span>${formatarData(chamado.data)}</span>
            </div>
        </div>
        <div class="chamado-prioridade ${prioridadeClass}">
            <span>${icoPrioridade}</span>
            <span>Prioridade ${capitalize(chamado.prioridade)}</span>
        </div>
        <div class="chamado-actions">
            <button class="btn-acao btn-editar" onclick="abrirEdicao(${index})">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn-acao btn-fechar" onclick="fecharChamado(${index})">
                <i class="fas fa-check"></i> Fechar
            </button>
        </div>
    </div>
    `;

        container.innerHTML += chamadoHTML;
    });
}

// Abrir modal de edição
function abrirEdicao(index) {
    chamadoAtual = index;
    const chamado = chamados[index];
    document.getElementById('chamadoStatus').value = chamado.status;
    document.getElementById('chamadoPrioridade').value = chamado.prioridade;
    document.getElementById('chamadoDescricao').value = chamado.descricao;
    modalChamado.show();
}

// Fechar chamado
function fecharChamado(index) {
    if (confirm('Tem certeza que deseja fechar este chamado?')) {
        chamados[index].status = 'fechado';
        renderizarChamados();
        alert('Chamado fechado com sucesso!');
    }
}

// Salvar alterações
document.getElementById('formChamado').addEventListener('submit', function (e) {
    e.preventDefault();
    if (chamadoAtual !== null) {
        chamados[chamadoAtual].status = document.getElementById('chamadoStatus').value;
        chamados[chamadoAtual].prioridade = document.getElementById('chamadoPrioridade').value;
        chamados[chamadoAtual].descricao = document.getElementById('chamadoDescricao').value;
        renderizarChamados();
        modalChamado.hide();
        alert('Chamado atualizado com sucesso!');
    }
});

// Utilitários
function capitalize(str) {
    const map = {
        'aberto': 'Aberto',
        'progresso': 'Em Progresso',
        'resolvido': 'Resolvido',
        'fechado': 'Fechado',
        'alta': 'Alta',
        'media': 'Média',
        'baixa': 'Baixa'
    };
    return map[str] || str;
}

function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

// Inicializar
renderizarChamados();