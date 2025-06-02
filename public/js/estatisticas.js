async function calcularEstatisticas() {
  try {
        const response = await fetch('http://localhost:3000/estatisticas',{
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error('Erro ao buscar estatísticas');
        }
    
        const dados = await response.json();
        const totalClientes =  dados.totalClientes;
        const totalVendas = dados.totalVendas;

        document.getElementById('clientesAtivos').textContent = totalClientes || '-';
        document.getElementById('totalVendas').textContent = totalVendas || '-';
  } catch (erro) {
    document.getElementById('clientesAtivos').textContent = '--';
    console.error('Erro ao carregar KPIs:', erro);
  }   
}
window.onload = calcularEstatisticas;