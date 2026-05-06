
document.addEventListener('DOMContentLoaded', function () {

    const isAdmin = sessionStorage.getItem('is_admin');

    if (isAdmin === 'true') {
        document.getElementById('menuLista').insertAdjacentHTML('afterbegin', `
            <li><a href="gerenciamento_adm.html">🧑‍💼 Gerenciamento de Usuários</a></li>
            <li><a href="gerenciamento_loja.html">🏬 Gerenciamento de Lojas</a></li>
        `);
    }

});