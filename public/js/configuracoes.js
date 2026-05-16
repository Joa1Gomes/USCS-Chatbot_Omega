const BASE_URL = 'http://localhost:3000/configuracoes';

document.addEventListener('DOMContentLoaded', async function () {
    // Injeta menu admin
    const isAdmin = sessionStorage.getItem('is_admin');
    if (isAdmin === 'true') {
        document.getElementById('menuLista').insertAdjacentHTML('afterbegin', `
      <li><a href="gerenciamento_adm.html">🧑‍💼 Gerenciamento de Usuários</a></li>
      <li><a href="gerenciamento_loja.html">🏬 Gerenciamento de Lojas</a></li>
    `);
    }

    // Carrega dados reais do usuário
    await carregarDadosUsuario();
});

async function carregarDadosUsuario() {
    const idUsuario = sessionStorage.getItem('id_usuario');
    if (!idUsuario) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/${idUsuario}/info`);
        if (!res.ok) throw new Error('Falha ao buscar dados');
        const dados = await res.json();

        const nomeCompleto = `${dados.primeiro_nome_usuario} ${dados.sobrenome_usuario}`;
        document.getElementById('profileName').textContent = nomeCompleto;
        document.getElementById('profileEmail').textContent = dados.email_usuario;
        document.getElementById('nomeInput').value = nomeCompleto;
        document.getElementById('emailInput').value = dados.email_usuario;

        // Guarda nome original para o botão Cancelar
        document.getElementById('nomeInput').dataset.original = nomeCompleto;
        document.getElementById('emailInput').dataset.original = dados.email_usuario;
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
    }
}

async function salvarNome() {
    const idUsuario = sessionStorage.getItem('id_usuario');
    const valor = document.getElementById('nomeInput').value.trim();
    if (!valor) { mostrarAlerta('alertNomeErro'); return; }

    const partes = valor.split(' ');
    const primeiro_nome = partes[0];
    const sobrenome = partes.slice(1).join(' ') || '';

    try {
        const res = await fetch(`${BASE_URL}/${idUsuario}/nome`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ primeiro_nome, sobrenome })
        });
        if (!res.ok) throw new Error();
        document.getElementById('profileName').textContent = valor;
        document.getElementById('nomeInput').dataset.original = valor;
        mostrarAlerta('alertNomeSucesso');
    } catch {
        mostrarAlerta('alertNomeErro');
    }
}

function cancelarNome() {
    const input = document.getElementById('nomeInput');
    input.value = input.dataset.original || '';
}

async function salvarEmail() {
    const idUsuario = sessionStorage.getItem('id_usuario');
    const email = document.getElementById('emailInput').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { mostrarAlerta('alertEmailErro'); return; }

    try {
        const res = await fetch(`${BASE_URL}/${idUsuario}/email`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!res.ok) throw new Error();
        document.getElementById('profileEmail').textContent = email;
        document.getElementById('emailInput').dataset.original = email;
        mostrarAlerta('alertEmailSucesso');
    } catch {
        mostrarAlerta('alertEmailErro');
    }
}

function cancelarEmail() {
    const input = document.getElementById('emailInput');
    input.value = input.dataset.original || '';
}

async function salvarSenha() {
    const idUsuario = sessionStorage.getItem('id_usuario');
    const senhaAtual = document.getElementById('senhaAtual').value;
    const senhaNova = document.getElementById('senhaNova').value;
    const senhaConfirm = document.getElementById('senhaConfirm').value;

    if (!senhaAtual || !senhaNova || !senhaConfirm) { mostrarAlerta('alertSenhaErro'); return; }
    if (senhaNova !== senhaConfirm) { mostrarAlerta('alertSenhaErro'); return; }
    if (senhaNova.length < 6) { mostrarAlerta('alertSenhaErro'); return; }

    try {
        const res = await fetch(`${BASE_URL}/${idUsuario}/senha`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senhaAtual, senhaNova })
        });
        if (!res.ok) throw new Error();
        cancelarSenha();
        mostrarAlerta('alertSenhaSucesso');
    } catch {
        mostrarAlerta('alertSenhaErro');
    }
}

function cancelarSenha() {
    document.getElementById('senhaAtual').value = '';
    document.getElementById('senhaNova').value = '';
    document.getElementById('senhaConfirm').value = '';
}

function mostrarAlerta(idAlerta) {
    const alerta = document.getElementById(idAlerta);
    alerta.classList.add('show');
    setTimeout(() => alerta.classList.remove('show'), 3000);
}
