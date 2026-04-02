document.addEventListener('DOMContentLoaded', carregarDados);

async function carregarDados() {
    try {
        const response = await fetch('http://localhost:3000/home', {
            method: 'GET'

        });
        if (!response.ok) {
            throw new Error('Erro ao buscar estatisticas')
        }

        const dados = await response.json();

        console.log(dados);

        const totalTickets = dados.totalTickets;
        const ticketsResolvidos = dados.ticketsResolvidos;
        const ticketsEmAndamento = dados.ticketsEmAndamento;
        const tempoMedio = dados.tempoMedio;

        document.getElementById('totaltickets_homepage').textContent = totalTickets || '-';
        document.getElementById('ticketsresolvidos_homepage').textContent = ticketsResolvidos || '-';
        document.getElementById('ticketsandamento_homepage').textContent = ticketsEmAndamento || '-';
        document.getElementById('tempomedio_homepage').textContent = tempoMedio || '-';


    } catch (error) {

        document.getElementById('totaltickets_homepage').textContent = '--';
        document.getElementById('ticketsresolvidos_homepage').textContent = '--';
        document.getElementById('ticketsandamento_homepage').textContent = '--';
        document.getElementById('tempomedio_homepage').textContent = '--';


        console.error('Erro ao carregar os dados', error);
    }
}
window.onload = carregarDados;