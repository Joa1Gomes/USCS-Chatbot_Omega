async function calcularEstatisticas() {
  try {
    const response = await fetch('http://localhost:3000/estatisticas', {
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


