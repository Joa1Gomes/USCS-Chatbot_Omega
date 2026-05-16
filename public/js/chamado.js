let chamados = [];       // todos os chamados vindos da API
let chamadoAtual = null;
const BASE_URL = 'http://localhost:3000/chamados';

/* ── Estado dos filtros ──────────────────────────────────────────────────── */
const filtros = {
  lojas: new Set(),   // valores selecionados
  status: new Set(),
  prioridade: new Set(),
  dataInicio: null,        // Date | null
  dataFim: null         // Date | null
};

const modalChamado = new bootstrap.Modal(document.getElementById('modalChamado'));


document.addEventListener('DOMContentLoaded', function () {

  const isAdmin = sessionStorage.getItem('is_admin');

  if (isAdmin === 'true') {
    document.getElementById('menuLista').insertAdjacentHTML('afterbegin', `
            <li><a href="gerenciamento_adm.html">🧑‍💼 Gerenciamento de Usuários</a></li>
            <li><a href="gerenciamento_loja.html">🏬 Gerenciamento de Lojas</a></li>
        `);
  }

});

/* ── Helpers de texto ────────────────────────────────────────────────────── */
function capitalize(str) {
  const map = {
    'aberto': 'Aberto',
    'em_andamento': 'Em Andamento',
    'resolvido': 'Resolvido',
    'encerrado': 'Encerrado',
    'fechado': 'Encerrado',
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

/* ── Normaliza qualquer valor de data para Date (sem hora) ──────────────── */
function toDate(val) {
  if (!val) return null;
  const d = new Date(val);
  d.setHours(0, 0, 0, 0);
  return isNaN(d) ? null : d;
}

/* ── Aplica todos os filtros e retorna o subconjunto de chamados ─────────── */
function chamadosFiltrados() {
  return chamados.filter(c => {
    if (filtros.lojas.size && !filtros.lojas.has(String(c.id_loja))) return false;
    if (filtros.status.size && !filtros.status.has(c.status)) return false;
    if (filtros.prioridade.size && !filtros.prioridade.has(c.prioridade)) return false;

    if (filtros.dataInicio || filtros.dataFim) {
      const d = toDate(c.data);
      if (!d) return false;
      if (filtros.dataInicio && d < filtros.dataInicio) return false;
      if (filtros.dataFim && d > filtros.dataFim) return false;
    }
    return true;
  });
}

/* ── Calcula quais opções ainda existem dado um subconjunto de chamados ─── */
function opcoesDisponiveis(lista) {
  const lojas = new Map();  // id_loja -> nome_loja (ou id)
  const status = new Set();
  const prioridade = new Set();
  let minData = null;
  let maxData = null;

  lista.forEach(c => {
    lojas.set(String(c.id_loja), c.nome_loja || c.id_loja);
    if (c.status) status.add(c.status);
    if (c.prioridade) prioridade.add(c.prioridade);

    const d = toDate(c.data);
    if (d) {
      if (!minData || d < minData) minData = d;
      if (!maxData || d > maxData) maxData = d;
    }
  });

  return { lojas, status, prioridade, minData, maxData };
}

/* ── Gera HTML de uma lista de checkboxes num dropdown ──────────────────── */
function renderDropdown(ulId, itens, filtroSet, onChange) {
  const ul = document.getElementById(ulId);
  ul.innerHTML = '';

  itens.forEach(({ value, label, disabled }) => {
    const li = document.createElement('li');
    const checked = filtroSet.has(value) ? 'checked' : '';
    const disabledAttr = disabled ? 'disabled' : '';
    li.innerHTML = `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="chk_${ulId}_${value}"
               value="${value}" ${checked} ${disabledAttr}>
        <label class="form-check-label" for="chk_${ulId}_${value}"
               style="${disabled ? 'opacity:.4;cursor:not-allowed' : ''}">${label}</label>
      </div>`;
    li.querySelector('input').addEventListener('change', e => {
      if (e.target.checked) filtroSet.add(value);
      else filtroSet.delete(value);
      onChange();
    });
    ul.appendChild(li);
  });
}

/* ── Renderiza as tags de seleção abaixo do botão ──────────────────────── */
function renderTags(containerId, filtroSet, labelMap) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  filtroSet.forEach(v => {
    const span = document.createElement('span');
    span.textContent = labelMap[v] || capitalize(v);
    el.appendChild(span);
  });
}

/* ── Atualiza os três dropdowns e o range de datas ───────────────────────
 *
 * Lógica interdependente:
 *   - Para calcular as opções de LOJAS:   ignora filtro de loja, respeita os demais
 *   - Para calcular as opções de STATUS:  ignora filtro de status, respeita os demais
 *   - Para calcular as opções de PRIOR.:  ignora filtro de prioridade, respeita os demais
 *   - Para calcular o range de DATA:      respeita todos os filtros ativos (exceto data)
 */
function atualizarFiltros() {
  /* Subconjuntos "sem o próprio filtro" para calcular opções disponíveis */
  const semLoja = chamados.filter(c => {
    if (filtros.status.size && !filtros.status.has(c.status)) return false;
    if (filtros.prioridade.size && !filtros.prioridade.has(c.prioridade)) return false;
    return dentroDaData(c);
  });

  const semStatus = chamados.filter(c => {
    if (filtros.lojas.size && !filtros.lojas.has(String(c.id_loja))) return false;
    if (filtros.prioridade.size && !filtros.prioridade.has(c.prioridade)) return false;
    return dentroDaData(c);
  });

  const semPrioridade = chamados.filter(c => {
    if (filtros.lojas.size && !filtros.lojas.has(String(c.id_loja))) return false;
    if (filtros.status.size && !filtros.status.has(c.status)) return false;
    return dentroDaData(c);
  });

  /* Subconjunto sem filtro de data (para calcular min/max de datas) */
  const semData = chamados.filter(c => {
    if (filtros.lojas.size && !filtros.lojas.has(String(c.id_loja))) return false;
    if (filtros.status.size && !filtros.status.has(c.status)) return false;
    if (filtros.prioridade.size && !filtros.prioridade.has(c.prioridade)) return false;
    return true;
  });

  const optLojas = opcoesDisponiveis(semLoja);
  const optStatus = opcoesDisponiveis(semStatus);
  const optPrior = opcoesDisponiveis(semPrioridade);
  const optData = opcoesDisponiveis(semData);

  /* ── Dropdowns ── */

  // LOJAS — usa as lojas do sessionStorage, não só as dos chamados
  const lojasStorage = JSON.parse(sessionStorage.getItem('lojas') || '[]');
  const lojasItens = lojasStorage.map(l => ({
    value: String(l.id_loja),
    label: l.nome_loja,
    disabled: false
  }));
  renderDropdown('lojasDropdown', lojasItens, filtros.lojas, aplicarFiltros);
  renderTags('tagsSelecionadas', filtros.lojas,
    Object.fromEntries(lojasStorage.map(l => [String(l.id_loja), l.nome_loja])));

  // STATUS — usa a lista de todos os status possíveis; desabilita os que não têm chamados
  const todosStatus = ['aberto', 'em_andamento', 'resolvido', 'encerrado'];
  const statusItens = todosStatus.map(s => ({
    value: s,
    label: capitalize(s),
    disabled: !optStatus.status.has(s)
  }));
  renderDropdown('statusDropdown', statusItens, filtros.status, aplicarFiltros);
  renderTags('tagsSelecionadas2', filtros.status, {});

  // PRIORIDADE
  const todasPrior = ['alta', 'media', 'baixa'];
  const priorItens = todasPrior.map(p => ({
    value: p,
    label: capitalize(p),
    disabled: !optPrior.prioridade.has(p)
  }));
  renderDropdown('prioridadeDropdown', priorItens, filtros.prioridade, aplicarFiltros);
  renderTags('tagsSelecionadas3', filtros.prioridade, {});

  /* ── Range de data ── */
  atualizarRangeData(optData.minData, optData.maxData);
}

/* ── Verifica se um chamado está dentro do range de datas selecionado ──── */
function dentroDaData(c) {
  if (!filtros.dataInicio && !filtros.dataFim) return true;
  const d = toDate(c.data);
  if (!d) return false;
  if (filtros.dataInicio && d < filtros.dataInicio) return false;
  if (filtros.dataFim && d > filtros.dataFim) return false;
  return true;
}

/* ── Atualiza os inputs de data (min/max dinâmicos) ─────────────────────── */
function atualizarRangeData(minData, maxData) {
  const inputInicio = document.getElementById('dataInicio');
  const inputFim = document.getElementById('dataFim');
  const hint = document.getElementById('dateRangeHint');

  if (!minData || !maxData) {
    inputInicio.min = '';
    inputInicio.max = '';
    inputFim.min = '';
    inputFim.max = '';
    if (hint) hint.textContent = '';
    return;
  }

  const fmt = d => d.toISOString().split('T')[0];  // YYYY-MM-DD

  inputInicio.min = fmt(minData);
  inputInicio.max = fmt(maxData);
  inputFim.min = fmt(minData);
  inputFim.max = fmt(maxData);

  // Preenche com o range total se ainda não tiver valor
  if (!inputInicio.value) inputInicio.value = fmt(minData);
  if (!inputFim.value) inputFim.value = fmt(maxData);

  // Garante consistência: inicio <= fim
  if (inputInicio.value > inputFim.value) inputFim.value = inputInicio.value;

  if (hint) {
    hint.textContent =
      `Disponível: ${formatarData(minData)} – ${formatarData(maxData)}`;
  }
}

/* ── Aplica filtros e re-renderiza chamados + atualiza opções ────────────── */
function aplicarFiltros() {
  // Lê datas dos inputs (só ao clicar "Filtrar"; chamadas internas usam o estado)
  const inputInicio = document.getElementById('dataInicio');
  const inputFim = document.getElementById('dataFim');
  filtros.dataInicio = toDate(inputInicio.value);
  filtros.dataFim = toDate(inputFim.value);

  atualizarFiltros();   // recalcula opções disponíveis
  renderizarChamados(chamadosFiltrados());
}

/* ── Renderiza os cards de chamados ─────────────────────────────────────── */
function renderizarChamados(lista) {
  const container = document.getElementById('chamadosContainer');
  container.innerHTML = '';

  if (!lista || lista.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#aaa;">Nenhum chamado encontrado.</p>';
    return;
  }

  lista.forEach((chamado, index) => {
    const realIndex = chamados.indexOf(chamado);
    const prioridadeClass = `prioridade-${chamado.prioridade}`;
    const icoPrioridade = chamado.prioridade === 'alta' ? '⚡'
      : chamado.prioridade === 'media' ? '⚠️' : '✓';

    container.innerHTML += `
      <div class="chamado-card">
        <div class="chamado-header">
          <span class="chamado-id">${chamado.id_ticket}</span>
          <span class="chamado-status status-${chamado.status}">${capitalize(chamado.status)}</span>
        </div>
        <div class="chamado-titulo">${chamado.titulo}</div>
        <div class="chamado-descricao">${chamado.descricao}</div>
        <div class="chamado-meta">
          <div class="chamado-meta-item">
            <i class="fas fa-user"></i>
            <span>${chamado.nome_cliente}</span>
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
          <button class="btn-acao btn-editar" onclick="abrirEdicao(${realIndex})">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn-acao btn-fechar" onclick="fecharChamado(${realIndex})">
            <i class="fas fa-check"></i> Fechar
          </button>
          <button class="btn-acao btn-chat" onclick="abrirChat(${chamado.id_ticket})">
            <i class="fas fa-comments"></i> Chat
          </button>
        </div>
      </div>`;
  });
}

/* ── Carregar chamados da API ─────────────────────────────────────────────── */
async function carregarChamados() {
  const idsLojasRaw = sessionStorage.getItem('ids_lojas');
  const idsLojasParsed = idsLojasRaw ? JSON.parse(idsLojasRaw) : [];
  if (!idsLojasRaw || idsLojasParsed.length === 0) {
    alert('Sessão expirada ou nenhuma loja associada. Faça login novamente.');
    window.location.href = '/login.html';
    return;
  }
  const idsLojas = idsLojasRaw;

  try {
    const url = `${BASE_URL}?ids_lojas=${encodeURIComponent(idsLojas)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro na resposta da API');
    chamados = await res.json();

    // Inicializa filtros de data com o range completo dos dados
    const { minData, maxData } = opcoesDisponiveis(chamados);
    filtros.dataInicio = minData;
    filtros.dataFim = maxData;

    atualizarFiltros();
    renderizarChamados(chamadosFiltrados());
  } catch (erro) {
    console.error('Erro ao carregar chamados:', erro);
    document.getElementById('chamadosContainer').innerHTML =
      '<p style="color:red;text-align:center;">Erro ao carregar chamados. Verifique a conexão com o servidor.</p>';
  }
}

/* ── Abrir modal de edição ────────────────────────────────────────────────── */
function abrirEdicao(index) {
  chamadoAtual = index;
  const chamado = chamados[index];
  document.getElementById('chamadoStatus').value = chamado.status;
  document.getElementById('chamadoPrioridade').value = chamado.prioridade;
  document.getElementById('chamadoDescricao').value = chamado.descricao;
  modalChamado.show();
}

/* ── Fechar chamado (PATCH /chamados/:id/fechar) ─────────────────────────── */
async function fecharChamado(index) {
  if (!confirm('Tem certeza que deseja fechar este chamado?')) return;
  const id = chamados[index].id_ticket;
  try {
    const res = await fetch(`${BASE_URL}/${id}/fechar`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Falha ao fechar chamado');
    alert('Chamado fechado com sucesso!');
    await carregarChamados();
  } catch (erro) {
    console.error(erro);
    alert('Erro ao fechar o chamado. Tente novamente.');
  }
}

/* ── Salvar edição (PATCH /chamados/:id) ─────────────────────────────────── */
document.getElementById('formChamado').addEventListener('submit', async function (e) {
  e.preventDefault();
  if (chamadoAtual === null) return;
  const id = chamados[chamadoAtual].id_ticket;
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
    await carregarChamados();
  } catch (erro) {
    console.error(erro);
    alert('Erro ao salvar o chamado. Tente novamente.');
  }
});

/* ── Controle de abertura/fechamento dos dropdowns ───────────────────────── */
document.addEventListener('click', e => {
  document.querySelectorAll('.multi-dropdown.open').forEach(dd => {
    if (!dd.contains(e.target)) dd.classList.remove('open');
  });

  const btn = e.target.closest('.multi-dropdown-btn');
  if (btn) {
    const dd = btn.closest('.multi-dropdown');
    const wasOpen = dd.classList.contains('open');
    document.querySelectorAll('.multi-dropdown.open').forEach(d => d.classList.remove('open'));
    if (!wasOpen) dd.classList.add('open');
  }
});

/* ── Botão Filtrar (datas) ───────────────────────────────────────────────── */
document.querySelector('.btn-filtrar-data').addEventListener('click', aplicarFiltros);

/* ── Sincroniza: ao mudar dataInicio, dataFim não pode ser menor ─────────── */
document.getElementById('dataInicio').addEventListener('change', function () {
  const inputFim = document.getElementById('dataFim');
  if (this.value && inputFim.value && inputFim.value < this.value) {
    inputFim.value = this.value;
  }
});

document.getElementById('dataFim').addEventListener('change', function () {
  const inputInicio = document.getElementById('dataInicio');
  if (this.value && inputInicio.value && this.value < inputInicio.value) {
    inputInicio.value = this.value;
  }
});

document.getElementById('btnLimparFiltros').addEventListener('click', () => {
  filtros.lojas.clear();
  filtros.status.clear();
  filtros.prioridade.clear();
  filtros.dataInicio = null;
  filtros.dataFim = null;

  document.getElementById('dataInicio').value = '';
  document.getElementById('dataFim').value = '';

  atualizarFiltros();
  renderizarChamados(chamadosFiltrados());
});

function abrirChat(idTicket) {
  // Salva o id do ticket na sessionStorage e redireciona para chat.html
  sessionStorage.setItem('ticket_chat_ativo', idTicket);
  window.location.href = 'chat.html';
}

/* ── Inicializar ─────────────────────────────────────────────────────────── */
carregarChamados();
