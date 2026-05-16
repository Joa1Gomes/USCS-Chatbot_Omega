
document.addEventListener('DOMContentLoaded', function () {

  const isAdmin = sessionStorage.getItem('is_admin');

  if (isAdmin === 'true') {
    document.getElementById('menuLista').insertAdjacentHTML('afterbegin', `
            <li><a href="gerenciamento_adm.html">🧑‍💼 Gerenciamento de Usuários</a></li>
            <li><a href="gerenciamento_loja.html">🏬 Gerenciamento de Lojas</a></li>
        `);
  }

});

async function calcularEstatisticas() {

  const idsLojasRaw = sessionStorage.getItem('ids_lojas');
  const idsLojasParsed = idsLojasRaw ? JSON.parse(idsLojasRaw) : [];
  if (!idsLojasRaw || idsLojasParsed.length === 0) {
    alert('Sessão expirada ou nenhuma loja associada. Faça login novamente.');
    window.location.href = '/login.html';
    return;
  }
  const idsLojas = idsLojasRaw;

  try {
    const response = await fetch(`http://localhost:3000/estatisticas?ids_lojas=${encodeURIComponent(idsLojas)}`, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas');
    }

    const dados = await response.json();
    const totalClientes = dados.totalClientes;
    const chamadosAbertos = dados.chamadosAbertos;
    const taxaResolucao = dados.taxaResolucao;
    //const mediaTempoResposta = dados.mediaTempoResposta;

    document.getElementById('totalclientes').textContent = totalClientes || '-';
    document.getElementById('chamadosabertos').textContent = chamadosAbertos || '-';
    document.getElementById('taxaresolucao').textContent = taxaResolucao + '%' || '-';
    //document.getElementById('mediatemporesposta').textContent = mediaTempoResposta || '-';

  } catch (erro) {
    document.getElementById('totalclientes').textContent = '--';
    document.getElementById('chamadosabertos').textContent = '--';
    document.getElementById('taxaresolucao').textContent = '--';
    //document.getElementById('mediatemporesposta').textContent = '--';

    console.error('Erro ao carregar KPIs:', erro);
  }
}
window.onload = calcularEstatisticas;


