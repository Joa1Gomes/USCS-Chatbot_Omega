let lojas = []
const urlPadrao = 'http://localhost:3000'

document.addEventListener('DOMContentLoaded', function () {

    let isAdmin = sessionStorage.getItem('is_admin');

    if (isAdmin = 'true') {
        document.getElementById('menuLista').insertAdjacentHTML('afterbegin', `
            <li><a href="gerenciamento_adm.html">🧑‍💼 Gerenciamento de Usuários</a></li>
            <li><a href="gerenciamento_lojas.html">🏬 Gerenciamento de Lojas</a></li>
            `)
    }

});


async function renderizarLojas() {
    const container = document.getElementById('tabelaLojas');
    container.innerHTML = '';

    if (lojas.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#aaa;">Nenhuma loja encontrada.</p>';
    }

    lojas.forEach((lojas, index) => {
        container.innerHTML += `
        <tr data-id="LOJ001" data-cep="00000-000" data-end="Rua A" data-num="10" data-compl="Loja B"
            data-resp-nome="João" data-resp-email="joao@a.com" data-resp-cargo="Gerente" data-resp-cpf="12345678901">
            <td>${lojas.codigo_loja || 'Sem código'}</td>
            <td>${lojas.nome_loja || 'Sem nome definido'}</td>
            <td>${lojas.cnpj_loja || 'Sem CNPJ'}</td>
            <td>${lojas.cidade || 'Sem cidade'}</td>
            <td>${lojas.estado || 'Sem estado'}</td>
            <td>${lojas.telefone || 'Sem telefone'}</td>
            <td><span class="badge-ativa">${lojas.status}</span></td>
            <td>
              <button class="btn btn-sm btn-outline-primary" onclick="editarLoja('${lojas.codigo_loja}')"><i
                  class="fas fa-edit"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="this.closest('tr').remove()"><i
                  class="fas fa-trash"></i></button>
            </td>
          </tr>
        
        `
    })

}


async function carregarLojas() {
    try {
        const response = await fetch(`http://localhost:3000/lojas/lista`, {
            method: 'GET',
        });
        if (!response.ok) throw new Error('Erro ao buscar lojas');

        lojas = await response.json();
        renderizarLojas();

    } catch (erro) {
        console.error('Erro ao carregar lojas', erro);
        const container = document.getElementById('lojas-lista');
        if (container) container.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar lojas.</p>';
    }
};

async function inicializarPagina() {
    await carregarLojas()
}

window.onload = inicializarPagina;


