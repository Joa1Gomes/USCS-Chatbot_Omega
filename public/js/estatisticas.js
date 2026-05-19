/* ═══════════════════════════════════════════════════════════════
   estatisticas.js  —  Carrega KPIs e gráficos com dados reais
═══════════════════════════════════════════════════════════════ */

const BASE_URL = 'http://localhost:3000/estatisticas';

// Instâncias dos gráficos (para destruir antes de re-renderizar)
let chartStatusInst     = null;
let chartPrioridadeInst = null;
let chartTempoInst      = null;

/* ── Menu admin ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  const isAdmin = sessionStorage.getItem('is_admin');
  if (isAdmin === 'true') {
    document.getElementById('menuLista').insertAdjacentHTML('afterbegin', `
      <li><a href="gerenciamento_adm.html">🧑‍💼 Gerenciamento de Usuários</a></li>
      <li><a href="gerenciamento_loja.html">🏬 Gerenciamento de Lojas</a></li>
    `);
  }
});

/* ── Helpers de label ───────────────────────────────────────── */
const STATUS_LABEL = {
  aberto:       'Aberto',
  em_andamento: 'Em Andamento',
  resolvido:    'Resolvido',
  encerrado:    'Encerrado',
  fechado:      'Encerrado'
};
const STATUS_COLOR = {
  aberto:       '#fbbf24',
  em_andamento: '#3b82f6',
  resolvido:    '#34d399',
  encerrado:    '#a78bfa',
  fechado:      '#a78bfa'
};
const PRIOR_LABEL = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
const PRIOR_COLOR = { alta: '#ef4444', media: '#fbbf24', baixa: '#34d399' };

/* ── Renderiza gráfico de Status (Donut) ───────────────────── */
function renderChartStatus(rows) {
  const labels = rows.map(r => STATUS_LABEL[r.status] || r.status);
  const data   = rows.map(r => parseInt(r.total));
  const colors = rows.map(r => STATUS_COLOR[r.status] || '#94a3b8');

  if (chartStatusInst) chartStatusInst.destroy();
  const ctx = document.getElementById('chartStatus').getContext('2d');
  chartStatusInst = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { family: "'Inter', 'Segoe UI', sans-serif" },
            padding: 15,
            boxWidth: 15
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed} tickets`
          }
        }
      }
    }
  });
}

/* ── Renderiza gráfico de Prioridade (Radar) ────────────────── */
function renderChartPrioridade(rows) {
  // Garante a ordem: alta, media, baixa
  const ordem = ['alta', 'media', 'baixa'];
  const map   = Object.fromEntries(rows.map(r => [r.prioridade, parseInt(r.total)]));
  const labels = ordem.map(p => PRIOR_LABEL[p] || p);
  const data   = ordem.map(p => map[p] || 0);

  if (chartPrioridadeInst) chartPrioridadeInst.destroy();
  const ctx = document.getElementById('chartPrioridade').getContext('2d');
  chartPrioridadeInst = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: 'Chamados',
        data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        fill: true,
        pointBackgroundColor: ordem.map(p => PRIOR_COLOR[p]),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { r: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

/* ── Renderiza gráfico de Tickets por Mês (Linha) ───────────── */
function renderChartTempo(rows) {
  const labels = rows.map(r => r.mes);
  const data   = rows.map(r => parseInt(r.total));

  if (chartTempoInst) chartTempoInst.destroy();
  const ctx = document.getElementById('chartTempo').getContext('2d');
  chartTempoInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Tickets Abertos',
        data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

/* ── Atualiza os insights dinâmicos com base nos dados ──────── */
function atualizarInsights(dados) {
  const el = document.getElementById('insightResolucao');
  const elTempo = document.getElementById('insightTempo');

  if (el) {
    const t = dados.taxaResolucao;
    const qualidade = t >= 90 ? 'excelente' : t >= 70 ? 'boa' : 'baixa';
    el.textContent = `Taxa de resolução em ${t}%. Performance ${qualidade} — ${
      t >= 90 ? 'parabéns ao time de suporte!' :
      t >= 70 ? 'há espaço para melhoria.' :
      'atenção necessária com os chamados abertos.'
    }`;
  }

  if (elTempo) {
    const v = dados.tempoMedioFormatado;
    elTempo.textContent = v === '-'
      ? 'Nenhum chamado encerrado registrado ainda.'
      : `Tempo médio de resolução: ${v}. Baseado nos chamados encerrados e resolvidos.`;
  }
}

/* ── Função principal ───────────────────────────────────────── */
async function calcularEstatisticas() {
  const idsLojasRaw    = sessionStorage.getItem('ids_lojas');
  const idsLojasParsed = idsLojasRaw ? JSON.parse(idsLojasRaw) : [];
  if (!idsLojasRaw || idsLojasParsed.length === 0) {
    alert('Sessão expirada ou nenhuma loja associada. Faça login novamente.');
    window.location.href = '/login.html';
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}?ids_lojas=${encodeURIComponent(idsLojasRaw)}`);
    if (!res.ok) throw new Error('Erro ao buscar estatísticas');

    const dados = await res.json();

    /* ── Cards de KPI ── */
    document.getElementById('totalclientes').textContent   = dados.totalClientes ?? '--';
    document.getElementById('chamadosabertos').textContent = dados.chamadosAbertos ?? '--';
    document.getElementById('taxaresolucao').textContent   =
      dados.taxaResolucao != null ? `${dados.taxaResolucao}%` : '--';
    document.getElementById('tempomedio').textContent      = dados.tempoMedioFormatado || '--';

    /* ── Gráficos ── */
    const g = dados.graficos;
    if (g?.porStatus?.length)     renderChartStatus(g.porStatus);
    if (g?.porPrioridade?.length) renderChartPrioridade(g.porPrioridade);
    if (g?.porMes?.length)        renderChartTempo(g.porMes);

    /* ── Insights ── */
    atualizarInsights(dados);

  } catch (erro) {
    console.error('[Estatísticas] Erro:', erro);
    ['totalclientes', 'chamadosabertos', 'taxaresolucao', 'tempomedio']
      .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '--'; });
  }
}

/* ── Animação de entrada dos cards ─────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.stat-card, .chart-card, .insight-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});

window.onload = calcularEstatisticas;
