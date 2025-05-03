document.getElementById('cadastroForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const dados = {nome, email, senha};

    const response = await fetch('http://localhost:3000/cadastro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })

    const resultado = await response.json();

    if(resultado.mensagem== 'Usuário cadastrado com sucesso!'){
        alert(resultado.mensagem);
        window.location.href = '../html/login.html';
    } else {
        alert(resultado.mensagem);
    }
})