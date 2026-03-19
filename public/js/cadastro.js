document.getElementById('cadastroForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const primeiroNome = document.getElementById('primeiroNome').value;
    const sobrenome = document.getElementById('sobrenome').value;
    const email = document.getElementById('emailEmpresarial').value;
    const senha = document.getElementById('senha').value;
    const dataNascimento = document.getElementById('dataNascimento').value;
    const telefone = document.getElementById('telefone').value;

    const dados = { primeiroNome, sobrenome, email, senha, dataNascimento, telefone };

    const response = await fetch('http://localhost:3000/cadastro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })

    const resultado = await response.json();

    if (resultado.mensagem == 'Usuário cadastrado com sucesso!') {
        alert(resultado.mensagem);
        window.location.href = '../html/login.html';
    } else {
        alert(resultado.mensagem);
    }
})