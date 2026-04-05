// Captura o token que veio na URL (ex: ?token=abc123...)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
// Se não tem token na URL, a página não deveria ser acessada
if (!token) {
    alert('Link inválido ou expirado.');
    window.location.href = 'login.html';
}

document.getElementById('formNovaSenha').addEventListener('submit', async function (e) {
    e.preventDefault();

    const novaSenha = document.getElementById('novaSenha').value;
    const confirmaSenha = document.getElementById('confirmarSenha').value;

    if (novaSenha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    if (novaSenha.lenght < 8) {
        alert('A senha deve ter pelo menos 8 caracteres');
        return;
    }

    try {
        const resposta = await fetch('/senha/resetar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, novaSenha })
        });

        const dados = resposta.json()

        if (resposta.ok) {
            alert(dados.mensagem)
            window.location.href = 'login.html'
        } else {
            alert(dados.mensagem || 'Erro ao resetar senha')
        }


    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor');
    }

})