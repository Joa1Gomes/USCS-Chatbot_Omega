let chamados = [];
let chamadoAtual = null;
const BASE_URL = 'http://localhost:3000/chamados';



const modalChamado = new bootstrap.Modal(document.getElementById('modalChamado'));

// Padronizar textos que a API retorna

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
  if (!data) return '-';
  return new Date(data).toLocaleDateString('pt-BR');
}

// Extraindo o id numerico a partir da string #CH-0001
function idNumerico(chamadoId) {
  return String(chamadoId).replace(/\D/g, '')
}

function renderizarChamados() {
  const container = document.getElementById('chamadosContainer');
  container.innerHTML = '';

  if (chamados.length === 0) {
    container.innerHTML = '<p style="text-align:center; color#aaa;">Nenhum chamado encontrado.</p>';
    return;
  }

  chamados.forEach((chamado, index) => {
    const statusClass = `status-${chamado.status}`
    const prioridadeClass = `prioridade-${chamado.prioridade}`;
    const icoPrioridade = chamado.prioridade === 'alta' ? '⚡'
      : chamado.prioridade === 'media' ? '⚠️' : '✓';
    container.innerHTML += `
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
  });
}
// ── Carregar chamados da API ───────────────────────────────────────────────
async function carregarChamados() {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error('Erro na resposta da API');
    chamados = await res.json();
    renderizarChamados();
  } catch (erro) {
    console.error('Erro ao carregar chamados:', erro);
    document.getElementById('chamadosContainer').innerHTML =
      '<p style="color:red; text-align:center;">Erro ao carregar chamados. Verifique a conexão com o servidor.</p>';
  }
}

// ── Abrir modal de edição ──────────────────────────────────────────────────
function abrirEdicao(index) {
  chamadoAtual = index;
  const chamado = chamados[index];
  document.getElementById('chamadoStatus').value = chamado.status;
  document.getElementById('chamadoPrioridade').value = chamado.prioridade;
  document.getElementById('chamadoDescricao').value = chamado.descricao;
  modalChamado.show();
}

// ── Fechar chamado (PATCH /chamados/:id/fechar) ───────────────────────────
async function fecharChamado(index) {
  if (!confirm('Tem certeza que deseja fechar este chamado?')) return;
  const id = idNumerico(chamados[index].id);
  try {
    const res = await fetch(`${BASE_URL}/${id}/fechar`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Falha ao fechar chamado');
    alert('Chamado fechado com sucesso!');
    await carregarChamados();   // recarrega da API para refletir estado real
  } catch (erro) {
    console.error(erro);
    alert('Erro ao fechar o chamado. Tente novamente.');
  }
}

// ── Salvar edição (PATCH /chamados/:id) ───────────────────────────────────
document.getElementById('formChamado').addEventListener('submit', async function (e) {
  e.preventDefault();
  if (chamadoAtual === null) return;
  const id = idNumerico(chamados[chamadoAtual].id);
  const status = document.getElementById('chamadoStatus').value;
  const prioridade = document.getElementById('chamadoPrioridade').value;
  const descricao = document.getElementById('chamadoDescricao').value;
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, prioridade, descricao })
    });
    if (!res.ok) throw new Error('Falha ao salvar alterações');
    alert('Chamado atualizado com sucesso!');
    modalChamado.hide();
    await carregarChamados();   // recarrega para refletir mudanças reais
  } catch (erro) {
    console.error(erro);
    alert('Erro ao salvar o chamado. Tente novamente.');
  }
});

// ── Inicializar ────────────────────────────────────────────────────────────
carregarChamados();