let lojas = []
let lojaAtual = null
const urlPadrao = 'http://localhost:3000'

document.addEventListener('DOMContentLoaded', function () {

    let isAdmin = sessionStorage.getItem('is_admin');

    if (isAdmin === 'true') {
        document.getElementById('menuLista').insertAdjacentHTML('afterbegin', `
            <li><a href="gerenciamento_adm.html">🧑‍💼 Gerenciamento de Usuários</a></li>
            <li><a href="gerenciamento_loja.html">🏬 Gerenciamento de Lojas</a></li>
            `)
    }

});


async function renderizarLojas() {
    const container = document.getElementById('tabelaLojas');
    container.innerHTML = '';

    if (lojas.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#aaa;">Nenhuma loja encontrada.</p>';
        return;
    }

    lojas.forEach((loja, index) => {
        container.innerHTML += `
        <tr>
            <td>${loja.codigo_loja || 'Sem código'}</td>
            <td>${loja.nome_loja || 'Sem nome definido'}</td>
            <td>${loja.cnpj_loja || 'Sem CNPJ'}</td>
            <td>${loja.cidade || 'Sem cidade'}</td>
            <td>${loja.estado || 'Sem estado'}</td>
            <td>${loja.telefone || 'Sem telefone'}</td>
            <td><span class="badge-ativa">${(loja.status || '').trim()}</span></td>
            <td>
              <button class="btn btn-sm btn-outline-primary" onclick="editarLoja(${loja.id_loja})"><i class="fas fa-edit"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="deletarLoja(${loja.id_loja})"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        
        `
    })

}


async function carregarLojas() {
    const id_empresa = sessionStorage.getItem('id_empresa');
    const id_usuario = sessionStorage.getItem('id_usuario');
    const is_admin = sessionStorage.getItem('is_admin'); // "true" ou "false" (string)

    if (!id_empresa) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/lojas/lista?id_empresa=${id_empresa}&id_usuario=${id_usuario}&is_admin=${is_admin}`,
            { method: 'GET' }
        );
        if (!response.ok) throw new Error('Erro ao buscar lojas');

        lojas = await response.json();
        renderizarLojas();

    } catch (erro) {
        console.error('Erro ao carregar lojas', erro);
        const container = document.getElementById('tabelaLojas');
        if (container) container.innerHTML = '<tr><td colspan="8" style="text-align:center;color:red;">Erro ao carregar lojas.</td></tr>';
    }
};


async function salvarLoja() {
    const form = document.getElementById('formLoja');
    //if (!form.CheckValidity()) { form.reportValidity(); return; }

    const id_empresa = sessionStorage.getItem('id_empresa');
    const isEditando = document.getElementById('editId').value !== '';

    const payload = {
        id_empresa: id_empresa,
        codigo_loja: document.getElementById('cod').value,
        nome_loja: document.getElementById('nome').value,
        cnpj_loja: document.getElementById('cnpj').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        endereco: document.getElementById('end').value,
        telefone: document.getElementById('tel').value,
        status: document.getElementById('status').value
    };

    try {
        const url = isEditando
            ? `http://localhost:3000/lojas/editarLoja/${document.getElementById('editId').value}`
            : `http://localhost:3000/lojas/cadastraLoja`;
        // Se for edição usamos PATCH ou PUT, se for criação usamos POST
        const metodo = isEditando ? 'PATCH' : 'POST';
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const resultado = await response.json();
            alert('Erro ao salvar loja: ' + resultado.mensagem);
            return;
        }
        bootstrap.Modal.getInstance(document.getElementById('modalLoja')).hide();
        await carregarLojas();

    } catch (erro) {
        console.error('Erro ao salvar loja:', erro);
        alert('Erro de conexão ao tentar salvar a loja.');
    }
}

async function deletarLoja(id_loja) {

    try {
        const response = await fetch(
            `http://localhost:3000/lojas/deletarLoja/${id_loja}`,
            { method: 'DELETE' }
        );

        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.mensagem || 'Erro ao deletar loja');
        }

        alert('Loja deletada com sucesso!');
        await carregarLojas(); // Recarrega a lista do backend

    } catch (erro) {
        console.error('Erro ao deletar lojas', erro);
        alert(erro.message);
    }
}

async function editarLoja(id_loja) {
    // Garante comparação numérica — o onclick pode passar string ou number
    const loja = lojas.find(l => Number(l.id_loja) === Number(id_loja));
    if (!loja) {
        console.error('Loja não encontrada no array. id_loja recebido:', id_loja, '| lojas no array:', lojas.map(l => l.id_loja));
        return;
    }

    // Preenche o campo oculto com o id_loja para o salvarLoja saber que é uma edição
    document.getElementById('editId').value = loja.id_loja;

    document.getElementById('cod').value = loja.codigo_loja;
    document.getElementById('nome').value = loja.nome_loja;
    document.getElementById('cnpj').value = loja.cnpj_loja;
    document.getElementById('cidade').value = loja.cidade;
    document.getElementById('estado').value = loja.estado;
    document.getElementById('tel').value = loja.telefone;
    document.getElementById('status').value = loja.status;

    document.getElementById('modalTitle').innerText = 'Editar loja';
    const modalEl = document.getElementById('modalLoja');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
}

async function inicializarPagina() {
    await carregarLojas()
}

window.onload = inicializarPagina;


